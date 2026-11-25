import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Wifi,
  Sparkles,
  Building2,
  Link2,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Eye,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Search,
} from 'lucide-react'
import {
  formatCardId,
  getCardById,
  getAllBusinesses,
  createBusiness,
  linkCardToBusiness,
  BUSINESS_CATEGORIES,
  DEFAULT_BASE_URL,
} from '../lib/businessStore.js'
import MiniPreview from '../components/MiniPreview.jsx'

export default function CardSetupWizard() {
  const { cardId: rawCardId } = useParams()
  const cardId = formatCardId(rawCardId || '001')
  const navigate = useNavigate()

  // Authorization state
  const [isAdminAuth, setIsAdminAuth] = useState(false)
  const [authPin, setAuthPin] = useState('')
  const [authError, setAuthError] = useState('')

  // Card & Existing Businesses
  const [card, setCard] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  // Wizard state: 'choice' | 'create' | 'link' | 'success'
  const [wizardMode, setWizardMode] = useState('choice') // 'create' | 'link'
  const [createStep, setCreateStep] = useState(1) // 1: Category, 2: Details, 3: Owner Access

  // New Business Form State
  const [selectedCategory, setSelectedCategory] = useState('Salon')
  const [businessName, setBusinessName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [googleReviewUrl, setGoogleReviewUrl] = useState('')
  const [whatsAppNumber, setWhatsAppNumber] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')

  // Owner Access State
  const [ownerAccessOption, setOwnerAccessOption] = useState('A') // 'A' = Phone+PIN, 'B' = Skip
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerPin, setOwnerPin] = useState('')

  // Link Existing Business State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBusinessId, setSelectedBusinessId] = useState('')

  // Submission & Feedback
  const [submitting, setSubmitting] = useState(false)
  const [completedBusiness, setCompletedBusiness] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  useEffect(() => {
    // Check if user is already logged in as Admin
    const token = localStorage.getItem('admin_token')
    if (token) {
      setIsAdminAuth(true)
    }

    async function loadData() {
      setLoading(true)
      try {
        const c = await getCardById(cardId)
        setCard(c)
        const allBiz = await getAllBusinesses()
        setBusinesses(allBiz)
      } catch (err) {
        console.error('Error loading setup data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [cardId])

  // Handle Admin Passcode Login
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    // Default admin passcode or token
    const entered = authPin.trim()
    if (entered === 'admin123' || entered === '1234' || entered === 'admin' || entered === 'omdropz') {
      localStorage.setItem('admin_token', 'temp_setup_token_' + Date.now())
      setIsAdminAuth(true)
      setAuthError('')
    } else {
      setAuthError('Invalid administrator passcode. Please try again.')
    }
  }

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3MB limit.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result
        setLogoPreview(base64)
        setLogoUrl(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Create Business
  const handleCreateSubmit = async () => {
    if (!businessName.trim()) {
      alert('Please enter a business name.')
      return
    }

    if (ownerAccessOption === 'A' && (!ownerPhone.trim() || !ownerPin.trim())) {
      alert('Please provide an owner mobile number and PIN, or select "Skip Owner Access".')
      return
    }

    setSubmitting(true)
    try {
      const bizData = {
        name: businessName,
        category: selectedCategory,
        logo_url: logoUrl,
        google_review_url: googleReviewUrl,
        whatsapp_number: whatsAppNumber,
        instagram_url: instagramUrl,
        welcome_message: welcomeMessage || `Welcome to ${businessName}. Connect with us below.`,
        owner_phone: ownerAccessOption === 'A' ? ownerPhone : '',
        owner_pin: ownerAccessOption === 'A' ? ownerPin : '',
        owner_access_enabled: ownerAccessOption === 'A',
      }

      const created = await createBusiness(bizData, cardId)
      setCompletedBusiness(created)
      setWizardMode('success')
    } catch (err) {
      console.error('Failed to create business:', err)
      alert('Error creating business. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Link Existing Business
  const handleLinkSubmit = async () => {
    if (!selectedBusinessId) {
      alert('Please select an existing business.')
      return
    }

    setSubmitting(true)
    try {
      await linkCardToBusiness(cardId, selectedBusinessId)
      const linkedBiz = businesses.find((b) => b.id === selectedBusinessId)
      setCompletedBusiness(linkedBiz)
      setWizardMode('success')
    } catch (err) {
      console.error('Failed to link business:', err)
      alert('Error linking business. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredBusinesses = businesses.filter((b) => {
    const q = searchQuery.toLowerCase()
    return (
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.id && b.id.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    )
  })

  // Live preview payload for Step 2
  const livePreviewData = {
    business_name: businessName || 'Your Business Name',
    welcome_message: welcomeMessage || 'Tap below to connect with us directly.',
    logo_url: logoPreview || logoUrl || '',
    google_review_enabled: Boolean(googleReviewUrl),
    google_review_url: googleReviewUrl,
    whatsapp_enabled: Boolean(whatsAppNumber),
    whatsapp_number: whatsAppNumber,
    instagram_enabled: Boolean(instagramUrl),
    instagram_url: instagramUrl,
    font: 'Poppins',
    bg_color: '#050507',
    btn_color: '#a3e635',
  }

  // ── 1. UNAUTHORIZED STATE: Secure Admin Authentication ──
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center p-4">
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none bg-[#a3e635]/15" />

        <div className="w-full max-w-md bg-[#0e1017] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center mx-auto mb-5 text-[#a3e635]">
            <Lock size={28} />
          </div>

          <div className="text-center mb-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#a3e635] bg-[#a3e635]/10 px-3 py-1 rounded-full border border-[#a3e635]/20">
              Protected Setup
            </span>
            <h1 className="text-2xl font-black mt-3 font-mono">{cardId}</h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Enter admin passcode to configure and assign this card.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Admin Passcode
              </label>
              <input
                type="password"
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-[#161822] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] text-center text-lg tracking-widest font-mono"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 text-center font-medium bg-rose-500/10 py-2 rounded-xl border border-rose-500/20">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-[0_10px_30px_rgba(163,230,53,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={18} />
              <span>Unlock Setup Wizard</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link
              to={`/c/${cardId}`}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              &larr; Return to Card Preview
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── 2. SUCCESS SCREEN: Live Demo & Access Info ──
  if (wizardMode === 'success' && completedBusiness) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none bg-[#a3e635]/20 animate-pulse-aura" />

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          {/* Left: Success Confirmation */}
          <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="inline-flex items-center gap-2 bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <CheckCircle2 size={16} />
              Card Successfully Activated
            </div>

            <h1 className="text-3xl font-black text-white leading-tight">
              {completedBusiness.name}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Card <span className="font-mono text-[#a3e635] font-bold">{cardId}</span> is now active and permanently linked.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-[#161822] border border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span>Hardware Chip:</span>
                <span className="font-mono text-white font-bold">NTAG213</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Permanent URL:</span>
                <span className="font-mono text-[#bef264]">/c/{cardId}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Business ID:</span>
                <span className="font-mono text-gray-300">{completedBusiness.id}</span>
              </div>
              {completedBusiness.owner_access_enabled && (
                <div className="flex justify-between items-center text-gray-400 pt-2 border-t border-white/10">
                  <span>Owner Access:</span>
                  <span className="text-emerald-400 font-bold">Enabled ({completedBusiness.owner_phone})</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/c/${cardId}`}
                target="_blank"
                className="flex-1 bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold py-3.5 px-4 rounded-2xl text-center text-sm shadow-[0_10px_25px_rgba(163,230,53,0.25)] transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                <span>Open Public Page</span>
              </Link>
              <Link
                to="/admin"
                className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-4 rounded-2xl text-center text-sm transition-all border border-white/10"
              >
                Go to Admin
              </Link>
            </div>

            {completedBusiness.owner_access_enabled && (
              <div className="mt-4 text-center">
                <Link
                  to="/owner/login"
                  className="text-xs text-[#a3e635] hover:underline inline-flex items-center gap-1"
                >
                  <Smartphone size={13} />
                  <span>Test Owner Login Portal (/owner/login)</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Live Interactive Phone Preview */}
          <div className="flex flex-col items-center">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <Eye size={14} className="text-[#a3e635]" />
              Live Landing Page Preview
            </p>
            <div className="w-[300px] h-[580px] rounded-[3rem] p-3 bg-[#0a0a0f] border-4 border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden">
              <div className="absolute top-2 inset-x-0 mx-auto w-24 h-4 bg-black rounded-b-xl z-30" />
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden">
                <MiniPreview formData={completedBusiness} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── 3. CHOICE VIEW: Create New vs Link Existing ──
  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-[#08090d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635]">
            <Wifi size={20} className="rotate-90" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#a3e635] font-bold">NFC SAGE</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">
                Setup Wizard
              </span>
            </div>
            <h1 className="text-sm font-bold text-white font-mono">
              {cardId}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/c/${cardId}`}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10"
          >
            View Public Card
          </Link>
          <Link
            to="/admin"
            className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {/* Choice Step */}
        {wizardMode === 'choice' && (
          <div className="max-w-2xl mx-auto w-full text-center">
            <span className="px-3 py-1 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/30 text-xs font-mono uppercase tracking-wider text-[#a3e635]">
              First Tap / Setup Flow
            </span>
            <h2 className="text-3xl font-black text-white mt-4 tracking-tight font-mono">
              {cardId}
            </h2>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Choose how you want to configure this card. You can create a fresh business profile or attach this card to an existing business.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
              {/* Option A: Create New Business */}
              <div
                onClick={() => setWizardMode('create')}
                className="group relative p-6 sm:p-8 rounded-3xl bg-[#0e1017] hover:bg-[#131622] border border-white/10 hover:border-[#a3e635] transition-all duration-300 cursor-pointer text-left shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#a3e635] to-[#bef264] text-black flex items-center justify-center font-black mb-5 shadow-lg shadow-lime-500/20 group-hover:scale-105 transition-transform">
                    <Building2 size={28} />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#a3e635] font-bold">
                    Option A
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1 group-hover:text-[#bef264] transition-colors">
                    Create New Business
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Set up a new brand profile from scratch with category, logo, review URL, WhatsApp, and optional owner login.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#a3e635] group-hover:translate-x-1 transition-transform">
                  <span>Start Profile Creation</span>
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* Option B: Link Existing Business */}
              <div
                onClick={() => setWizardMode('link')}
                className="group relative p-6 sm:p-8 rounded-3xl bg-[#0e1017] hover:bg-[#131622] border border-white/10 hover:border-indigo-400 transition-all duration-300 cursor-pointer text-left shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black mb-5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <Link2 size={28} />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                    Option B
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                    Link Existing Business
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Attach this card to an existing business (e.g. if a salon bought 5 cards, link cards 002-005 to that salon).
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Browse &amp; Link</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OPTION A: CREATE NEW BUSINESS WIZARD ── */}
        {wizardMode === 'create' && (
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  if (createStep > 1) setCreateStep(createStep - 1)
                  else setWizardMode('choice')
                }}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      createStep === s
                        ? 'w-8 bg-[#a3e635]'
                        : createStep > s
                        ? 'w-4 bg-emerald-500'
                        : 'w-4 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs font-mono text-gray-400">
                Step {createStep} of 3
              </span>
            </div>

            {/* Step 1: Business Category */}
            {createStep === 1 && (
              <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8">
                <span className="text-xs font-mono text-[#a3e635] uppercase tracking-wider font-bold">
                  Step 1
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Select Business Category
                </h2>
                <p className="text-xs text-gray-400 mt-1 mb-6">
                  Choose the category that best matches your client's business.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#a3e635]/15 border-[#a3e635] text-white font-bold shadow-[0_0_20px_rgba(163,230,53,0.15)]'
                          : 'bg-[#141620] border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{cat}</span>
                        {selectedCategory === cat && (
                          <CheckCircle2 size={16} className="text-[#a3e635]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setCreateStep(2)}
                    className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold py-3 px-6 rounded-2xl text-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Business Details */}
            {createStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8">
                  <span className="text-xs font-mono text-[#a3e635] uppercase tracking-wider font-bold">
                    Step 2
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">
                    Enter Business Details
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 mb-6">
                    Category: <span className="text-white font-bold">{selectedCategory}</span>
                  </p>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Aura Studio & Salon"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                        Business Logo
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 bg-[#1b1e2c] hover:bg-[#222638] text-gray-200 px-4 py-2.5 rounded-xl border border-white/10 cursor-pointer transition-colors text-xs">
                          <Upload size={14} className="text-[#a3e635]" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-gray-500 text-[11px]">or paste URL</span>
                      </div>
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => {
                          setLogoUrl(e.target.value)
                          setLogoPreview(e.target.value)
                        }}
                        placeholder="https://example.com/logo.png"
                        className="w-full mt-2 bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                        Google Review URL
                      </label>
                      <input
                        type="url"
                        value={googleReviewUrl}
                        onChange={(e) => setGoogleReviewUrl(e.target.value)}
                        placeholder="https://g.page/r/your-review-link"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                        WhatsApp Number (with country code)
                      </label>
                      <input
                        type="tel"
                        value={whatsAppNumber}
                        onChange={(e) => setWhatsAppNumber(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/yourbusiness"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                        Welcome Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        placeholder="Bespoke luxury styling & atelier."
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#a3e635] outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setCreateStep(1)}
                      className="text-gray-400 hover:text-white text-xs px-4 py-2.5 rounded-xl border border-white/10"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!businessName.trim()) {
                          alert('Business Name is required.')
                          return
                        }
                        setCreateStep(3)
                      }}
                      className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold py-3 px-6 rounded-2xl text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Owner Access &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Right: Real-time preview */}
                <div className="hidden md:flex flex-col items-center justify-center">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <Eye size={12} className="text-[#a3e635]" />
                    Live Mini Preview
                  </p>
                  <div className="w-[240px] h-[460px] rounded-[2rem] p-2.5 bg-[#0a0a0f] border-2 border-white/15 shadow-xl relative overflow-hidden">
                    <div className="w-full h-full rounded-[1.6rem] overflow-hidden">
                      <MiniPreview formData={livePreviewData} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Owner Access Options */}
            {createStep === 3 && (
              <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8">
                <span className="text-xs font-mono text-[#a3e635] uppercase tracking-wider font-bold">
                  Step 3
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Owner Access Configuration
                </h2>
                <p className="text-xs text-gray-400 mt-1 mb-6">
                  Decide whether the client can independently edit their social links and business info.
                </p>

                <div className="space-y-4">
                  {/* Option A */}
                  <label
                    onClick={() => setOwnerAccessOption('A')}
                    className={`block p-5 rounded-2xl border transition-all cursor-pointer ${
                      ownerAccessOption === 'A'
                        ? 'bg-[#a3e635]/10 border-[#a3e635] text-white shadow-[0_0_20px_rgba(163,230,53,0.1)]'
                        : 'bg-[#141620] border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="owner_opt"
                        checked={ownerAccessOption === 'A'}
                        onChange={() => setOwnerAccessOption('A')}
                        className="mt-1 accent-[#a3e635]"
                      />
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>OPTION A: Give Owner Access</span>
                          <span className="text-[10px] bg-[#a3e635]/20 text-[#a3e635] px-2 py-0.5 rounded font-mono font-normal">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Owner gets a private login via mobile number + PIN to edit ONLY their own links. They cannot touch admin settings.
                        </p>
                      </div>
                    </div>

                    {ownerAccessOption === 'A' && (
                      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                            Owner Mobile Number *
                          </label>
                          <input
                            type="tel"
                            value={ownerPhone}
                            onChange={(e) => setOwnerPhone(e.target.value)}
                            placeholder="+919876543210"
                            className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#a3e635] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                            Owner PIN (4 to 6 digits) *
                          </label>
                          <input
                            type="password"
                            maxLength={6}
                            value={ownerPin}
                            onChange={(e) => setOwnerPin(e.target.value)}
                            placeholder="e.g. 5678"
                            className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#a3e635] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Option B */}
                  <label
                    onClick={() => setOwnerAccessOption('B')}
                    className={`block p-5 rounded-2xl border transition-all cursor-pointer ${
                      ownerAccessOption === 'B'
                        ? 'bg-[#a3e635]/10 border-[#a3e635] text-white shadow-[0_0_20px_rgba(163,230,53,0.1)]'
                        : 'bg-[#141620] border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="owner_opt"
                        checked={ownerAccessOption === 'B'}
                        onChange={() => setOwnerAccessOption('B')}
                        className="mt-1 accent-[#a3e635]"
                      />
                      <div>
                        <div className="font-bold text-sm text-white">
                          OPTION B: Skip Owner Access
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          No owner credentials created. You keep full admin-only control. You can assign or reset owner access later anytime.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setCreateStep(2)}
                    className="text-gray-400 hover:text-white text-xs px-4 py-2.5 rounded-xl border border-white/10"
                  >
                    Back to Details
                  </button>
                  <button
                    onClick={handleCreateSubmit}
                    disabled={submitting}
                    className="bg-[#a3e635] hover:bg-[#bef264] text-black font-black py-3.5 px-8 rounded-2xl text-sm transition-all shadow-[0_10px_30px_rgba(163,230,53,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Saving Profile...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Save &amp; Activate {cardId}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── OPTION B: LINK EXISTING BUSINESS ── */}
        {wizardMode === 'link' && (
          <div className="max-w-2xl mx-auto w-full bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setWizardMode('choice')}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Options</span>
              </button>
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
                Option B: Multi-Card Linking
              </span>
            </div>

            <h2 className="text-2xl font-black text-white">
              Link {cardId} to Existing Business
            </h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Select an existing client business. {cardId} will immediately resolve to the exact same landing page.
            </p>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses by name or ID..."
                className="w-full bg-[#161822] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-indigo-400 outline-none"
              />
            </div>

            {/* Business List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredBusinesses.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No businesses found. You can switch to Option A to create one.
                </div>
              ) : (
                filteredBusinesses.map((b) => {
                  const isSelected = selectedBusinessId === b.id
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBusinessId(b.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-lg'
                          : 'bg-[#141620] border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1c1f2e] border border-white/10 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                          {b.logo_url ? (
                            <img
                              src={b.logo_url}
                              alt={b.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (b.name || 'B').charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">
                            {b.name}
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-2">
                            <span>{b.category || 'Business'}</span>
                            <span>•</span>
                            <span className="font-mono text-indigo-300">
                              {b.cardCount || 0} card{b.cardCount === 1 ? '' : 's'} linked
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-400/30">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Link Action */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {cardId} &rarr;{' '}
                <span className="text-white font-bold">
                  {businesses.find((b) => b.id === selectedBusinessId)?.name || 'None selected'}
                </span>
              </span>

              <button
                onClick={handleLinkSubmit}
                disabled={!selectedBusinessId || submitting}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Linking...</span>
                ) : (
                  <>
                    <Link2 size={16} />
                    <span>Link {cardId} Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
