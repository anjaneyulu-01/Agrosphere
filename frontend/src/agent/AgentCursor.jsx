/* ─────────────────────────────────────────────────────────────
   AgentCursor
   ───────────
   A screen-level overlay that visualises the AI agent operating the
   site: a glowing robot pointer that glides to buttons, a click
   ripple, and a floating status banner narrating what it's doing.
   Mounted once in App; driven entirely by the agent bus.
   ───────────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MousePointer2, Bot } from 'lucide-react'
import { subscribeCursor } from './agentBus'

export default function AgentCursor() {
  const [pos,     setPos]     = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)  // the pointer
  const [active,  setActive]  = useState(false)  // the status banner
  const [click,   setClick]   = useState(0)      // increments to retrigger ripple
  const [status,  setStatus]  = useState('')

  useEffect(() => {
    return subscribeCursor(({ x, y, visible: vis, active: act, click: clicked, status: st }) => {
      if (typeof x === 'number' && typeof y === 'number') setPos({ x, y })
      if (typeof vis === 'boolean') setVisible(vis)
      if (typeof act === 'boolean') setActive(act)
      if (typeof st === 'string') setStatus(st)
      if (clicked) setClick(c => c + 1)
    })
  }, [])

  return (
    <>
      {/* ── Floating status banner (always visible while active) ── */}
      <AnimatePresence>
        {active && status && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            className="fixed top-5 left-1/2 z-[10000] flex items-center gap-3 rounded-2xl px-5 py-3 pointer-events-none"
            style={{
              transform: 'translateX(-50%)',
              background: 'var(--bg-card, rgba(15,23,42,0.92))',
              border: '1px solid color-mix(in srgb, var(--primary, #16a34a) 45%, transparent)',
              boxShadow: '0 8px 40px color-mix(in srgb, var(--primary, #16a34a) 25%, transparent)',
              backdropFilter: 'blur(8px)',
              maxWidth: '90vw',
            }}>
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'color-mix(in srgb, var(--primary, #16a34a) 22%, transparent)' }}>
              <Bot className="w-4 h-4" style={{ color: 'var(--primary, #16a34a)' }} />
              <motion.div className="absolute inset-0 rounded-xl border-2"
                style={{ borderColor: 'var(--primary, #16a34a)' }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.1, repeat: Infinity }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-widest uppercase"
                 style={{ color: 'var(--primary, #16a34a)' }}>
                Agent working
              </p>
              <p className="text-sm font-medium truncate"
                 style={{ color: 'var(--text-primary, #fff)' }}>
                {status}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── The robot cursor ── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, left: pos.x, top: pos.y }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.6 }}
            className="fixed z-[10001] pointer-events-none"
            style={{ left: pos.x, top: pos.y }}>

            {/* Click ripples — re-key on each click to restart the animation */}
            <AnimatePresence>
              {click > 0 && (
                <motion.span
                  key={click}
                  className="absolute rounded-full"
                  style={{
                    left: -22, top: -22, width: 44, height: 44,
                    border: '2px solid var(--primary, #16a34a)',
                  }}
                  initial={{ scale: 0.3, opacity: 0.8 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }} />
              )}
            </AnimatePresence>

            {/* Pulsing glow */}
            <motion.div className="absolute rounded-full"
              style={{
                left: -16, top: -16, width: 32, height: 32,
                background: 'color-mix(in srgb, var(--primary, #16a34a) 40%, transparent)',
                filter: 'blur(6px)',
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 1.3, repeat: Infinity }} />

            {/* Pointer */}
            <MousePointer2
              className="w-7 h-7 relative"
              style={{
                color: 'var(--primary, #16a34a)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                fill: 'var(--primary, #16a34a)',
              }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
