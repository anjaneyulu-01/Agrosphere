import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tractor, Star, MapPin, Calendar, Filter, Search } from 'lucide-react'
import { registerAgentAction } from '../agent/agentBus'

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

const EQUIPMENT = [
  { id: 1, name: 'Mahindra JIVO 245DI Tractor', type: 'Tractor', owner: 'Rami Reddy', rating: 4.8, reviews: 142, distance: 2.3, price_hour: 350, price_day: 2500, available: true, image: '🚜', location: 'Karimnagar, TG' },
  { id: 2, name: 'John Deere Rotavator 6ft', type: 'Rotavator', owner: 'Suresh Kumar', rating: 4.6, reviews: 89, distance: 4.1, price_hour: 200, price_day: 1400, available: true, image: '⚙️', location: 'Nizamabad, TG' },
  { id: 3, name: 'DJI Agras T30 Spray Drone', type: 'Drone', owner: 'AgriTech Services', rating: 4.9, reviews: 203, distance: 5.7, price_hour: 800, price_day: 5000, available: true, image: '🚁', location: 'Hyderabad, TG' },
  { id: 4, name: 'CLAAS Crop Tiger Harvester', type: 'Harvester', owner: 'Venkat Rao', rating: 4.7, reviews: 67, distance: 7.2, price_hour: 1200, price_day: 8000, available: false, image: '🌾', location: 'Warangal, TG' },
  { id: 5, name: 'Electric Power Sprayer 16L', type: 'Sprayer', owner: 'Krishna Farms', rating: 4.5, reviews: 34, distance: 1.8, price_hour: 120, price_day: 800, available: true, image: '💨', location: 'Medak, TG' },
  { id: 6, name: 'Paddy Transplanter 4-Row', type: 'Transplanter', owner: 'Srinivas Goud', rating: 4.4, reviews: 51, distance: 3.5, price_hour: 450, price_day: 3000, available: true, image: '🌱', location: 'Nalgonda, TG' },
]

const TYPES = ['All', 'Tractor', 'Harvester', 'Drone', 'Rotavator', 'Sprayer', 'Transplanter']

export default function EquipmentRental() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [booked, setBooked] = useState(null)

  const filtered = EQUIPMENT.filter(e =>
    (filter === 'All' || e.type === filter) &&
    (search === '' || e.name.toLowerCase().includes(search.toLowerCase()))
  )

  // ── Expose to the AI agent ──
  useEffect(() => registerAgentAction('equipment.run', () => {
    const avail = EQUIPMENT.filter(e => e.available)
    const nearest = [...avail].sort((a, b) => a.distance - b.distance)[0]
    return { available_count: avail.length, nearest }
  }), [])

  return (
    <section className="py-24 bg-[#0a0f0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-12">
          <h2 className="section-heading mb-3">🚜 <span className="gradient-text">Equipment Rental Marketplace</span></h2>
          <p className="section-subtext">Find and book tractors, harvesters, drones near your location — pay by the hour</p>
        </motion.div>

        {/* Filters */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search equipment..." className="input-dark pl-9 w-48" />
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filter === t ? 'bg-[#00ff88] text-black border-[#00ff88]' : 'border-white/10 text-[#94a3b8] hover:border-white/30'
                }`}>{t}</button>
            ))}
          </div>
        </motion.div>

        {/* Equipment grid */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(eq => (
            <motion.div key={eq.id} variants={fadeInUp}
              className="card-glass p-5 rounded-2xl flex flex-col gap-4 hover:border-[#00ff88]/30 transition-all">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-3xl border border-white/10">
                  {eq.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-bold text-sm leading-tight">{eq.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ml-2 ${eq.available ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-red-500/20 text-red-400'}`}>
                      {eq.available ? 'Available' : 'Booked'}
                    </span>
                  </div>
                  <p className="text-[#94a3b8] text-xs mt-0.5">{eq.type} • {eq.owner}</p>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-xl p-2">
                  <div className="flex items-center justify-center gap-0.5 text-[#ffd700] mb-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">{eq.rating}</span>
                  </div>
                  <p className="text-[#94a3b8] text-xs">{eq.reviews} reviews</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <div className="flex items-center justify-center gap-0.5 text-[#00b4d8] mb-0.5">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs font-bold">{eq.distance} km</span>
                  </div>
                  <p className="text-[#94a3b8] text-xs">away</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-[#00ff88] font-bold text-xs">₹{eq.price_hour}/hr</p>
                  <p className="text-[#94a3b8] text-xs">₹{eq.price_day}/day</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[#94a3b8] text-xs">
                <MapPin className="w-3 h-3" /> {eq.location}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setBooked(booked === eq.id ? null : eq.id)}
                disabled={!eq.available}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  booked === eq.id ? 'bg-[#ffd700] text-black' : 'bg-[#00ff88] text-black hover:bg-[#00cc6a]'
                }`}
              >
                {!eq.available ? 'Not Available' : booked === eq.id ? '✓ Booking Confirmed!' : 'Book Now'}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#94a3b8] text-lg">No equipment found matching your search</p>
          </div>
        )}
      </div>
    </section>
  )
}
