import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ open, onClose, initialMode = 'login' }) {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  // Reset to the requested tab each time the modal is opened from the navbar.
  useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, initialMode])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      if (isLogin) {
        const u = await login(form.email.trim(), form.password)
        toast.success(`Welcome back, ${u.name}! 🌾`)
      } else {
        const u = await signup(form.name.trim(), form.email.trim(), form.password)
        toast.success(`Account created — welcome, ${u.name}! 🌱`)
      }
      onClose()
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(isLogin ? 'signup' : 'login')
  }

  const inputWrap = 'flex items-center gap-2 rounded-xl border px-3 py-2.5'
  const inputWrapStyle = { borderColor: 'var(--border)', background: 'var(--bg-base)' }
  const inputStyle = { color: 'var(--text-primary)' }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative w-full max-w-md rounded-2xl border p-7"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🌾</div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {isLogin ? 'Welcome Back' : 'Join AgroSphere'}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {isLogin ? 'Log in to your account' : 'Create your free account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {!isLogin && (
                <div className={inputWrap} style={inputWrapStyle}>
                  <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder="Full name"
                    value={form.name}
                    onChange={update('name')}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
              )}

              <div className={inputWrap} style={inputWrapStyle}>
                <Mail className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={form.email}
                  onChange={update('email')}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={inputStyle}
                />
              </div>

              <div className={inputWrap} style={inputWrapStyle}>
                <Lock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Password (min 6 characters)"
                  value={form.password}
                  onChange={update('password')}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={switchMode}
                className="font-semibold"
                style={{ color: 'var(--primary)' }}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
