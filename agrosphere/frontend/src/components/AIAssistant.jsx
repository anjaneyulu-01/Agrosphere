import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Bot, User, Loader2, Volume2, VolumeX, Square } from 'lucide-react'
import { chatWithAI } from '../api'
import toast from 'react-hot-toast'

/* ─────────────────────────── constants ─────────────────────────── */

const QUICK_QUESTIONS = [
  'My tomato leaves are turning yellow',
  'When should I sow wheat in Telangana?',
  'Best fertilizer for rice crop',
  'PM-KISAN next installment date',
  'How to control aphids in cotton?',
  'Rainfall forecast this week',
]

const LANG_CONFIG = {
  en: { label: '🇬🇧 EN', speech: 'en-IN', name: 'English' },
  hi: { label: '🇮🇳 HI', speech: 'hi-IN', name: 'हिंदी' },
  te: { label: '🏁 TE', speech: 'te-IN', name: 'తెలుగు' },
}

// Per-language TTS settings for natural-sounding speech
const TTS_OPTS = {
  en: { rate: 0.92, pitch: 1.05 },
  hi: { rate: 0.82, pitch: 1.0  },
  te: { rate: 0.80, pitch: 0.98 },
}

const DEMO_REPLIES = {
  en: "🌱 Based on current conditions:\n\n1. Apply **Urea @ 65 kg/acre** in 3 splits\n2. Maintain 2–5 cm water level during vegetative stage\n3. Monitor for Brown Plant Hopper — use Buprofezin if detected\n\n💡 Use SRI method to increase yield by **20–30%**!",
  hi: "🌾 आपकी फसल के लिए:\n\n1. **यूरिया 65 किग्रा/एकड़** तीन भागों में डालें\n2. वानस्पतिक अवस्था में 2–5 सेमी पानी बनाए रखें\n3. भूरा फुदका (BPH) की निगरानी करें — **बूप्रोफेज़िन** का उपयोग करें\n\n💡 एसआरआई विधि से **20–30%** अधिक उपज मिलती है!",
  te: "🌿 మీ పంటకు:\n\n1. **యూరియా 65 కిలోలు/ఎకరా** మూడు విడతలుగా వేయండి\n2. మొలక దశలో 2–5 సెమీ నీటి స్థాయి నిర్వహించండి\n3. వద్దెన పురుగు (BPH) పర్యవేక్షించండి — **బూప్రొఫెజిన్** వాడండి\n\n💡 SRI పద్ధతితో **20–30%** అధిక దిగుబడి సాధించవచ్చు!",
}

/* ─────────────────────────── helpers ─────────────────────────── */

// Detect script language from Unicode ranges
function detectLang(text) {
  if (/[ఀ-౿]/.test(text)) return 'te'  // Telugu
  if (/[ऀ-ॿ]/.test(text)) return 'hi'  // Hindi / Devanagari
  return 'en'
}

// Strip markdown for clean TTS
function stripMd(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/[•\-]\s/g, '')
    .trim()
}

// Format message for display (markdown → HTML)
function fmtMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:700">$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em style="color:var(--text-secondary)">$1</em>')
    .replace(/\n/g, '<br/>')
}

