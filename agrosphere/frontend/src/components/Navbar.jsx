import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Leaf, Sun, Moon } from 'lucide-react'

const navLinks = [
  { label: 'Home',      href: '#home' },
  { label: 'Features',  href: '#features' },
  { label: 'Market',    href: '#market' },
  { label: 'Assistant', href: '#ai-assistant' },
  { label: 'Insights',  href: '#stats' },
  { label: 'Contact',   href: '#footer' },
]

const languages = ['EN', 'हिं', 'తె']

export default function Navbar({ demoMode }) {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active,   setActive]   = useState('#home')
  const [lang,     setLang]     = useState('EN')
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('agro-theme') !== 'light'
  )

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function applyTheme(dark) {
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('agro-theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('agro-theme', 'light')
    }
  }

  const handleNav = (href) => {
    setActive(href)
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'nav-scrolled backdrop-blur-xl shadow-lg border-b'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <motion.button
            onClick={() => handleNav('#home')}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ background: 'rgba(0,200,100,0.15)', borderColor: 'var(--border)' }}
            >
              <Leaf className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              Agro<span style={{ color: 'var(--primary)' }}>Sphere</span>
            </span>
          </motion.button>

          {/* ── Desktop links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                style={{
                  color: active === link.href ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                {link.label}
                {active === link.href && (
                  <motion.div
                    layoutId="active-link"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Right controls ── */}
          <div className="hidden md:flex items-center gap-3">

            {/* Language */}
            <div
              className="flex items-center gap-1 rounded-lg p-1 border"
              style={{ borderColor: 'var(--border)' }}
            >
              {languages.map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="px-2 py-1 text-xs rounded-md font-medium transition-all"
                  style={
                    lang === l
                      ? { background: 'var(--primary)', color: 'var(--primary-text)' }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => applyTheme(!isDark)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300"
              style={{
                borderColor: 'var(--border)',
                background:  isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                color:       'var(--text-secondary)',
              }}
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{    rotate:  90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun  className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
                  </motion.span>
                ) : (
                  <motion.span key="moon"
                    initial={{ rotate: 90,  opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{    rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Demo badge */}
            {demoMode && (
              <span
                className="px-2 py-1 text-xs font-bold rounded-lg border"
                style={{
                  background:   'rgba(255,215,0,0.1)',
                  borderColor:  'rgba(255,215,0,0.3)',
                  color:        'var(--secondary)',
                }}
              >
                DEMO
              </span>
            )}

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNav('#crop-doctor')}
              className="btn-primary text-sm py-2 px-5"
            >
              Get Started Free
            </motion.button>
          </div>

          {/* ── Mobile hamburger ── */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => applyTheme(!isDark)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{ borderColor: 'var(--border)', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
            >
              {isDark
                ? <Sun  className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
                : <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              }
            </motion.button>
            <button
              className="p-2"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{    opacity: 0, height: 0 }}
            className="md:hidden backdrop-blur-xl border-b"
            style={{
              background:   isDark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.95)',
              borderColor:  'var(--border)',
            }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="text-left px-4 py-3 rounded-xl transition-all text-sm font-medium"
                  style={{
                    color:      active === link.href ? 'var(--primary)' : 'var(--text-secondary)',
                    background: active === link.href ? 'rgba(0,200,100,0.08)' : 'transparent',
                  }}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex gap-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                {languages.map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all border"
                    style={
                      lang === l
                        ? { background: 'var(--primary)', color: 'var(--primary-text)', borderColor: 'var(--primary)' }
                        : { color: 'var(--text-secondary)', borderColor: 'var(--border)' }
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button onClick={() => handleNav('#crop-doctor')} className="btn-primary mt-3 text-center">
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
