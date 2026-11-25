import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  Building2,
  PlusCircle,
  Link2,
  QrCode,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Trash2,
  Edit,
  Key,
  Save,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Archive,
  Eye,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react'
import {
  getAllCards,
  getAllBusinesses,
  createCard,
  bulkCreateCards,
  deleteCardRecord,
  getNextCardId,
  createBusiness,
  updateBusiness,
  linkCardToBusiness,
  unlinkCard,
  deleteBusiness,
  resetOwnerPin,
  formatCardId,
  BUSINESS_CATEGORIES,
  DEFAULT_BASE_URL,
} from '../lib/businessStore.js'
import {
  generateQRDataURL,
  downloadSingleQRPNG,
  downloadAllCardsZip,
  downloadCSVFile,
} from '../lib/qrHelper.js'

export default function AdminDashboard() {
  const navigate = useNavigate()

  // Navigation tab
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'cards' | 'businesses' | 'create-biz' | 'link-biz' | 'qr-hub'

  // Data
  const [cards, setCards] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedUrl, setCopiedUrl] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  // Card Pagination & Filter
  const [cardSearch, setCardSearch] = useState('')
  const [cardFilter, setCardFilter] = useState('all') // 'all' | 'available' | 'assigned' | 'linked'
  const [cardPage, setCardPage] = useState(1)
  const [cardPageSize, setCardPageSize] = useState(25)

  // Business Pagination & Filter
  const [bizSearch, setBizSearch] = useState('')
  const [bizPage, setBizPage] = useState(1)
  const bizPageSize = 12

  // Modal States
  const [editBizModal, setEditBizModal] = useState(null)
  const [pinModal, setPinModal] = useState(null)
  const [qrModalCard, setQrModalCard] = useState(null)
  const [qrModalDataUrl, setQrModalDataUrl] = useState('')

  // Bulk Card Creation Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkQuantity, setBulkQuantity] = useState(50)
  const [bulkCreating, setBulkCreating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [creatingSingleCard, setCreatingSingleCard] = useState(false)
  const [nextId, setNextId] = useState('001')

  // Create Business Form
  const [createCategory, setCreateCategory] = useState('Salon')
  const [createName, setCreateName] = useState('')
  const [createLogo, setCreateLogo] = useState('')
  const [createReviewUrl, setCreateReviewUrl] = useState('')
  const [createWhatsApp, setCreateWhatsApp] = useState('')
  const [createInstagram, setCreateInstagram] = useState('')
  const [createWelcome, setCreateWelcome] = useState('')
  const [createCardId, setCreateCardId] = useState('')
  const [createOwnerAccess, setCreateOwnerAccess] = useState('A')
  const [createOwnerPhone, setCreateOwnerPhone] = useState('')
  const [createOwnerPin, setCreateOwnerPin] = useState('')
  const [createSaving, setCreateSaving] = useState(false)

  // Dedicated Link Form
  const [selectedLinkCard, setSelectedLinkCard] = useState('')
  const [selectedLinkBiz, setSelectedLinkBiz] = useState('')
  const [linkSaving, setLinkSaving] = useState(false)

  // QR Bulk Download Progress
  const [zipProgress, setZipProgress] = useState(null)

  // QR Hub credentials state
  const [qrhubApiKey, setQrhubApiKey] = useState(localStorage.getItem('qrhub_api_key') || '')
  const [qrhubApiUrl, setQrhubApiUrl] = useState(localStorage.getItem('qrhub_api_url') || 'https://api.qrhub.com/v1')
  const [qrhubSaved, setQrhubSaved] = useState(false)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Load Data
  const reloadData = async () => {
    setLoading(true)
    try {
      const allCards = await getAllCards()
      const allBiz = await getAllBusinesses()
      setCards(allCards)
      setBusinesses(allBiz)
      const nId = await getNextCardId()
      setNextId(nId)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin/login')
      return
    }
    reloadData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(id)
    setTimeout(() => setCopiedUrl(''), 2500)
  }

  const handleShowQrModal = async (c) => {
    setQrModalCard(c)
    try {
      const dataUrl = await generateQRDataURL(c.permanent_url)
      setQrModalDataUrl(dataUrl)
    } catch {}
  }

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const q = cardSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        String(c.card_id).toLowerCase().includes(q) ||
        (c.business_name && c.business_name.toLowerCase().includes(q)) ||
        (c.business_id && String(c.business_id).toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (cardFilter === 'available') return c.status === 'available' || !c.business_id
      if (cardFilter === 'assigned') return c.status === 'assigned'
      if (cardFilter === 'linked') return c.status === 'linked'
      if (cardFilter === 'active') return c.status === 'active'
      return true
    })
  }, [cards, cardSearch, cardFilter])

  // Paginated Cards for smooth 60fps rendering with unlimited cards
  const totalFilteredCards = filteredCards.length
  const totalCardPages = Math.max(1, Math.ceil(totalFilteredCards / cardPageSize))
  const paginatedCards = useMemo(() => {
    const safePage = Math.min(cardPage, totalCardPages)
    const start = (safePage - 1) * cardPageSize
    return filteredCards.slice(start, start + cardPageSize)
  }, [filteredCards, cardPage, totalCardPages, cardPageSize])

  // Overview Metrics (Never hardcoded!)
  const metrics = useMemo(() => {
    const totalCards = cards.length
    const availableCards = cards.filter((c) => c.status === 'available' || !c.business_id).length
    const assignedCards = cards.filter((c) => c.status === 'assigned' || c.status === 'linked' || c.status === 'active').length
    const totalBusinesses = businesses.length
    const linkedCards = cards.filter((c) => c.status === 'linked').length
    return {
      totalCards,
      availableCards,
      assignedCards,
      totalBusinesses,
      linkedCards,
    }
  }, [cards, businesses])

  // Filtered & Paginated Businesses
  const filteredBusinesses = useMemo(() => {
    const q = bizSearch.toLowerCase().trim()
    return businesses.filter((b) => {
      if (!q) return true
      return (
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.id && String(b.id).toLowerCase().includes(q))
      )
    })
  }, [businesses, bizSearch])

  const totalBizPages = Math.max(1, Math.ceil(filteredBusinesses.length / bizPageSize))
  const paginatedBusinesses = useMemo(() => {
    const safePage = Math.min(bizPage, totalBizPages)
    const start = (safePage - 1) * bizPageSize
    return filteredBusinesses.slice(start, start + bizPageSize)
  }, [filteredBusinesses, bizPage, totalBizPages, bizPageSize])

  // ── ACTION: Create Single New Card ──
  const handleCreateSingleCard = async () => {
    setCreatingSingleCard(true)
    try {
      const newCard = await createCard()
      await reloadData()
      showToast(`NFC Card #${newCard.card_id} created successfully!`)
    } catch (err) {
      alert('Error creating card.')
    } finally {
      setCreatingSingleCard(false)
    }
  }

  // ── ACTION: Bulk Create Cards ──
  const handleBulkCreateCards = async (e) => {
    e.preventDefault()
    const qty = parseInt(bulkQuantity, 10)
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity (e.g. 10, 50, 100, 500).')
      return
    }

    setBulkCreating(true)
    setBulkProgress(0)
    try {
      const created = await bulkCreateCards(qty, DEFAULT_BASE_URL, (cur, tot) => {
        setBulkProgress(Math.round((cur / tot) * 100))
      })
      await reloadData()
      setBulkModalOpen(false)
      showToast(`Successfully created ${created.length} new NFC cards (#${created[0].card_id} to #${created[created.length - 1].card_id})!`)
    } catch (err) {
      alert('Error during bulk card creation.')
    } finally {
      setBulkCreating(false)
      setBulkProgress(0)
    }
  }

  // ── ACTION: Delete Card Record ──
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm(`Delete Card #${cardId}? Permanent URL will be deactivated.`)) return
    try {
      await deleteCardRecord(cardId)
      await reloadData()
      showToast(`Card #${cardId} deleted.`)
    } catch {
      alert('Error deleting card.')
    }
  }

  // ── ACTION: Create Business Submit ──
  const handleCreateBusinessSubmit = async (e) => {
    e.preventDefault()
    if (!createName.trim()) {
      alert('Business name is required.')
      return
    }

    if (createOwnerAccess === 'A' && (!createOwnerPhone.trim() || !createOwnerPin.trim())) {
      alert('Please provide owner mobile number and PIN, or choose Skip Owner Access.')
      return
    }

    setCreateSaving(true)
    try {
      const data = {
        name: createName,
        category: createCategory,
        logo_url: createLogo,
        google_review_url: createReviewUrl,
        whatsapp_number: createWhatsApp,
        instagram_url: createInstagram,
        welcome_message: createWelcome,
        owner_phone: createOwnerAccess === 'A' ? createOwnerPhone : '',
        owner_pin: createOwnerAccess === 'A' ? createOwnerPin : '',
        owner_access_enabled: createOwnerAccess === 'A',
      }

      await createBusiness(data, createCardId || null)
      await reloadData()

      setCreateName('')
      setCreateLogo('')
      setCreateReviewUrl('')
      setCreateWhatsApp('')
      setCreateInstagram('')
      setCreateWelcome('')
      setCreateCardId('')
      setCreateOwnerPhone('')
      setCreateOwnerPin('')

      showToast('Business profile created successfully!')
      setActiveTab('businesses')
    } catch (err) {
      alert('Error creating business.')
    } finally {
      setCreateSaving(false)
    }
  }

  // ── ACTION: Link Card Submit ──
  const handleLinkCardSubmit = async (e) => {
    e.preventDefault()
    if (!selectedLinkCard || !selectedLinkBiz) {
      alert('Please select both a card and a business.')
      return
    }

    setLinkSaving(true)
    try {
      await linkCardToBusiness(selectedLinkCard, selectedLinkBiz)
      await reloadData()
      setSelectedLinkCard('')
      setSelectedLinkBiz('')
      showToast(`Card #${selectedLinkCard} linked successfully!`)
      setActiveTab('cards')
    } catch (err) {
      alert('Error linking card.')
    } finally {
      setLinkSaving(false)
    }
  }

  // ── ACTION: Unlink Card ──
  const handleUnlink = async (cardId) => {
    if (!window.confirm(`Unlink Card #${cardId}? It will revert to Available state.`)) return
    try {
      await unlinkCard(cardId)
      await reloadData()
      showToast(`Card #${cardId} unlinked.`)
    } catch {
      alert('Error unlinking card.')
    }
  }

  // ── ACTION: Delete Business ──
  const handleDeleteBusiness = async (bizId, name) => {
    if (!window.confirm(`Delete business "${name}"? All attached cards will revert to Available.`)) return
    try {
      await deleteBusiness(bizId)
      await reloadData()
      showToast(`Business "${name}" deleted.`)
    } catch {
      alert('Error deleting business.')
    }
  }

  // ── ACTION: Save Edited Business (Strict: Details only) ──
  const handleSaveEditedBusiness = async (e) => {
    e.preventDefault()
    if (!editBizModal) return

    try {
      await updateBusiness(editBizModal.id, {
        name: editBizModal.name,
        category: editBizModal.category,
        logo_url: editBizModal.logo_url,
        google_review_url: editBizModal.google_review_url,
        google_review_enabled: editBizModal.google_review_enabled,
        whatsapp_number: editBizModal.whatsapp_number,
        whatsapp_enabled: editBizModal.whatsapp_enabled,
        instagram_url: editBizModal.instagram_url,
        instagram_enabled: editBizModal.instagram_enabled,
        welcome_message: editBizModal.welcome_message,
      })
      await reloadData()
      setEditBizModal(null)
      showToast('Business details updated!')
    } catch {
      alert('Error updating business.')
    }
  }

  // ── ACTION: Save Reset PIN ──
  const handleSavePin = async (e) => {
    e.preventDefault()
    if (!pinModal) return
    try {
      await resetOwnerPin(pinModal.businessId, pinModal.newPin, pinModal.newPhone)
      await reloadData()
      setPinModal(null)
      showToast('Owner PIN updated successfully.')
    } catch {
      alert('Error updating PIN.')
    }
  }

  const availableCards = cards.filter((c) => c.status === 'available' || !c.business_id)

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161822] border border-[#a3e635] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 size={16} className="text-[#a3e635]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-full md:w-64 bg-[#08090e] border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#a3e635] text-black font-black flex items-center justify-center text-sm shadow-[0_0_15px_rgba(163,230,53,0.35)]">
                OM
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white">
                  OMDROPZ <span className="text-[#a3e635]">ADMIN</span>
                </h1>
                <p className="text-[10px] font-mono text-gray-400">Unlimited Card Manager</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#a3e635] text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={17} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('cards')
                setCardPage(1)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-[#a3e635] text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={17} />
                <span>All NFC Cards</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'cards' ? 'bg-black text-[#a3e635]' : 'bg-white/10 text-gray-300'
                }`}
              >
                {metrics.totalCards}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('businesses')
                setBizPage(1)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'businesses'
                  ? 'bg-[#a3e635] text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 size={17} />
                <span>All Businesses</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'businesses' ? 'bg-black text-[#a3e635]' : 'bg-white/10 text-gray-300'
                }`}
              >
                {metrics.totalBusinesses}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('create-biz')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'create-biz'
                  ? 'bg-[#a3e635] text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle size={17} />
              <span>Create Business</span>
            </button>

            <button
              onClick={() => setActiveTab('link-biz')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'link-biz'
                  ? 'bg-[#a3e635] text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link2 size={17} />
              <span>Link Existing Business</span>
            </button>

            <button
              onClick={() => setActiveTab('qr-hub')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'qr-hub'
                  ? 'bg-[#a3e635] text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode size={17} />
              <span>QR Code Management</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
          >
            <ExternalLink size={14} />
            <span>View Public Landing</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD VIEWPORT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="px-6 py-4 border-b border-white/10 bg-[#08090e]/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#a3e635] bg-[#a3e635]/10 px-2.5 py-1 rounded-md border border-[#a3e635]/20 font-bold">
              SCALABLE SYSTEM
            </span>
            <h2 className="text-sm font-bold capitalize text-white">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Create Card Button in Header */}
            <button
              onClick={handleCreateSingleCard}
              disabled={creatingSingleCard}
              className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              title="Instantly generate next sequential card ID"
            >
              <PlusCircle size={14} />
              <span>{creatingSingleCard ? 'Creating...' : '+ Create Card'}</span>
            </button>

            <button
              onClick={() => setBulkModalOpen(true)}
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Bulk generate cards"
            >
              <Layers size={14} className="text-[#a3e635]" />
              <span>Bulk Cards</span>
            </button>

            <button
              onClick={reloadData}
              className="text-xs text-gray-400 hover:text-white p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/owner/login"
              target="_blank"
              className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Smartphone size={13} className="text-[#a3e635]" />
              <span className="hidden sm:inline">Owner Portal</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* ════════════════════════════════════════════════════════════
              TAB 1: OVERVIEW (UNLIMITED SYSTEM)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                    <span>Total NFC Cards</span>
                    <CreditCard size={16} className="text-[#a3e635]" />
                  </div>
                  <div className="text-3xl font-black text-white font-mono">{metrics.totalCards}</div>
                  <p className="text-[10px] text-gray-500 mt-1">Unlimited capacity</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                    <span>Available Cards</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">{metrics.availableCards}</div>
                  <p className="text-[10px] text-gray-500 mt-1">Ready to assign / link</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                    <span>Assigned Cards</span>
                    <span className="w-2 h-2 rounded-full bg-[#a3e635]" />
                  </div>
                  <div className="text-3xl font-black text-[#a3e635] font-mono">{metrics.assignedCards}</div>
                  <p className="text-[10px] text-gray-500 mt-1">Live customer cards</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                    <span>Total Businesses</span>
                    <Building2 size={16} className="text-indigo-400" />
                  </div>
                  <div className="text-3xl font-black text-indigo-400 font-mono">{metrics.totalBusinesses}</div>
                  <p className="text-[10px] text-gray-500 mt-1">Registered clients</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                    <span>Linked Cards</span>
                    <Link2 size={16} className="text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-blue-400 font-mono">{metrics.linkedCards}</div>
                  <p className="text-[10px] text-gray-500 mt-1">Multi-card clients</p>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="p-6 rounded-3xl bg-[#0e1017] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Quick Management Actions
                  </h3>
                  <span className="text-xs font-mono text-[#a3e635]">Next Card ID: #{nextId}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <button
                    onClick={handleCreateSingleCard}
                    disabled={creatingSingleCard}
                    className="p-4 rounded-2xl bg-gradient-to-tr from-[#a3e635]/20 to-[#bef264]/10 border border-[#a3e635]/40 hover:border-[#a3e635] text-left transition-all cursor-pointer group disabled:opacity-50"
                  >
                    <PlusCircle size={22} className="text-[#a3e635] mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white text-sm">Create Next Card (#{nextId})</div>
                    <p className="text-gray-400 mt-0.5">1-click instant unique card creation</p>
                  </button>

                  <button
                    onClick={() => setBulkModalOpen(true)}
                    className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all cursor-pointer group"
                  >
                    <Layers size={22} className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white text-sm">Bulk Card Generator</div>
                    <p className="text-gray-400 mt-0.5">Batch create 10, 50, 100, 500+ cards</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('create-biz')}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                  >
                    <Building2 size={22} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white text-sm">Create New Business</div>
                    <p className="text-gray-400 mt-0.5">Register brand and assign cards</p>
                  </button>

                  <button
                    onClick={() => downloadAllCardsZip(cards, DEFAULT_BASE_URL, setZipProgress)}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-left transition-all cursor-pointer group"
                  >
                    <Archive size={22} className="text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white text-sm">Export All QRs (ZIP)</div>
                    <p className="text-gray-400 mt-0.5">
                      {zipProgress ? `${zipProgress.current}/${zipProgress.total}` : `Batch export ${cards.length} PNGs`}
                    </p>
                  </button>
                </div>
              </div>

              {/* Architecture Info Box */}
              <div className="p-6 rounded-3xl bg-[#0e1017] border border-white/10 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center shrink-0 text-[#a3e635]">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Fully Scalable Architecture (No Card Limits)
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    You can manufacture and program any number of PVC NFC cards whenever your business expands. Each physical card is assigned a permanent, unchanging URL (e.g. <span className="text-[#a3e635] font-mono">/c/001</span>, <span className="text-[#a3e635] font-mono">/c/051</span>, <span className="text-[#a3e635] font-mono">/c/500</span>). You can create unlimited client businesses, and one business can have multiple NFC cards assigned to it without duplicate profiles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 2: ALL NFC CARDS (UNLIMITED & PAGINATED)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              {/* Header Action & Filter Bar */}
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[#0e1017] p-4 rounded-2xl border border-white/10">
                {/* Search & Status Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
                  <div className="relative w-full sm:w-72">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={cardSearch}
                      onChange={(e) => {
                        setCardSearch(e.target.value)
                        setCardPage(1)
                      }}
                      placeholder="Search by ID or business..."
                      className="w-full bg-[#161822] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#a3e635] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <Filter size={14} className="text-gray-500 shrink-0 ml-1" />
                    {['all', 'available', 'assigned', 'linked'].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setCardFilter(f)
                          setCardPage(1)
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                          cardFilter === f
                            ? 'bg-[#a3e635] text-black font-extrabold'
                            : 'bg-[#161822] text-gray-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Creation Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCreateSingleCard}
                    disabled={creatingSingleCard}
                    className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <PlusCircle size={15} />
                    <span>+ Create Card</span>
                  </button>

                  <button
                    onClick={() => setBulkModalOpen(true)}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Layers size={15} />
                    <span>Bulk Generate</span>
                  </button>

                  <button
                    onClick={() => downloadAllCardsZip(filteredCards, DEFAULT_BASE_URL, setZipProgress)}
                    className="bg-white/10 hover:bg-white/15 text-white font-bold p-2 rounded-xl text-xs border border-white/10 transition-colors"
                    title="Download ZIP for these cards"
                  >
                    <Archive size={15} />
                  </button>

                  <button
                    onClick={() => downloadCSVFile(filteredCards, DEFAULT_BASE_URL)}
                    className="bg-white/10 hover:bg-white/15 text-white font-bold p-2 rounded-xl text-xs border border-white/10 transition-colors"
                    title="Export CSV Manifest"
                  >
                    <FileSpreadsheet size={15} />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#0e1017] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#12141d] border-b border-white/10 text-gray-400 uppercase font-mono text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Card ID</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Chip</th>
                        <th className="py-3.5 px-4">Linked Business</th>
                        <th className="py-3.5 px-4">Permanent URL (NTAG213)</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedCards.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No cards matching your search or filter.
                          </td>
                        </tr>
                      ) : (
                        paginatedCards.map((c) => {
                          const isAssigned = Boolean(c.business_id)
                          return (
                            <tr key={c.card_id} className="hover:bg-white/[0.02] transition-colors">
                              {/* Card ID */}
                              <td className="py-3.5 px-4 font-mono font-black text-white">
                                #{c.card_id}
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    c.status === 'available' || !isAssigned
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : c.status === 'linked'
                                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                                      : 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/30'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      c.status === 'available' || !isAssigned
                                        ? 'bg-emerald-400'
                                        : c.status === 'linked'
                                        ? 'bg-indigo-400'
                                        : 'bg-[#a3e635]'
                                    }`}
                                  />
                                  {c.status || (isAssigned ? 'Assigned' : 'Available')}
                                </span>
                              </td>

                              {/* Chip */}
                              <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                                NTAG213
                              </td>

                              {/* Linked Business */}
                              <td className="py-3.5 px-4">
                                {isAssigned ? (
                                  <div>
                                    <div className="font-bold text-white text-xs">
                                      {c.business_name || 'Business'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono">
                                      {c.business_id}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic text-[11px]">
                                    Unassigned / Ready
                                  </span>
                                )}
                              </td>

                              {/* Permanent URL */}
                              <td className="py-3.5 px-4 font-mono text-[11px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-300 truncate max-w-[180px] sm:max-w-[240px]">
                                    {c.permanent_url}
                                  </span>
                                  <button
                                    onClick={() => handleCopyUrl(c.permanent_url, c.card_id)}
                                    className="text-gray-500 hover:text-[#a3e635] transition-colors cursor-pointer shrink-0"
                                    title="Copy URL"
                                  >
                                    {copiedUrl === c.card_id ? (
                                      <CheckCircle2 size={13} className="text-[#a3e635]" />
                                    ) : (
                                      <Copy size={13} />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* QR Modal */}
                                  <button
                                    onClick={() => handleShowQrModal(c)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
                                    title="View QR Code"
                                  >
                                    <QrCode size={14} />
                                  </button>

                                  {/* Download PNG */}
                                  <button
                                    onClick={() => downloadSingleQRPNG(c.permanent_url, c.card_id)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
                                    title="Download High-Res PNG QR"
                                  >
                                    <Download size={14} />
                                  </button>

                                  {/* Open Public Page */}
                                  <Link
                                    to={`/c/${c.card_id}`}
                                    target="_blank"
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                                    title="Open Public Card"
                                  >
                                    <ExternalLink size={14} />
                                  </Link>

                                  {/* Setup / Unlink / Delete */}
                                  {isAssigned ? (
                                    <button
                                      onClick={() => handleUnlink(c.card_id)}
                                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                      title="Unlink Card"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  ) : (
                                    <>
                                      <Link
                                        to={`/setup/${c.card_id}`}
                                        className="px-2 py-1 rounded-lg bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold text-[10px] uppercase tracking-wider transition-all"
                                      >
                                        Setup
                                      </Link>
                                      <button
                                        onClick={() => handleDeleteCard(c.card_id)}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                                        title="Delete Card Record"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── PAGINATION CONTROLS ── */}
                <div className="p-4 bg-[#12141d] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span>
                      Showing{' '}
                      <span className="font-bold text-white font-mono">
                        {totalFilteredCards === 0 ? 0 : (cardPage - 1) * cardPageSize + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-bold text-white font-mono">
                        {Math.min(cardPage * cardPageSize, totalFilteredCards)}
                      </span>{' '}
                      of{' '}
                      <span className="font-bold text-white font-mono">
                        {totalFilteredCards}
                      </span>{' '}
                      cards
                    </span>

                    <span className="text-gray-600">•</span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px]">Per page:</span>
                      <select
                        value={cardPageSize}
                        onChange={(e) => {
                          setCardPageSize(Number(e.target.value))
                          setCardPage(1)
                        }}
                        className="bg-[#1b1e2c] border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-[11px] outline-none"
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={250}>250</option>
                      </select>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCardPage(1)}
                      disabled={cardPage <= 1}
                      className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="First Page"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCardPage((p) => Math.max(1, p - 1))}
                      disabled={cardPage <= 1}
                      className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span className="px-3 py-1 font-mono text-xs text-white font-bold bg-white/5 rounded-lg border border-white/10">
                      Page {cardPage} of {totalCardPages}
                    </span>

                    <button
                      onClick={() => setCardPage((p) => Math.min(totalCardPages, p + 1))}
                      disabled={cardPage >= totalCardPages}
                      className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => setCardPage(totalCardPages)}
                      disabled={cardPage >= totalCardPages}
                      className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Last Page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 3: ALL BUSINESSES (UNLIMITED & PAGINATED)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'businesses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={bizSearch}
                    onChange={(e) => {
                      setBizSearch(e.target.value)
                      setBizPage(1)
                    }}
                    placeholder="Search businesses..."
                    className="w-full bg-[#161822] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#a3e635] outline-none"
                  />
                </div>

                <button
                  onClick={() => setActiveTab('create-biz')}
                  className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                >
                  <PlusCircle size={15} />
                  <span>Create New Business</span>
                </button>
              </div>

              {filteredBusinesses.length === 0 ? (
                <div className="p-12 text-center bg-[#0e1017] rounded-3xl border border-white/10">
                  <Building2 size={36} className="mx-auto text-gray-600 mb-3" />
                  <h3 className="text-base font-bold text-white">No Businesses Found</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Create a new business client to start linking NFC cards.
                  </p>
                  <button
                    onClick={() => setActiveTab('create-biz')}
                    className="mt-4 bg-[#a3e635] text-black font-extrabold px-5 py-2.5 rounded-xl text-xs cursor-pointer inline-block"
                  >
                    Create Business Now
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedBusinesses.map((b) => (
                      <div
                        key={b.id}
                        className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all"
                      >
                        <div>
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-[#161822] border border-white/10 overflow-hidden flex items-center justify-center font-bold text-lg text-white">
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
                                <h3 className="text-base font-bold text-white leading-tight">
                                  {b.name}
                                </h3>
                                <span className="text-[10px] font-mono text-[#a3e635] bg-[#a3e635]/10 px-2 py-0.5 rounded border border-[#a3e635]/20 mt-1 inline-block">
                                  {b.category || 'General'}
                                </span>
                              </div>
                            </div>

                            <Link
                              to={`/p/${b.id}`}
                              target="_blank"
                              className="text-gray-400 hover:text-white p-1.5 rounded-lg border border-white/10 transition-colors"
                              title="View Landing Page"
                            >
                              <ExternalLink size={14} />
                            </Link>
                          </div>

                          {/* Linked Cards Chips */}
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <div className="text-[11px] font-semibold text-gray-400 mb-2 flex items-center justify-between">
                              <span>Linked NFC Cards:</span>
                              <span className="font-mono text-white font-bold">
                                {b.linkedCards?.length || 0} Card{b.linkedCards?.length === 1 ? '' : 's'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                              {b.linkedCards && b.linkedCards.length > 0 ? (
                                b.linkedCards.map((cid) => (
                                  <Link
                                    key={cid}
                                    to={`/c/${cid}`}
                                    target="_blank"
                                    className="font-mono text-[10px] font-bold bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#bef264] px-2 py-0.5 rounded-lg hover:bg-[#a3e635] hover:text-black transition-colors"
                                  >
                                    #{cid}
                                  </Link>
                                ))
                              ) : (
                                <span className="text-gray-500 text-[11px] italic">
                                  No cards linked yet
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Owner Access info */}
                          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Owner Access:</span>
                              <span className={b.owner_access_enabled ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                                {b.owner_access_enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            {b.owner_phone && (
                              <div className="flex justify-between">
                                <span>Owner Mobile:</span>
                                <span className="font-mono text-gray-300">{b.owner_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setEditBizModal({ ...b })}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-2 px-3 rounded-xl text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() =>
                              setPinModal({
                                businessId: b.id,
                                businessName: b.name,
                                newPin: b.owner_pin || '',
                                newPhone: b.owner_phone || '',
                              })
                            }
                            className="bg-white/5 hover:bg-white/10 text-gray-300 p-2 rounded-xl border border-white/10 transition-colors cursor-pointer"
                            title="Reset Owner PIN"
                          >
                            <Key size={14} className="text-amber-400" />
                          </button>

                          <button
                            onClick={() => handleDeleteBusiness(b.id, b.name)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-xl border border-rose-500/20 transition-colors cursor-pointer"
                            title="Delete Business"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Businesses Pagination */}
                  {totalBizPages > 1 && (
                    <div className="flex items-center justify-between p-4 bg-[#0e1017] rounded-2xl border border-white/10 text-xs">
                      <span className="text-gray-400 font-mono">
                        Page {bizPage} of {totalBizPages} ({filteredBusinesses.length} total)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBizPage((p) => Math.max(1, p - 1))}
                          disabled={bizPage <= 1}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 disabled:opacity-30"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setBizPage((p) => Math.min(totalBizPages, p + 1))}
                          disabled={bizPage >= totalBizPages}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 disabled:opacity-30"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 4: CREATE NEW BUSINESS
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'create-biz' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#a3e635] bg-[#a3e635]/10 px-2.5 py-1 rounded-md border border-[#a3e635]/20 font-bold">
                    Brand Creation
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">
                    Create New Business Profile
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Configure business details and attach an available NFC card.
                  </p>
                </div>

                <form onSubmit={handleCreateBusinessSubmit} className="space-y-6 text-xs">
                  {/* Step 1: Category */}
                  <div>
                    <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                      Step 1: Select Business Category *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCreateCategory(cat)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            createCategory === cat
                              ? 'bg-[#a3e635]/15 border-[#a3e635] text-white font-bold'
                              : 'bg-[#161822] border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Details */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <label className="font-semibold text-gray-300 uppercase tracking-wider block">
                      Step 2: Business Information
                    </label>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="e.g. Luxe Coiffure & Spa"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">
                        Logo Image URL
                      </label>
                      <input
                        type="url"
                        value={createLogo}
                        onChange={(e) => setCreateLogo(e.target.value)}
                        placeholder="https://example.com/logo.jpg"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">
                        Google Review URL
                      </label>
                      <input
                        type="url"
                        value={createReviewUrl}
                        onChange={(e) => setCreateReviewUrl(e.target.value)}
                        placeholder="https://g.page/r/your-review"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={createWhatsApp}
                        onChange={(e) => setCreateWhatsApp(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={createInstagram}
                        onChange={(e) => setCreateInstagram(e.target.value)}
                        placeholder="https://instagram.com/yourbusiness"
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">
                        Welcome Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={createWelcome}
                        onChange={(e) => setCreateWelcome(e.target.value)}
                        placeholder="Bespoke luxury experiences."
                        className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                      />
                    </div>
                  </div>

                  {/* Step 3: Initial Card Selection */}
                  <div className="pt-4 border-t border-white/10">
                    <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                      Step 3: Initial NFC Card Assignment (Optional)
                    </label>
                    <select
                      value={createCardId}
                      onChange={(e) => setCreateCardId(e.target.value)}
                      className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                    >
                      <option value="">-- Assign card later --</option>
                      {availableCards.map((c) => (
                        <option key={c.card_id} value={c.card_id}>
                          Card #{c.card_id} (Available)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 4: Owner Access */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <label className="font-semibold text-gray-300 uppercase tracking-wider block">
                      Step 4: Owner Access Setup
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setCreateOwnerAccess('A')}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          createOwnerAccess === 'A'
                            ? 'bg-[#a3e635]/10 border-[#a3e635] text-white'
                            : 'bg-[#161822] border-white/10 text-gray-400'
                        }`}
                      >
                        <div className="font-bold text-white text-xs">OPTION A: Owner Access</div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Mobile Number + PIN login</p>
                      </label>

                      <label
                        onClick={() => setCreateOwnerAccess('B')}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          createOwnerAccess === 'B'
                            ? 'bg-[#a3e635]/10 border-[#a3e635] text-white'
                            : 'bg-[#161822] border-white/10 text-gray-400'
                        }`}
                      >
                        <div className="font-bold text-white text-xs">OPTION B: Skip Access</div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Admin-only control</p>
                      </label>
                    </div>

                    {createOwnerAccess === 'A' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-[11px] text-gray-400 block mb-1">
                            Owner Mobile Number *
                          </label>
                          <input
                            type="tel"
                            value={createOwnerPhone}
                            onChange={(e) => setCreateOwnerPhone(e.target.value)}
                            placeholder="+919876543210"
                            className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#a3e635] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-400 block mb-1">
                            Owner PIN (4 to 6 digits) *
                          </label>
                          <input
                            type="password"
                            maxLength={6}
                            value={createOwnerPin}
                            onChange={(e) => setCreateOwnerPin(e.target.value)}
                            placeholder="e.g. 1234"
                            className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#a3e635] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button
                      type="submit"
                      disabled={createSaving}
                      className="bg-[#a3e635] hover:bg-[#bef264] text-black font-black py-3 px-8 rounded-2xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {createSaving ? (
                        <span>Creating...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Save &amp; Create Business</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 5: LINK EXISTING BUSINESS
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'link-biz' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 font-bold">
                  Multi-Card Assignment
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  Link Card to Existing Business
                </h3>
                <p className="text-xs text-gray-400 mt-1 mb-6 leading-relaxed">
                  Attach newly created or available cards to any existing client business. Every card linked to the same business will open the identical landing page.
                </p>

                <form onSubmit={handleLinkCardSubmit} className="space-y-5 text-xs">
                  <div>
                    <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                      1. Select Available NFC Card *
                    </label>
                    <select
                      value={selectedLinkCard}
                      onChange={(e) => setSelectedLinkCard(e.target.value)}
                      className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-400 outline-none"
                    >
                      <option value="">-- Choose unassigned card --</option>
                      {availableCards.map((c) => (
                        <option key={c.card_id} value={c.card_id}>
                          Card #{c.card_id} (URL: /c/{c.card_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                      2. Select Target Business *
                    </label>
                    <select
                      value={selectedLinkBiz}
                      onChange={(e) => setSelectedLinkBiz(e.target.value)}
                      className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-400 outline-none"
                    >
                      <option value="">-- Choose target business --</option>
                      {businesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.category}) — {b.cardCount || 0} card{b.cardCount === 1 ? '' : 's'} linked
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={linkSaving || !selectedLinkCard || !selectedLinkBiz}
                      className="bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold py-3 px-6 rounded-2xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {linkSaving ? (
                        <span>Linking...</span>
                      ) : (
                        <>
                          <Link2 size={16} />
                          <span>Link Card to Business</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 6: QR CODE MANAGEMENT & QR HUB
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'qr-hub' && (
            <div className="space-y-8">
              {/* Export Suite */}
              <div className="p-6 rounded-3xl bg-[#0e1017] border border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Physical Card Manufacturing &amp; QR Export
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Download individual high-res PNGs or batch export QR codes and programming CSV for PVC card production.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => downloadAllCardsZip(cards, DEFAULT_BASE_URL, setZipProgress)}
                      className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Archive size={15} />
                      <span>
                        {zipProgress
                          ? `Packaging (${zipProgress.current}/${zipProgress.total})...`
                          : `Download All ${cards.length} QRs (ZIP)`}
                      </span>
                    </button>

                    <button
                      onClick={() => downloadCSVFile(cards, DEFAULT_BASE_URL)}
                      className="bg-white/10 hover:bg-white/15 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer border border-white/10"
                    >
                      <FileSpreadsheet size={15} />
                      <span>Export Manifest CSV</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/10">
                    <span className="text-gray-400">Total Cards in System:</span>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      {cards.length} Cards
                    </div>
                    <span className="text-[10px] text-gray-500">Fully expandable</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/10">
                    <span className="text-gray-400">NFC Chip Target:</span>
                    <div className="text-2xl font-black text-[#a3e635] font-mono mt-1">NTAG213</div>
                    <span className="text-[10px] text-gray-500">144 Bytes standard PVC tag</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/10">
                    <span className="text-gray-400">QR Resolution:</span>
                    <div className="text-2xl font-black text-indigo-400 font-mono mt-1">640 &times; 740 px</div>
                    <span className="text-[10px] text-gray-500">High-Res PNG with bottom metadata label</span>
                  </div>
                </div>
              </div>

              {/* QR Hub Integration Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1017] border border-white/10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 font-bold">
                        Dynamic QR Integration
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      QR Hub API Integration &amp; Dynamic QR Sync
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      QR Hub allows remote redirection syncing for physical dynamic QR codes. If you have an active QR Hub plan and API key, enter your credentials below. The platform maintains permanent URLs (<span className="font-mono text-[#a3e635]">/c/:cardId</span>) so that physical PVC cards remain 100% functional even if external API connectivity changes.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#141620] border border-white/10 space-y-3 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#a3e635]" />
                    <span>Current Architecture Status</span>
                  </h4>
                  <ul className="space-y-1.5 text-gray-400 list-disc list-inside">
                    <li>All cards are mapped to permanent URLs: <code className="text-white">https://nfc-sage.vercel.app/c/:cardId</code></li>
                    <li>NFC chips and QR codes use the exact same permanent URL structure.</li>
                    <li>Card assignments change dynamically in your database without altering physical QR codes or chips.</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-gray-300 block mb-1">
                      QR Hub API Key
                    </label>
                    <input
                      type="password"
                      value={qrhubApiKey}
                      onChange={(e) => setQrhubApiKey(e.target.value)}
                      placeholder="Enter your QR Hub secret API key"
                      className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-300 block mb-1">
                      QR Hub Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={qrhubApiUrl}
                      onChange={(e) => setQrhubApiUrl(e.target.value)}
                      placeholder="https://api.qrhub.com/v1"
                      className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-400 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-gray-500">
                    Stored securely in your local environment. Never exposed to public visitors.
                  </span>
                  <button
                    onClick={() => {
                      localStorage.setItem('qrhub_api_key', qrhubApiKey.trim())
                      localStorage.setItem('qrhub_api_url', qrhubApiUrl.trim())
                      setQrhubSaved(true)
                      setTimeout(() => setQrhubSaved(false), 3000)
                    }}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>{qrhubSaved ? 'Saved!' : 'Save Credentials'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL: BULK CREATE CARDS (Any quantity: 10, 50, 100, 500...) ── */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <h3 className="text-base font-bold text-white">Bulk Card Generator</h3>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleBulkCreateCards} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-300 block mb-1.5 uppercase tracking-wider text-[11px]">
                  Quantity to Generate *
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(e.target.value)}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-indigo-400 outline-none"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1.5">
                  Quick Presets:
                </span>
                <div className="flex gap-2">
                  {[10, 50, 100, 250, 500].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setBulkQuantity(q)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                        Number(bulkQuantity) === q
                          ? 'bg-indigo-500 text-white border-indigo-400 font-bold'
                          : 'bg-[#161822] text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      +{q}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Range Preview */}
              <div className="p-3.5 rounded-2xl bg-[#141620] border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Starting Card ID:</span>
                  <span className="font-mono text-[#a3e635] font-bold">#{nextId}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Ending Card ID:</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    #{formatCardId(parseInt(nextId, 10) + Math.max(1, parseInt(bulkQuantity, 10) || 1) - 1)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-white/5">
                  <span className="text-gray-400">Target Chip:</span>
                  <span className="font-mono text-gray-300">NTAG213 (144B)</span>
                </div>
              </div>

              {/* Progress bar during generation */}
              {bulkCreating && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Generating Cards...</span>
                    <span className="font-mono font-bold text-[#a3e635]">{bulkProgress}%</span>
                  </div>
                  <div className="w-full bg-[#161822] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#a3e635] h-full transition-all duration-200"
                      style={{ width: `${bulkProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  disabled={bulkCreating}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkCreating}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {bulkCreating ? (
                    <span>Generating {bulkQuantity} Cards...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Generate {bulkQuantity} Cards</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT BUSINESS DETAILS (STRICT: Name, Logo, Review, WhatsApp, Instagram, Toggles ONLY) ── */}
      {editBizModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-black text-white">Edit Business Details</h3>
              <button
                onClick={() => setEditBizModal(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditedBusiness} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={editBizModal.name || ''}
                  onChange={(e) => setEditBizModal({ ...editBizModal, name: e.target.value })}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#a3e635] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Category
                </label>
                <select
                  value={editBizModal.category || 'Other'}
                  onChange={(e) => setEditBizModal({ ...editBizModal, category: e.target.value })}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#a3e635] outline-none"
                >
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={editBizModal.logo_url || ''}
                  onChange={(e) => setEditBizModal({ ...editBizModal, logo_url: e.target.value })}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#a3e635] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Welcome Subtitle
                </label>
                <input
                  type="text"
                  value={editBizModal.welcome_message || ''}
                  onChange={(e) => setEditBizModal({ ...editBizModal, welcome_message: e.target.value })}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#a3e635] outline-none"
                />
              </div>

              {/* 3 Buttons with Toggles */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <span className="text-[11px] font-mono uppercase text-[#a3e635] font-bold block">
                  Customer Social Buttons
                </span>

                <div className="p-3 rounded-xl bg-[#141620] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">1. Google Review URL</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                      <span>Enabled</span>
                      <input
                        type="checkbox"
                        checked={editBizModal.google_review_enabled !== false}
                        onChange={(e) => setEditBizModal({ ...editBizModal, google_review_enabled: e.target.checked })}
                        className="accent-[#a3e635]"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={editBizModal.google_review_url || ''}
                    onChange={(e) => setEditBizModal({ ...editBizModal, google_review_url: e.target.value })}
                    className="w-full bg-[#1b1e2c] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#141620] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">2. WhatsApp Number</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                      <span>Enabled</span>
                      <input
                        type="checkbox"
                        checked={editBizModal.whatsapp_enabled !== false}
                        onChange={(e) => setEditBizModal({ ...editBizModal, whatsapp_enabled: e.target.checked })}
                        className="accent-[#a3e635]"
                      />
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={editBizModal.whatsapp_number || ''}
                    onChange={(e) => setEditBizModal({ ...editBizModal, whatsapp_number: e.target.value })}
                    className="w-full bg-[#1b1e2c] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#141620] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">3. Instagram Profile URL</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                      <span>Enabled</span>
                      <input
                        type="checkbox"
                        checked={editBizModal.instagram_enabled !== false}
                        onChange={(e) => setEditBizModal({ ...editBizModal, instagram_enabled: e.target.checked })}
                        className="accent-[#a3e635]"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={editBizModal.instagram_url || ''}
                    onChange={(e) => setEditBizModal({ ...editBizModal, instagram_url: e.target.value })}
                    className="w-full bg-[#1b1e2c] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditBizModal(null)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold px-6 py-2 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RESET OWNER PIN ── */}
      {pinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e1017] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Reset Owner PIN</h3>
              <button onClick={() => setPinModal(null)} className="text-gray-400 hover:text-white">&times;</button>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Assign or reset login credentials for <span className="text-white font-bold">{pinModal.businessName}</span>.
            </p>

            <form onSubmit={handleSavePin} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 block mb-1">Owner Mobile Number</label>
                <input
                  type="tel"
                  value={pinModal.newPhone}
                  onChange={(e) => setPinModal({ ...pinModal, newPhone: e.target.value })}
                  placeholder="+919876543210"
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">New PIN (4-6 digits)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinModal.newPin}
                  onChange={(e) => setPinModal({ ...pinModal, newPin: e.target.value })}
                  placeholder="Enter new PIN"
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3 py-2 text-white tracking-widest font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPinModal(null)}
                  className="px-3 py-1.5 text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-4 py-1.5 rounded-xl"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: QR CODE ZOOM ── */}
      {qrModalCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e1017] border border-white/10 rounded-3xl p-6 shadow-2xl text-center">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-mono font-bold text-white">NFC Card #{qrModalCard.card_id}</h3>
              <button onClick={() => setQrModalCard(null)} className="text-gray-400 hover:text-white">&times;</button>
            </div>

            {qrModalDataUrl && (
              <div className="p-4 bg-white rounded-2xl inline-block my-2 shadow-inner">
                <img src={qrModalDataUrl} alt="QR" className="w-56 h-56 mx-auto object-contain" />
              </div>
            )}

            <p className="font-mono text-[11px] text-[#a3e635] mt-2 truncate">
              {qrModalCard.permanent_url}
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
              <button
                onClick={() => downloadSingleQRPNG(qrModalCard.permanent_url, qrModalCard.card_id)}
                className="flex-1 bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => setQrModalCard(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
