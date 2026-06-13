import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Wind, Droplets, Eye, Thermometer, Loader2, RefreshCw, X, Bell, BellOff } from 'lucide-react'
import { getWeather } from '../api'
import toast from 'react-hot-toast'

/* ─── weather icon map ─── */
const weatherIcons = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
}

const pestRiskColor = (r) => r === 'Low' ? 'var(--primary)' : r === 'Medium' ? 'var(--secondary)' : '#f87171'
const pestRiskWidth = (r) => r === 'Low' ? '25%' : r === 'Medium' ? '55%' : '85%'

/* ─── alert severity → colour ─── */
const ALERT_COLOR = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  warning:  '#3b82f6',
}

/* ─── Web Audio siren ─── */
function playSiren(severity) {
  try {
    const Ctx  = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx  = new Ctx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    gain.gain.setValueAtTime(0.22, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)

    if (severity === 'critical' || severity === 'high') {
      // Two-tone emergency sweep (like an ambulance siren)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(960, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(480, ctx.currentTime + 0.45)
      osc.frequency.linearRampToValueAtTime(960, ctx.currentTime + 0.9)
      osc.frequency.linearRampToValueAtTime(480, ctx.currentTime + 1.35)
      osc.frequency.linearRampToValueAtTime(960, ctx.currentTime + 1.8)
    } else {
      // Softer descending alert for rain warnings
      osc.type = 'sine'
      osc.frequency.setValueAtTime(700, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.6)
      osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 1.2)
    }

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 2)
    setTimeout(() => ctx.close(), 2500)
  } catch { /* silently ignore — blocked by browser autoplay policy */ }
}

