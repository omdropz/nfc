import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Wifi,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { getPage } from '../lib/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

// Official Brand Vector Icons
function GoogleIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function WhatsAppIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

function InstagramIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

// Subtle synthetic tactile click sound + phone hardware vibration
function playHapticClick() {
  try {
    // Physical tactile motor buzz on mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(18)
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(620, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.035)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  } catch {
    // suppressed before user gesture
  }
}

export default function LandingPage({ defaultPageId = 'omdropz' }) {
  const { pageId: routePageId } = useParams()
  const pageId = routePageId || defaultPageId || 'omdropz'
  const navigate = useNavigate()

  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tapCount, setTapCount] = useState(0)

  // Interactive mouse spotlight position inside card
  const [spotlight, setSpotlight] = useState({ x: 50, y: 30 })
  const cardRef = useRef(null)

  const tapTimestamps = useRef([])
  const tapTimeoutRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getPage(pageId)
      .then((data) => {
        const pageSettings = data?.page || data?.settings || data || null
        setPageData(pageSettings)
      })
      .catch(() => {
        setNotFound(true)
      })
      .finally(() => setLoading(false))

    // Listen to real-time updates from admin customizations
    const handleUpdate = (e) => {
      const updated = e.detail?.page
      if (updated) {
        const updatedId = (e.detail.pageId || updated.page_id || '').toLowerCase()
        const currentId = (pageId || 'omdropz').toLowerCase()
        if (updatedId === currentId || currentId === 'omdropz' || currentId === 'demo') {
          setPageData((prev) => ({ ...prev, ...updated }))
        }
      }
    }
    window.addEventListener('nfc_page_updated', handleUpdate)
    return () => window.removeEventListener('nfc_page_updated', handleUpdate)
  }, [pageId])

  useEffect(() => {
    if (pageData?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return () => document.documentElement.classList.remove('dark')
  }, [pageData])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setSpotlight({ x, y })
  }

  const handleTouchMove = (e) => {
    if (!cardRef.current || !e.touches || !e.touches[0]) return
    const rect = cardRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    setSpotlight({ x, y })
  }

  // Triple-tap detection on footer brand for hidden admin access
  const handleFooterBrandTap = () => {
    playHapticClick()
    const now = Date.now()
    tapTimestamps.current = [...tapTimestamps.current, now].filter(
      (t) => now - t < 1500
    )

    setTapCount(tapTimestamps.current.length)

    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)

    if (tapTimestamps.current.length >= 3) {
      tapTimestamps.current = []
      setTapCount(0)
      navigate('/admin/login')
      return
    }

    tapTimeoutRef.current = setTimeout(() => {
      tapTimestamps.current = []
      setTapCount(0)
    }, 1500)
  }

  const handleGoogleReview = () => {
    playHapticClick()
    const url = pageData?.google_review_url
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleWhatsApp = () => {
    playHapticClick()
    const number = pageData?.whatsapp_number
    const message = pageData?.whatsapp_message || ''
    if (number) {
      const clean = number.replace(/\D/g, '')
      window.open(
        `https://wa.me/${clean}?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener,noreferrer'
      )
    }
  }

  const handleInstagram = () => {
    playHapticClick()
    const url = pageData?.instagram_url
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050507]">
        <div className="text-center flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-lime-400/20 border-t-lime-400 animate-spin" />
            <Zap className="absolute inset-0 m-auto text-lime-400 animate-pulse" size={22} />
          </div>
          <p className="text-lime-300 mt-4 text-[11px] tracking-[0.25em] uppercase font-mono">
            Initializing NFC...
          </p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050507] p-6">
        <div className="text-center bg-[#0d0e12] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/10">
          <Wifi className="mx-auto text-lime-400 mb-4" size={32} />
          <h1 className="text-xl font-bold text-white mb-2">Card Not Found</h1>
          <p className="text-gray-400 text-sm mb-6">
            This card link has not been activated yet.
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full bg-lime-400 hover:bg-lime-300 text-black font-extrabold py-3.5 px-5 rounded-2xl transition-all text-sm shadow-lg shadow-lime-400/20"
          >
            Go to Admin
          </button>
        </div>
      </div>
    )
  }

  const settings = pageData || {}
  const font = settings.font || 'Poppins'

  const googleEnabled = settings.google_review_enabled !== false
  const whatsappEnabled = settings.whatsapp_enabled !== false
  const instagramEnabled = settings.instagram_enabled !== false

  // Detect unassigned / available PVC card state (Requirement 7)
  const isAvailableCard =
    settings.status === 'available' ||
    (!settings.business_name && pageId !== 'omdropz' && pageId !== 'demo')

  if (isAvailableCard) {
    return (
      <div
        className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none bg-[#050507] touch-manipulation"
        style={{ fontFamily: font }}
      >
        {/* Ambient Glows */}
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full blur-[160px] pointer-events-none bg-gradient-to-tr from-[#a3e635]/25 via-[#84cc16]/15 to-white/10 animate-pulse-aura" />
        <div className="fixed -bottom-28 -right-28 w-[450px] h-[450px] rounded-full blur-[150px] opacity-15 pointer-events-none bg-[#a3e635]" />

        {/* Floating Card */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          className="relative w-full max-w-[390px] mx-auto rounded-[2.5rem] p-7 sm:p-9 transition-all duration-500 shadow-[0_35px_100px_-15px_rgba(0,0,0,0.95)] animate-card-enter overflow-hidden group text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(16, 17, 23, 0.95) 0%, rgba(8, 9, 12, 0.98) 100%)',
            backdropFilter: 'blur(35px)',
            WebkitBackdropFilter: 'blur(35px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 30px 90px -15px rgba(0, 0, 0, 0.95), 0 0 45px -10px rgba(163, 230, 53, 0.2)',
          }}
        >
          {/* Top Bevel */}
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#a3e635] via-white to-transparent" />

          {/* Top Badge Row */}
          <div className="flex items-center justify-between mb-4 relative z-20">
            <span className="px-3 py-1 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/35 text-[10px] font-bold text-[#bef264] uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(163,230,53,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-ping inline-block" />
              Card Available
            </span>
            <span className="font-mono text-xs font-bold text-white/70 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
              #{pageId}
            </span>
          </div>

          {/* Radar Wireless NFC Pulse Icon */}
          <div className="relative w-28 h-28 mx-auto my-5 flex items-center justify-center z-20">
            <div
              className="absolute -inset-[3px] rounded-full animate-spin-slow opacity-90 blur-[1px]"
              style={{
                background: 'conic-gradient(from 0deg, #bef264, #a3e635, #ffffff, transparent, #a3e635, #bef264)',
              }}
            />
            <div className="relative w-24 h-24 rounded-full bg-[#050507] flex flex-col items-center justify-center border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.95)]">
              <Wifi size={38} className="text-[#a3e635] rotate-90 animate-pulse" />
            </div>
          </div>

          {/* Card Title & Intro */}
          <h1 className="text-2xl font-black tracking-tight text-white mt-2 leading-snug z-20 relative">
            <span className="bg-gradient-to-r from-white via-white to-[#bef264] bg-clip-text text-transparent">
              PVC NFC Card #{pageId}
            </span>
          </h1>

          <p className="text-xs text-emerald-100/75 mt-2 leading-relaxed font-light max-w-[300px] mx-auto z-20 relative">
            This permanent dynamic card is active and awaiting customer assignment.
          </p>

          {/* Specifications Box */}
          <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left text-xs space-y-2 z-20 relative">
            <div className="flex justify-between items-center text-white/60">
              <span className="text-[11px]">Hardware Chip:</span>
              <span className="font-mono font-bold text-[#bef264] text-[11px]">NTAG213 (144B)</span>
            </div>
            <div className="flex justify-between items-center text-white/60">
              <span className="text-[11px]">Permanent URL:</span>
              <span className="font-mono text-[10px] text-white/90 truncate max-w-[160px]">
                /c/{pageId}
              </span>
            </div>
            <div className="flex justify-between items-center text-white/60">
              <span className="text-[11px]">Card State:</span>
              <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Ready to Program
              </span>
            </div>
          </div>

          {/* Assign / Claim Button */}
          <button
            onClick={() => navigate(`/setup/${pageId}`)}
            className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold text-sm shadow-[0_10px_30px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95 z-20 relative cursor-pointer"
          >
            <Zap size={16} />
            <span>Assign / Activate Profile</span>
          </button>

          {/* Footer brand with 3-tap detection */}
          <div className="mt-8 pt-4 text-center border-t border-white/[0.08] relative z-20">
            <p className="text-[10px] tracking-[0.25em] uppercase font-medium text-white/50">
              Powered by{' '}
              <span
                className="font-black cursor-pointer transition-colors hover:text-white inline-block px-1 py-0.5 text-[#a3e635] shadow-[0_0_10px_rgba(163,230,53,0.3)]"
                onClick={handleFooterBrandTap}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  handleFooterBrandTap()
                }}
              >
                {settings.footer_brand && settings.footer_brand !== 'NEXUS NFC' ? settings.footer_brand : 'OMDROPZ'}
              </span>
            </p>

            {tapCount > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${tapCount >= 1 ? 'bg-[#a3e635] scale-125' : 'bg-white/20'}`} />
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${tapCount >= 2 ? 'bg-[#a3e635] scale-125' : 'bg-white/20'}`} />
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${tapCount >= 3 ? 'bg-[#a3e635] scale-125' : 'bg-white/20'}`} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none bg-[#050507] touch-manipulation"
      style={{
        fontFamily: font,
        backgroundColor: settings.bg_color || '#050507',
      }}
    >
      {/* Cinematic Ambient Atmosphere: Midnight Black + Neon Lime + Frost White */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full blur-[160px] pointer-events-none bg-gradient-to-tr from-[#a3e635]/25 via-[#84cc16]/15 to-white/10 animate-pulse-aura" />
      <div className="fixed -bottom-28 -right-28 w-[450px] h-[450px] rounded-full blur-[150px] opacity-15 pointer-events-none bg-[#a3e635]" />
      <div className="fixed -top-28 -left-28 w-[380px] h-[380px] rounded-full blur-[140px] opacity-10 pointer-events-none bg-white" />

      {/* Main Midnight Black & Frost White Floating Glass Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        className="relative w-full max-w-[390px] mx-auto rounded-[2.5rem] p-7 sm:p-9 transition-all duration-500 shadow-[0_35px_100px_-15px_rgba(0,0,0,0.95)] animate-card-enter overflow-hidden group"
        style={{
          background: 'linear-gradient(180deg, rgba(16, 17, 23, 0.95) 0%, rgba(8, 9, 12, 0.98) 100%)',
          backdropFilter: 'blur(35px)',
          WebkitBackdropFilter: 'blur(35px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 90px -15px rgba(0, 0, 0, 0.95), 0 0 45px -10px rgba(163, 230, 53, 0.2)',
        }}
      >
        {/* Dynamic Finger/Cursor Spotlight Following Touch */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 z-10"
          style={{
            background: `radial-gradient(420px circle at ${spotlight.x}px ${spotlight.y}px, rgba(163, 230, 53, 0.16), transparent 75%)`,
          }}
        />

        {/* Top Razor-Sharp Bevel Highlight: Frost White & Neon Lime Green */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#a3e635] via-white to-transparent" />

        {/* Profile DP / Logo with Rotating Neon Lime & Frost White Halo */}
        <div className="flex flex-col items-center relative z-20">
          <div className="relative group/dp cursor-pointer">
            {/* Multi-stop Rotating Neon Lime & Frost White Conic Halo */}
            <div
              className="absolute -inset-[3.5px] rounded-full animate-spin-slow opacity-95 blur-[1.5px]"
              style={{
                background:
                  'conic-gradient(from 0deg, #bef264, #a3e635, #ffffff, #65a30d, #a3e635, #ffffff, #bef264)',
              }}
            />

            {/* Glowing Neon Lime Ambient Aura */}
            <div className="absolute -inset-2 rounded-full bg-[#a3e635]/25 blur-lg animate-pulse pointer-events-none" />

            {/* Inner Dark Frame with Image */}
            <div className="relative w-28 h-28 sm:w-30 sm:h-30 rounded-full p-[3px] bg-[#050507] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.95)] transition-transform duration-300 group-hover/dp:scale-105">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.business_name || 'Business'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-black text-lime-400 bg-[#101217]">
                  {(settings.business_name || 'B').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Neon Lime Green Verified Emblem */}
            <div
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#a3e635] text-black flex items-center justify-center shadow-lg border-2 border-[#050507]"
              title="Verified NFC Profile"
            >
              <CheckCircle2 size={16} strokeWidth={3.2} />
            </div>
          </div>

          {/* Business Name with High-Contrast Gradient: Frost White into Neon Lime */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-4 text-center leading-snug">
            <span className="bg-gradient-to-r from-white via-white to-[#bef264] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(163,230,53,0.35)]">
              {settings.business_name || 'Business Name'}
            </span>
          </h1>

          {/* Welcome Message in Tinted Frost White & Mint */}
          {settings.welcome_message && (
            <p className="text-xs sm:text-sm mt-2 text-center leading-relaxed max-w-[310px] text-emerald-100/80 font-light">
              {settings.welcome_message}
            </p>
          )}
        </div>

        {/* Frost White Fine Divider with Neon Glow */}
        <div className="my-6 relative z-20">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#a3e635]/30 to-transparent" />
        </div>

        {/* 3 Core Interactive Action Buttons: Google, WhatsApp, Instagram */}
        <div className="flex flex-col gap-3.5 relative z-20">
          {/* 1. Official Google Review Button */}
          {googleEnabled && (
            <button
              onClick={handleGoogleReview}
              className="group mobile-tap animate-mobile-enter-1 luxury-tile luxury-tile-lime relative w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 shadow-md cursor-pointer border hover:-translate-y-1 hover:border-[#a3e635] hover:shadow-[0_12px_35px_-5px_rgba(163,230,53,0.35)] active:scale-[0.96] active:border-[#a3e635] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                borderColor: 'rgba(163, 230, 53, 0.35)',
              }}
            >
              <div className="flex items-center gap-3.5">
                {/* Official Google Logo */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 border border-white/20 shadow-md transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                  <GoogleIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base tracking-tight leading-snug">
                    <span className="text-white group-hover:text-amber-100 transition-colors">
                      {settings.google_review_text ? (
                        settings.google_review_text
                      ) : (
                        <>
                          Google <span className="text-[#a3e635] font-black">Review</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold tracking-wider flex items-center gap-1.5 mt-0.5">
                    <span className="text-amber-400 font-bold inline-block animate-star-pulse">★★★★★</span>
                    <span className="text-[#bef264] font-semibold">5.0 Rating</span>
                    <span className="text-white/40 text-[10px]">• Verified</span>
                  </div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/10 text-white group-hover:text-black group-hover:bg-[#a3e635] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                <ArrowUpRight size={18} />
              </div>
            </button>
          )}

          {/* 2. Official WhatsApp Button */}
          {whatsappEnabled && (
            <button
              onClick={handleWhatsApp}
              className="group mobile-tap animate-mobile-enter-2 luxury-tile luxury-tile-lime relative w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 shadow-md cursor-pointer border hover:-translate-y-1 hover:border-[#bef264] hover:shadow-[0_12px_35px_-5px_rgba(163,230,53,0.4)] active:scale-[0.96] active:border-[#bef264] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                borderColor: 'rgba(163, 230, 53, 0.4)',
              }}
            >
              <div className="flex items-center gap-3.5">
                {/* Official WhatsApp Logo */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] shadow-md transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                  <WhatsAppIcon className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base tracking-tight leading-snug">
                    <span className="text-white group-hover:text-emerald-100 transition-colors">
                      {settings.whatsapp_text ? (
                        settings.whatsapp_text
                      ) : (
                        <>
                          Chat on <span className="text-[#25D366] font-black">WhatsApp</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#bef264] font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-80" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
                    </span>
                    <span className="font-semibold text-[#a3e635]">Online • Instant Reply</span>
                  </div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/10 text-white group-hover:text-black group-hover:bg-[#25D366] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                <ArrowUpRight size={18} />
              </div>
            </button>
          )}

          {/* 3. Official Instagram Button */}
          {instagramEnabled && (
            <button
              onClick={handleInstagram}
              className="group mobile-tap animate-mobile-enter-3 luxury-tile luxury-tile-frost relative w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 shadow-md cursor-pointer border hover:-translate-y-1 hover:border-pink-500/80 hover:shadow-[0_12px_35px_-5px_rgba(225,48,108,0.3)] active:scale-[0.96] active:border-pink-500 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-center gap-3.5">
                {/* Official Instagram Logo with Signature Gradient */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                  <InstagramIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base tracking-tight leading-snug">
                    <span className="text-white group-hover:text-pink-100 transition-colors">
                      {settings.instagram_text ? (
                        settings.instagram_text
                      ) : (
                        <>
                          Follow on{' '}
                          <span className="bg-gradient-to-r from-[#ff7a00] via-[#ff0169] to-[#d300c5] bg-clip-text text-transparent font-black">
                            Instagram
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-[11px] text-pink-300/90 font-medium mt-0.5">
                    Portfolio, Stories & Drops
                  </div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/10 text-white group-hover:text-white group-hover:bg-gradient-to-tr group-hover:from-[#fd5949] group-hover:to-[#d6249f] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                <ArrowUpRight size={18} />
              </div>
            </button>
          )}

          {!googleEnabled && !whatsappEnabled && !instagramEnabled && (
            <div className="text-center py-4 text-xs text-gray-500">
              No links enabled yet.
            </div>
          )}
        </div>

        {/* Minimal Understated Footer with Secret 3-Tap Admin Access */}
        <div className="mt-8 pt-4 text-center border-t border-white/[0.08] relative z-20">
          <p className="text-[10px] tracking-[0.25em] uppercase font-medium text-white/50">
            Powered by{' '}
            <span
              className="font-black cursor-pointer transition-colors hover:text-white inline-block px-1 py-0.5 text-[#a3e635] shadow-[0_0_10px_rgba(163,230,53,0.3)]"
              onClick={handleFooterBrandTap}
              onTouchEnd={(e) => {
                e.preventDefault()
                handleFooterBrandTap()
              }}
              title=""
            >
              {settings.footer_brand && settings.footer_brand !== 'NEXUS NFC' ? settings.footer_brand : 'OMDROPZ'}
            </span>
          </p>

          {/* Discreet tap feedback for admin */}
          {tapCount > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  tapCount >= 1 ? 'bg-[#a3e635] scale-125' : 'bg-white/20'
                }`}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  tapCount >= 2 ? 'bg-[#a3e635] scale-125' : 'bg-white/20'
                }`}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  tapCount >= 3 ? 'bg-[#a3e635] scale-125' : 'bg-white/20'
                }`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
