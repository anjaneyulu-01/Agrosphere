import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Zap, Globe, Layers, Database } from 'lucide-react'

const fadeInUp = {
  hidden:   { opacity: 0, y: 48 },
  visible:  { opacity: 1, y: 0,  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
}

const floatA = { y: [-6, 6, -6], transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }
const floatB = { y: [6, -6,  6], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }

export default function Hero() {
  const canvasRef = useRef(null)
  const [particleRgb, setParticleRgb] = useState(
    () => document.documentElement.classList.contains('light') ? '22,163,74' : '0,255,136'
  )
  const particleRef = useRef(particleRgb)
  particleRef.current = particleRgb

  /* Theme observer → update particle colour on toggle */
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const light = document.documentElement.classList.contains('light')
      setParticleRgb(light ? '22,163,74' : '0,255,136')
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  /* Canvas particle field */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const pts = Array.from({ length: 90 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.8 + 0.4,
      a:  Math.random() * 0.45 + 0.08,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const rgb = particleRef.current
      const isLight = document.documentElement.classList.contains('light')
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width)  p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${isLight ? p.a * 0.5 : p.a})`
        ctx.fill()
      })
      pts.forEach((p, i) => {
        pts.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(${rgb},${isLight ? 0.04 : 0.07} * (1 - ${d}/110))`
            ctx.strokeStyle = `rgba(${rgb},${(isLight ? 0.04 : 0.07) * (1 - d / 110)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden hero-section">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Ambient blobs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none hero-blob-1"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none hero-blob-2"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
      <div className="absolute inset-0 hero-fade-overlay pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* ── Left copy ── */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6">

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight">
              <span style={{ color: 'var(--text-primary)' }}>Smart Farming</span>
              <br />
              <span className="gradient-text">Starts Here</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
              AI-powered platform with{' '}
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>8 core solutions</span> for{' '}
              <span className="font-bold" style={{ color: 'var(--primary)' }}>150 million Indian farmers</span>{' '}
              — crop disease, weather, markets, loans, and 20+ more in one place.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: '0 0 32px rgba(0,200,100,0.5)' }}
                whileTap={{ scale: 0.94 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary flex items-center gap-2"
              >
                Explore Platform <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => document.getElementById('crop-doctor')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Live Demo
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-6 pt-4 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              {[
                { icon: <Layers className="w-4 h-4" />, text: '20 Solutions' },
                { icon: <Zap    className="w-4 h-4" />, text: '8 AI Models' },
                { icon: <Globe  className="w-4 h-4" />, text: '3 Languages' },
                { icon: <Database className="w-4 h-4" />, text: 'Real-time Data' },
              ].map((s, i) => (
                <motion.div
                  key={s.text}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                >
                  <span style={{ color: 'var(--primary)' }}>{s.icon}</span>
                  {s.text}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right — Dashboard mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 70, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex flex-col items-center gap-4"
            style={{ perspective: 800 }}
          >
            {/* Card */}
            <motion.div
              animate={floatA}
              className="card-glass p-6 w-full max-w-sm glow-green"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--primary)' }}
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--primary)' }}>
                    LIVE DASHBOARD
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  Karimnagar, TG
                </span>
              </div>

              {/* Crop Health */}
              <div className="rounded-xl p-4 mb-3" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>🌱 Crop Health</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>87%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 1.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="h-2 rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Rice crop — Good condition</p>
              </div>

              {/* Weather */}
              <div className="rounded-xl p-4 mb-3" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⛅</span>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>28°C</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Partly Cloudy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Humidity</p>
                    <p className="font-semibold" style={{ color: 'var(--accent)' }}>68%</p>
                  </div>
                </div>
              </div>

              {/* Market Price */}
              <div className="rounded-xl p-4 mb-3" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>💰 Tomato — Bowenpally</p>
                    <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>₹24/kg</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>↑ 12%</span>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>vs yesterday</p>
                  </div>
                </div>
              </div>

              {/* Alert */}
              <div className="rounded-xl p-3 flex items-start gap-3"
                   style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-400">Pest Risk Detected</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>High humidity — aphid risk in cotton</p>
                </div>
              </div>
            </motion.div>

            {/* Badges below the card (no longer floating overlays) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex gap-3 justify-center"
            >
              <motion.div
                animate={floatB}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-lg"
                style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
              >
                <Zap className="w-3 h-3" /> AI Powered
              </motion.div>
              <motion.div
                animate={{ ...floatA, transition: { ...floatA.transition, delay: 0.4 } }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-lg"
                style={{ background: 'var(--secondary)', color: '#000' }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-black"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                Real-time
              </motion.div>
              <motion.div
                animate={floatB}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-lg"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                🇮🇳 India
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
