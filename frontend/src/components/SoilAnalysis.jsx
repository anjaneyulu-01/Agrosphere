import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { analyzeSoil } from '../api'
import { registerAgentAction } from '../agent/agentBus'
import toast from 'react-hot-toast'

const gaugeColor = (score) => {
  if (score >= 80) return 'var(--primary)'
  if (score >= 60) return 'var(--secondary)'
  if (score >= 40) return '#fb923c'
  return '#f87171'
}
const gaugeLabel = (score) => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

function GaugeChart({ score }) {
  const r = 60, cx = 80, cy = 80
  const circ  = 2 * Math.PI * r
  const arc   = circ * 0.75
  const filled = (arc * score) / 100
  const color  = gaugeColor(score)

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="120" viewBox="0 0 160 120">
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="12"
          stroke="rgba(128,128,128,0.12)"
          strokeDasharray={`${arc} ${circ - arc}`} strokeDashoffset={0}
          strokeLinecap="round" transform={`rotate(-225 ${cx} ${cy})`} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={0}
          strokeLinecap="round" transform={`rotate(-225 ${cx} ${cy})`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${filled} ${circ - filled}` }}
          transition={{ duration: 1.5, ease: 'easeOut' }} />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="var(--text-primary)" fontSize="24" fontWeight="900">{score}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="var(--text-secondary)" fontSize="11">/ 100</text>
      </svg>
      <p className="font-bold text-lg" style={{ color }}>{gaugeLabel(score)}</p>
    </div>
  )
}

const NUTRIENTS = [
  { key: 'nitrogen',        label: 'Nitrogen (N)',      unit: 'kg/ha', min: 0, max: 400, optimal: '140-280', color: 'var(--primary)' },
  { key: 'phosphorus',      label: 'Phosphorus (P)',    unit: 'kg/ha', min: 0, max: 50,  optimal: '11-25',   color: 'var(--accent)' },
  { key: 'potassium',       label: 'Potassium (K)',     unit: 'kg/ha', min: 0, max: 600, optimal: '140-280', color: 'var(--secondary)' },
  { key: 'ph',              label: 'Soil pH',           unit: '',      min: 4, max: 10,  step: 0.1, optimal: '6.0-7.5', color: '#a78bfa' },
  { key: 'organic_carbon',  label: 'Organic Carbon',   unit: '%',     min: 0, max: 3,   step: 0.05, optimal: '0.5-0.75', color: '#fb923c' },
]

export default function SoilAnalysis({ demoMode }) {
  const [form,    setForm]    = useState({ nitrogen: 180, phosphorus: 18, potassium: 200, ph: 6.8, organic_carbon: 0.55 })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const data = await analyzeSoil(form, demoMode)
      setResult(data)
      toast.success(`Soil health: ${data.grade} (${data.health_score}/100)`)
      return data
    } catch {
      toast.error('Analysis failed. Enable Demo Mode.')
      return null
    } finally {
      setLoading(false)
    }
  }

  // ── Expose to the AI agent ──
  useEffect(() => registerAgentAction('soil.run', analyze), [form, demoMode])

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute left-0 bottom-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--secondary) 4%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">Soil Science</p>
          <h2 className="section-heading mb-3">🌱 <span className="gradient-text">Soil Analysis</span></h2>
          <p className="section-subtext">Enter your soil test values and get a complete health report with fertilizer recommendations</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="card-glass p-6 rounded-2xl">
            <h3 className="font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Layers className="w-5 h-5" style={{ color: 'var(--primary)' }} /> Soil Test Values
            </h3>
            <div className="flex flex-col gap-5">
              {NUTRIENTS.map(n => (
                <div key={n.key}>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>{n.label}</label>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{form[n.key]} {n.unit}</span>
                  </div>
                  <input type="range" min={n.min} max={n.max} step={n.step || 1}
                    value={form[n.key]} onChange={e => setForm({ ...form, [n.key]: parseFloat(e.target.value) })}
                    className="w-full" style={{ accentColor: n.color }} />
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Optimal: {n.optimal} {n.unit}</p>
                </div>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              data-agent="soil-run"
              onClick={analyze} disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-5 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
              {loading ? 'Analyzing...' : 'Analyze Soil Health'}
            </motion.button>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                {/* Score */}
                <div className="card-glass p-5 rounded-2xl flex items-center gap-6">
                  <GaugeChart score={result.health_score} />
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Soil Health Score</p>
                    <p className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{result.grade} Soil</p>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[['N', result.scores?.n_score, 'var(--primary)'], ['P', result.scores?.p_score, 'var(--accent)'], ['K', result.scores?.k_score, 'var(--secondary)']].map(([l, v, c]) => (
                        <div key={l} className="text-center rounded-lg p-2 subtle-surface">
                          <p className="font-bold text-sm" style={{ color: c }}>{l}</p>
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{v}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Deficiencies */}
                {result.deficiencies?.length > 0 && (
                  <div className="card-glass p-4 rounded-2xl">
                    <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <AlertCircle className="w-4 h-4 text-orange-400" /> Issues Detected
                    </h3>
                    {result.deficiencies.map((d, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl mb-2 ${
                        d.status === 'Low' || d.status === 'Critical' ? 'subtle-red' : 'subtle-secondary'
                      }`}>
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{d.nutrient} — {d.status}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{d.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suitable crops */}
                <div className="card-glass p-4 rounded-2xl">
                  <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Best Crops for Your Soil
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.suitable_crops?.map(c => (
                      <span key={c} className="px-3 py-1.5 rounded-full text-sm font-medium subtle-primary"
                            style={{ color: 'var(--primary)' }}>{c}</span>
                    ))}
                  </div>
                </div>

                {/* Improvement plan */}
                {result.improvement_plan?.length > 0 && (
                  <div className="card-glass p-4 rounded-2xl">
                    <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>📋 6-Month Improvement Plan</h3>
                    {result.improvement_plan.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="font-bold text-xs w-5 shrink-0" style={{ color: 'var(--primary)' }}>{i + 1}.</span>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" className="card-glass p-8 rounded-2xl flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center subtle-primary">
                  <Layers className="w-10 h-10" style={{ color: 'var(--primary)' }} />
                </div>
                <p className="font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  Adjust the soil parameters and click Analyze to get a complete soil health report
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
