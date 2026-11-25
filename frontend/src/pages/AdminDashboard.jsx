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
  Radio,
  Check,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Wifi,
  Share2,
  Sliders,
  Send,
  MessageCircle,
  Database,
} from 'lucide-react'
import {
  getAllCards,
  getAllBusinesses,
  createCard,
  createSingleQrCard,
  bulkCreateCards,
  bulkCreateSingleQrCards,
  updateSingleQrCard,
  deleteCardRecord,
  getNextCardId,
  updateCardNfcStatus,
  createBusiness,
  updateBusiness,
  linkCardToBusiness,
  unlinkCard,
  deleteBusiness,
  resetOwnerPin,
  formatCardId,
  formatWhatsAppChatUrl,
  formatInstagramUrl,
  formatGoogleReviewUrl,
  syncAllToSupabase,
  QR_CARD_TYPES,
  BUSINESS_CATEGORIES,
  DEFAULT_BASE_URL,
} from '../lib/businessStore.js'
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
} from '../lib/supabase.js'
import {
  generateQRDataURL,
  generateQRSVG,
  downloadSingleQRPNG,
  downloadSingleQRSVG,
  downloadAllCardsZip,
  downloadCSVFile,
} from '../lib/qrHelper.js'

function GoogleBrandIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
}

function WhatsAppBrandIcon({ className = "w-4 h-4 text-emerald-400" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

function InstagramBrandIcon({ className = "w-4 h-4 text-pink-500" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  // Navigation tab: 'overview' | 'cards' | 'nfc-programming' | 'businesses' | 'create-biz' | 'link-biz' | 'qr-hub'
  const [activeTab, setActiveTab] = useState('overview')

  // Data
  const [cards, setCards] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedUrl, setCopiedUrl] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  // Card Pagination & Filter (All NFC Cards tab)
  const [cardSearch, setCardSearch] = useState('')
  const [cardFilter, setCardFilter] = useState('all') // 'all' | 'available' | 'assigned' | 'linked'
  const [cardPage, setCardPage] = useState(1)
  const [cardPageSize, setCardPageSize] = useState(25)

  // NFC Programming State
  const [selectedNfcCardId, setSelectedNfcCardId] = useState('')
  const [nfcProgSearch, setNfcProgSearch] = useState('')
  const [nfcProgFilter, setNfcProgFilter] = useState('all') // 'all' | 'not_programmed' | 'programmed' | 'tested'
  const [nfcProgPage, setNfcProgPage] = useState(1)
  const nfcProgPageSize = 25

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

  // ── NEW: Single & 3-in-1 QR Creation Modal State (Requirements 1 & 2) ──
  const [createQrModalOpen, setCreateQrModalOpen] = useState(false)
  const [qrModalTab, setQrModalTab] = useState('google_review') // '3in1' | 'google_review' | 'instagram' | 'whatsapp'
  const [qrModalMode, setQrModalMode] = useState('single') // 'single' | 'bulk'
  const [qrModalBizName, setQrModalBizName] = useState('')
  const [qrModalDestUrl, setQrModalDestUrl] = useState('')
  const [qrModalWhatsApp, setQrModalWhatsApp] = useState('')
  const [qrModalWaMsg, setQrModalWaMsg] = useState('')
  const [qrModalCustomId, setQrModalCustomId] = useState('')
  const [qrModalBulkQty, setQrModalBulkQty] = useState(10)
  const [qrModalSaving, setQrModalSaving] = useState(false)
  const [createdCardResult, setCreatedCardResult] = useState(null)

  // ── NEW: Edit Destination Modal State (Requirement 4) ──
  const [editDestModalCard, setEditDestModalCard] = useState(null)
  const [editDestType, setEditDestType] = useState('google_review')
  const [editDestBizName, setEditDestBizName] = useState('')
  const [editDestUrl, setEditDestUrl] = useState('')
  const [editDestWhatsApp, setEditDestWhatsApp] = useState('')
  const [editDestWaMsg, setEditDestWaMsg] = useState('')
  const [editDestStatus, setEditDestStatus] = useState('active')
  const [editDestSaving, setEditDestSaving] = useState(false)

  // ── NEW: QR Type Filters ──
  const [cardQrTypeFilter, setCardQrTypeFilter] = useState('all') // 'all' | '3in1' | 'google_review' | 'instagram' | 'whatsapp'
  const [qrHubTypeFilter, setQrHubTypeFilter] = useState('all')

  // ── NEW: Bulk ZIP Options Modal ──
  const [zipModalOpen, setZipModalOpen] = useState(false)

  // ── Cloud Database / Supabase Sync Modal State ──
  const [dbModalOpen, setDbModalOpen] = useState(false)
  const [dbUrl, setDbUrl] = useState('')
  const [dbKey, setDbKey] = useState('')
  const [dbTesting, setDbTesting] = useState(false)
  const [dbSyncing, setDbSyncing] = useState(false)
  const [dbStatusMsg, setDbStatusMsg] = useState(null)
  const [hasSupaCreds, setHasSupaCreds] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

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

      const creds = getSupabaseCredentials()
      setHasSupaCreds(Boolean(creds.url && creds.anonKey))
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDbModal = () => {
    const creds = getSupabaseCredentials()
    setDbUrl(creds.url)
    setDbKey(creds.anonKey)
    setDbStatusMsg(null)
    setDbModalOpen(true)
  }

  const handleTestAndSaveDb = async (e) => {
    e.preventDefault()
    setDbTesting(true)
    setDbStatusMsg(null)
    try {
      const res = await testSupabaseConnection(dbUrl, dbKey)
      if (res.ok) {
        saveSupabaseCredentials(dbUrl, dbKey)
        setHasSupaCreds(true)
        setDbStatusMsg({ ok: true, text: 'Supabase connected! Syncing local cards to cloud...' })
        const syncRes = await syncAllToSupabase()
        setDbStatusMsg({
          ok: true,
          text: `Connected! ${syncRes.cardsSynced} cards and ${syncRes.bizSynced} businesses synced to Supabase cloud.`,
        })
        await reloadData()
        showToast('Supabase Cloud Database connected and synced!')
      } else {
        setDbStatusMsg({ ok: false, text: res.message })
      }
    } catch (err) {
      setDbStatusMsg({ ok: false, text: err.message })
    } finally {
      setDbTesting(false)
    }
  }

  const handleDisconnectDb = () => {
    if (window.confirm('Disconnect Supabase? Local IndexedDB data will remain intact.')) {
      saveSupabaseCredentials('', '')
      setHasSupaCreds(false)
      setDbUrl('')
      setDbKey('')
      setDbStatusMsg(null)
      showToast('Supabase disconnected. Using local database.')
    }
  }

  const handleManualSyncNow = async () => {
    setDbSyncing(true)
    try {
      const syncRes = await syncAllToSupabase()
      showToast(`Cloud Sync Complete: ${syncRes.cardsSynced} cards synced to Supabase!`)
      setDbStatusMsg({
        ok: true,
        text: `Synced ${syncRes.cardsSynced} cards and ${syncRes.bizSynced} businesses to Supabase successfully.`,
      })
    } catch (err) {
      alert(`Sync failed: ${err.message}`)
    } finally {
      setDbSyncing(false)
    }
  }

  const handleCopySqlSchema = () => {
    const sql = `-- Supabase Schema for NFC Cards
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Business',
  category TEXT DEFAULT 'Other',
  logo_url TEXT DEFAULT '',
  welcome_message TEXT DEFAULT 'Welcome! Tap a button to connect with us.',
  footer_brand TEXT DEFAULT 'OMDROPZ',
  google_review_enabled BOOLEAN DEFAULT true,
  google_review_url TEXT DEFAULT '',
  google_review_text TEXT DEFAULT 'Google Review',
  whatsapp_enabled BOOLEAN DEFAULT true,
  whatsapp_number TEXT DEFAULT '',
  whatsapp_message TEXT DEFAULT 'Hello! I found your NFC card.',
  whatsapp_text TEXT DEFAULT 'Chat on WhatsApp',
  instagram_enabled BOOLEAN DEFAULT true,
  instagram_url TEXT DEFAULT '',
  instagram_text TEXT DEFAULT 'Follow on Instagram',
  owner_phone TEXT DEFAULT '',
  owner_pin TEXT DEFAULT '',
  owner_access_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nfc_cards (
  card_id TEXT PRIMARY KEY,
  card_number TEXT NOT NULL,
  card_type TEXT NOT NULL DEFAULT '3in1',
  status TEXT NOT NULL DEFAULT 'available',
  nfc_status TEXT NOT NULL DEFAULT 'not_programmed',
  business_id TEXT REFERENCES businesses(id) ON DELETE SET NULL,
  business_name TEXT,
  destination_url TEXT,
  whatsapp_number TEXT,
  whatsapp_message TEXT,
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  permanent_url TEXT NOT NULL,
  nfc_url TEXT NOT NULL,
  qrhub_qr_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Public read nfc_cards" ON nfc_cards FOR SELECT USING (true);
CREATE POLICY "Public write nfc_cards" ON nfc_cards FOR ALL USING (true);
CREATE POLICY "Public write businesses" ON businesses FOR ALL USING (true);`

    navigator.clipboard.writeText(sql)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 3000)
    showToast('SQL Schema copied to clipboard!')
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

  // Overview Metrics (Never hardcoded!)
  const metrics = useMemo(() => {
    const totalCards = cards.length
    const availableCards = cards.filter((c) => c.status === 'available' || (!c.business_id && !c.destination_url)).length
    const assignedCards = cards.filter((c) => c.status === 'assigned' || c.status === 'linked' || c.status === 'active' || !!c.destination_url).length
    const totalBusinesses = businesses.length
    const linkedCards = cards.filter((c) => c.status === 'linked').length

    // QR Type Breakdown (Requirement 1 & 4)
    const total3in1 = cards.filter((c) => (c.card_type || '3in1') === '3in1').length
    const totalGoogleReview = cards.filter((c) => c.card_type === 'google_review').length
    const totalInstagram = cards.filter((c) => c.card_type === 'instagram').length
    const totalWhatsApp = cards.filter((c) => c.card_type === 'whatsapp').length
    const totalSingleQr = totalGoogleReview + totalInstagram + totalWhatsApp

    // NFC Programming Metrics
    const notProgrammed = cards.filter((c) => !c.nfc_status || c.nfc_status === 'not_programmed').length
    const programmed = cards.filter((c) => c.nfc_status === 'programmed').length
    const tested = cards.filter((c) => c.nfc_status === 'tested').length
    const completionPercent = totalCards > 0 ? Math.round(((programmed + tested) / totalCards) * 100) : 0

    return {
      totalCards,
      availableCards,
      assignedCards,
      totalBusinesses,
      linkedCards,
      total3in1,
      totalGoogleReview,
      totalInstagram,
      totalWhatsApp,
      totalSingleQr,
      notProgrammed,
      programmed,
      tested,
      completionPercent,
    }
  }, [cards, businesses])

  // Filtered Cards for "All NFC Cards" tab
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const q = cardSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        String(c.card_id).toLowerCase().includes(q) ||
        (c.business_name && c.business_name.toLowerCase().includes(q)) ||
        (c.destination_url && c.destination_url.toLowerCase().includes(q)) ||
        (c.permanent_url && c.permanent_url.toLowerCase().includes(q)) ||
        (c.whatsapp_number && c.whatsapp_number.toLowerCase().includes(q)) ||
        (c.business_id && String(c.business_id).toLowerCase().includes(q))

      if (!matchesSearch) return false

      // Filter by QR type
      if (cardQrTypeFilter && cardQrTypeFilter !== 'all') {
        const ct = c.card_type || '3in1'
        if (ct !== cardQrTypeFilter) return false
      }

      if (cardFilter === 'available') return c.status === 'available' || (!c.business_id && !c.destination_url)
      if (cardFilter === 'assigned') return c.status === 'assigned'
      if (cardFilter === 'linked') return c.status === 'linked'
      if (cardFilter === 'active') return c.status === 'active' || !!c.destination_url
      return true
    })
  }, [cards, cardSearch, cardFilter, cardQrTypeFilter])

  // Paginated Cards for "All NFC Cards" tab
  const totalFilteredCards = filteredCards.length
  const totalCardPages = Math.max(1, Math.ceil(totalFilteredCards / cardPageSize))
  const paginatedCards = useMemo(() => {
    const safePage = Math.min(cardPage, totalCardPages)
    const start = (safePage - 1) * cardPageSize
    return filteredCards.slice(start, start + cardPageSize)
  }, [filteredCards, cardPage, totalCardPages, cardPageSize])

  // Currently selected Card in NFC Programming Workbench
  const currentNfcCard = useMemo(() => {
    if (selectedNfcCardId) {
      const found = cards.find((c) => c.card_id === selectedNfcCardId)
      if (found) return found
    }
    const firstUnprog = cards.find((c) => !c.nfc_status || c.nfc_status === 'not_programmed')
    return firstUnprog || cards[0] || null
  }, [cards, selectedNfcCardId])

  // Filtered Cards for NFC Programming Queue
  const filteredNfcCards = useMemo(() => {
    return cards.filter((c) => {
      const q = nfcProgSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        String(c.card_id).toLowerCase().includes(q) ||
        (c.business_name && c.business_name.toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (nfcProgFilter === 'not_programmed') {
        return !c.nfc_status || c.nfc_status === 'not_programmed'
      }
      if (nfcProgFilter === 'programmed') {
        return c.nfc_status === 'programmed'
      }
      if (nfcProgFilter === 'tested') {
        return c.nfc_status === 'tested'
      }
      return true
    })
  }, [cards, nfcProgSearch, nfcProgFilter])

  const totalNfcProgPages = Math.max(1, Math.ceil(filteredNfcCards.length / nfcProgPageSize))
  const paginatedNfcCards = useMemo(() => {
    const safePage = Math.min(nfcProgPage, totalNfcProgPages)
    const start = (safePage - 1) * nfcProgPageSize
    return filteredNfcCards.slice(start, start + nfcProgPageSize)
  }, [filteredNfcCards, nfcProgPage, totalNfcProgPages, nfcProgPageSize])

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
      showToast(`${newCard.card_id} created successfully!`)
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
      showToast(`Successfully created ${created.length} cards (${created[0].card_id} to ${created[created.length - 1].card_id})!`)
    } catch (err) {
      alert('Error during bulk card creation.')
    } finally {
      setBulkCreating(false)
      setBulkProgress(0)
    }
  }

  // ── ACTION: Create QR Card (Single & Bulk - Requirements 1 & 2) ──
  const handleCreateQrCardSubmit = async (e) => {
    e.preventDefault()
    setQrModalSaving(true)
    try {
      if (qrModalMode === 'bulk') {
        const qty = parseInt(qrModalBulkQty, 10) || 10
        let newCards
        if (qrModalTab === '3in1') {
          newCards = await bulkCreateCards(qty, DEFAULT_BASE_URL)
        } else {
          newCards = await bulkCreateSingleQrCards({
            quantity: qty,
            type: qrModalTab,
            businessName: qrModalBizName,
            destinationUrl: qrModalDestUrl,
            whatsappNumber: qrModalWhatsApp,
            whatsappMessage: qrModalWaMsg,
            baseUrl: DEFAULT_BASE_URL,
          })
        }
        await reloadData()
        showToast(`Successfully generated ${newCards.length} dynamic QR cards!`)
        setCreateQrModalOpen(false)
        resetQrCreateForm()
      } else {
        // Single Card creation
        let newCard
        if (qrModalTab === '3in1') {
          newCard = await createCard(qrModalCustomId || null, DEFAULT_BASE_URL)
        } else {
          newCard = await createSingleQrCard({
            type: qrModalTab,
            businessName: qrModalBizName,
            destinationUrl: qrModalDestUrl,
            whatsappNumber: qrModalWhatsApp,
            whatsappMessage: qrModalWaMsg,
            customCardId: qrModalCustomId || null,
            baseUrl: DEFAULT_BASE_URL,
          })
        }
        await reloadData()
        setCreatedCardResult(newCard)
        showToast(`Card ${newCard.card_id} created successfully!`)
      }
    } catch (err) {
      alert(`Error creating QR card: ${err.message}`)
    } finally {
      setQrModalSaving(false)
    }
  }

  const resetQrCreateForm = () => {
    setQrModalBizName('')
    setQrModalDestUrl('')
    setQrModalWhatsApp('')
    setQrModalWaMsg('')
    setQrModalCustomId('')
    setQrModalBulkQty(10)
    setCreatedCardResult(null)
  }

  // ── ACTION: Open Destination Editor (Requirement 4) ──
  const handleOpenEditDestination = (card) => {
    setEditDestModalCard(card)
    setEditDestType(card.card_type || 'google_review')
    setEditDestBizName(card.business_name || (card.business ? card.business.name : ''))
    setEditDestUrl(card.destination_url || '')
    setEditDestWhatsApp(card.whatsapp_number || '')
    setEditDestWaMsg(card.whatsapp_message || '')
    setEditDestStatus(card.status || 'active')
  }

  // ── ACTION: Save Destination Changes (Requirement 4: URL remains unchanged) ──
  const handleSaveDestinationChanges = async (e) => {
    e.preventDefault()
    if (!editDestModalCard) return
    setEditDestSaving(true)
    try {
      await updateSingleQrCard(editDestModalCard.card_id, {
        card_type: editDestType,
        business_name: editDestBizName,
        destination_url: editDestUrl,
        whatsapp_number: editDestWhatsApp,
        whatsapp_message: editDestWaMsg,
        status: editDestStatus,
      })
      await reloadData()
      showToast(`Destination for Card ${editDestModalCard.card_id} updated! Printed QR code remains 100% functional.`)
      setEditDestModalCard(null)
    } catch (err) {
      alert(`Error updating destination: ${err.message}`)
    } finally {
      setEditDestSaving(false)
    }
  }

  // ── ACTION: Bulk Download with Format Choices (PNG, SVG, Bundle) ──
  const handleDownloadZipWithOptions = async (format = 'bundle') => {
    try {
      setZipProgress({ current: 0, total: cards.length, percent: 1, message: 'Starting export...' })
      await downloadAllCardsZip(
        cards,
        DEFAULT_BASE_URL,
        {
          includePng: format === 'png' || format === 'bundle',
          includeSvg: format === 'svg' || format === 'bundle',
        },
        setZipProgress
      )
      showToast('QR Codes ZIP downloaded successfully!')
      setZipModalOpen(false)
    } catch (err) {
      alert(`Failed to download ZIP: ${err.message}`)
    } finally {
      setZipProgress(null)
    }
  }

  // ── ACTION: Update NFC Programming Status ──
  // Requirement 10: Admin must confirm after physically writing and testing.
  const handleSetNfcStatus = async (cardId, status) => {
    try {
      await updateCardNfcStatus(cardId, status)
      await reloadData()
      const label =
        status === 'tested'
          ? 'Tested & Verified'
          : status === 'programmed'
          ? 'Programmed'
          : 'Not Programmed'
      showToast(`${cardId} marked as ${label}`)
    } catch {
      alert('Error updating NFC programming status.')
    }
  }

  // ── Jump to Next Unprogrammed Card ──
  const handleNextUnprogrammed = () => {
    const unprogCards = cards.filter((c) => !c.nfc_status || c.nfc_status === 'not_programmed')
    const currentIndex = unprogCards.findIndex((c) => c.card_id === currentNfcCard?.card_id)
    if (currentIndex >= 0 && currentIndex < unprogCards.length - 1) {
      setSelectedNfcCardId(unprogCards[currentIndex + 1].card_id)
    } else if (unprogCards.length > 0) {
      setSelectedNfcCardId(unprogCards[0].card_id)
    }
  }

  // ── ACTION: Delete Card Record ──
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm(`Delete ${cardId}? Permanent URL will be deactivated.`)) return
    try {
      await deleteCardRecord(cardId)
      await reloadData()
      showToast(`${cardId} deleted.`)
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
      showToast(`${selectedLinkCard} linked successfully!`)
      setActiveTab('cards')
    } catch (err) {
      alert('Error linking card.')
    } finally {
      setLinkSaving(false)
    }
  }

  // ── ACTION: Unlink Card ──
  const handleUnlink = async (cardId) => {
    if (!window.confirm(`Unlink ${cardId}? It will revert to Available state.`)) return
    try {
      await unlinkCard(cardId)
      await reloadData()
      showToast(`${cardId} unlinked.`)
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
                <p className="text-[10px] font-mono text-gray-400">NFC &amp; QR Control Center</p>
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

            {/* ── NEW: DEDICATED NFC PROGRAMMING SECTION ── */}
            <button
              onClick={() => {
                setActiveTab('nfc-programming')
                setNfcProgPage(1)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'nfc-programming'
                  ? 'bg-[#a3e635] text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio size={17} />
                <span>NFC Programming</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'nfc-programming'
                    ? 'bg-black text-[#a3e635]'
                    : metrics.notProgrammed > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {metrics.notProgrammed > 0 ? `${metrics.notProgrammed} left` : 'All Done'}
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
          <button
            onClick={handleOpenDbModal}
            className="w-full flex items-center justify-between text-xs text-gray-300 hover:text-white px-3 py-2 rounded-xl transition-colors hover:bg-white/5 cursor-pointer"
            title="Configure Supabase Cloud Database"
          >
            <span className="flex items-center gap-2">
              <Database size={14} className={hasSupaCreds ? 'text-emerald-400' : 'text-amber-400'} />
              <span>Database Sync</span>
            </span>
            <span className={`w-2 h-2 rounded-full ${hasSupaCreds ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </button>

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
              CONTROL PANEL
            </span>
            <h2 className="text-sm font-bold capitalize text-white">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenDbModal}
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasSupaCreds
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 font-mono'
              }`}
              title="Cloud Database Settings (Supabase)"
            >
              <Database size={13} className={hasSupaCreds ? 'text-emerald-400' : 'text-amber-400'} />
              <span className="hidden sm:inline">
                {hasSupaCreds ? 'Cloud DB Active' : 'Cloud Sync'}
              </span>
            </button>

            <button
              onClick={handleCreateSingleCard}
              disabled={creatingSingleCard}
              className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              title="Instantly generate next sequential card ID"
            >
              <PlusCircle size={14} />
              <span>{creatingSingleCard ? 'Creating...' : `+ Create ${nextId}`}</span>
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
              TAB 1: OVERVIEW
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                    <span>Total Cards</span>
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
                    <span>NFC Tags Programmed</span>
                    <Radio size={16} className="text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-blue-400 font-mono">
                    {metrics.programmed + metrics.tested}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {metrics.tested} tested &bull; {metrics.notProgrammed} pending
                  </p>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="p-6 rounded-3xl bg-[#0e1017] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Quick Management Actions
                  </h3>
                  <span className="text-xs font-mono text-[#a3e635]">Next ID: {nextId}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('nfc-programming')
                      setNfcProgPage(1)
                    }}
                    className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 text-left transition-all cursor-pointer group"
                  >
                    <Radio size={22} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white text-sm">NFC Programming Workbench</div>
                    <p className="text-gray-400 mt-0.5">
                      {metrics.notProgrammed} tags awaiting NTAG213 write
                    </p>
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
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 2: ALL NFC CARDS (TABLE & INVENTORY)
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              {/* QR Type Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] text-gray-500 font-mono uppercase tracking-wider shrink-0">QR Type:</span>
                {[
                  { id: 'all', label: 'All Types', count: metrics.totalCards },
                  { id: '3in1', label: '3-in-1 Cards', count: metrics.total3in1 },
                  { id: 'google_review', label: 'Google Review', count: metrics.totalGoogleReview, icon: GoogleBrandIcon },
                  { id: 'instagram', label: 'Instagram', count: metrics.totalInstagram, icon: InstagramBrandIcon },
                  { id: 'whatsapp', label: 'WhatsApp', count: metrics.totalWhatsApp, icon: WhatsAppBrandIcon },
                ].map((t) => {
                  const Icon = t.icon
                  const active = cardQrTypeFilter === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCardQrTypeFilter(t.id)
                        setCardPage(1)
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                        active
                          ? 'bg-[#a3e635] text-black border-[#a3e635] font-extrabold shadow-sm'
                          : 'bg-[#0e1017] text-gray-400 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      <span>{t.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${active ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'}`}>
                        {t.count}
                      </span>
                    </button>
                  )
                })}
              </div>

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
                      placeholder="Search by ID, business, URL..."
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

                {/* Card Creation & Export Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      resetQrCreateForm()
                      setCreateQrModalOpen(true)
                    }}
                    className="bg-gradient-to-r from-[#a3e635] to-emerald-400 hover:opacity-95 text-black font-black px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Sparkles size={14} />
                    <span>+ Create QR Card</span>
                  </button>

                  <button
                    onClick={() => setBulkModalOpen(true)}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Layers size={14} />
                    <span>Bulk Cards</span>
                  </button>

                  <button
                    onClick={() => handleDownloadZipWithOptions('bundle')}
                    className="bg-white/10 hover:bg-white/15 text-white font-bold p-2 rounded-xl text-xs border border-white/10 transition-colors"
                    title="Download ZIP (PNG + SVG Bundle)"
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
                        <th className="py-3.5 px-4">ID</th>
                        <th className="py-3.5 px-4">QR Type</th>
                        <th className="py-3.5 px-4">Profile Status</th>
                        <th className="py-3.5 px-4">NFC Programming</th>
                        <th className="py-3.5 px-4">Destination / Business</th>
                        <th className="py-3.5 px-4">Permanent NFC / QR URL</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedCards.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            No cards matching your search or filter.
                          </td>
                        </tr>
                      ) : (
                        paginatedCards.map((c) => {
                          const isAssigned = Boolean(c.business_id || c.destination_url)
                          const nfcStat = c.nfc_status || 'not_programmed'
                          const cType = c.card_type || '3in1'
                          return (
                            <tr key={c.card_id} className="hover:bg-white/[0.02] transition-colors">
                              {/* Card ID */}
                              <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                                {c.card_id}
                              </td>

                              {/* QR Type Badge */}
                              <td className="py-3.5 px-4">
                                {cType === 'google_review' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                    <GoogleBrandIcon className="w-3.5 h-3.5" />
                                    <span>Google Review</span>
                                  </span>
                                )}
                                {cType === 'instagram' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/30">
                                    <InstagramBrandIcon className="w-3.5 h-3.5" />
                                    <span>Instagram</span>
                                  </span>
                                )}
                                {cType === 'whatsapp' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    <WhatsAppBrandIcon className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </span>
                                )}
                                {cType === '3in1' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                                    <Layers size={12} />
                                    <span>3-in-1 Card</span>
                                  </span>
                                )}
                              </td>

                              {/* Profile Status Badge */}
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
                                  {c.status || (isAssigned ? 'Active' : 'Available')}
                                </span>
                              </td>

                              {/* NFC Programming Status Badge */}
                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => {
                                    setSelectedNfcCardId(c.card_id)
                                    setActiveTab('nfc-programming')
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-105 ${
                                    nfcStat === 'tested'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                      : nfcStat === 'programmed'
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                  }`}
                                  title="Click to open NFC Programming Workbench"
                                >
                                  {nfcStat === 'tested' ? (
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                  ) : nfcStat === 'programmed' ? (
                                    <Check size={12} className="text-blue-400" />
                                  ) : (
                                    <AlertCircle size={12} className="text-amber-400" />
                                  )}
                                  <span>
                                    {nfcStat === 'tested'
                                      ? 'Tested'
                                      : nfcStat === 'programmed'
                                      ? 'Programmed'
                                      : 'Not Programmed'}
                                  </span>
                                </button>
                              </td>

                              {/* Target / Destination */}
                              <td className="py-3.5 px-4">
                                {cType !== '3in1' ? (
                                  <div>
                                    <div className="font-bold text-white text-xs">
                                      {c.business_name || 'Direct QR Card'}
                                    </div>
                                    {c.destination_url ? (
                                      <a
                                        href={c.destination_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] text-[#a3e635] hover:underline font-mono truncate max-w-[200px] block"
                                        title={c.destination_url}
                                      >
                                        {c.destination_url}
                                      </a>
                                    ) : (
                                      <span className="text-gray-500 italic text-[11px]">No destination set</span>
                                    )}
                                  </div>
                                ) : isAssigned ? (
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

                              {/* Permanent NFC / QR URL */}
                              <td className="py-3.5 px-4 font-mono text-[11px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-300 truncate max-w-[170px] sm:max-w-[200px]">
                                    {c.permanent_url}
                                  </span>
                                  <button
                                    onClick={() => handleCopyUrl(c.permanent_url, `nfc-${c.card_id}`)}
                                    className="text-gray-500 hover:text-[#a3e635] transition-colors cursor-pointer shrink-0"
                                    title="Copy Permanent NFC URL"
                                  >
                                    {copiedUrl === `nfc-${c.card_id}` ? (
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
                                  {/* QR Code Preview Modal */}
                                  <button
                                    onClick={() => handleShowQrModal(c)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a3e635] transition-colors cursor-pointer"
                                    title="View & Zoom QR Code"
                                  >
                                    <QrCode size={14} />
                                  </button>

                                  {/* Download PNG */}
                                  <button
                                    onClick={() => downloadSingleQRPNG(c.permanent_url, c.card_id)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
                                    title={`Download ${c.card_id}.png`}
                                  >
                                    <Download size={14} />
                                  </button>

                                  {/* Download SVG */}
                                  <button
                                    onClick={() => downloadSingleQRSVG(c.permanent_url, c.card_id)}
                                    className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors cursor-pointer font-mono text-[10px] font-bold px-2"
                                    title={`Download ${c.card_id}.svg (Vector)`}
                                  >
                                    SVG
                                  </button>

                                  {/* Edit Destination */}
                                  <button
                                    onClick={() => handleOpenEditDestination(c)}
                                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                                    title="Edit Destination Target"
                                  >
                                    <Edit size={14} />
                                  </button>

                                  {/* Test Direct Dynamic QR Link */}
                                  <Link
                                    to={`/p/${c.card_id}`}
                                    target="_blank"
                                    className="p-1.5 rounded-lg bg-lime-400/10 hover:bg-lime-400/20 text-[#a3e635] transition-colors"
                                    title="Test Dynamic QR / NFC Tap"
                                  >
                                    <ExternalLink size={14} />
                                  </Link>

                                  {/* Quick NFC Programmer */}
                                  <button
                                    onClick={() => {
                                      setSelectedNfcCardId(c.card_id)
                                      setActiveTab('nfc-programming')
                                    }}
                                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors cursor-pointer"
                                    title="Program NFC Tag"
                                  >
                                    <Radio size={14} />
                                  </button>

                                  {/* Delete Card Record */}
                                  <button
                                    onClick={() => handleDeleteCard(c.card_id)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                                    title="Delete Card Record"
                                  >
                                    <Trash2 size={13} />
                                  </button>
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
              TAB 3: DEDICATED NFC PROGRAMMING MANAGEMENT SECTION
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'nfc-programming' && (
            <div className="space-y-8">
              {/* Top Summary Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1017] border border-white/10 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                      <Radio size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20 font-bold">
                          PHYSICAL HARDWARE SUITE
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white mt-1">
                        NFC Programming Management
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                        Hardware chip programming and verification workflow. Write permanent URLs into physical NTAG213 chips using NFC Tools and confirm testing status.
                      </p>
                    </div>
                  </div>

                  {/* Quick Export Manifest CSV */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => downloadCSVFile(cards, DEFAULT_BASE_URL)}
                      className="bg-white/10 hover:bg-white/15 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer border border-white/10"
                    >
                      <FileSpreadsheet size={15} />
                      <span>Export NTAG213 Programming CSV</span>
                    </button>
                  </div>
                </div>

                {/* 4 Status Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/10">
                    <span className="text-[11px] text-gray-400">Total Cards:</span>
                    <div className="text-2xl font-black text-white font-mono mt-0.5">
                      {metrics.totalCards}
                    </div>
                    <span className="text-[10px] text-gray-500">All registered tags</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between text-[11px] text-amber-300">
                      <span>Not Programmed:</span>
                      <AlertCircle size={14} />
                    </div>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                      {metrics.notProgrammed}
                    </div>
                    <span className="text-[10px] text-amber-300/60">Awaiting NTAG213 write</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between text-[11px] text-blue-300">
                      <span>Programmed:</span>
                      <Check size={14} />
                    </div>
                    <div className="text-2xl font-black text-blue-400 font-mono mt-0.5">
                      {metrics.programmed}
                    </div>
                    <span className="text-[10px] text-blue-300/60">Written &bull; Ready for test</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between text-[11px] text-emerald-300">
                      <span>Tested &amp; Verified:</span>
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                      {metrics.tested}
                    </div>
                    <span className="text-[10px] text-emerald-300/60">Physical tap verified</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs mb-2 text-gray-400">
                    <span className="font-semibold text-white">Batch Verification Progress:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {metrics.completionPercent}% ({metrics.tested} of {metrics.totalCards} cards tested)
                    </span>
                  </div>
                  <div className="w-full bg-[#161822] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${metrics.completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ── INTERACTIVE WORKBENCH (CARD DETAIL & NFC TOOLS WRITE GUIDE) ── */}
              {currentNfcCard && (
                <div className="bg-[#0e1017] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#161822] border border-white/15 flex items-center justify-center font-mono font-black text-2xl text-white shadow-inner">
                        {currentNfcCard.card_id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#a3e635] font-bold">
                            Active Workbench Tag
                          </span>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">
                            NTAG213 (144B)
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-white mt-0.5">
                          {currentNfcCard.business_name || 'Unassigned Card'}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                          currentNfcCard.nfc_status === 'tested'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                            : currentNfcCard.nfc_status === 'programmed'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {currentNfcCard.nfc_status === 'tested' ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : currentNfcCard.nfc_status === 'programmed' ? (
                          <Check size={14} className="text-blue-400" />
                        ) : (
                          <AlertCircle size={14} className="text-amber-400" />
                        )}
                        <span>
                          {currentNfcCard.nfc_status === 'tested'
                            ? 'Status: Tested & Verified'
                            : currentNfcCard.nfc_status === 'programmed'
                            ? 'Status: Programmed'
                            : 'Status: Not Programmed'}
                        </span>
                      </span>

                      <button
                        onClick={handleNextUnprogrammed}
                        className="bg-white/10 hover:bg-white/15 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
                        title="Jump to next tag that needs programming"
                      >
                        <span>Next Tag</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Workbench Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 relative z-10">
                    {/* Left Column: URL Box & Confirmation Actions (6 cols) */}
                    <div className="lg:col-span-6 space-y-5">
                      {/* URL Box */}
                      <div className="p-4 rounded-2xl bg-[#141620] border border-white/10 space-y-2">
                        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                          Exact Permanent NFC URL (Write to Chip):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={currentNfcCard.permanent_url}
                            className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none select-all focus:border-[#a3e635]"
                          />
                          <button
                            onClick={() => handleCopyUrl(currentNfcCard.permanent_url, currentNfcCard.card_id)}
                            className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                          >
                            {copiedUrl === currentNfcCard.card_id ? (
                              <>
                                <Check size={14} />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy URL</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Parity Notice */}
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                          <CheckCircle2 size={14} className="shrink-0" />
                          <span>
                            QR Code and NFC Tag use the identical URL: <strong className="font-mono text-white">/p/{currentNfcCard.card_id}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Manual Confirmation Actions */}
                      <div className="p-4 rounded-2xl bg-[#141620] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Admin Physical Confirmation:
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Never auto-marked
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                          <button
                            onClick={() => handleSetNfcStatus(currentNfcCard.card_id, 'programmed')}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              currentNfcCard.nfc_status === 'programmed'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20'
                            }`}
                          >
                            <Check size={14} />
                            <span>Mark Programmed</span>
                          </button>

                          <button
                            onClick={() => handleSetNfcStatus(currentNfcCard.card_id, 'tested')}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              currentNfcCard.nfc_status === 'tested'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            <CheckCircle2 size={14} />
                            <span>Mark Tested &amp; Verified</span>
                          </button>

                          <button
                            onClick={() => handleSetNfcStatus(currentNfcCard.card_id, 'not_programmed')}
                            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            title="Reset tag status"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>

                        <p className="text-[10px] text-gray-500 leading-normal">
                          Per specification rule 10, the system requires admin confirmation after physically writing the tag with your phone and testing the tap.
                        </p>
                      </div>

                      {/* Direct Test Link */}
                      <div className="flex items-center justify-between px-1 text-xs">
                        <Link
                          to={`/p/${currentNfcCard.card_id}`}
                          target="_blank"
                          className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink size={13} />
                          <span>Simulate Public NFC Tap (/p/{currentNfcCard.card_id})</span>
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: Step-by-Step NFC Tools App Instructions (6 cols) */}
                    <div className="lg:col-span-6 bg-[#12141d] border border-white/10 rounded-2xl p-5 space-y-3.5 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <Smartphone size={16} className="text-[#a3e635]" />
                          <span>Writing Guide: NFC Tools App</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">iOS &bull; Android</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            1
                          </span>
                          <p className="text-gray-300">
                            Launch <strong>NFC Tools</strong> on your smartphone.
                          </p>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            2
                          </span>
                          <p className="text-gray-300">
                            Tap <strong>Write</strong> &rarr; <strong>Add a record</strong> &rarr; <strong>Custom URL / URI</strong>.
                          </p>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            3
                          </span>
                          <p className="text-gray-300">
                            Paste the permanent URL: <code className="text-[#a3e635] font-mono bg-black/40 px-1 py-0.5 rounded">/p/{currentNfcCard.card_id}</code> and tap <strong>OK</strong>.
                          </p>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            4
                          </span>
                          <p className="text-gray-300">
                            Tap <strong>Write / 144 Bytes</strong> and hold the top back of your phone directly against card <strong>{currentNfcCard.card_id}</strong>.
                          </p>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            5
                          </span>
                          <p className="text-gray-300">
                            Tap the card with your phone to verify it immediately opens the live landing page, then click <strong>Mark Tested &amp; Verified</strong> above.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NFC PROGRAMMING QUEUE & TABLE ── */}
              <div className="space-y-4">
                {/* Search & Status Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0e1017] p-4 rounded-2xl border border-white/10">
                  <div className="relative w-full sm:w-80">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={nfcProgSearch}
                      onChange={(e) => {
                        setNfcProgSearch(e.target.value)
                        setNfcProgPage(1)
                      }}
                      placeholder="Filter by ID (001...) or business..."
                      className="w-full bg-[#161822] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-400 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <Filter size={14} className="text-gray-500 shrink-0 ml-1" />
                    {[
                      { id: 'all', label: `All (${metrics.totalCards})` },
                      { id: 'not_programmed', label: `Not Programmed (${metrics.notProgrammed})` },
                      { id: 'programmed', label: `Programmed (${metrics.programmed})` },
                      { id: 'tested', label: `Tested (${metrics.tested})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setNfcProgFilter(tab.id)
                          setNfcProgPage(1)
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          nfcProgFilter === tab.id
                            ? 'bg-blue-500 text-white font-extrabold shadow-md'
                            : 'bg-[#161822] text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue Table */}
                <div className="bg-[#0e1017] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#12141d] border-b border-white/10 text-gray-400 uppercase font-mono text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">ID</th>
                          <th className="py-3.5 px-4">Permanent NFC URL</th>
                          <th className="py-3.5 px-4">Chip</th>
                          <th className="py-3.5 px-4">Linked Business</th>
                          <th className="py-3.5 px-4">NFC Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {paginatedNfcCards.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">
                              No NFC tags matching your filter.
                            </td>
                          </tr>
                        ) : (
                          paginatedNfcCards.map((c) => {
                            const isSelected = currentNfcCard?.card_id === c.card_id
                            const nfcStat = c.nfc_status || 'not_programmed'
                            return (
                              <tr
                                key={c.card_id}
                                className={`transition-colors ${
                                  isSelected ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'
                                }`}
                              >
                                {/* ID */}
                                <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                                  {c.card_id}
                                </td>

                                {/* Permanent NFC URL with Copy Button */}
                                <td className="py-3.5 px-4 font-mono text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300 truncate max-w-[200px] sm:max-w-[280px]">
                                      {c.permanent_url}
                                    </span>
                                    <button
                                      onClick={() => handleCopyUrl(c.permanent_url, c.card_id)}
                                      className="text-gray-500 hover:text-[#a3e635] transition-colors cursor-pointer shrink-0"
                                      title="Copy exact NFC URL"
                                    >
                                      {copiedUrl === c.card_id ? (
                                        <CheckCircle2 size={13} className="text-[#a3e635]" />
                                      ) : (
                                        <Copy size={13} />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Hardware Chip */}
                                <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                                  NTAG213
                                </td>

                                {/* Linked Business */}
                                <td className="py-3.5 px-4">
                                  {c.business_id ? (
                                    <div>
                                      <span className="font-bold text-white text-xs">
                                        {c.business_name || 'Business'}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 italic text-[11px]">
                                      Unassigned
                                    </span>
                                  )}
                                </td>

                                {/* Status Badge */}
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      nfcStat === 'tested'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : nfcStat === 'programmed'
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                    }`}
                                  >
                                    {nfcStat === 'tested' ? (
                                      <CheckCircle2 size={12} className="text-emerald-400" />
                                    ) : nfcStat === 'programmed' ? (
                                      <Check size={12} className="text-blue-400" />
                                    ) : (
                                      <AlertCircle size={12} className="text-amber-400" />
                                    )}
                                    <span>
                                      {nfcStat === 'tested'
                                        ? 'Tested'
                                        : nfcStat === 'programmed'
                                        ? 'Programmed'
                                        : 'Not Programmed'}
                                    </span>
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setSelectedNfcCardId(c.card_id)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-blue-500 text-white'
                                          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                                      }`}
                                      title="Load into Workbench"
                                    >
                                      {isSelected ? 'Active' : 'Select'}
                                    </button>

                                    <button
                                      onClick={() => handleSetNfcStatus(c.card_id, 'programmed')}
                                      className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors cursor-pointer"
                                      title="Mark as Programmed"
                                    >
                                      <Check size={13} />
                                    </button>

                                    <button
                                      onClick={() => handleSetNfcStatus(c.card_id, 'tested')}
                                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors cursor-pointer"
                                      title="Mark as Tested & Verified"
                                    >
                                      <CheckCircle2 size={13} />
                                    </button>

                                    <Link
                                      to={`/p/${c.card_id}`}
                                      target="_blank"
                                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                                      title="Test Live URL"
                                    >
                                      <ExternalLink size={13} />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="p-4 bg-[#12141d] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <span className="text-gray-400">
                      Showing{' '}
                      <span className="font-bold text-white font-mono">
                        {filteredNfcCards.length === 0 ? 0 : (nfcProgPage - 1) * nfcProgPageSize + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-bold text-white font-mono">
                        {Math.min(nfcProgPage * nfcProgPageSize, filteredNfcCards.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-bold text-white font-mono">
                        {filteredNfcCards.length}
                      </span>{' '}
                      cards in queue
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setNfcProgPage(1)}
                        disabled={nfcProgPage <= 1}
                        className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronsLeft size={16} />
                      </button>
                      <button
                        onClick={() => setNfcProgPage((p) => Math.max(1, p - 1))}
                        disabled={nfcProgPage <= 1}
                        className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <span className="px-3 py-1 font-mono text-xs text-white font-bold bg-white/5 rounded-lg border border-white/10">
                        Page {nfcProgPage} of {totalNfcProgPages}
                      </span>

                      <button
                        onClick={() => setNfcProgPage((p) => Math.min(totalNfcProgPages, p + 1))}
                        disabled={nfcProgPage >= totalNfcProgPages}
                        className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => setNfcProgPage(totalNfcProgPages)}
                        disabled={nfcProgPage >= totalNfcProgPages}
                        className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 4: ALL BUSINESSES
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
                                    to={`/p/${cid}`}
                                    target="_blank"
                                    className="font-mono text-[10px] font-bold bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#bef264] px-2 py-0.5 rounded-lg hover:bg-[#a3e635] hover:text-black transition-colors"
                                  >
                                    {cid}
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
              TAB 5: CREATE NEW BUSINESS
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
                      Step 3: Initial Card Assignment (Optional)
                    </label>
                    <select
                      value={createCardId}
                      onChange={(e) => setCreateCardId(e.target.value)}
                      className="w-full bg-[#161822] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#a3e635] outline-none"
                    >
                      <option value="">-- Assign card later --</option>
                      {availableCards.map((c) => (
                        <option key={c.card_id} value={c.card_id}>
                          {c.card_id} (Available)
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
              TAB 6: LINK EXISTING BUSINESS
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
                          {c.card_id} (URL: /p/{c.card_id})
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
              TAB 7: QR CODE MANAGEMENT & DYNAMIC QR HUB
              ════════════════════════════════════════════════════════════ */}
          {activeTab === 'qr-hub' && (
            <div className="space-y-8">
              {/* Export Suite */}
              <div className="p-6 rounded-3xl bg-[#0e1017] border border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#a3e635] bg-[#a3e635]/10 px-2.5 py-0.5 rounded border border-[#a3e635]/20 font-bold">
                      Dynamic QR Suite
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      QR Code Management &amp; Manufacturing Export
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Manage 3-in-1 cards and Single QR cards (Google Review, Instagram, WhatsApp). Export in PNG and SVG vector formats.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        resetQrCreateForm()
                        setCreateQrModalOpen(true)
                      }}
                      className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Sparkles size={14} />
                      <span>+ Create QR Card</span>
                    </button>

                    <button
                      onClick={() => handleDownloadZipWithOptions('png')}
                      className="bg-white/10 hover:bg-white/15 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                      title="Download all PNGs in a ZIP"
                    >
                      <Download size={14} />
                      <span>PNGs (.zip)</span>
                    </button>

                    <button
                      onClick={() => handleDownloadZipWithOptions('svg')}
                      className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-500/30"
                      title="Download all SVGs in a ZIP"
                    >
                      <Download size={14} />
                      <span>SVGs (.zip)</span>
                    </button>

                    <button
                      onClick={() => handleDownloadZipWithOptions('bundle')}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-black px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      title="Download complete PNG + SVG + Manifest bundle"
                    >
                      <Archive size={14} />
                      <span>Full Bundle (.zip)</span>
                    </button>

                    <button
                      onClick={() => downloadCSVFile(cards, DEFAULT_BASE_URL)}
                      className="bg-white/10 hover:bg-white/15 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                    >
                      <FileSpreadsheet size={14} />
                      <span>CSV Manifest</span>
                    </button>
                  </div>
                </div>

                {/* 4 QR Type Stat Pills */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-6">
                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex items-center justify-between text-gray-400 mb-1">
                      <span>3-in-1 Cards</span>
                      <Layers size={14} className="text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-indigo-400 font-mono">
                      {metrics.total3in1}
                    </div>
                    <span className="text-[10px] text-gray-500">Full Business Profile</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex items-center justify-between text-gray-400 mb-1">
                      <span>Google Review QR</span>
                      <GoogleBrandIcon className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black text-blue-400 font-mono">
                      {metrics.totalGoogleReview}
                    </div>
                    <span className="text-[10px] text-gray-500">1-Tap Direct Review</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex items-center justify-between text-gray-400 mb-1">
                      <span>Instagram QR</span>
                      <InstagramBrandIcon className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black text-pink-400 font-mono">
                      {metrics.totalInstagram}
                    </div>
                    <span className="text-[10px] text-gray-500">Direct Profile Follow</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/10">
                    <div className="flex items-center justify-between text-gray-400 mb-1">
                      <span>WhatsApp QR</span>
                      <WhatsAppBrandIcon className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      {metrics.totalWhatsApp}
                    </div>
                    <span className="text-[10px] text-gray-500">Direct Chat Starter</span>
                  </div>
                </div>
              </div>

              {/* QR Management Table with Type Filter */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e1017] p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                    <span className="text-[11px] text-gray-500 font-mono uppercase tracking-wider shrink-0">Filter:</span>
                    {[
                      { id: 'all', label: 'All Types', count: metrics.totalCards },
                      { id: '3in1', label: '3-in-1', count: metrics.total3in1 },
                      { id: 'google_review', label: 'Google Review', count: metrics.totalGoogleReview, icon: GoogleBrandIcon },
                      { id: 'instagram', label: 'Instagram', count: metrics.totalInstagram, icon: InstagramBrandIcon },
                      { id: 'whatsapp', label: 'WhatsApp', count: metrics.totalWhatsApp, icon: WhatsAppBrandIcon },
                    ].map((t) => {
                      const Icon = t.icon
                      const active = qrHubTypeFilter === t.id
                      return (
                        <button
                          key={t.id}
                          onClick={() => setQrHubTypeFilter(t.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                            active
                              ? 'bg-[#a3e635] text-black border-[#a3e635] font-extrabold shadow-sm'
                              : 'bg-[#141620] text-gray-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                          <span>{t.label}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${active ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'}`}>
                            {t.count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <span className="text-xs text-gray-500 font-mono">
                    Permanent URL is invariant. Destinations update dynamically.
                  </span>
                </div>

                <div className="bg-[#0e1017] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#12141d] border-b border-white/10 text-gray-400 uppercase font-mono text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">ID</th>
                          <th className="py-3.5 px-4">Type</th>
                          <th className="py-3.5 px-4">Business / Profile</th>
                          <th className="py-3.5 px-4">Dynamic Target Destination</th>
                          <th className="py-3.5 px-4">Permanent QR / NFC URL</th>
                          <th className="py-3.5 px-4 text-right">Download &amp; Edit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {cards
                          .filter((c) => qrHubTypeFilter === 'all' || (c.card_type || '3in1') === qrHubTypeFilter)
                          .map((c) => {
                            const cType = c.card_type || '3in1'
                            return (
                              <tr key={c.card_id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                                  {c.card_id}
                                </td>

                                <td className="py-3.5 px-4">
                                  {cType === 'google_review' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                      <GoogleBrandIcon className="w-3.5 h-3.5" />
                                      <span>Google Review</span>
                                    </span>
                                  )}
                                  {cType === 'instagram' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/30">
                                      <InstagramBrandIcon className="w-3.5 h-3.5" />
                                      <span>Instagram</span>
                                    </span>
                                  )}
                                  {cType === 'whatsapp' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                      <WhatsAppBrandIcon className="w-3.5 h-3.5" />
                                      <span>WhatsApp</span>
                                    </span>
                                  )}
                                  {cType === '3in1' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                                      <Layers size={12} />
                                      <span>3-in-1 Card</span>
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-white text-xs">
                                    {c.business_name || (c.business ? c.business.name : 'Unassigned')}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  {c.destination_url ? (
                                    <a
                                      href={c.destination_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-[#a3e635] hover:underline font-mono truncate max-w-[220px] block"
                                      title={c.destination_url}
                                    >
                                      {c.destination_url}
                                    </a>
                                  ) : cType === '3in1' && c.business ? (
                                    <span className="text-gray-400 text-[11px]">3-in-1 Landing Profile</span>
                                  ) : (
                                    <span className="text-gray-500 italic text-[11px]">No target set</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 font-mono text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300 truncate max-w-[180px]">
                                      {c.permanent_url}
                                    </span>
                                    <button
                                      onClick={() => handleCopyUrl(c.permanent_url, `qrhub-${c.card_id}`)}
                                      className="text-gray-500 hover:text-[#a3e635] transition-colors cursor-pointer shrink-0"
                                      title="Copy Permanent URL"
                                    >
                                      {copiedUrl === `qrhub-${c.card_id}` ? (
                                        <CheckCircle2 size={13} className="text-[#a3e635]" />
                                      ) : (
                                        <Copy size={13} />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => downloadSingleQRPNG(c.permanent_url, c.card_id)}
                                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                      title={`Download ${c.card_id}.png`}
                                    >
                                      <Download size={12} />
                                      <span>PNG</span>
                                    </button>

                                    <button
                                      onClick={() => downloadSingleQRSVG(c.permanent_url, c.card_id)}
                                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                      title={`Download ${c.card_id}.svg`}
                                    >
                                      <Download size={12} />
                                      <span>SVG</span>
                                    </button>

                                    <button
                                      onClick={() => handleOpenEditDestination(c)}
                                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                                      title="Edit Destination Target"
                                    >
                                      <Edit size={14} />
                                    </button>

                                    <Link
                                      to={`/p/${c.card_id}`}
                                      target="_blank"
                                      className="p-1.5 rounded-lg bg-lime-400/10 hover:bg-lime-400/20 text-[#a3e635] transition-colors"
                                      title="Test Dynamic QR / Scan"
                                    >
                                      <ExternalLink size={14} />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
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
                      QR Hub allows remote redirection syncing for physical dynamic QR codes. If you have an active QR Hub plan and API key, enter your credentials below. The platform maintains permanent URLs (<span className="font-mono text-[#a3e635]">/p/:cardId</span>) so that physical cards remain 100% functional even if external API connectivity changes.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#141620] border border-white/10 space-y-3 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#a3e635]" />
                    <span>Current Architecture Status</span>
                  </h4>
                  <ul className="space-y-1.5 text-gray-400 list-disc list-inside">
                    <li>All cards are mapped to permanent URLs: <code className="text-white">https://nfc-sage.vercel.app/p/:cardId</code></li>
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
                  <span className="text-gray-400">Starting ID:</span>
                  <span className="font-mono text-[#a3e635] font-bold">{nextId}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Ending ID:</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {formatCardId(parseInt(nextId, 10) + Math.max(1, parseInt(bulkQuantity, 10) || 1) - 1)}
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
              <h3 className="text-base font-mono font-bold text-white">{qrModalCard.card_id}</h3>
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
                <span>PNG ({qrModalCard.card_id}.png)</span>
              </button>
              <button
                onClick={() => downloadSingleQRSVG(qrModalCard.permanent_url, qrModalCard.card_id)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>SVG ({qrModalCard.card_id}.svg)</span>
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

      {/* ── MODAL: CREATE DYNAMIC QR CARD (Requirements 1 & 2: 3-in-1, Google, Instagram, WhatsApp) ── */}
      {createQrModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#a3e635] to-emerald-400 text-black flex items-center justify-center font-black shadow-lg">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Create Dynamic QR Card</h3>
                  <p className="text-[11px] text-gray-400 font-mono">Select single or 3-in-1 QR format</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCreateQrModalOpen(false)
                  resetQrCreateForm()
                }}
                className="text-gray-400 hover:text-white p-1 rounded-lg text-xl"
              >
                &times;
              </button>
            </div>

            {/* Created Single Card Success Result View */}
            {createdCardResult ? (
              <div className="space-y-5 text-center py-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase">
                  <CheckCircle2 size={13} />
                  <span>Card {createdCardResult.card_id} Ready &amp; Active</span>
                </div>

                <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(createdCardResult.permanent_url)}`}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#141620] border border-white/10 space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Card ID:</span>
                    <span className="font-mono text-white font-bold">#{createdCardResult.card_id}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Permanent URL:</span>
                    <span className="font-mono text-[#a3e635] truncate max-w-[200px]">{createdCardResult.permanent_url}</span>
                  </div>
                  {createdCardResult.destination_url && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Target Destination:</span>
                      <a
                        href={createdCardResult.destination_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-indigo-400 hover:underline truncate max-w-[200px]"
                      >
                        {createdCardResult.destination_url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Instant Download Options */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => downloadSingleQRPNG(createdCardResult.permanent_url, createdCardResult.card_id)}
                    className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download size={14} />
                    <span>Download {createdCardResult.card_id}.png</span>
                  </button>

                  <button
                    onClick={() => downloadSingleQRSVG(createdCardResult.permanent_url, createdCardResult.card_id)}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download size={14} />
                    <span>Download {createdCardResult.card_id}.svg</span>
                  </button>
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => handleCopyUrl(createdCardResult.permanent_url, 'created-nfc')}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-2.5 px-3 rounded-xl border border-white/10 flex items-center justify-center gap-1.5"
                  >
                    <Copy size={13} />
                    <span>{copiedUrl === 'created-nfc' ? 'Copied NFC URL!' : 'Copy NFC URL'}</span>
                  </button>

                  <Link
                    to={`/p/${createdCardResult.card_id}`}
                    target="_blank"
                    className="flex-1 bg-lime-400/10 hover:bg-lime-400/20 text-[#a3e635] font-semibold py-2.5 px-3 rounded-xl border border-lime-400/20 flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>Test Scan / Tap</span>
                  </Link>
                </div>

                <button
                  onClick={() => resetQrCreateForm()}
                  className="w-full text-xs text-gray-400 hover:text-white pt-2 cursor-pointer"
                >
                  + Create Another Card
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateQrCardSubmit} className="space-y-5 text-xs">
                {/* 1. Select QR Type (Requirement 1) */}
                <div>
                  <label className="font-semibold text-gray-300 uppercase tracking-wider block mb-2 text-[11px]">
                    1. Select QR Card Format *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Google Review QR */}
                    <button
                      type="button"
                      onClick={() => setQrModalTab('google_review')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        qrModalTab === 'google_review'
                          ? 'bg-blue-500/15 border-blue-400 text-white ring-1 ring-blue-400'
                          : 'bg-[#141620] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <GoogleBrandIcon className="w-4 h-4" />
                        <span className="font-bold text-white text-xs">Google Review QR</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Direct 1-tap redirect to Google Review page
                      </p>
                    </button>

                    {/* Instagram QR */}
                    <button
                      type="button"
                      onClick={() => setQrModalTab('instagram')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        qrModalTab === 'instagram'
                          ? 'bg-pink-500/15 border-pink-400 text-white ring-1 ring-pink-400'
                          : 'bg-[#141620] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <InstagramBrandIcon className="w-4 h-4" />
                        <span className="font-bold text-white text-xs">Instagram QR</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Direct 1-tap redirect to Instagram profile
                      </p>
                    </button>

                    {/* WhatsApp QR */}
                    <button
                      type="button"
                      onClick={() => setQrModalTab('whatsapp')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        qrModalTab === 'whatsapp'
                          ? 'bg-emerald-500/15 border-emerald-400 text-white ring-1 ring-emerald-400'
                          : 'bg-[#141620] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <WhatsAppBrandIcon className="w-4 h-4" />
                        <span className="font-bold text-white text-xs">WhatsApp QR</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Direct 1-tap redirect to WhatsApp chat
                      </p>
                    </button>

                    {/* 3-in-1 QR Card (Existing) */}
                    <button
                      type="button"
                      onClick={() => setQrModalTab('3in1')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        qrModalTab === '3in1'
                          ? 'bg-indigo-500/15 border-indigo-400 text-white ring-1 ring-indigo-400'
                          : 'bg-[#141620] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Layers size={15} className="text-indigo-400" />
                        <span className="font-bold text-white text-xs">3-in-1 QR Card</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Full landing page with 3 social buttons
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Generation Mode (Single vs Bulk) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-gray-300 uppercase tracking-wider text-[11px]">
                      2. Creation Mode
                    </span>
                    <div className="flex bg-[#141620] p-0.5 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setQrModalMode('single')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                          qrModalMode === 'single' ? 'bg-[#a3e635] text-black shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Single Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrModalMode('bulk')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                          qrModalMode === 'bulk' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Bulk Batch
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Form Fields tailored to Selected Type */}
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#141620] border border-white/10">
                  {/* Common: Business / Profile Name */}
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">
                      Business or Profile Name {qrModalMode === 'single' ? '*' : '(Optional prefix)'}
                    </label>
                    <input
                      type="text"
                      value={qrModalBizName}
                      onChange={(e) => setQrModalBizName(e.target.value)}
                      placeholder={
                        qrModalTab === 'instagram'
                          ? 'e.g. Aura Studio'
                          : qrModalTab === 'whatsapp'
                          ? 'e.g. Green Leaf Cafe'
                          : 'e.g. Elite Dental Clinic'
                      }
                      className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#a3e635] outline-none"
                    />
                  </div>

                  {/* Google Review URL Field */}
                  {qrModalTab === 'google_review' && (
                    <div>
                      <label className="text-gray-300 font-semibold block mb-1">
                        Google Review URL *
                      </label>
                      <input
                        type="url"
                        required={qrModalMode === 'single'}
                        value={qrModalDestUrl}
                        onChange={(e) => setQrModalDestUrl(e.target.value)}
                        placeholder="https://g.page/r/example-review or maps.app.goo.gl/..."
                        className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-blue-400 outline-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Permanent URL: <code className="text-[#a3e635]">/p/{qrModalCustomId || nextId}</code> &bull; Redirects immediately on scan/tap.
                      </p>
                    </div>
                  )}

                  {/* Instagram URL Field */}
                  {qrModalTab === 'instagram' && (
                    <div>
                      <label className="text-gray-300 font-semibold block mb-1">
                        Instagram Profile URL or @Handle *
                      </label>
                      <input
                        type="text"
                        required={qrModalMode === 'single'}
                        value={qrModalDestUrl}
                        onChange={(e) => setQrModalDestUrl(e.target.value)}
                        placeholder="https://instagram.com/yourhandle or @yourhandle"
                        className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-pink-400 outline-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Permanent URL: <code className="text-[#a3e635]">/p/{qrModalCustomId || nextId}</code> &bull; Auto-formats to official Instagram URL.
                      </p>
                    </div>
                  )}

                  {/* WhatsApp Fields */}
                  {qrModalTab === 'whatsapp' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-300 font-semibold block mb-1">
                          WhatsApp Number with Country Code *
                        </label>
                        <input
                          type="tel"
                          required={qrModalMode === 'single'}
                          value={qrModalWhatsApp}
                          onChange={(e) => setQrModalWhatsApp(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-emerald-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 font-semibold block mb-1">
                          Prefilled Greeting Message (Optional)
                        </label>
                        <input
                          type="text"
                          value={qrModalWaMsg}
                          onChange={(e) => setQrModalWaMsg(e.target.value)}
                          placeholder="Hello, I am connecting from your NFC card!"
                          className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-none"
                        />
                      </div>
                      {qrModalWhatsApp && (
                        <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 font-mono text-[11px] text-emerald-400 truncate">
                          Live Target: {formatWhatsAppChatUrl(qrModalWhatsApp, qrModalWaMsg)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3-in-1 info notice */}
                  {qrModalTab === '3in1' && (
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
                      Creates a standard 3-in-1 multi-action NFC card. You can assign it to any business profile in the Businesses tab or setup wizard.
                    </div>
                  )}

                  {/* Card ID or Bulk Quantity */}
                  {qrModalMode === 'single' ? (
                    <div>
                      <label className="text-gray-400 block mb-1 text-[11px]">
                        Card ID (Optional, defaults to next available: <span className="font-mono text-[#a3e635]">{nextId}</span>)
                      </label>
                      <input
                        type="text"
                        value={qrModalCustomId}
                        onChange={(e) => setQrModalCustomId(e.target.value)}
                        placeholder={nextId}
                        className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:border-[#a3e635] outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-gray-300 font-semibold block mb-1.5">
                        Quantity of Cards to Generate *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={qrModalBulkQty}
                        onChange={(e) => setQrModalBulkQty(e.target.value)}
                        className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:border-indigo-400 outline-none"
                      />
                      <div className="flex gap-2 mt-2">
                        {[10, 25, 50, 100].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQrModalBulkQty(q)}
                            className={`flex-1 py-1 rounded-lg text-xs font-mono border ${
                              Number(qrModalBulkQty) === q
                                ? 'bg-indigo-500 text-white border-indigo-400 font-bold'
                                : 'bg-[#1b1e2c] text-gray-400 border-white/10'
                            }`}
                          >
                            +{q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateQrModalOpen(false)
                      resetQrCreateForm()
                    }}
                    className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={qrModalSaving}
                    className="bg-[#a3e635] hover:bg-[#bef264] text-black font-black py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {qrModalSaving ? (
                      <span>Creating...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>{qrModalMode === 'bulk' ? `Generate ${qrModalBulkQty} Cards` : 'Generate QR Card'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT DESTINATION URL (Requirement 4: Permanent URL & Printed QR never change) ── */}
      {editDestModalCard && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-black text-white">
                  Edit Destination Target — Card #{editDestModalCard.card_id}
                </h3>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  Dynamic QR &amp; NFC Redirection Settings
                </p>
              </div>
              <button
                onClick={() => setEditDestModalCard(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg text-xl"
              >
                &times;
              </button>
            </div>

            {/* Permanent URL Reassurance Banner (Requirement 4) */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 mb-4 text-xs space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck size={15} />
                <span>Permanent URL &amp; Printed QR Unchanged</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Physical printed QR codes and programmed NFC stickers stay 100% valid forever. Only the redirection destination updates.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-gray-300">
                <span className="text-gray-500">Permanent URL:</span>
                <span className="text-[#a3e635] truncate">{editDestModalCard.permanent_url}</span>
              </div>
            </div>

            <form onSubmit={handleSaveDestinationChanges} className="space-y-4 text-xs">
              {/* QR Type Selector */}
              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Card Type
                </label>
                <select
                  value={editDestType}
                  onChange={(e) => setEditDestType(e.target.value)}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#a3e635] outline-none"
                >
                  <option value="google_review">Google Review QR (Direct 1-Tap)</option>
                  <option value="instagram">Instagram QR (Direct 1-Tap)</option>
                  <option value="whatsapp">WhatsApp QR (Direct Chat)</option>
                  <option value="3in1">3-in-1 QR Card (Landing Page Profile)</option>
                </select>
              </div>

              {/* Business Name */}
              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Business / Profile Name
                </label>
                <input
                  type="text"
                  value={editDestBizName}
                  onChange={(e) => setEditDestBizName(e.target.value)}
                  placeholder="e.g. Aura Studio"
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#a3e635] outline-none"
                />
              </div>

              {/* Destination URL for Google Review or Instagram */}
              {(editDestType === 'google_review' || editDestType === 'instagram') && (
                <div>
                  <label className="font-semibold text-gray-300 block mb-1">
                    {editDestType === 'google_review' ? 'Google Review URL *' : 'Instagram Profile URL or Handle *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editDestUrl}
                    onChange={(e) => setEditDestUrl(e.target.value)}
                    placeholder={
                      editDestType === 'google_review'
                        ? 'https://g.page/r/example or maps.app.goo.gl/...'
                        : 'https://instagram.com/myhandle or @myhandle'
                    }
                    className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-[#a3e635] outline-none"
                  />
                </div>
              )}

              {/* WhatsApp Inputs */}
              {editDestType === 'whatsapp' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-gray-300 block mb-1">
                      WhatsApp Number with Country Code *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editDestWhatsApp}
                      onChange={(e) => setEditDestWhatsApp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-emerald-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-300 block mb-1">
                      Greeting Message
                    </label>
                    <input
                      type="text"
                      value={editDestWaMsg}
                      onChange={(e) => setEditDestWaMsg(e.target.value)}
                      placeholder="Hello, I am contacting you via your NFC card!"
                      className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-400 outline-none"
                    />
                  </div>
                  {editDestWhatsApp && (
                    <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 font-mono text-[11px] text-emerald-400 truncate">
                      Live Target: {formatWhatsAppChatUrl(editDestWhatsApp, editDestWaMsg)}
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Card Status
                </label>
                <select
                  value={editDestStatus}
                  onChange={(e) => setEditDestStatus(e.target.value)}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-[#a3e635] outline-none"
                >
                  <option value="active">Active (Redirecting Live)</option>
                  <option value="available">Available (Unassigned)</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditDestModalCard(null)}
                  className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editDestSaving}
                  className="bg-[#a3e635] hover:bg-[#bef264] text-black font-black py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {editDestSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Save Destination Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MODAL: CLOUD DATABASE (SUPABASE) SETTINGS ── */}
      {dbModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Cloud Database (Supabase)
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Real-Time Cross-Device Synchronization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDbModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg text-xl"
              >
                &times;
              </button>
            </div>

            {/* Status Card */}
            <div
              className={`p-4 rounded-2xl border mb-5 space-y-2 ${
                hasSupaCreds
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] font-mono ${
                    hasSupaCreds ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasSupaCreds ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {hasSupaCreds ? 'Cloud Database Connected' : 'Local Storage Only (IndexedDB)'}
                </span>

                {hasSupaCreds && (
                  <button
                    type="button"
                    onClick={handleDisconnectDb}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-mono underline"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <p className="text-gray-300 text-[11px] leading-relaxed">
                {hasSupaCreds
                  ? 'Your NFC cards and Dynamic QR codes are synchronizing with Supabase PostgreSQL in real time. Changes made here apply instantly to all mobile devices and external scanners.'
                  : 'Your cards and settings are currently stored securely in your browser (IndexedDB). To enable instant synchronization across phones, scanners, and external devices, connect your free Supabase project below.'}
              </p>

              {hasSupaCreds && (
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleManualSyncNow}
                    disabled={dbSyncing}
                    className="bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={dbSyncing ? 'animate-spin' : ''} />
                    <span>{dbSyncing ? 'Syncing...' : 'Sync Local Cards to Cloud Now'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleTestAndSaveDb} className="space-y-4">
              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Supabase Project URL *
                </label>
                <input
                  type="url"
                  required
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-emerald-400 outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-300 block mb-1">
                  Supabase Anon Public Key *
                </label>
                <input
                  type="text"
                  required
                  value={dbKey}
                  onChange={(e) => setDbKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-emerald-400 outline-none text-xs"
                />
              </div>

              {/* Status Message */}
              {dbStatusMsg && (
                <div
                  className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-center gap-2 ${
                    dbStatusMsg.ok
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {dbStatusMsg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{dbStatusMsg.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCopySqlSchema}
                  className="text-gray-400 hover:text-white flex items-center gap-1.5 font-mono text-[11px] py-2 px-2.5 rounded-lg border border-white/10 hover:bg-white/5"
                  title="Copy SQL Schema for Supabase SQL Editor"
                >
                  <Copy size={13} className={copiedSql ? 'text-emerald-400' : ''} />
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDbModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={dbTesting}
                    className="bg-[#a3e635] hover:bg-[#bef264] text-black font-extrabold px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {dbTesting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Test &amp; Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
