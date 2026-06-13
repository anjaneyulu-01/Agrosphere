import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

const fadeInUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/* ── 8 PRIMARY features shown by default ── */
const primaryProblems = [
  { id: 1,  icon: '📸', problem: 'Crop Diseases',         solution: 'Crop Disease Detection',          desc: 'Upload a photo — AI diagnoses disease and gives treatment plan in your language',   tech: 'MobileNetV2 on HuggingFace',  href: '#crop-doctor'  },
  { id: 2,  icon: '🌦️', problem: 'Unpredictable Weather', solution: 'AI Weather Alerts & Advisory',     desc: 'Hyperlocal 7-day forecasts with crop-specific advisories and pest risk alerts',     tech: 'OpenWeather API + Gemini AI',  href: '#weather'      },
  { id: 3,  icon: '💧', problem: 'Water Waste',            solution: 'Smart Irrigation Recommendations', desc: 'AI calculates exact water needed based on crop, soil and weather — save 40%',       tech: 'ML Model + IoT Sensors',       href: '#irrigation'   },
  { id: 4,  icon: '💰', problem: 'Low Market Prices',      solution: 'Live Mandi Price Tracker',         desc: 'Real-time prices from 200+ mandis with 7-day AI price forecast to sell at peak',   tech: 'data.gov.in Agmarknet API',    href: '#market'       },
  { id: 5,  icon: '🏛️', problem: 'No Scheme Awareness',  solution: 'Government Scheme Finder',         desc: 'Answer 3 questions — instantly matched to all eligible central & state schemes',   tech: 'Gemini AI Matching Engine',    href: '#schemes'      },
  { id: 6,  icon: '🤖', problem: 'No Expert Guidance',    solution: 'AI Farming Assistant',             desc: 'Ask anything about farming in Telugu, Hindi, or English — available 24/7',         tech: 'Gemini 1.5 Flash API',         href: '#ai-assistant' },
  { id: 7,  icon: '🚜', problem: 'Equipment Access',      solution: 'Equipment Rental Marketplace',     desc: 'Find and book tractors, harvesters, sprayers near your farm by the hour',           tech: 'Geolocation + Marketplace',    href: '#equipment'    },
  { id: 8,  icon: '📈', problem: 'Yield Uncertainty',     solution: 'AI Crop Yield Prediction',         desc: 'Input crop, soil, weather data — ML model predicts expected yield and revenue',     tech: 'Hugging Face ML Model',        href: '#yield'        },
]

/* ── 12 EXTENDED features revealed on "Explore All" ── */
const extendedProblems = [
  { id: 9,  icon: '🐛', problem: 'Pest Attacks',          solution: 'Image-based Pest Detection',       desc: 'Upload a photo — AI identifies pests and suggests treatment instantly',             tech: 'Hugging Face Vision Model',    href: '#crop-doctor'  },
  { id: 10, icon: '🧪', problem: 'Fertilizer Misuse',     solution: 'Personalized Fertilizer Plan',     desc: 'Exact NPK dosage based on your soil test results',                                 tech: 'Gemini AI + Soil Analysis',    href: '#soil'         },
  { id: 11, icon: '🌱', problem: 'Soil Degradation',      solution: 'Soil Analysis & Improvement',      desc: 'Complete soil health report with actionable improvement plan',                     tech: 'ML Analysis + Gemini AI',      href: '#soil'         },
  { id: 12, icon: '🐄', problem: 'Animal Health',         solution: 'Livestock Health Tracker',         desc: 'Diagnose livestock diseases from symptoms — instant veterinary guidance',           tech: 'Gemini AI Veterinary',         href: '#livestock'    },
  { id: 13, icon: '📝', problem: 'Insurance Hassles',     solution: 'Digital Insurance Claim Assistant',desc: 'Step-by-step guided crop insurance claim process',                                 tech: 'Gemini AI + Document AI',      href: '#insurance'    },
  { id: 14, icon: '🏦', problem: 'Loan Access',           solution: 'Digital Loan Eligibility Portal',  desc: 'Check eligibility and apply for KCC and other farm loans online',                 tech: 'Rule Engine + Gemini AI',      href: '#schemes'      },
  { id: 15, icon: '🏪', problem: 'Lack of Storage',       solution: 'Nearby Warehouse Discovery',       desc: 'Find and book cold storage near your farm to prevent post-harvest loss',           tech: 'Geolocation + Maps API',       href: '#equipment'    },
  { id: 16, icon: '🚛', problem: 'High Transport Costs',  solution: 'Shared Logistics Booking',         desc: 'Share transport vehicles with nearby farmers to cut logistics costs',               tech: 'Geolocation + Matching',       href: '#equipment'    },
  { id: 17, icon: '👷', problem: 'Labor Shortages',       solution: 'Farm Labor Hiring Platform',       desc: 'Connect with skilled agricultural labor available in your district',               tech: 'Gig Economy Platform',         href: '#equipment'    },
  { id: 18, icon: '🔍', problem: 'Fake Inputs',           solution: 'QR Code Product Verification',     desc: 'Scan QR to verify seed and fertilizer authenticity before purchase',               tech: 'QR Scanner + Blockchain',      href: '#crop-doctor'  },
  { id: 19, icon: '💹', problem: 'Price Fluctuations',    solution: 'Price Forecast & Alerts',          desc: 'AI-powered price prediction — get alerts when your crop hits the best price',     tech: 'Agmarknet API + ML Forecast',  href: '#market'       },
  { id: 20, icon: '📲', problem: 'Digital Literacy Gap',  solution: 'Voice & Vernacular UI',            desc: 'Full voice input support in Telugu, Hindi, English for low-literacy users',        tech: 'Web Speech API + Gemini AI',   href: '#ai-assistant' },
]