/* ─── Alert Banner ─── */
function AlertBanner({ alerts, onDismiss, soundOn, onToggleSound }) {
  const primary  = alerts[0]
  const color    = ALERT_COLOR[primary.severity] || ALERT_COLOR.warning
  const isCritical = primary.severity === 'critical' || primary.severity === 'high'

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1,  y: 0,   scale: 1    }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{
        background:  `color-mix(in srgb, ${color} 9%, var(--bg-surface))`,
        border:      `2px solid color-mix(in srgb, ${color} 40%, transparent)`,
        boxShadow:   `0 0 24px color-mix(in srgb, ${color} 18%, transparent)`,
      }}>

      {/* Pulsing glow overlay for critical alerts */}
      {isCritical && (
        <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: `color-mix(in srgb, ${color} 7%, transparent)` }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.0, repeat: Infinity }} />
      )}

      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b"
           style={{ borderColor: `color-mix(in srgb, ${color} 25%, transparent)` }}>
        {/* Siren light */}
        <motion.div className="w-5 h-5 rounded-full shrink-0"
          style={{ background: color }}
          animate={isCritical ? { scale: [1, 1.35, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.7, repeat: Infinity }} />

        <span className="font-black text-xs tracking-widest uppercase" style={{ color }}>
          🚨 Weather Alert — 15 km Radius
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* Mute / unmute siren */}
          <button onClick={onToggleSound}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
            title={soundOn ? 'Mute siren' : 'Unmute siren'}>
            {soundOn ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onDismiss}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
            title="Dismiss alert">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary alert body */}
      <div className="px-4 py-3 flex items-start gap-3">
        <motion.span className="text-3xl shrink-0 leading-none mt-0.5"
          animate={isCritical ? { rotate: [-8, 8, -8] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}>
          {primary.type.includes('thunder') ? '⚡' : '🌧️'}
        </motion.span>

        <div className="flex-1 min-w-0">
          <p className="font-black text-sm mb-0.5" style={{ color }}>
            {primary.title}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {primary.message}
          </p>

          {/* Additional alerts as chips */}
          {alerts.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {alerts.slice(1).map((a, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background:  `color-mix(in srgb, ${ALERT_COLOR[a.severity] || color} 12%, transparent)`,
                    border:      `1px solid color-mix(in srgb, ${ALERT_COLOR[a.severity] || color} 30%, transparent)`,
                    color:       ALERT_COLOR[a.severity] || color,
                  }}>
                  {a.title}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-1"
           style={{ borderTop: `1px solid color-mix(in srgb, ${color} 15%, transparent)` }}>
        <MapPin className="w-3 h-3 shrink-0" style={{ color }} />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Coverage: <strong style={{ color: 'var(--text-primary)' }}>~15 km radius</strong> around your GPS location · Real-time OWM data
        </p>
      </div>
    </motion.div>
  )
}

/* ─── Main component ─── */
export default function WeatherAdvisory({ demoMode }) {
  const [weather,        setWeather]       = useState(null)
  const [loading,        setLoading]       = useState(false)
  const [locating,       setLocating]      = useState(false)
  const [crop,           setCrop]          = useState('rice')
  const [alertDismissed, setAlertDismissed]= useState(false)
  const [soundOn,        setSoundOn]       = useState(true)
  const prevAlertKey     = useRef(null)

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true)
    setAlertDismissed(false)
    try {
      const data = await getWeather(lat, lon, crop, demoMode)
      setWeather(data)
    } catch {
      toast.error('Failed to fetch weather. Try Demo Mode.')
    } finally {
      setLoading(false)
    }
  }

  const handleLocate = () => {
    setLocating(true)
    if (!navigator.geolocation) {
      fetchWeatherByCoords(17.385, 78.4867); setLocating(false); return
    }
    navigator.geolocation.getCurrentPosition(
      pos => { fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude); setLocating(false) },
      ()  => { fetchWeatherByCoords(17.385, 78.4867); setLocating(false); toast('Using default location: Hyderabad') }
    )
  }

  useEffect(() => {
    if (demoMode) fetchWeatherByCoords(17.385, 78.4867)
  }, [demoMode])

  // Play siren when new alerts arrive
  useEffect(() => {
    if (!weather?.alerts?.length || alertDismissed || !soundOn) return
    const key = weather.alerts[0].type + weather.alerts[0].title
    if (key === prevAlertKey.current) return
    prevAlertKey.current = key
    playSiren(weather.alerts[0].severity)
  }, [weather, alertDismissed, soundOn])

  const riskColor   = weather ? pestRiskColor(weather.pest_risk) : 'var(--primary)'
  const riskWidth   = weather ? pestRiskWidth(weather.pest_risk) : '0%'
  const showAlerts  = weather?.alerts?.length > 0 && !alertDismissed

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 3%, transparent), transparent, color-mix(in srgb, var(--primary) 3%, transparent))' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">Hyperlocal Forecast</p>
          <h2 className="section-heading mb-3">🌦️ <span className="gradient-text">Weather & Crop Advisory</span></h2>
          <p className="section-subtext">Hyperlocal forecasts with AI-powered crop advisories, pest risk and live storm alerts</p>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex flex-wrap gap-3 justify-center mb-8">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleLocate} disabled={loading || locating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {locating ? 'Detecting...' : 'Use My Location'}
          </motion.button>
          <select value={crop} onChange={e => setCrop(e.target.value)} className="input-dark">
            {['rice', 'wheat', 'tomato', 'cotton', 'maize', 'sugarcane'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          {weather && (
            <button onClick={() => fetchWeatherByCoords(17.385, 78.4867)} disabled={loading}
              className="btn-outline flex items-center gap-2 disabled:opacity-60">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {loading && !weather ? (
            /* First-load spinner — don't show during refresh so weather doesn't go blank */
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-20">
              <div className="w-16 h-16 rounded-full border-4 animate-spin"
                   style={{ borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)', borderTopColor: 'var(--accent)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Fetching weather data...</p>
            </motion.div>

          ) : weather ? (
            <motion.div key="weather" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* ── Alert Banner ── */}
              <AnimatePresence>
                {showAlerts && (
                  <AlertBanner
                    key="alert-banner"
                    alerts={weather.alerts}
                    onDismiss={() => setAlertDismissed(true)}
                    soundOn={soundOn}
                    onToggleSound={() => {
                      const next = !soundOn
                      setSoundOn(next)
                      if (next && weather?.alerts?.length) playSiren(weather.alerts[0].severity)
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Current weather + forecast */}
              <div className="grid lg:grid-cols-3 gap-5 mb-6">
                {/* Main card */}
                <div className="card-glass p-6 lg:col-span-1 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin className="w-3 h-3" /> {weather.city}
                      </div>
                      <div className="text-6xl font-black" style={{ color: 'var(--text-primary)' }}>{weather.current?.temp}°</div>
                      <p className="capitalize" style={{ color: 'var(--text-secondary)' }}>{weather.current?.description}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Feels like {weather.current?.feels_like}°C</p>
                    </div>
                    <span className="text-5xl">{weatherIcons[weather.current?.icon] || '☁️'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Droplets className="w-4 h-4" />, label: 'Humidity',   val: `${weather.current?.humidity}%`,         color: 'var(--accent)'   },
                      { icon: <Wind     className="w-4 h-4" />, label: 'Wind',        val: `${weather.current?.wind_speed} km/h`,   color: 'var(--text-primary)' },
                      { icon: <Thermometer className="w-4 h-4"/>,label: 'UV Index',  val: weather.current?.uv_index,               color: 'var(--secondary)'},
                      { icon: <Eye      className="w-4 h-4" />, label: 'Rain Today',  val: `${weather.current?.rainfall_today} mm`, color: 'var(--accent)'   },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl p-3 subtle-surface">
                        <div className="flex items-center gap-1 mb-1" style={{ color: m.color }}>{m.icon}</div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{m.val}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forecast */}
                <div className="card-glass p-5 lg:col-span-2">
                  <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {weather.forecast?.length ?? 7}-Day Forecast
                  </h3>
                  <div className="grid gap-2"
                       style={{ gridTemplateColumns: `repeat(${weather.forecast?.length || 7}, minmax(0, 1fr))` }}>
                    {weather.forecast?.map((day, i) => {
                      const hasAlert = weather.alerts?.some(a =>
                        a.when === day.day || (a.type.includes('thunder') && day.icon?.startsWith('11')) || (a.type === 'heavy_rain_incoming' && day.rain_prob >= 75)
                      )
                      return (
                        <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-xl relative ${i === 0 ? 'subtle-accent' : 'subtle-surface'}`}
                          style={hasAlert ? { border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 0 8px rgba(239,68,68,0.1)' } : {}}>
                          {hasAlert && (
                            <span className="absolute -top-1.5 -right-1.5 text-xs">🚨</span>
                          )}
                          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{day.day}</p>
                          <span className="text-xl">{weatherIcons[day.icon] || '☁️'}</span>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{day.high}°</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{day.low}°</p>
                          <div className="w-full rounded-full h-1" style={{ background: 'var(--bg-input)' }}>
                            <div className="h-1 rounded-full" style={{ width: `${day.rain_prob}%`, background: 'var(--accent)' }} />
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{day.rain_prob}%</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Advisory + Pest Risk */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="card-glass p-5">
                  <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    🌾 Crop Advisory — {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {weather.advisory?.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl subtle-surface">
                        <div className="num-badge shrink-0">{i + 1}</div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-glass p-5">
                  <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🐛 Pest Risk Assessment</h3>
                  <div className="rounded-xl p-5 text-center mb-4"
                       style={{ background: `color-mix(in srgb, ${riskColor} 10%, transparent)`,
                                border:     `1px solid color-mix(in srgb, ${riskColor} 20%, transparent)` }}>
                    <p className="text-5xl font-black mb-2" style={{ color: riskColor }}>{weather.pest_risk}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Pest Risk Level</p>
                  </div>
                  <div className="mb-4">
                    <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: riskWidth }}
                        transition={{ duration: 1.2 }} className="h-3 rounded-full"
                        style={{ background: riskColor }} />
                    </div>
                    <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      <span>Low</span><span>Medium</span><span>High</span>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 subtle-surface">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {weather.pest_risk === 'Low'    && '✅ Low pest activity expected. Maintain regular monitoring.'}
                      {weather.pest_risk === 'Medium' && '⚠️ Moderate risk — scout fields twice weekly, especially for aphids and thrips.'}
                      {weather.pest_risk === 'High'   && '🚨 High risk! Apply preventive pesticide spray in next 24–48 hours.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          ) : (
            <motion.div key="empty" className="text-center py-20">
              <div className="text-6xl mb-4">🌤️</div>
              <p className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Get Hyperlocal Weather for Your Farm</p>
              <p style={{ color: 'var(--text-secondary)' }}>Click "Use My Location" or enable Demo Mode to see weather data and storm alerts</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
