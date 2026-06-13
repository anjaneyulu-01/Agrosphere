import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Leaf, AlertCircle, CheckCircle2, Phone, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { detectDisease } from '../api'
import confetti from 'canvas-confetti'

const crops = ['Tomato', 'Rice', 'Wheat', 'Cotton', 'Maize', 'Potato', 'Groundnut', 'Chilli']

const severityConfig = {
  Low:      { class: 'severity-low',      icon: '🟢' },
  Medium:   { class: 'severity-medium',   icon: '🟡' },
  High:     { class: 'severity-high',     icon: '🟠' },
  Critical: { class: 'severity-critical', icon: '🔴' },
}

export default function CropDoctor({ demoMode }) {
  const [image,     setImage]     = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [crop,      setCrop]      = useState('Tomato')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)
  const [dragging,  setDragging]  = useState(false)
  const fileInputRef = useRef()

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImage(e.target.result)
    reader.readAsDataURL(file)
    setResult(null); setError(null)
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleDiagnose = async () => {
    if (!imageFile && !demoMode) { toast.error('Please upload a crop image first'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await detectDisease(imageFile || new File(['demo'], 'demo.jpg', { type: 'image/jpeg' }), crop.toLowerCase(), demoMode)
      setResult(data)
      if (data.is_healthy) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
        toast.success('Great news! Your crop is healthy! 🎉')
      } else {
        toast.error(`Disease detected: ${data.disease}`)
      }
    } catch {
      setError('Failed to analyze image. Please try Demo Mode or check your connection.')
      toast.error('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const sev = result ? severityConfig[result.severity] || severityConfig.Medium : null

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--primary) 5%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">AI Diagnosis</p>
          <h2 className="section-heading mb-3">🌿 <span className="gradient-text">AI Crop Doctor</span></h2>
          <p className="section-subtext">Upload a photo of your crop — AI diagnoses disease and gives treatment in seconds</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="flex flex-col gap-5">

            {/* Drop zone */}
            <div
              className="relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer"
              style={{
                borderColor: dragging ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 30%, transparent)',
                background:  dragging ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent',
              }}
              onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)}
              onDragOver={e => e.preventDefault()} onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={e => { if (!dragging) e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 55%, transparent)' }}
              onMouseLeave={e => { if (!dragging) e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 30%, transparent)' }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleFile(e.target.files[0])} />
              {image ? (
                <div className="relative">
                  <img src={image} alt="Crop" className="max-h-52 mx-auto rounded-xl object-contain" />
                  <button onClick={e => { e.stopPropagation(); setImage(null); setImageFile(null); setResult(null) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}>
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center subtle-primary">
                    <Upload className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Drop your crop photo here</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>or click to browse • JPG, PNG, WEBP</p>
                  </div>
                </div>
              )}
            </div>

            {/* Crop selector */}
            <div>
              <label className="text-sm mb-2 block font-medium" style={{ color: 'var(--text-secondary)' }}>Select Crop Type</label>
              <div className="grid grid-cols-4 gap-2">
                {crops.map(c => (
                  <button key={c} onClick={() => setCrop(c)}
                    className="py-2 px-3 rounded-xl text-sm font-medium transition-all border"
                    style={crop === c
                      ? { background: 'var(--primary)', color: 'var(--primary-text)', borderColor: 'var(--primary)' }
                      : { background: 'var(--bg-input)', color: 'var(--text-secondary)', borderColor: 'var(--input-border)' }
                    }>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleDiagnose} disabled={loading}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Analyzing your crop...</>
              ) : (
                <><Leaf className="w-5 h-5" />{demoMode ? 'Run Demo Analysis' : 'Diagnose Now'}</>
              )}
            </motion.button>

            {demoMode && (
              <div className="subtle-secondary rounded-xl p-3 flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--secondary)' }}>⚡ Demo Mode: Using pre-loaded sample data</span>
              </div>
            )}
          </motion.div>

          {/* Right: Results */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="card-glass rounded-2xl p-8 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 animate-spin"
                       style={{ borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)', borderTopColor: 'var(--primary)' }} />
                  <Leaf className="absolute inset-0 m-auto w-8 h-8" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>AI is analyzing your crop...</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Scanning for diseases, pests, and deficiencies</p>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-input)' }}>
                  <motion.div className="h-2 rounded-full" initial={{ width: '0%' }} animate={{ width: '85%' }}
                    transition={{ duration: 2.5 }}
                    style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
                </div>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card-glass rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Analysis Failed</p>
                <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                <button onClick={() => { setError(null); setResult(null) }} className="btn-outline flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-2xl p-6 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {result.is_healthy
                      ? <CheckCircle2 className="w-7 h-7 mt-0.5" style={{ color: 'var(--primary)' }} />
                      : <AlertCircle className="w-7 h-7 text-orange-400 mt-0.5" />}
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{result.disease}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{result.description}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${sev?.class}`}>
                    {sev?.icon} {result.severity}
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>Confidence</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{result.confidence}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-input)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1 }} className="h-2 rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
                  </div>
                </div>

                {/* Cause */}
                <div className="rounded-xl p-3 subtle-surface">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Cause</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>🦠 {result.cause}</p>
                </div>

                {/* Treatment */}
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Treatment Plan</p>
                  <div className="flex flex-col gap-1.5">
                    {result.treatment?.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-bold w-5 shrink-0" style={{ color: 'var(--primary)' }}>{i + 1}.</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="subtle-red rounded-xl p-3 text-center">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Crop Loss Risk</p>
                    <p className="text-red-400 font-bold text-sm">{result.crop_loss_estimate}</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Urgency</p>
                    <p className="text-orange-400 font-bold text-sm">{result.urgency}</p>
                  </div>
                </div>

                <button
                  onClick={() => toast('Expert call feature coming soon! 📞', { icon: '🌾' })}
                  className="btn-outline w-full flex items-center justify-center gap-2 text-sm">
                  <Phone className="w-4 h-4" /> Get Expert Call
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card-glass rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center subtle-primary">
                  <Leaf className="w-10 h-10" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ready to Diagnose</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Upload a clear photo of your crop leaf or stem,<br />select the crop type, and click Diagnose Now.
                  </p>
                </div>
                <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="px-3 py-1 rounded-full subtle-surface">✓ 30+ diseases detected</span>
                  <span className="px-3 py-1 rounded-full subtle-surface">✓ 95% accuracy</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
