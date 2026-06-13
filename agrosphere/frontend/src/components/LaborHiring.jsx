import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Star, MapPin, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const WORKERS = [
  { id: 1, name: 'Raju Yadav', skill: 'Rice Transplanting', rate: '₹500/day', rating: 4.8, exp: '8 years', location: '3.2 km', available: true },
  { id: 2, name: 'Lalitha Devi', skill: 'Vegetable Harvesting', rate: '₹400/day', rating: 4.6, exp: '5 years', location: '1.8 km', available: true },
  { id: 3, name: 'Srinivas Rao', skill: 'Pesticide Spraying', rate: '₹600/day', rating: 4.9, exp: '12 years', location: '5.1 km', available: true },
  { id: 4, name: 'Meena Kumari', skill: 'Cotton Picking', rate: '₹450/day', rating: 4.7, exp: '6 years', location: '2.7 km', available: false },
]

export default function LaborHiring() {
  const [hired, setHired] = useState(null)

  return (
    <div className="card-glass p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-5">
        <Users className="w-6 h-6 text-[#00b4d8]" />
        <h3 className="text-white font-bold text-lg">Farm Labor Hiring</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {WORKERS.map(w => (
          <div key={w.id} className={`p-4 rounded-xl border transition-all ${w.available ? 'border-white/10 hover:border-[#00b4d8]/30' : 'border-white/5 opacity-60'}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-semibold text-sm">{w.name}</p>
                <p className="text-[#94a3b8] text-xs">{w.skill}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.available ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/10 text-[#94a3b8]'}`}>
                {w.available ? 'Available' : 'Busy'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#94a3b8] mb-3">
              <span className="flex items-center gap-0.5 text-[#ffd700]"><Star className="w-3 h-3 fill-current" /> {w.rating}</span>
              <span>{w.exp}</span>
              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {w.location}</span>
              <span className="text-white font-semibold ml-auto">{w.rate}</span>
            </div>
            <button
              onClick={() => { if (w.available) { setHired(w.id); toast.success(`${w.name} contacted!`) } }}
              disabled={!w.available}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                hired === w.id ? 'bg-[#ffd700] text-black' : w.available ? 'bg-[#00b4d8] text-black hover:bg-[#0090b0]' : 'bg-white/5 text-[#94a3b8] cursor-not-allowed'
              }`}>
              {hired === w.id ? '✓ Contacted!' : w.available ? 'Hire Now' : 'Not Available'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
