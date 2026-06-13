import { motion } from 'framer-motion'
import { Leaf, Github, Linkedin, Twitter, Heart, Mail, MapPin, Phone } from 'lucide-react'

const links = {
  Platform:  ['Crop Disease AI', 'Weather Advisory', 'Mandi Prices', 'Smart Irrigation', 'Yield Prediction', 'AI Assistant'],
  Resources: ['Documentation', 'API Reference', 'Farmer Guides', 'Video Tutorials', 'Blog', 'Case Studies'],
  Company:   ['About Us', 'Team', 'Careers', 'Partners', 'Press Kit', 'Contact'],
  Connect:   ['WhatsApp Community', 'Telegram Group', 'YouTube Channel', 'Twitter / X', 'LinkedIn', 'GitHub'],
}

const socialLinks = [
  { icon: <Github className="w-4 h-4" />,   href: 'https://github.com',   hoverColor: 'var(--primary)' },
  { icon: <Linkedin className="w-4 h-4" />,  href: 'https://linkedin.com', hoverColor: 'var(--accent)' },
  { icon: <Twitter className="w-4 h-4" />,   href: 'https://twitter.com',  hoverColor: 'var(--text-secondary)' },
]

export default function Footer() {
  return (
    <footer id="footer" className="footer-section border-t relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 100%, color-mix(in srgb, var(--primary) 5%, transparent), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <motion.div
              className="flex items-center gap-2 mb-4"
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                   style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' }}>
                <Leaf className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                Agro<span style={{ color: 'var(--primary)' }}>Sphere</span>
              </span>
            </motion.div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
              Smart Farming. Better Future.<br />
              AI-powered solutions for India's 150 million farmers.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200"
                  style={{
                    background:  'var(--bg-input)',
                    borderColor: 'var(--border)',
                    color:       'var(--text-secondary)',
                  }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h4>
              <ul className="flex flex-col gap-2">
                {items.map(item => (
                  <li key={item}>
                    <motion.a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                      whileHover={{ x: 3, color: 'var(--primary)' }}
                    >
                      {item}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10 p-5 rounded-2xl border"
             style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
          {[
            { icon: <Mail  className="w-4 h-4" />, label: 'Email',    value: 'support@agrosphere.in' },
            { icon: <Phone className="w-4 h-4" />, label: 'Helpline', value: '1800-123-AGRO (toll-free)' },
            { icon: <MapPin className="w-4 h-4" />, label: 'HQ',      value: 'IIIT Hyderabad, India' },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                {c.icon}
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.label}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8"
             style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            Made with{' '}
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            </motion.span>
            {' '}for India's 150 million farmers
          </p>
          <div className="flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {['Privacy Policy', 'Terms of Service', 'Farmer Charter'].map(l => (
              <motion.a
                key={l}
                href="#"
                className="transition-colors duration-200"
                whileHover={{ color: 'var(--primary)' }}
                style={{ color: 'var(--text-secondary)' }}
              >
                {l}
              </motion.a>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            © 2024 AgroSphere. Built for Hackathon 2024.
          </p>
        </div>
      </div>
    </footer>
  )
}
