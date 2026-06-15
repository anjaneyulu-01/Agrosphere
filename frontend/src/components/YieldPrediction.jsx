import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, Loader2 } from 'lucide-react'
import { predictYield } from '../api'
import { registerAgentAction } from '../agent/agentBus'
import toast from 'react-hot-toast'

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-lg" style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
    }}>
      <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="font-bold" style={{ color: 'var(--primary)' }}>{payload[0].value} Q/acre</p>
    </div>
  )
}

const BAR_COLORS = ['var(--primary)', 'var(--accent)', 'var(--secondary)']

export default function YieldPrediction({ demoMode }) {
  const [form,    setForm]    = useState({ crop: 'Rice', state: 'Telangana', district: 'Karimnagar', season: 'Kharif', area_acres: 3, soil_type: 'Clay', irrigation_type: 'irrigated', fertilizer_kg_per_acre: 70 })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const predict = async () => {
    setLoading(true)
    try {
      const data = await predictYield(form, demoMode)
      setResult(data)
      toast.success('Yield prediction complete!')
      return data
    } catch {
      toast.error('Prediction failed. Enable Demo Mode.')
      return null
    } finally {
      setLoading(false)
    }
  }

  // ── Expose to the AI agent ──
  useEffect(() => registerAgentAction('yield.run', predict), [form, demoMode])

  const chartData = result ? [
    { name: 'Your Farm', yield: result.predicted_yield_per_acre },
    { name: `${result.vs_state_average?.state?.split(' ')[0] || 'State'} Avg`, yield: result.vs_state_average?.state_avg },
    { name: 'National Avg', yield: result.vs_national_average?.national_avg },
  ] : []

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--primary) 4%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">ML Forecasting</p>
          <h2 className="section-heading mb-3">📈 <span className="gradient-text">AI Yield Prediction</span></h2>
          <p className="section-subtext">ML-powered crop yield forecasting with revenue estimation and improvement tips</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="card-glass p-6 rounded-2xl">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Crop',      key: 'crop',       type: 'select', opts: ['Rice', 'Wheat', 'Cotton', 'Maize', 'Sugarcane', 'Tomato', 'Groundnut'] },
                { label: 'State',     key: 'state',      type: 'select', opts: ['Telangana', 'Andhra Pradesh', 'Maharashtra', 'Punjab', 'Karnataka', 'UP'] },
                { label: 'District',  key: 'district',   type: 'text' },
                { label: 'Season',    key: 'season',     type: 'select', opts: ['Kharif', 'Rabi', 'Zaid'] },
                { label: 'Soil Type', key: 'soil_type',  type: 'select', opts: ['Clay', 'Sandy', 'Loamy', 'Black Cotton'] },
                { label: 'Irrigation',key: 'irrigation_type', type: 'select', opts: ['irrigated', 'rainfed'] },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="input-dark w-full">
                      {f.opts?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="input-dark w-full" />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Farm Area: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{form.area_acres} acres</span>
              </label>
              <input type="range" min="0.5" max="50" step="0.5" value={form.area_acres}
                onChange={e => setForm({ ...form, area_acres: parseFloat(e.target.value) })}
                className="w-full" style={{ accentColor: 'var(--primary)' }} />
            </div>

            <div className="mb-5">
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Fertilizer: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{form.fertilizer_kg_per_acre} kg/acre</span>
              </label>
              <input type="range" min="0" max="200" step="5" value={form.fertilizer_kg_per_acre}
                onChange={e => setForm({ ...form, fertilizer_kg_per_acre: parseInt(e.target.value) })}
                className="w-full" style={{ accentColor: 'var(--secondary)' }} />
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              data-agent="yield-run"
              onClick={predict} disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
              {loading ? 'Predicting...' : 'Predict Yield & Revenue'}
            </motion.button>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                {/* Main numbers */}
                <div className="card-glass p-5 rounded-2xl text-center">
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Predicted Yield</p>
                  <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-6xl font-black gradient-text">
                    {result.predicted_yield_per_acre}
                  </motion.p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>quintals/acre</p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total: {result.total_yield_quintals} Q</span>
                    <span style={{ color: 'var(--border)' }}>•</span>
                    <span className="font-bold" style={{ color: 'var(--primary)' }}>₹{result.expected_revenue?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>at ₹{result.mandi_price_per_quintal}/quintal mandi price</p>
                  <div className="flex justify-center gap-2 mt-3 flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full subtle-primary font-medium" style={{ color: 'var(--primary)' }}>
                      {result.vs_state_average?.difference} vs state avg
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full subtle-accent font-medium" style={{ color: 'var(--accent)' }}>
                      Confidence: {result.confidence_pct}%
                    </span>
                  </div>
                </div>

                {/* Chart */}
                <div className="card-glass p-5 rounded-2xl">
                  <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>Yield Comparison (quintals/acre)</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="yield" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tips */}
                {result.improvement_tips?.length > 0 && (
                  <div className="card-glass p-5 rounded-2xl">
                    <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>💡 Tips to Improve Yield</h3>
                    {result.improvement_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="font-bold text-xs w-5 shrink-0" style={{ color: 'var(--primary)' }}>{i + 1}.</span>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" className="card-glass p-8 rounded-2xl flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center subtle-primary">
                  <TrendingUp className="w-10 h-10" style={{ color: 'var(--primary)' }} />
                </div>
                <p className="font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  Fill crop details and predict expected yield, revenue, and comparison with state averages
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
