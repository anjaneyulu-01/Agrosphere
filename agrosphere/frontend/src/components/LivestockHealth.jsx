import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Loader2, AlertCircle, Phone } from 'lucide-react'
import { diagnoseLivestock } from '../api'
import toast from 'react-hot-toast'

const ANIMALS  = ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Pig']
const SYMPTOMS = ['Fever', 'Loss of appetite', 'Coughing', 'Diarrhea', 'Limping', 'Skin lesions', 'Reduced milk', 'Behavioral changes', 'Weight loss', 'Nasal discharge']
const EMOJI    = { Cow: '🐄', Buffalo: '🐃', Goat: '🐐', Sheep: '🐑', Poultry: '🐔', Pig: '🐷' }

const severityStyle = {
  Low:      { bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.2)',   text: '#4ade80' },
  Medium:   { bg: 'rgba(234,179,8,0.1)',    border: 'rgba(234,179,8,0.2)',   text: '#facc15' },
  High:     { bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.2)',  text: '#fb923c' },
  Critical: { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)',   text: '#f87171' },
}

export default function LivestockHealth({ demoMode }) {
  const [animal,   setAnimal]   = useState('Cow')
  const [symptoms, setSymptoms] = useState([])
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  const toggleSymptom = (s) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const diagnose = async () => {
    if (symptoms.length === 0) { toast.error('Select at least one symptom'); return }
    setLoading(true)
    try {
      const data = await diagnoseLivestock({ animal_type: animal, symptoms: symptoms.map(s => s.toLowerCase()) }, demoMode)
      setResult(data)
      toast.success('Diagnosis complete')
    } catch {
      toast.error('Diagnosis failed. Enable Demo Mode.')
    } finally {
      setLoading(false)
    }
  }

  const sev = result ? severityStyle[result.severity] || severityStyle.Medium : null

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      <div className="absolute right-0 top-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--primary) 4%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">Veterinary AI</p>
          <h2 className="section-heading mb-3">🐄 <span className="gradient-text">Livestock Health Tracker</span></h2>
          <p className="section-subtext">AI-powered livestock disease diagnosis from symptoms — instant veterinary guidance</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="card-glass p-6 rounded-2xl flex flex-col gap-5">

            {/* Animal selector */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Select Animal</h3>
              <div className="grid grid-cols-3 gap-2">
                {ANIMALS.map(a => (
                  <button key={a} onClick={() => setAnimal(a)}
                    className="py-3 rounded-xl text-sm font-medium border transition-all"
                    style={animal === a
                      ? { background: 'color-mix(in srgb, var(--primary) 15%, transparent)', borderColor: 'color-mix(in srgb, var(--primary) 40%, transparent)', color: 'var(--primary)' }
                      : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                    }>
                    {EMOJI[a]} {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Symptoms <span className="font-normal text-sm" style={{ color: 'var(--text-secondary)' }}>(select all that apply)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className="px-3 py-2 rounded-xl text-sm border transition-all"
                    style={symptoms.includes(s)
                      ? { background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.35)', color: '#fca5a5' }
                      : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                    }>
                    {symptoms.includes(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
              {symptoms.length > 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {symptoms.length} symptom{symptoms.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={diagnose} disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
              {loading ? 'Diagnosing...' : 'Diagnose Now'}
            </motion.button>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                {/* Diagnosis */}
                <div className="p-5 rounded-2xl border"
                     style={{ background: sev?.bg, borderColor: sev?.border }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Diagnosis</p>
                      <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{result.diagnosis}</h3>
                    </div>
                    <span className="px-3 py-1.5 rounded-full text-sm font-bold"
                          style={{ background: sev?.bg, border: `1px solid ${sev?.border}`, color: sev?.text }}>
                      {result.severity}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{result.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 rounded-full h-2" style={{ background: 'var(--bg-input)' }}>
                      <div className="h-2 rounded-full"
                        style={{ width: `${result.confidence}%`, background: 'linear-gradient(90deg, var(--accent), var(--primary))' }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{result.confidence}% confident</span>
                  </div>
                </div>

                {/* First aid */}
                <div className="card-glass p-4 rounded-2xl">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <AlertCircle className="w-4 h-4 text-orange-400" /> Immediate First Aid
                  </h3>
                  {result.first_aid?.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <span className="font-bold text-xs w-5 shrink-0" style={{ color: 'var(--primary)' }}>{i + 1}.</span>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                    </div>
                  ))}
                </div>

                {/* Vet advice */}
                <div className="subtle-red rounded-2xl p-4">
                  <h3 className="font-bold mb-2 text-sm flex items-center gap-2 text-red-400">
                    <Phone className="w-4 h-4" /> Veterinary Advice
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{result.veterinary_advice}</p>
                  {result.helpline && (
                    <p className="text-sm font-semibold mt-2" style={{ color: 'var(--accent)' }}>📞 {result.helpline}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="card-glass p-3 rounded-xl flex-1 text-center">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Recovery Time</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{result.recovery_timeline}</p>
                  </div>
                  <button
                    onClick={() => toast('Vet call feature coming soon! 📞', { icon: '🐄' })}
                    className="btn-outline flex items-center gap-1.5 px-4 text-sm">
                    <Phone className="w-4 h-4" /> Call Vet
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" className="card-glass p-8 rounded-2xl flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl subtle-primary">🐄</div>
                <p className="font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  Select your animal type, check all symptoms, and get AI-powered diagnosis
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
