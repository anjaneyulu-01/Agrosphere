import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  { name: 'Ramaiah Naidu',  village: 'Karimnagar',  state: 'Telangana',       initial: 'R', color: '#00c864', rating: 5, quote: 'AgroSphere diagnosed my tomato crop disease in 30 seconds! The treatment plan worked perfectly. My yield improved by 35% this season.' },
  { name: 'Priya Singh',    village: 'Ludhiana',    state: 'Punjab',           initial: 'P', color: '#00b4d8', rating: 5, quote: 'The mandi price tracker helped me sell wheat at the peak price. Earned ₹40,000 more this season by choosing the right market.' },
  { name: 'Suresh Patil',   village: 'Nashik',      state: 'Maharashtra',      initial: 'S', color: '#ffd700', rating: 5, quote: 'Smart irrigation saved me 40% water. My electricity bill reduced by ₹8,000 per month. This app is a blessing for every farmer!' },
  { name: 'Lakshmi Devi',   village: 'Guntur',      state: 'Andhra Pradesh',   initial: 'L', color: '#a78bfa', rating: 5, quote: 'Government Scheme Finder showed me PM-KISAN eligibility. Got ₹6,000 under PM-KISAN that I never knew I was eligible for!' },
  { name: 'Mohammad Khan',  village: 'Meerut',      state: 'Uttar Pradesh',    initial: 'M', color: '#fb923c', rating: 5, quote: 'The AI chatbot answered all my questions about wheat cultivation in Hindi. Like having an agricultural expert in my pocket!' },
  { name: 'Venkat Reddy',   village: 'Kurnool',     state: 'Andhra Pradesh',   initial: 'V', color: '#00c864', rating: 4, quote: 'Soil analysis told me exactly what fertilizers my cotton field needs. Saved ₹12,000 by not over-applying urea.' },
  { name: 'Geeta Patel',    village: 'Anand',       state: 'Gujarat',          initial: 'G', color: '#00b4d8', rating: 5, quote: 'Equipment rental feature saved my harvest season! Booked a harvester within 2 hours when mine broke down. Life saver!' },
  { name: 'Arjun Yadav',    village: 'Kanpur',      state: 'Uttar Pradesh',    initial: 'A', color: '#ffd700', rating: 5, quote: 'Yield prediction was 95% accurate! Helped me plan finances and decide how much to invest in post-harvest storage.' },
]

export default function Testimonials() {
  const scrollRef  = useRef()
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let raf
    const tick = () => {
      if (!paused) {
        el.scrollLeft += 0.6
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused])

  const doubled = [...testimonials, ...testimonials]

  return (
    <section className="py-24 relative overflow-hidden testimonials-section">
      {/* Gradient mask for the carousel edges */}
      <div className="testimonials-fade-left  absolute left-0  top-0 bottom-0 w-24 z-10 pointer-events-none" />
      <div className="testimonials-fade-right absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.p
            className="text-sm font-bold tracking-widest uppercase mb-3"
            style={{ color: 'var(--primary)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Testimonials
          </motion.p>
          <h2 className="section-heading mb-3">
            Farmers <span className="gradient-text">Love AgroSphere</span>
          </h2>
          <p className="section-subtext">
            Real stories from farmers across India who transformed their yield and income
          </p>
        </motion.div>
      </div>

      <div ref={scrollRef} className="flex gap-5 overflow-x-hidden pb-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {doubled.map((t, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03, y: -4, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
            className="card-glass p-5 rounded-2xl flex flex-col gap-4 min-w-[280px] max-w-xs shrink-0 cursor-pointer"
          >
            <Quote className="w-5 h-5" style={{ color: 'var(--primary)', opacity: 0.5 }} />
            <p className="text-sm leading-relaxed flex-1 line-clamp-5" style={{ color: 'var(--text-secondary)' }}>
              {t.quote}
            </p>
            <div className="flex items-center gap-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-black text-base shrink-0 text-black"
                style={{ background: t.color }}
              >
                {t.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                  <div className="flex gap-0.5 shrink-0">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 text-[#ffd700] fill-[#ffd700]" />
                    ))}
                  </div>
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {t.village}, {t.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--primary)' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
              Verified AgroSphere User
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