function ProblemCard({ item, index }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <motion.div
      variants={fadeInUp}
      className="relative h-52 cursor-pointer group"
      style={{ perspective: 1000 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="w-full h-full relative transition-all duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div className="absolute inset-0 card-glass p-4 flex flex-col gap-3"
             style={{ backfaceVisibility: 'hidden' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'rgba(239,68,68,0.8)' }}>Problem</p>
              <p className="font-semibold text-sm leading-tight text-red-400">{item.problem}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(239,68,68,0.3), rgba(255,215,0,0.3))' }} />
            <ArrowRight className="w-3 h-3" style={{ color: 'var(--secondary)' }} />
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(0,200,100,0.3), transparent)' }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'color-mix(in srgb, var(--primary) 80%, transparent)' }}>AI Solution</p>
            <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--primary)' }}>{item.solution}</p>
          </div>
          <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 card-glass p-4 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <span className="text-2xl">{item.icon}</span>
            <h4 className="font-bold mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>{item.solution}</h4>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
          </div>
          <div>
            <div className="rounded-lg px-3 py-1.5 mb-3"
                 style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 22%, transparent)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>⚡ {item.tech}</p>
            </div>
            <button
              onClick={() => document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full text-center text-xs font-bold py-2 rounded-lg transition-all"
              style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              Try Now →
            </button>
          </div>
        </div>
      </div>

      {/* Number badge */}
      <div
        className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
        style={{ background: 'var(--bg-base)', border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)', color: 'var(--primary)' }}
      >
        {index + 1}
      </div>
    </motion.div>
  )
}

export default function ProblemSolution() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Subtle accent */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, color-mix(in srgb, var(--primary) 3%, transparent), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Heading */}
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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Platform Features
          </motion.p>
          <h2 className="section-heading mb-4">
            Everything a Farmer Needs.{' '}
            <span className="gradient-text">One Platform.</span>
          </h2>
          <p className="section-subtext">
            Every card is a real problem faced by Indian farmers — hover to reveal the AI solution and tech stack.
          </p>
        </motion.div>

        {/* Primary 8 cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {primaryProblems.map((item, i) => (
            <ProblemCard key={item.id} item={item} index={i} />
          ))}
        </motion.div>

        {/* Expanded 12 cards */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{    opacity: 0, height: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5"
              >
                {extendedProblems.map((item, i) => (
                  <ProblemCard key={item.id} item={item} index={primaryProblems.length + i} />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explore All / Show Less button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-3 mt-12"
        >
          {!expanded && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Showing 8 of 20 solutions
            </p>
          )}

          <motion.button
            onClick={() => {
              if (expanded) {
                setExpanded(false)
                setTimeout(() => {
                  document.getElementById('problems')?.scrollIntoView({ behavior: 'smooth' })
                }, 60)
              } else {
                setExpanded(true)
              }
            }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300"
            style={{
              background:   expanded
                ? 'var(--bg-input)'
                : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color:        expanded ? 'var(--text-secondary)' : 'var(--primary-text)',
              border:       `1.5px solid ${expanded ? 'var(--border)' : 'transparent'}`,
              boxShadow:    expanded ? 'none' : 'var(--shadow-btn)',
            }}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Explore All 20 Solutions
                <span
                  className="ml-1 px-2 py-0.5 rounded-full text-xs font-black"
                  style={{ background: 'rgba(0,0,0,0.15)' }}
                >
                  +12
                </span>
              </>
            )}
          </motion.button>

          {!expanded && (
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
