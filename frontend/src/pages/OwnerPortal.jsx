import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Building2,
  Upload,
  Save,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Wifi,
} from 'lucide-react'
import { getBusinessById, updateBusiness } from '../lib/businessStore.js'
import MiniPreview from '../components/MiniPreview.jsx'

export default function OwnerPortal() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Editable fields (STRICT: Name, Logo, Review URL, WhatsApp, Instagram, Button toggles only)
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [googleReviewUrl, setGoogleReviewUrl] = useState('')
  const [googleReviewEnabled, setGoogleReviewEnabled] = useState(true)
  const [whatsAppNumber, setWhatsAppNumber] = useState('')
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(true)
  const [instagramUrl, setInstagramUrl] = useState('')
  const [instagramEnabled, setInstagramEnabled] = useState(true)
  const [welcomeMessage, setWelcomeMessage] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('owner_session')
    if (!raw) {
      navigate('/owner/login')
      return
    }

    try {
      const parsed = JSON.parse(raw)
      setSession(parsed)
      loadBusiness(parsed.businessId)
    } catch {
      navigate('/owner/login')
    }
  }, [navigate])

  async function loadBusiness(bizId) {
    setLoading(true)
    try {
      const b = await getBusinessById(bizId)
      if (!b) {
        setErrorMsg('Business profile not found.')
        return
      }
      setBusiness(b)
      setName(b.name || '')
      setLogoUrl(b.logo_url || '')
      setGoogleReviewUrl(b.google_review_url || '')
      setGoogleReviewEnabled(b.google_review_enabled !== false)
      setWhatsAppNumber(b.whatsapp_number || '')
      setWhatsAppEnabled(b.whatsapp_enabled !== false)
      setInstagramUrl(b.instagram_url || '')
      setInstagramEnabled(b.instagram_enabled !== false)
      setWelcomeMessage(b.welcome_message || '')
    } catch (err) {
      setErrorMsg('Error loading business details.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3MB limit.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoUrl(event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Business name cannot be empty.')
      return
    }

    setSaving(true)
    setSavedSuccess(false)
    setErrorMsg('')

    try {
      const updates = {
        name: name.trim(),
        logo_url: logoUrl,
        google_review_url: googleReviewUrl.trim(),
        google_review_enabled: googleReviewEnabled,
        whatsapp_number: whatsAppNumber.trim(),
        whatsapp_enabled: whatsAppEnabled,
        instagram_url: instagramUrl.trim(),
        instagram_enabled: instagramEnabled,
        welcome_message: welcomeMessage.trim(),
      }

      await updateBusiness(session.businessId, updates)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err) {
      setErrorMsg('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('owner_session')
    navigate('/owner/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#a3e635]/20 border-t-[#a3e635] animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-gray-400">Loading your business...</p>
        </div>
      </div>
    )
  }

  const previewData = {
    business_name: name || 'Business Name',
    logo_url: logoUrl || '',
    welcome_message: welcomeMessage || '',
    google_review_enabled: googleReviewEnabled,
    google_review_url: googleReviewUrl,
    whatsapp_enabled: whatsAppEnabled,
    whatsapp_number: whatsAppNumber,
    instagram_enabled: instagramEnabled,
    instagram_url: instagramUrl,
    bg_color: '#050507',
    btn_color: '#a3e635',
    font: 'Poppins',
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-[#08090d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635]">
            <Building2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#a3e635] font-bold">CLIENT PORTAL</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">
                {business?.category || 'Business'}
              </span>
            </div>
            <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-none">
              {business?.name || 'My Business'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/p/${session?.businessId}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <ExternalLink size={14} />
            <span>View Public Page</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Edit Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white">Edit Business Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Changes made here update your customer NFC card and QR code pages instantly.
                </p>
              </div>

              {savedSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 size={15} />
                  <span>Saved!</span>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Business Name */}
              <div>
                <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#a3e635] outline-none"
                  placeholder="Enter business name"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                  Business Logo
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-2 bg-[#1b1e2c] hover:bg-[#222638] text-gray-200 px-4 py-2.5 rounded-xl border border-white/10 cursor-pointer transition-colors text-xs">
                    <Upload size={14} className="text-[#a3e635]" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-gray-500 text-[11px]">or image URL</span>
                </div>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.jpg"
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                />
              </div>

              {/* Welcome Subtitle */}
              <div>
                <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                  Welcome Message / Subtitle
                </label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Exclusive beauty salon & personal styling."
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#a3e635] outline-none"
                />
              </div>

              {/* 3 Action Buttons with Toggles */}
              <div className="pt-3 border-t border-white/10 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#a3e635] font-bold block">
                  Customer Social Buttons
                </span>

                {/* 1. Google Review */}
                <div className="p-4 rounded-2xl bg-[#141620] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-xs flex items-center gap-2">
                      <span>1. Google Review Link</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-400">
                      <span>Enabled</span>
                      <input
                        type="checkbox"
                        checked={googleReviewEnabled}
                        onChange={(e) => setGoogleReviewEnabled(e.target.checked)}
                        className="accent-[#a3e635] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder="https://g.page/r/your-review-link"
                    className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#a3e635] outline-none"
                  />
                </div>

                {/* 2. WhatsApp Number */}
                <div className="p-4 rounded-2xl bg-[#141620] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-xs flex items-center gap-2">
                      <span>2. WhatsApp Number</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-400">
                      <span>Enabled</span>
                      <input
                        type="checkbox"
                        checked={whatsAppEnabled}
                        onChange={(e) => setWhatsAppEnabled(e.target.checked)}
                        className="accent-[#a3e635] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#a3e635] outline-none"
                  />
                </div>

                {/* 3. Instagram URL */}
                <div className="p-4 rounded-2xl bg-[#141620] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-xs flex items-center gap-2">
                      <span>3. Instagram Profile URL</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-400">
                      <span>Enabled</span>
                      <input
                        type="checkbox"
                        checked={instagramEnabled}
                        onChange={(e) => setInstagramEnabled(e.target.checked)}
                        className="accent-[#a3e635] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourbusiness"
                    className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#a3e635] outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#a3e635] hover:bg-[#bef264] text-black font-black py-3.5 px-8 rounded-2xl text-sm transition-all shadow-[0_10px_30px_rgba(163,230,53,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <span>Saving Changes...</span>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Phone Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-6">
              <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3 flex items-center justify-center gap-2">
                <Eye size={14} className="text-[#a3e635]" />
                Live Customer Screen Preview
              </p>
              <div className="w-[280px] h-[560px] rounded-[3rem] p-3 bg-[#0a0a0f] border-4 border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden">
                <div className="absolute top-2 inset-x-0 mx-auto w-24 h-4 bg-black rounded-b-xl z-30" />
                <div className="w-full h-full rounded-[2.2rem] overflow-hidden">
                  <MiniPreview formData={previewData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
