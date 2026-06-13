import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Camera, Cloud, Droplets, TrendingUp, Building2, Bot, Tractor, BarChart3, ChevronRight } from 'lucide-react'

const fadeInUp = {
  hidden:  { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const features = [
  { icon: <Camera   className="w-7 h-7" />, title: 'Crop Disease Detection',   desc: 'Upload a photo — AI diagnoses disease and gives treatment in your language', badge: '95% Accuracy',   color: 'var(--primary)',   api: 'Hugging Face Vision AI', href: '#crop-doctor' },
  { icon: <Cloud    className="w-7 h-7" />, title: 'Weather & Crop Advisory',  desc: 'Hyperlocal 7-day forecast with crop-specific advisories and pest risk alerts', badge: 'Real-time',       color: 'var(--accent)',    api: 'OpenWeather API',      href: '#weather'    },
  { icon: <Droplets className="w-7 h-7" />, title: 'Smart Irrigation',         desc: 'AI calculates exact water needed based on crop, soil, and weather. Save 40%.',  badge: 'IoT Ready',       color: 'var(--accent)',    api: 'Custom ML Model',      href: '#irrigation' },
  { icon: <TrendingUp className="w-7 h-7" />, title: 'Live Mandi Prices',      desc: 'Real-time prices from 200+ mandis. AI forecasts best time to sell.',            badge: '200+ Markets',    color: 'var(--secondary)', api: 'Agmarknet API',        href: '#market'     },
  { icon: <Building2 className="w-7 h-7" />, title: 'Government Scheme Finder',desc: 'Answer 3 questions — get matched to all eligible central and state schemes.',   badge: '50+ Schemes',     color: 'var(--secondary)', api: 'Gemini AI Matching',   href: '#schemes'    },
  { icon: <Bot      className="w-7 h-7" />, title: 'AI Farming Assistant',     desc: 'Ask anything about farming in Telugu, Hindi, or English. Powered by Gemini.',   badge: '3 Languages',     color: 'var(--primary)',   api: 'Gemini 1.5 Flash',     href: '#ai-assistant' },
  { icon: <Tractor  className="w-7 h-7" />, title: 'Equipment Rental',         desc: 'Find and book tractors, harvesters, sprayers near you by the hour.',             badge: '10k+ Listings',   color: 'var(--text-secondary)', api: 'Geolocation API',  href: '#equipment'  },
  { icon: <BarChart3 className="w-7 h-7" />, title: 'Yield Prediction',        desc: 'Input crop, soil, weather data — AI predicts expected yield and revenue.',       badge: 'ML Powered',      color: 'var(--primary)',   api: 'Hugging Face ML',      href: '#yield'      },
]

function TiltCard({ children, className, style }) {
  const ref  = useRef(null)
  const mx   = useMotionValue(0)
  const my   = useMotionValue(0)
  const rx   = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]),  { stiffness: 200, damping: 24 })
  const ry   = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]),  { stiffness: 200, damping: 24 })

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width  - 0.5)
    my.set((e.clientY - r.top)  / r.height - 0.5)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Features() {
  return (
    <section className="py-24 relative overflow-hidden features-section">
      <div className="absolute inset-0 features-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="text-center mb-14"
        >
          <motion.p
            className="text-sm font-bold tracking-widest uppercase mb-3"
            style={{ color: 'var(--primary)' }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Platform Features
          </motion.p>
          <h2 className="section-heading mb-4">
            Everything a Farmer Needs.{' '}
            <span className="gradient-text">One Platform.</span>
          </h2>
          <p className="section-subtext">
            8 core AI-driven modules covering every aspect of modern farming — from seed to sale.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeInUp}>
              <TiltCard className="feature-card p-5 flex flex-col gap-4 group h-full cursor-pointer">
                <div className="flex items-start justify-between">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `color-mix(in srgb, ${f.color} 12%, transparent)`,
                      color: f.color,
                      border: `1px solid color-mix(in srgb, ${f.color} 25%, transparent)`,
                    }}
                    whileHover={{ scale: 1.15, rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {f.icon}
                  </motion.div>
                  <motion.span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      color: f.color,
                      background: `color-mix(in srgb, ${f.color} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${f.color} 22%, transparent)`,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {f.badge}
                  </motion.span>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>

                <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>⚡ {f.api}</span>
                  <motion.button
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => document.querySelector(f.href)?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: f.color }}
                  >
                    Open <ChevronRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
