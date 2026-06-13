import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import { getInsuranceAssistance } from '../api'
import toast from 'react-hot-toast'

export default function InsuranceClaim({ demoMode }) {
  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState({ insurance_type: 'PMFBY', crop: 'Rice', damage_percentage: 40, damage_cause: 'Flood', area_affected_acres: 2 })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const data = await getInsuranceAssistance(form, demoMode)
      setResult(data)
      setStep(3)
      toast.success('Claim assessment complete!')
    } catch {
      toast.error('Failed. Enable Demo Mode.')
    } finally {
      setLoading(false)
    }
  }

  const damageColor = form.damage_percentage > 70 ? '#f87171' : form.damage_percentage > 40 ? 'var(--secondary)' : 'var(--primary)'

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--accent) 4%, transparent)' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">Claim Assistance</p>
          <h2 className="section-heading mb-3">🛡️ <span className="gradient-text">Insurance Claim Assistant</span></h2>
          <p className="section-subtext">Step-by-step guided insurance claim process with AI-powered form filling</p>
        </motion.div>

        {/* Timeline */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {['Damage Details', 'Review & Submit', 'Claim Status'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={i + 1 === step
                  ? { background: 'var(--primary)', color: 'var(--primary-text)' }
                  : i + 1 < step
                    ? { background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }
                    : { background: 'var(--bg-input)', color: 'var(--text-secondary)' }
                }>
                {i + 1 < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                <span className="ml-1">{label}</span>
              </div>
              {i < 2 && <div className="w-8 h-px" style={{ background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="card-glass p-7 rounded-2xl">
              <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Step 1: Crop Damage Details</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Insurance Type</label>
                  <select value={form.insurance_type} onChange={e => setForm({ ...form, insurance_type: e.target.value })} className="input-dark w-full">
                    {['PMFBY', 'State Scheme', 'Private Insurance'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Affected Crop</label>
                  <select value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} className="input-dark w-full">
                    {['Rice', 'Wheat', 'Cotton', 'Maize', 'Sugarcane', 'Tomato', 'Groundnut'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Damage Cause</label>
                  <select value={form.damage_cause} onChange={e => setForm({ ...form, damage_cause: e.target.value })} className="input-dark w-full">
                    {['Flood', 'Drought', 'Hailstorm', 'Pest Attack', 'Disease', 'Fire', 'Cyclone'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Area Affected (acres)</label>
                  <input type="number" value={form.area_affected_acres} min="0.5" step="0.5"
                    onChange={e => setForm({ ...form, area_affected_acres: parseFloat(e.target.value) })} className="input-dark w-full" />
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  Damage Percentage: <span style={{ color: damageColor, fontWeight: 600 }}>{form.damage_percentage}%</span>
                </label>
                <input type="range" min="10" max="100" step="5" value={form.damage_percentage}
                  onChange={e => setForm({ ...form, damage_percentage: parseInt(e.target.value) })}
                  className="w-full" style={{ accentColor: 'var(--secondary)' }} />
              </div>

              <div className="subtle-secondary rounded-xl p-3 mb-5 flex items-start gap-3">
                <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  ⏰ <strong style={{ color: 'var(--text-primary)' }}>Important:</strong> Report crop damage within 72 hours to the insurance company or bank to ensure eligibility.
                </p>
              </div>

              <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2 ml-auto">
                Next: Review <CheckCircle2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="card-glass p-7 rounded-2xl">
              <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Step 2: Review Claim Details</h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  ['Insurance', form.insurance_type],
                  ['Crop', form.crop],
                  ['Damage Cause', form.damage_cause],
                  ['Area Affected', `${form.area_affected_acres} acres`],
                  ['Damage %', `${form.damage_percentage}%`],
                  ['Expected', `₹${Math.round(form.area_affected_acres * form.damage_percentage * 300).toLocaleString()} approx`],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl p-3 subtle-surface">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{l}</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline">Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={submit} disabled={loading}
                  className="btn-primary flex items-center gap-2 ml-auto disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {loading ? 'Processing...' : 'Submit & Assess'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && result && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              {/* Eligibility */}
              <div className={`p-5 rounded-2xl ${result.claim_eligibility === 'Eligible' ? 'subtle-primary' : 'subtle-secondary'}`}>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8"
                    style={{ color: result.claim_eligibility === 'Eligible' ? 'var(--primary)' : 'var(--secondary)' }} />
                  <div>
                    <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{result.claim_eligibility}</p>
                    <p className="font-semibold" style={{ color: 'var(--primary)' }}>Estimated: {result.estimated_compensation}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="card-glass p-5 rounded-2xl">
                <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>📄 Required Documents</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {result.required_documents?.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Process steps */}
              <div className="card-glass p-5 rounded-2xl">
                <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>📋 Claim Process Steps</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
                  {result.claim_steps?.map((s, i) => (
                    <div key={i} className="flex items-start gap-4 mb-3 pl-10 relative">
                      <div className="absolute left-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--bg-surface)', border: '2px solid color-mix(in srgb, var(--primary) 40%, transparent)' }}>
                        <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{s.step}</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Helpline */}
              {result.helpline && (
                <div className="card-glass p-4 rounded-2xl flex items-center gap-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Helpline</p>
                    <p className="font-semibold" style={{ color: 'var(--primary)' }}>{result.helpline}</p>
                  </div>
                  <a href="https://pmfby.gov.in" target="_blank" rel="noreferrer"
                    className="ml-auto btn-outline text-xs flex items-center gap-1">
                    Apply Online <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <button onClick={() => { setStep(1); setResult(null) }} className="btn-outline w-full">Start New Claim</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
