import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Calculator, Loader2 } from 'lucide-react'
import { registerAgentAction } from '../agent/agentBus'
import toast from 'react-hot-toast'

const CROP_WATER   = { Rice: 6, Wheat: 3, Maize: 4, Cotton: 5, Tomato: 4.5, Sugarcane: 8, Groundnut: 3.5, Chilli: 4 }
const SOIL_FACTOR  = { Clay: 0.8, Sandy: 1.3, Loamy: 1.0, 'Black Cotton': 0.75 }

function WaterDroplet({ pct }) {
  return (
    <div className="relative w-28 h-36 mx-auto">
      <svg viewBox="0 0 100 130" className="w-full h-full">
        <defs>
          <clipPath id="drop">
            <path d="M50 5 Q75 40 75 75 A25 25 0 0 1 25 75 Q25 40 50 5Z" />
          </clipPath>
        </defs>
        <path d="M50 5 Q75 40 75 75 A25 25 0 0 1 25 75 Q25 40 50 5Z"
          fill="none" stroke="color-mix(in srgb, #00b4d8 30%, transparent)" strokeWidth="2" />
        <rect x="0" y={130 - 1.3 * pct} width="100" height="130" fill="rgba(0,180,216,0.6)" clipPath="url(#drop)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-black text-lg text-white">{pct}%</span>
      </div>
    </div>
  )
}

const moistureColor = (pct) => {
  if (pct < 30)  return 'text-red-400'
  if (pct > 60)  return ''
  return ''
}

export default function SmartIrrigation({ demoMode }) {
  const [form,    setForm]    = useState({ crop: 'Rice', soil_type: 'Loamy', area_acres: 2, soil_moisture_pct: 40, last_irrigation_date: new Date().toISOString().slice(0, 10) })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  // Returns a promise so the AI agent can await the computed plan.
  const calculate = () => new Promise(resolve => {
    setLoading(true)
    setTimeout(() => {
      const base = (CROP_WATER[form.crop] || 4) * (SOIL_FACTOR[form.soil_type] || 1)
      const moistureDeficit = Math.max(0, (70 - form.soil_moisture_pct) / 100)
      const waterPerAcre = base * moistureDeficit * 1000
      const totalWater = Math.round(waterPerAcre * form.area_acres)
      const nextDays = form.soil_moisture_pct > 60 ? 3 : form.soil_moisture_pct > 40 ? 1 : 0
      const traditional = Math.round(totalWater * 1.65)
      const saving = Math.round(((traditional - totalWater) / traditional) * 100)

      const schedule = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i)
        const irrigate = i % (nextDays + 1) === 0
        return {
          day: d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
          irrigate,
          amount: irrigate ? Math.round(totalWater * 0.3) : 0,
          time: irrigate ? (i % 2 === 0 ? '6:00 AM' : '6:30 AM') : '—',
        }
      })

      const res = { water_needed: totalWater, water_per_acre: Math.round(waterPerAcre), next_irrigation_days: nextDays, saving_pct: saving, traditional_usage: traditional, schedule }
      setResult(res)
      setLoading(false)
      toast.success(`Irrigation plan calculated! Save ${saving}% water.`)
      resolve(res)
    }, 1200)
  })

  // ── Expose to the AI agent ──
  useEffect(() => registerAgentAction('irrigation.run', calculate), [form])

  const moistureVal = form.soil_moisture_pct
  const moistureStyle = moistureVal < 30
    ? { color: '#f87171' }
    : moistureVal > 60
      ? { color: 'var(--primary)' }
      : { color: 'var(--secondary)' }

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--accent) 5%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">Water Management</p>
          <h2 className="section-heading mb-3">💧 <span className="gradient-text">Smart Irrigation Planner</span></h2>
          <p className="section-subtext">AI calculates exact water requirements — save up to 40% water</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="card-glass p-6 rounded-2xl">
            <h3 className="font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Calculator className="w-5 h-5" style={{ color: 'var(--accent)' }} /> Farm Details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Crop Type</label>
                  <select value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} className="input-dark w-full">
                    {Object.keys(CROP_WATER).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Soil Type</label>
                  <select value={form.soil_type} onChange={e => setForm({ ...form, soil_type: e.target.value })} className="input-dark w-full">
                    {Object.keys(SOIL_FACTOR).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  Farm Size: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{form.area_acres} acres</span>
                </label>
                <input type="range" min="0.5" max="20" step="0.5" value={form.area_acres}
                  onChange={e => setForm({ ...form, area_acres: parseFloat(e.target.value) })}
                  className="w-full" style={{ accentColor: 'var(--accent)' }} />
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  Current Soil Moisture: <span style={{ ...moistureStyle, fontWeight: 600 }}>{moistureVal}%</span>
                </label>
                <input type="range" min="0" max="100" value={form.soil_moisture_pct}
                  onChange={e => setForm({ ...form, soil_moisture_pct: parseInt(e.target.value) })}
                  className="w-full" style={{ accentColor: 'var(--accent)' }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  <span>Dry (0%)</span><span>Optimal (60-70%)</span><span>Saturated (100%)</span>
                </div>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Last Irrigation Date</label>
                <input type="date" value={form.last_irrigation_date}
                  onChange={e => setForm({ ...form, last_irrigation_date: e.target.value })}
                  className="input-dark w-full" />
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                data-agent="irrigation-run"
                onClick={calculate} disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Droplets className="w-5 h-5" />}
                {loading ? 'Calculating...' : 'Calculate Irrigation Plan'}
              </motion.button>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                {/* Water needed */}
                <div className="card-glass p-5 rounded-2xl">
                  <div className="flex items-center gap-6">
                    <WaterDroplet pct={form.soil_moisture_pct} />
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Water Needed Today</p>
                      <p className="text-4xl font-black" style={{ color: 'var(--accent)' }}>{result.water_needed.toLocaleString()} L</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{result.water_per_acre.toLocaleString()} L per acre</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>💚 {result.saving_pct}% saved</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>vs traditional ({result.traditional_usage.toLocaleString()} L)</span>
                      </div>
                    </div>
                  </div>
                  {result.next_irrigation_days === 0 ? (
                    <div className="mt-3 subtle-red rounded-xl p-3">
                      <p className="text-red-400 font-semibold text-sm">⚠️ Irrigate immediately — soil moisture critically low!</p>
                    </div>
                  ) : (
                    <div className="mt-3 subtle-primary rounded-xl p-3">
                      <p className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>
                        ✅ Next irrigation in {result.next_irrigation_days} day{result.next_irrigation_days > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* Weekly schedule */}
                <div className="card-glass p-5 rounded-2xl">
                  <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📅 Weekly Irrigation Schedule</h3>
                  <div className="flex flex-col gap-2">
                    {result.schedule.map((day, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${day.irrigate ? 'schedule-active' : 'subtle-surface'}`}>
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full"
                            style={{ background: day.irrigate ? 'var(--accent)' : 'var(--border)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{day.day}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{day.time}</span>
                          <span className="text-sm font-semibold"
                            style={{ color: day.irrigate ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {day.irrigate ? `${day.amount.toLocaleString()} L` : 'No irrigation'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" className="card-glass p-8 rounded-2xl flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center subtle-accent">
                  <Droplets className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                </div>
                <p className="font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  Fill in your farm details and click Calculate to get a personalized irrigation plan
                </p>
                <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="px-3 py-1 rounded-full subtle-surface">✓ 40% water savings</span>
                  <span className="px-3 py-1 rounded-full subtle-surface">✓ 7-day schedule</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
