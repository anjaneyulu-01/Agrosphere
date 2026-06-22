import { useState, useEffect, useLayoutEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProblemSolution from './components/ProblemSolution'
import CropDoctor from './components/CropDoctor'
import WeatherAdvisory from './components/WeatherAdvisory'
import MandiPrices from './components/MandiPrices'
import SmartIrrigation from './components/SmartIrrigation'
import GovernmentSchemes from './components/GovernmentSchemes'
import AIAssistant from './components/AIAssistant'
import YieldPrediction from './components/YieldPrediction'
import SoilAnalysis from './components/SoilAnalysis'
import LivestockHealth from './components/LivestockHealth'
import InsuranceClaim from './components/InsuranceClaim'
import EquipmentRental from './components/EquipmentRental'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import AgentCursor from './agent/AgentCursor'

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [scrollPct, setScrollPct]         = useState(0)
  const [demoMode, setDemoMode]           = useState(false)

  // ── Synchronous: instant jump to top before first paint ──
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop            = 0
    window.scrollTo(0, 0)
  }, [])

  // ── Dismiss splash, then instantly snap to top, then enable smooth scroll ──
  useEffect(() => {
    const t = setTimeout(() => {
      // 1. Kill smooth scroll so the reset is instant (not animated)
      document.documentElement.classList.remove('smooth-scroll')

      // 2. Snap to absolute top — instant, no animation
      document.documentElement.scrollTop = 0
      document.body.scrollTop            = 0
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

      // 3. Hide splash
      setSplashVisible(false)

      // 4. Re-enable smooth scroll after two animation frames
      //    (ensures the snap has fully committed before smooth takes over)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.add('smooth-scroll')
        })
      })
    }, 2200)
    return () => clearTimeout(t)
  }, [])

  // ── Scroll progress + Ctrl+K ──
  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setScrollPct(Math.min(100, pct))
    }
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    window.addEventListener('scroll', onScroll)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <>
      {/* ── Splash overlay (fixed, always on top) ── */}
      {splashVisible && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
             style={{ background: 'var(--bg-base)' }}>
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 animate-spin"
                   style={{ borderColor: 'rgba(0,200,100,0.2)', borderTopColor: 'var(--primary)' }} />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🌾</div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black gradient-text">AgroSphere</h1>
              <p className="mt-2 text-sm tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                Smart Farming. Better Future.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--primary)', animation: `_bounce 0.8s ease infinite ${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
          <style>{`@keyframes _bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
        </div>
      )}

      {/* ── Main app (always rendered, so scroll position is always 0) ── */}
      <div className="min-h-screen font-inter" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        {/* Scroll progress bar */}
        <div className="progress-bar-scroll" style={{ width: `${scrollPct}%` }} />

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            },
          }}
        />

        {/* Demo Mode toggle */}
        <div
          className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl px-4 py-2 backdrop-blur-sm border"
          style={{
            background:  'var(--bg-card)',
            borderColor: 'rgba(255,215,0,0.3)',
            boxShadow:   'var(--shadow-card)',
          }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Demo Mode</span>
          <button
            onClick={() => setDemoMode(d => !d)}
            className="relative w-10 h-5 rounded-full transition-colors"
            style={{ background: demoMode ? 'var(--secondary)' : 'var(--border)' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              style={{ transform: demoMode ? 'translateX(20px)' : 'translateX(2px)' }}
            />
          </button>
          {demoMode && (
            <span className="text-xs font-bold" style={{ color: 'var(--secondary)' }}>ON</span>
          )}
        </div>

        {/* WhatsApp float */}
        <a
          href="https://wa.me/+919999999999?text=Hello+AgroSphere"
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow hover:scale-110 transition-transform"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        {/* AI agent's on-screen cursor + status overlay */}
        <AgentCursor />

        <Navbar demoMode={demoMode} />

        <main>
          <section id="home">       <ErrorBoundary name="Home"><Hero /></ErrorBoundary></section>
          {/* AI Assistant placed right after the hero so farmers can talk to it immediately */}
          <section id="ai-assistant"><ErrorBoundary name="AI Assistant"><AIAssistant demoMode={demoMode} /></ErrorBoundary></section>
          <section id="features">   <ErrorBoundary name="Features"><ProblemSolution /></ErrorBoundary></section>
          <section id="crop-doctor"><ErrorBoundary name="Crop Doctor"><CropDoctor demoMode={demoMode} /></ErrorBoundary></section>
          <section id="weather">    <ErrorBoundary name="Weather"><WeatherAdvisory demoMode={demoMode} /></ErrorBoundary></section>
          <section id="market">     <ErrorBoundary name="Market"><MandiPrices demoMode={demoMode} /></ErrorBoundary></section>
          <section id="irrigation"> <ErrorBoundary name="Irrigation"><SmartIrrigation demoMode={demoMode} /></ErrorBoundary></section>
          <section id="schemes">    <ErrorBoundary name="Schemes"><GovernmentSchemes demoMode={demoMode} /></ErrorBoundary></section>
          <section id="yield">      <ErrorBoundary name="Yield"><YieldPrediction demoMode={demoMode} /></ErrorBoundary></section>
          <section id="soil">       <ErrorBoundary name="Soil"><SoilAnalysis demoMode={demoMode} /></ErrorBoundary></section>
          <section id="livestock">  <ErrorBoundary name="Livestock"><LivestockHealth demoMode={demoMode} /></ErrorBoundary></section>
          <section id="insurance">  <ErrorBoundary name="Insurance"><InsuranceClaim demoMode={demoMode} /></ErrorBoundary></section>
          <section id="equipment">  <ErrorBoundary name="Equipment"><EquipmentRental /></ErrorBoundary></section>
          <section id="stats">      <ErrorBoundary name="Stats"><Stats /></ErrorBoundary></section>
          <section id="testimonials"><ErrorBoundary name="Testimonials"><Testimonials /></ErrorBoundary></section>
        </main>

        <Footer />
      </div>
    </>
  )
}
