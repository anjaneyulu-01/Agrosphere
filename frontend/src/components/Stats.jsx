import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'

const stats = [
  { icon: '🌾', value: 150000, suffix: '+',   label: 'Farmers Helped',             color: 'var(--primary)',   varRaw: '0,255,136' },
  { icon: '📸', value: 95,     suffix: '%',   label: 'Disease Detection Accuracy', color: 'var(--primary)',   varRaw: '0,255,136' },
  { icon: '💧', value: 40,     suffix: '%',   label: 'Average Water Saved',        color: 'var(--accent)',    varRaw: '0,180,216' },
  { icon: '💰', value: 3.2,    suffix: 'Cr',  label: 'Additional Farmer Income',   color: 'var(--secondary)', varRaw: '255,215,0', prefix: '₹' },
  { icon: '🤖', value: 20,     suffix: '',    label: 'AI-Powered Solutions',       color: 'var(--primary)',   varRaw: '0,255,136' },
  { icon: '📱', value: 3,      suffix: '',    label: 'Languages Supported',        color: 'var(--accent)',    varRaw: '0,180,216' },
  { icon: '🏛️', value: 50,    suffix: '+',   label: 'Government Schemes Listed',  color: 'var(--secondary)', varRaw: '255,215,0' },
  { icon: '⚡', value: 3,      suffix: 'sec', label: 'AI Response Time',           color: 'var(--primary)',   varRaw: '0,255,136', prefix: '<' },
]

function AnimCounter({ target, suffix, prefix, color }) {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const mv     = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 60, damping: 18 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    mv.set(target)
  }, [inView, target, mv])

  useEffect(() => {
    const unsub = spring.on('change', v => {
      const isFloat = target % 1 !== 0
      setDisplay(isFloat ? parseFloat(v.toFixed(1)) : Math.floor(v))
    })
    return unsub
  }, [spring, target])

  return (
    <span ref={ref} className="tabular-nums" style={{ color }}>
      {prefix}{display}{suffix}
    </span>
  )
}

const cardVariants = {
  hidden:  { opacity: 0, y: 36, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export default function Stats() {
  return (
    <section className="py-24 relative overflow-hidden stats-section">
      {/* Animated ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full stats-orb"
            style={{
              width:  200 + i * 90,
              height: 200 + i * 90,
              left:   `${i * 20}%`,
              top:    `${i * 16}%`,
              background: i % 2 === 0
                ? 'radial-gradient(circle, rgba(0,200,100,0.18), transparent 70%)'
                : 'radial-gradient(circle, rgba(255,215,0,0.12), transparent 70%)',
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.p
            className="text-sm font-bold tracking-widest uppercase mb-3"
            style={{ color: 'var(--primary)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Impact Metrics
          </motion.p>
          <h2 className="section-heading mb-4">
            Our <span className="gradient-text">Impact in Numbers</span>
          </h2>
          <p className="section-subtext">Real results for real farmers across India</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover={{ scale: 1.06, y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="card-glass p-6 text-center rounded-2xl relative overflow-hidden group"
            >
              {/* Subtle glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 80%, ${stat.varRaw ? `rgba(${stat.varRaw},0.08)` : 'rgba(0,200,100,0.08)'}, transparent 70%)` }}
              />

              <motion.div
                className="text-4xl mb-3"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
              >
                {stat.icon}
              </motion.div>
              <div className="text-3xl sm:text-4xl font-black mb-2">
                <AnimCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  color={stat.color}
                />
              </div>
              <p className="text-sm leading-tight" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