// ── Voice loading (Chrome loads voices lazily) ──
// Returns a promise that resolves with the voice list.
// Retries via voiceschanged event with a 3 s safety timeout.
function loadVoicesAsync() {
  return new Promise(resolve => {
    const immediate = window.speechSynthesis.getVoices()
    if (immediate.length) { resolve(immediate); return }

    let done = false
    const handler = () => {
      if (done) return
      done = true
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
      resolve(window.speechSynthesis.getVoices())
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    setTimeout(() => {
      if (!done) { done = true; resolve(window.speechSynthesis.getVoices() || []) }
    }, 3000)
  })
}

// Pick best available voice for a BCP-47 language code.
// Prefers Google / Microsoft quality voices.
async function pickVoice(langCode) {
  const voices = await loadVoicesAsync()
  if (!voices.length) return null
  const lang2 = langCode.split('-')[0]

  const quality = voices.find(v => v.lang === langCode && (v.name.includes('Google') || v.name.includes('Microsoft')))
  if (quality)  return quality
  const exact  = voices.find(v => v.lang === langCode)
  if (exact)   return exact
  const prefix = voices.find(v => v.lang.startsWith(lang2))
  return prefix || null
}

/* ─────────────────────────── component ─────────────────────────── */

const INIT_MSG = {
  role: 'assistant',
  content: "🙏 Namaste! I'm **AgroSphere AI** — your intelligent farming companion.\n\nAsk me in **English, हिंदी, or తెలుగు** — I'll reply in the same language with voice!\n\n• 🌾 Crop diseases & cultivation tips\n• 🌦️ Weather, irrigation & pest alerts\n• 💰 Mandi prices & government schemes\n• 🐄 Livestock health guidance\n\nTap the 🎤 mic button and speak freely!",
  lang: 'en', source: 'AgroSphere',
}

export default function AIAssistant({ demoMode }) {
  const [messages,    setMessages]    = useState([INIT_MSG])
  const [input,       setInput]       = useState('')
  const [interimText, setInterimText] = useState('') // live speech-to-text preview
  const [lang,        setLang]        = useState('en')
  const [loading,     setLoading]     = useState(false)
  const [listening,   setListening]   = useState(false)
  const [speaking,    setSpeaking]    = useState(false)
  const [voiceOn,     setVoiceOn]     = useState(true)
  const [aiSource,    setAiSource]    = useState('Groq · Llama 3.1')

  const chatBoxRef     = useRef()
  const recRef         = useRef(null)
  const voiceOnRef     = useRef(true)
  const loadingRef     = useRef(false)
  const sendRef        = useRef(null)   // always-fresh reference to sendMessage

  // Keep refs in sync with state
  voiceOnRef.current = voiceOn
  loadingRef.current = loading

  // ── Scroll inside chat box only ──
  useEffect(() => {
    if (chatBoxRef.current)
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
  }, [messages, loading, interimText])

  // ── Pre-warm voice list on mount ──
  useEffect(() => {
    if (window.speechSynthesis) loadVoicesAsync()
  }, [])

  // ── Chrome TTS stuck-speaking fix ──
  // Chrome sometimes never fires onend; poll every 300 ms.
  useEffect(() => {
    if (!speaking) return
    const id = setInterval(() => {
      if (!window.speechSynthesis?.speaking) setSpeaking(false)
    }, 300)
    return () => clearInterval(id)
  }, [speaking])

  /* ── TTS ── */
  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  const speak = async (text, spokenLang = 'en') => {
    if (!voiceOnRef.current || !window.speechSynthesis) return

    // Cancel any current speech and let it settle
    window.speechSynthesis.cancel()
    setSpeaking(false)
    await new Promise(r => setTimeout(r, 100))

    const langCode = LANG_CONFIG[spokenLang]?.speech || 'en-IN'
    const opts     = TTS_OPTS[spokenLang] || TTS_OPTS.en
    const clean    = stripMd(text).slice(0, 500)

    const utt    = new SpeechSynthesisUtterance(clean)
    utt.lang     = langCode
    utt.rate     = opts.rate
    utt.pitch    = opts.pitch
    utt.volume   = 1

    const voice = await pickVoice(langCode)
    if (voice) utt.voice = voice

    utt.onstart = () => setSpeaking(true)
    utt.onend   = () => setSpeaking(false)
    utt.onerror = (e) => {
      // 'interrupted' / 'cancelled' are expected when we call cancel()
      if (e.error !== 'interrupted' && e.error !== 'cancelled') setSpeaking(false)
    }

    window.speechSynthesis.speak(utt)
  }

  /* ── Send message ── */
  const sendMessage = async (text) => {
    const trimmed = (text || '').trim()
    if (!trimmed || loadingRef.current) return

    stopSpeaking()

    // Use the language the user selected with the buttons.
    // Auto-detect only upgrades to Hindi/Telugu when the typed script demands it;
    // it never silently reverts back to English (see onChange below).
    const scriptLang = detectLang(trimmed)
    const activeLang = (scriptLang !== 'en') ? scriptLang : lang
    if (scriptLang !== 'en') setLang(scriptLang)   // sync button if user typed a different script

    setInput('')
    setInterimText('')
    setMessages(prev => [...prev, { role: 'user', content: trimmed, lang: activeLang }])
    setLoading(true)

    try {
      let reply, source

      if (demoMode) {
        await new Promise(r => setTimeout(r, 900))
        reply  = DEMO_REPLIES[activeLang] || DEMO_REPLIES.en
        source = 'Demo Mode'
      } else {
        const data = await chatWithAI(trimmed, activeLang, [])
        reply  = data.reply
        source = data.source || aiSource
        setAiSource(source)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply, lang: activeLang, source }])
      speak(reply, activeLang)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Connection error. Please enable **Demo Mode** or check your backend.',
        lang: activeLang, source: 'Error',
      }])
      toast.error('Chat failed. Try Demo Mode.')
    } finally {
      setLoading(false)
    }
  }

  // Keep sendRef fresh so mic's onresult always calls the latest sendMessage
  sendRef.current = sendMessage

  /* ── Microphone ── */
  const toggleMic = () => {
    // ── Stop ──
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      setInterimText('')
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      toast.error('Voice input requires Chrome or Edge.')
      return
    }

    stopSpeaking()

    const rec           = new SR()
    rec.lang            = LANG_CONFIG[lang]?.speech || 'en-IN'
    rec.interimResults  = true   // real-time transcript preview
    rec.maxAlternatives = 1
    rec.continuous      = false

    rec.onstart = () => { setListening(true); setInterimText('') }

    rec.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      if (final.trim()) {
        // Speech complete — auto-send
        setInterimText('')
        setListening(false)
        sendRef.current(final.trim())   // use ref to avoid stale closure
      } else {
        // Still speaking — show live preview
        setInterimText(interim)
      }
    }

    rec.onerror = (e) => {
      setListening(false)
      setInterimText('')
      if      (e.error === 'not-allowed') toast.error('Microphone access denied. Allow it in browser settings.')
      else if (e.error === 'no-speech')   toast('No speech detected — try again.', { icon: '🎤' })
      else if (e.error !== 'aborted')     toast.error(`Voice error: ${e.error}`)
    }

    rec.onend = () => { setListening(false); setInterimText('') }

    recRef.current = rec
    try {
      rec.start()
    } catch {
      toast.error('Could not start microphone.')
      setListening(false)
    }
  }

  /* ─────────────────────────── JSX ─────────────────────────── */

  const statusText = speaking ? '🔊 Speaking...' : listening ? '🎤 Listening...' : 'Online'
  const dotColor   = speaking ? 'var(--secondary)' : listening ? '#f87171' : 'var(--primary)'

  return (
    <section id="ai-assistant" className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--primary) 4%, transparent)' }} />
      <div className="absolute top-10 right-0 w-56 h-56 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--accent) 4%, transparent)' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <p className="section-tag">AI Voice Assistant</p>
          <h2 className="section-heading mb-3">🤖 <span className="gradient-text">AI Farming Assistant</span></h2>
          <p className="section-subtext">
            Type or speak in <strong>Hindi, Telugu or English</strong> — AI detects your language and replies in voice
          </p>
        </motion.div>

        {/* Chat card */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="card-glass rounded-2xl overflow-hidden flex flex-col"
          style={{ height: '620px' }}>

          {/* ── Header ── */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b"
               style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                   style={{ background: 'color-mix(in srgb, var(--primary) 18%, transparent)' }}>
                <Bot className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                {speaking && (
                  <motion.div className="absolute inset-0 rounded-xl border-2" style={{ borderColor: 'var(--primary)' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }} />
                )}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AgroSphere AI</p>
                <div className="flex items-center gap-1.5">
                  <motion.div className="w-1.5 h-1.5 rounded-full"
                    style={{ background: dotColor }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{statusText}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice on/off */}
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                onClick={() => { setVoiceOn(v => !v); stopSpeaking() }}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                style={{
                  background:  voiceOn ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-input)',
                  borderColor: voiceOn ? 'var(--primary)' : 'var(--border)',
                  color:       voiceOn ? 'var(--primary)' : 'var(--text-secondary)',
                }}
                title={voiceOn ? 'Mute AI voice' : 'Unmute AI voice'}>
                {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </motion.button>

              {/* Mic language selector */}
              <div className="flex gap-0.5 rounded-xl p-1 border"
                   style={{ borderColor: 'var(--border)', background: 'var(--bg-input)' }}>
                {Object.entries(LANG_CONFIG).map(([code, cfg]) => (
                  <button key={code} onClick={() => setLang(code)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                    style={lang === code
                      ? { background: 'var(--primary)', color: 'var(--primary-text)' }
                      : { background: 'transparent', color: 'var(--text-secondary)' }
                    }
                    title={`Mic language: ${cfg.name}`}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Messages (scrolls inside only) ── */}
          <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 min-h-0">
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                     style={{ background: msg.role === 'user'
                       ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
                       : 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                    : <Bot  className="w-3.5 h-3.5" style={{ color: 'var(--accent)'  }} />}
                </div>

                {/* Bubble */}
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}
                    dangerouslySetInnerHTML={{ __html: fmtMsg(msg.content) }} />

                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-end mt-1.5 pt-1.5"
                         style={{ borderTop: '1px solid var(--border)' }}>
                      <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
                        onClick={() => speak(msg.content, msg.lang || 'en')}
                        style={{ color: 'var(--text-secondary)' }} title="Replay voice">
                        <Volume2 className="w-3 h-3" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                     style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="chat-bubble-ai">
                  <div className="flex gap-1.5 items-end py-1">
                    {[0, 1, 2].map(j => (
                      <motion.div key={j} className="w-1.5 rounded-full"
                        style={{ background: 'var(--text-secondary)' }}
                        animate={{ height: [5, 14, 5] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: j * 0.13 }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Quick questions ── */}
          <div className="flex-shrink-0 px-5 py-2 border-t flex flex-wrap gap-1.5"
               style={{ borderColor: 'var(--border)' }}>
            {QUICK_QUESTIONS.map(q => (
              <motion.button key={q} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text-secondary)' }}>
                {q}
              </motion.button>
            ))}
          </div>

          {/* ── Input area ── */}
          <div className="flex-shrink-0 px-5 pb-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>

            {/* Listening banner — shows live transcript */}
            <AnimatePresence>
              {listening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 rounded-xl px-4 py-2.5 overflow-hidden flex items-center gap-3"
                  style={{
                    background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
                  }}>

                  {/* Pulsing mic dot */}
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                         style={{ background: 'var(--primary)' }}>
                      <Mic className="w-4 h-4" style={{ color: 'var(--primary-text)' }} />
                    </div>
                    <motion.div className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid var(--primary)' }}
                      animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity }} />
                  </div>

                  {/* Live transcript */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                      Listening in {LANG_CONFIG[lang]?.name}…
                    </p>
                    <p className="text-sm font-medium truncate mt-0.5"
                       style={{ color: interimText ? 'var(--text-primary)' : 'var(--text-secondary)', fontStyle: interimText ? 'normal' : 'italic' }}>
                      {interimText || 'Speak now…'}
                    </p>
                  </div>

                  {/* Animated waveform */}
                  <div className="flex gap-0.5 items-end shrink-0">
                    {[3, 7, 12, 8, 5, 10, 6].map((h, i) => (
                      <motion.div key={i} className="w-1 rounded-full" style={{ background: 'var(--primary)' }}
                        animate={{ height: [2, h + 4, 2] }}
                        transition={{ duration: 0.38 + i * 0.04, repeat: Infinity, delay: i * 0.06 }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 items-center">
              {/* Text input */}
              <input
                value={listening ? interimText : input}
                readOnly={listening}
                onChange={e => {
                  if (listening) return
                  const v = e.target.value
                  setInput(v)
                  if (v.length > 1) {
                    const d = detectLang(v)
                    // Only auto-switch to Hindi/Telugu when that script is detected;
                    // never override the user's explicit button selection back to English.
                    if (d !== 'en') setLang(d)
                  }
                }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !listening && sendMessage(input)}
                placeholder={
                  lang === 'hi' ? 'अपना सवाल यहाँ लिखें...' :
                  lang === 'te' ? 'మీ ప్రశ్న ఇక్కడ టైప్ చేయండి...' :
                  'Ask about farming in any language...'
                }
                className="input-dark flex-1"
                disabled={loading}
                style={listening ? { opacity: 0.75, fontStyle: 'italic' } : {}}
              />

              {/* Mic button */}
              <motion.button
                whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.92 }}
                onClick={toggleMic}
                disabled={loading}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden disabled:opacity-40"
                style={{
                  background:  listening ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 12%, transparent)',
                  border:      `1.5px solid ${listening ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 35%, transparent)'}`,
                  color:       listening ? 'var(--primary-text)' : 'var(--primary)',
                }}
                title={listening ? 'Stop listening' : `Speak in ${LANG_CONFIG[lang]?.name}`}>
                <AnimatePresence mode="wait">
                  {listening
                    ? <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <MicOff className="w-5 h-5" />
                      </motion.div>
                    : <motion.div key="on"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Mic className="w-5 h-5" />
                      </motion.div>
                  }
                </AnimatePresence>
                {listening && (
                  <motion.div className="absolute inset-0"
                    style={{ background: 'color-mix(in srgb, var(--primary) 25%, transparent)' }}
                    animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity }} />
                )}
              </motion.button>

              {/* Send / Stop-speaking button */}
              <AnimatePresence mode="wait">
                {speaking ? (
                  <motion.button key="stop"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.92 }}
                    onClick={stopSpeaking}
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#ef4444', color: '#fff' }}
                    title="Stop speaking">
                    <Square className="w-4 h-4 fill-white" />
                  </motion.button>
                ) : (
                  <motion.button key="send"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.92 }}
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim() || listening}
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
                    style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
                    title="Send">
                    {loading
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Send    className="w-4 h-4" />}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Auto-detects language · 🎤 speak then AI replies in voice ·
              Voice: <span style={{ color: voiceOn ? 'var(--primary)' : 'inherit', fontWeight: 600 }}>
                {voiceOn ? 'ON' : 'OFF'}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
