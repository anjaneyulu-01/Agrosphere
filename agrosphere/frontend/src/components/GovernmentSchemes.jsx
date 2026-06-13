import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ChevronRight, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react'
import { findSchemes } from '../api'
import toast from 'react-hot-toast'

const STATES = ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Madhya Pradesh']
const CATEGORIES = ['all', 'loan', 'insurance', 'subsidy', 'training', 'market']

const categoryStyle = {
  loan:      { color: 'var(--secondary)', className: 'subtle-secondary' },
  insurance: { color: 'var(--accent)',    className: 'subtle-accent' },
  subsidy:   { color: 'var(--primary)',   className: 'subtle-primary' },
  training:  { color: '#a78bfa',          className: '' },
  market:    { color: '#fb923c',          className: '' },
}

const getCatStyle = (cat) => categoryStyle[cat] || categoryStyle.subsidy

export default function GovernmentSchemes({ demoMode }) {
  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState({ state: 'Telangana', farmer_type: 'small', crop: 'Rice', land_size_acres: 2, annual_income: 100000, category: 'all' })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const next = () => setStep(s => Math.min(s + 1, 3))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const handleFind = async () => {
    setLoading(true)
    try {
      const data = await findSchemes(form, demoMode)
      setResult(data)
      setStep(4)
      toast.success(`Found ${data.matched_schemes?.length || 0} matching schemes!`)
    } catch {
      toast.error('Failed to fetch schemes. Enable Demo Mode.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--secondary) 4%, transparent)' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">Welfare Schemes</p>
          <h2 className="section-heading mb-3">🏛️ <span className="gradient-text">Government Scheme Finder</span></h2>
          <p className="section-subtext">Answer 3 quick questions and discover all government schemes you're eligible for</p>
        </motion.div>

        {/* Progress Stepper */}
        {step <= 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  style={s < step
                    ? { background: 'var(--primary)', color: 'var(--primary-text)' }
                    : s === step
                      ? { background: 'color-mix(in srgb, var(--primary) 15%, transparent)', border: '2px solid var(--primary)', color: 'var(--primary)' }
                      : { background: 'var(--bg-input)', color: 'var(--text-secondary)' }
                  }>
                  {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className="w-16 h-0.5 transition-all"
                    style={{ background: s < step ? 'var(--primary)' : 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="card-glass p-7 rounded-2xl">
              <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Step 1: Basic Information</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Your State</label>
                  <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-dark w-full">
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Farmer Type</label>
                  <select value={form.farmer_type} onChange={e => setForm({ ...form, farmer_type: e.target.value })} className="input-dark w-full">
                    <option value="small">Small Farmer (&lt;2 ha)</option>
                    <option value="marginal">Marginal Farmer (&lt;1 ha)</option>
                    <option value="large">Large Farmer (2+ ha)</option>
                  </select>
                </div>
              </div>
              <button onClick={next} className="btn-primary flex items-center gap-2 ml-auto">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="card-glass p-7 rounded-2xl">
              <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Step 2: Farm Details</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Primary Crop</label>
                  <select value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} className="input-dark w-full">
                    {['Rice', 'Wheat', 'Cotton', 'Maize', 'Sugarcane', 'Tomato', 'Onion', 'Chilli', 'Groundnut'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Land Size (acres)</label>
                  <input type="number" value={form.land_size_acres} min="0.5" step="0.5"
                    onChange={e => setForm({ ...form, land_size_acres: parseFloat(e.target.value) })} className="input-dark w-full" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Annual Income: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{form.annual_income.toLocaleString()}</span>
                </label>
                <input type="range" min="25000" max="500000" step="25000" value={form.annual_income}
                  onChange={e => setForm({ ...form, annual_income: parseInt(e.target.value) })}
                  className="w-full" style={{ accentColor: 'var(--primary)' }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  <span>₹25K</span><span>₹5L</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={back} className="btn-outline">Back</button>
                <button onClick={next} className="btn-primary flex items-center gap-2 ml-auto">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="card-glass p-7 rounded-2xl">
              <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Step 3: What are you looking for?</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                    className="py-3 px-2 rounded-xl text-xs font-semibold border transition-all capitalize"
                    style={form.category === cat
                      ? { background: 'color-mix(in srgb, var(--primary) 12%, transparent)', borderColor: 'var(--primary)', color: 'var(--primary)' }
                      : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                    }>
                    {cat === 'all' ? '🔍 All' : cat === 'loan' ? '🏦 Loan' : cat === 'insurance' ? '🛡️ Insurance' : cat === 'subsidy' ? '💰 Subsidy' : cat === 'training' ? '📚 Training' : '🛒 Market'}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={back} className="btn-outline">Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleFind} disabled={loading}
                  className="btn-primary flex items-center gap-2 ml-auto disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                  {loading ? 'Finding...' : 'Find My Schemes'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {result.personalized_tip && (
                <div className="subtle-secondary rounded-2xl p-4 mb-5 flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.personalized_tip}</p>
                </div>
              )}
              <p className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                Found <span style={{ color: 'var(--primary)' }}>{result.matched_schemes?.length}</span> schemes for you
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                {result.matched_schemes?.map(scheme => {
                  const cs = getCatStyle(scheme.category)
                  return (
                    <motion.div key={scheme.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="card-glass p-5 rounded-2xl hover:scale-[1.01] transition-transform">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{scheme.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium capitalize ${cs.className}`}
                          style={!cs.className ? { color: cs.color, background: `${cs.color}18`, borderColor: `${cs.color}30` } : { color: cs.color }}>
                          {scheme.category}
                        </span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{scheme.ministry}</p>
                      <p className="font-semibold text-sm mb-2" style={{ color: 'var(--primary)' }}>💰 {scheme.benefit}</p>
                      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{scheme.eligibility}</p>
                      <div className="flex gap-2">
                        <a href={scheme.apply_url} target="_blank" rel="noreferrer"
                          className="flex-1 btn-primary text-center text-xs py-2 flex items-center justify-center gap-1">
                          Apply Now <ExternalLink className="w-3 h-3" />
                        </a>
                        <button className="btn-outline text-xs py-2 px-3">📖 Explain</button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <button onClick={() => { setStep(1); setResult(null) }} className="btn-outline w-full">Search Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
