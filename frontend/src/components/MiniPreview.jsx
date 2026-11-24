import React from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  Zap,
} from 'lucide-react'

// Official Brand Vector Icons
function GoogleIcon({ className = "w-4 h-4" }) {
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

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

export default function MiniPreview({ formData }) {
  const settings = formData || {}
  const font = settings.font || 'Poppins'

  const googleEnabled = settings.google_review_enabled !== false
  const whatsappEnabled = settings.whatsapp_enabled !== false
  const instagramEnabled = settings.instagram_enabled !== false

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center relative p-3 select-none bg-[#050507]"
      style={{
        fontFamily: font,
        minHeight: '100%',
      }}
    >
      {/* Subtle luxury ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-30 blur-3xl pointer-events-none bg-[#a3e635] animate-pulse-aura"
      />

      {/* Mini Card */}
      <div
        className="relative w-full max-w-[270px] shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden rounded-[1.75rem] p-5 my-auto animate-float"
        style={{
          background: 'linear-gradient(180deg, rgba(16, 17, 23, 0.95) 0%, rgba(8, 9, 12, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px -5px rgba(163, 230, 53, 0.2)',
        }}
      >
        {/* Top Razor-Sharp Bevel Highlight */}
        <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#a3e635] via-white to-transparent" />

        {/* DP / Profile Image with rotating ring */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              className="absolute -inset-[2.5px] rounded-full animate-spin-slow opacity-95 blur-[0.5px]"
              style={{
                background:
                  'conic-gradient(from 0deg, #bef264, #a3e635, #ffffff, #65a30d, #a3e635, #ffffff, #bef264)',
              }}
            />
            <div className="relative w-18 h-18 rounded-full p-[2px] overflow-hidden bg-[#050507] shadow-lg">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-xl font-black text-[#a3e635] bg-[#101217]">
                  {(settings.business_name || 'B').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#a3e635] text-black flex items-center justify-center border-2 border-[#050507]">
              <CheckCircle2 size={11} strokeWidth={3.2} />
            </div>
          </div>

          {/* Business Name with Gradient */}
          <h1 className="font-black text-center mt-3 leading-tight text-[13px]">
            <span className="bg-gradient-to-r from-white via-white to-[#bef264] bg-clip-text text-transparent">
              {settings.business_name || 'Business Name'}
            </span>
          </h1>

          {/* Welcome Message */}
          {settings.welcome_message && (
            <p className="text-center mt-1 leading-snug line-clamp-2 text-[10px] max-w-[200px] text-emerald-100/80 font-light">
              {settings.welcome_message}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="my-3.5 h-[1px] w-full bg-gradient-to-r from-transparent via-[#a3e635]/30 to-transparent" />

        {/* 3 Core Buttons */}
        <div className="flex flex-col gap-2">
          {/* Google */}
          {googleEnabled && (
            <div
              className="luxury-tile luxury-tile-lime flex items-center justify-between p-2.5 rounded-xl shadow-sm border"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                borderColor: 'rgba(163, 230, 53, 0.35)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10 border border-white/20">
                  <GoogleIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-[10px] leading-tight truncate max-w-[130px]">
                    <span className="text-white">Google </span>
                    <span className="text-[#a3e635]">Review</span>
                  </div>
                  <div className="text-[8px] font-semibold flex items-center gap-1">
                    <span className="text-amber-400">★★★★★</span>
                    <span className="text-[#bef264]">5.0 Star</span>
                  </div>
                </div>
              </div>
              <ArrowUpRight size={12} className="text-white/70" />
            </div>
          )}

          {/* WhatsApp */}
          {whatsappEnabled && (
            <div
              className="luxury-tile luxury-tile-lime flex items-center justify-between p-2.5 rounded-xl shadow-sm border"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                borderColor: 'rgba(163, 230, 53, 0.4)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366]">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-[10px] leading-tight truncate max-w-[130px]">
                    <span className="text-white">Chat on </span>
                    <span className="text-[#25D366]">WhatsApp</span>
                  </div>
                  <div className="text-[8px] text-[#a3e635] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    <span>Instant Reply</span>
                  </div>
                </div>
              </div>
              <ArrowUpRight size={12} className="text-white/70" />
            </div>
          )}

          {/* Instagram */}
          {instagramEnabled && (
            <div
              className="luxury-tile luxury-tile-frost flex items-center justify-between p-2.5 rounded-xl shadow-sm border"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] text-white">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-[10px] leading-tight truncate max-w-[130px]">
                    <span className="text-white">Follow on </span>
                    <span className="bg-gradient-to-r from-[#ff7a00] via-[#ff0169] to-[#d300c5] bg-clip-text text-transparent">
                      Instagram
                    </span>
                  </div>
                  <div className="text-[8px] text-pink-300 font-medium">Stories & Drops</div>
                </div>
              </div>
              <ArrowUpRight size={12} className="text-white/70" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-[9px] tracking-[0.2em] uppercase font-semibold text-white/50">
          Powered by{' '}
          <span className="font-bold text-[#a3e635]">
            {settings.footer_brand && settings.footer_brand !== 'NEXUS NFC' ? settings.footer_brand : 'OMDROPZ'}
          </span>
        </div>
      </div>
    </div>
  )
}
