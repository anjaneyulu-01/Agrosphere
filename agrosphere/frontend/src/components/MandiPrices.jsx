import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, Minus, Star, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getMarketPrices } from '../api'
import toast from 'react-hot-toast'

const TrendIcon = ({ trend }) => {
  if (trend === 'up')   return <TrendingUp   className="w-4 h-4 text-green-400" />
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />
  return <Minus className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
}

// CSS-variable-aware tooltip
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-lg" style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)',
    }}>
      <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="font-bold" style={{ color: 'var(--primary)' }}>₹{payload[0].value}</p>
    </div>
  )
}

export default function MandiPrices({ demoMode }) {
  const [data,     setData]    = useState(null)
  const [loading,  setLoading] = useState(false)
  const [search,   setCrop]    = useState('')
  const [state,    setState]   = useState('')
  const [selected, setSelected] = useState(null)

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const res = await getMarketPrices(search, state, demoMode)
      setData(res)
      if (res.prices?.length) setSelected(res.prices[0])
    } catch {
      toast.error('Failed to fetch market prices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (demoMode) fetchPrices() }, [demoMode])

  const chartData = data ? [
    ...(data.price_history?.slice(-14) || []).map(p => ({ ...p, type: 'actual' })),
    ...(data.forecast || []).map(p => ({ ...p, price: p.predicted_price })),
  ] : []

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--secondary) 5%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">Market Intelligence</p>
          <h2 className="section-heading mb-3">💰 <span className="gradient-text">Live Mandi Prices</span></h2>
          <p className="section-subtext">Real-time prices from 200+ mandis with AI-powered price forecasting</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex flex-wrap gap-3 mb-6 justify-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input value={search} onChange={e => setCrop(e.target.value)}
              placeholder="Search crop..." className="input-dark pl-9 w-48" />
          </div>
          <select value={state} onChange={e => setState(e.target.value)} className="input-dark">
            <option value="">All States</option>
            {['Telangana', 'Andhra Pradesh', 'Maharashtra', 'Karnataka', 'Punjab', 'Uttar Pradesh', 'Gujarat'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={fetchPrices} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Loading...' : 'Search Prices'}
          </motion.button>
        </motion.div>

        {data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Best market */}
            {data.best_market && (
              <div className="rounded-2xl p-5 flex items-center gap-4 subtle-secondary">
                <Star className="w-8 h-8 shrink-0" style={{ color: 'var(--secondary)' }} />
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--secondary)' }}>Best Market to Sell Today</p>
                  <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {data.best_market.crop} — {data.best_market.market}, {data.best_market.state}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Modal price: <span className="font-bold" style={{ color: 'var(--secondary)' }}>₹{data.best_market.modal_price}/quintal</span>
                  </p>
                </div>
              </div>
            )}

            {/* Price table */}
            <div className="card-glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      {['Crop', 'Market', 'State', 'Min ₹', 'Max ₹', 'Modal ₹', 'Trend'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                            style={{ color: 'var(--text-secondary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.prices?.slice(0, 12).map((row, i) => (
                      <motion.tr key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }} onClick={() => setSelected(row)}
                        className="border-b cursor-pointer transition-colors"
                        style={{
                          borderColor: 'var(--border)',
                          background: selected?.market === row.market && selected?.crop === row.crop
                            ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-input)' }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = selected?.market === row.market && selected?.crop === row.crop
                            ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent'
                        }}>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.crop}</td>
                        <td className="px-4 py-3 text-sm"      style={{ color: 'var(--text-secondary)' }}>{row.market}</td>
                        <td className="px-4 py-3 text-sm"      style={{ color: 'var(--text-secondary)' }}>{row.state}</td>
                        <td className="px-4 py-3"              style={{ color: 'var(--text-secondary)' }}>₹{row.min_price}</td>
                        <td className="px-4 py-3"              style={{ color: 'var(--text-secondary)' }}>₹{row.max_price}</td>
                        <td className="px-4 py-3 font-bold"    style={{ color: 'var(--text-primary)' }}>₹{row.modal_price}</td>
                        <td className="px-4 py-3"><TrendIcon trend={row.trend} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price chart */}
            <div className="card-glass p-5 rounded-2xl">
              <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📈 Price Trend & Forecast
                <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-secondary)' }}>
                  {selected ? `— ${selected.crop}, ${selected.market}` : ''}
                </span>
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5" style={{ background: 'var(--primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5" style={{ borderTop: '2px dashed var(--primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>AI Forecast</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!data && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💰</div>
            <p className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Check Real-time Mandi Prices</p>
            <p style={{ color: 'var(--text-secondary)' }}>Search by crop name or state, or enable Demo Mode</p>
          </div>
        )}
      </div>
    </section>
  )
}
