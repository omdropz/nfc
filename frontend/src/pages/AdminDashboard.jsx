import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, Save, Plus, Trash2, Edit2, ChevronDown, Upload,
  Building2, Share2, Palette, LayoutDashboard, X, Check,
  Smartphone, AlertCircle, Loader2, ExternalLink, RotateCcw, Database, QrCode,
} from 'lucide-react'
import {
  listPages, getPage, createPage, updatePage, deletePage,
  verifyAuth, logout,
} from '../lib/api.js'
import api from '../lib/api.js'
import ToggleSwitch from '../components/ToggleSwitch.jsx'
import ColorPicker from '../components/ColorPicker.jsx'
import MiniPreview from '../components/MiniPreview.jsx'
import Toast from '../components/Toast.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import BulkCardsManager from '../components/BulkCardsManager.jsx'

const DEFAULT_FORM = {
  business_name: '',
  welcome_message: '',
  footer_brand: 'OMDROPZ',
  logo_url: '',
  google_review_enabled: false,
  google_review_url: '',
  google_review_text: 'Leave a Google Review',
  whatsapp_enabled: false,
  whatsapp_number: '',
  whatsapp_message: 'Hi! I found your NFC card.',
  whatsapp_text: 'Chat on WhatsApp',
  instagram_enabled: false,
  instagram_url: '',
  instagram_text: 'Follow on Instagram',
  bg_color: '#6366f1',
  btn_color: '#6366f1',
  btn_style: 'solid',
  text_color: '#ffffff',
  font: 'Inter',
  border_radius: 'rounded-2xl',
  layout: 'centered',
  theme: 'light',
}

const TABS = [
  { id: 'bulk-cards', label: 'Bulk QR Cards (50)', icon: QrCode },
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'social', label: 'Social Links', icon: Share2 },
  { id: 'design', label: 'Design & Style', icon: Palette },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'pages', label: 'All Pages', icon: LayoutDashboard },
]

const FONTS = ['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Raleway']
const RADII = [
  { value: 'rounded-lg', label: 'Small' },
  { value: 'rounded-2xl', label: 'Medium' },
  { value: 'rounded-3xl', label: 'Large' },
  { value: 'rounded-full', label: 'Pill' },
]

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-5 first:mt-0">
      {children}
    </p>
  )
}

function FieldGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      {children}
    </div>
  )
}

function inputCls(extra = '') {
  return `border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm transition-shadow ${extra}`
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [authLoading, setAuthLoading] = useState(true)
  const [pages, setPages] = useState([])
  const [selectedPageId, setSelectedPageId] = useState(null)
  const [formData, setFormData] = useState({ ...DEFAULT_FORM })
  const [activeTab, setActiveTab] = useState('bulk-cards')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Database settings
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('nfc_supabase_url') || '')
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('nfc_supabase_anon_key') || '')

  // Pages management
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPageId, setNewPageId] = useState('')
  const [newBusinessName, setNewBusinessName] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  const loadPages = useCallback(async () => {
    try {
      const data = await listPages()
      const list = Array.isArray(data) ? data : data?.pages || []
      setPages(list)
      return list
    } catch {
      return []
    }
  }, [])

  const loadPageData = useCallback(async (pgId) => {
    try {
      const data = await getPage(pgId)
      // API returns { success, page } — unwrap the page object
      const raw = data?.page || data?.settings || data || {}
      // Normalize DB column names → frontend form field names
      const settings = {
        ...raw,
        google_review_text: raw.google_review_text,
        whatsapp_text: raw.whatsapp_text,
        instagram_text: raw.instagram_text,
        btn_style: raw.btn_style,
        // Also populate the _btn_text aliases used by some components
        google_review_btn_text: raw.google_review_text || raw.google_review_btn_text || 'Leave a Google Review',
        whatsapp_btn_text: raw.whatsapp_text || raw.whatsapp_btn_text || 'Chat on WhatsApp',
        instagram_btn_text: raw.instagram_text || raw.instagram_btn_text || 'Follow on Instagram',
        button_style: raw.btn_style || raw.button_style || 'solid',
      }
      setFormData({ ...DEFAULT_FORM, ...settings })
      setLogoPreview(settings.logo_url || null)
    } catch {
      setFormData({ ...DEFAULT_FORM })
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        await verifyAuth()
      } catch {
        localStorage.removeItem('admin_token')
        navigate('/admin/login', { replace: true })
        return
      }
      setAuthLoading(false)
      const list = await loadPages()
      if (list.length > 0) {
        const firstId = list[0].page_id || list[0].id
        setSelectedPageId(firstId)
        await loadPageData(firstId)
      }
    }
    init()
  }, [navigate, loadPages, loadPageData])

  useEffect(() => {
    if (selectedPageId) {
      loadPageData(selectedPageId)
    }
  }, [selectedPageId, loadPageData])

  const handleLogout = async () => {
    try { await logout() } catch {}
    localStorage.removeItem('admin_token')
    navigate('/admin/login', { replace: true })
  }

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleUploadLogo = async () => {
    if (!logoFile || !selectedPageId) return
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('logo', logoFile)
      const res = await api.post(`/upload/${selectedPageId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.url || res.data?.logo_url || ''
      handleFieldChange('logo_url', url)
      setLogoFile(null)
      showToast('Logo uploaded!', 'success')
    } catch {
      // Local preview & fallback via FileReader
      const reader = new FileReader()
      reader.onload = (ev) => {
        const localUrl = ev.target?.result
        if (localUrl) {
          handleFieldChange('logo_url', localUrl)
          setLogoFile(null)
          showToast('Logo updated!', 'success')
        }
      }
      reader.readAsDataURL(logoFile)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async () => {
    if (!selectedPageId) return
    setSaving(true)
    try {
      // Auto-assign status if customer business name is provided
      let status = formData.status || 'available'
      if (formData.business_name && status === 'available') {
        status = 'assigned'
      }

      // Map frontend field names → DB column names
      const payload = {
        ...formData,
        page_id: selectedPageId, // ensure permanent URL never changes!
        status,
        google_review_text: formData.google_review_text || formData.google_review_btn_text,
        whatsapp_text: formData.whatsapp_text || formData.whatsapp_btn_text,
        instagram_text: formData.instagram_text || formData.instagram_btn_text,
        btn_style: formData.btn_style || formData.button_style,
      }
      await updatePage(selectedPageId, payload)
      await loadPages()
      showToast('✓ Saved! Live page updated.', 'success')
    } catch {
      showToast('Save failed. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!selectedPageId) return
    const confirmed = window.confirm('Revert all fields to the last saved database state?')
    if (!confirmed) return
    await loadPageData(selectedPageId)
    showToast('Reset to saved state.', 'success')
  }

  const handleSaveDbConfig = () => {
    if (supabaseUrl.trim()) {
      localStorage.setItem('nfc_supabase_url', supabaseUrl.trim())
    } else {
      localStorage.removeItem('nfc_supabase_url')
    }
    if (supabaseKey.trim()) {
      localStorage.setItem('nfc_supabase_anon_key', supabaseKey.trim())
    } else {
      localStorage.removeItem('nfc_supabase_anon_key')
    }
    showToast('Database configuration updated!', 'success')
  }

  const handleCreatePage = async () => {
    if (!newPageId.trim() || !newBusinessName.trim()) {
      setCreateError('Both fields are required.')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      await createPage({
        page_id: newPageId.trim(),
        business_name: newBusinessName.trim(),
      })
      setShowCreateModal(false)
      setNewPageId('')
      setNewBusinessName('')
      const list = await loadPages()
      setSelectedPageId(newPageId.trim())
    } catch (err) {
      setCreateError(err?.response?.data?.message || 'Failed to create page.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePage = async (pgId) => {
    setDeleting(true)
    try {
      await deletePage(pgId)
      setDeleteConfirm(null)
      const list = await loadPages()
      if (selectedPageId === pgId) {
        if (list.length > 0) {
          const newId = list[0].page_id || list[0].id
          setSelectedPageId(newId)
        } else {
          setSelectedPageId(null)
          setFormData({ ...DEFAULT_FORM })
        }
      }
      showToast('Page deleted.', 'success')
    } catch {
      showToast('Delete failed.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" color="indigo" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toast */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Smartphone size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">NFC Dashboard</span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-center sm:justify-end max-w-xs">
            {pages.length > 0 && (
              <div className="relative">
                <select
                  value={selectedPageId || ''}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white font-medium text-gray-700 cursor-pointer"
                >
                  {pages.map((p) => (
                    <option key={p.page_id || p.id} value={p.page_id || p.id}>
                      {p.settings?.business_name || p.business_name || p.page_id || p.id}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}

            {selectedPageId && (
              <a
                href={`/p/${selectedPageId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-100 bg-indigo-50 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                <ExternalLink size={12} />
                Preview
              </a>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        {selectedPageId === null && pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutDashboard size={48} className="text-gray-200 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No pages yet</h2>
            <p className="text-gray-400 mb-6 text-sm">Create your first NFC card page to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              Create First Page
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT PANEL */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                <div className="flex border-b border-gray-100">
                  {TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3.5 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 ${
                          activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="hidden sm:block">{tab.label}</span>
                        <span className="sm:hidden text-[10px]">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Tab content */}
                <div className="p-5">
                  {/* ========== BULK CARDS GENERATOR TAB ========== */}
                  {activeTab === 'bulk-cards' && (
                    <BulkCardsManager
                      onEditCard={async (cardId) => {
                        setSelectedPageId(cardId)
                        await loadPageData(cardId)
                        setActiveTab('business')
                      }}
                      onSelectForPreview={async (cardId) => {
                        setSelectedPageId(cardId)
                        await loadPageData(cardId)
                      }}
                    />
                  )}

                  {/* ========== BUSINESS TAB ========== */}
                  {activeTab === 'business' && (
                    <div>
                      {/* Permanent Bulk Card Banner */}
                      {selectedPageId && /^\d{1,3}$/.test(selectedPageId) && (
                        <div className="mb-5 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                              {selectedPageId}
                            </span>
                            <span>
                              Editing PVC Card #{selectedPageId} (URL: <strong className="font-mono">https://nfc-sage.vercel.app/p/{selectedPageId}</strong>)
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200 self-start sm:self-auto">
                            Permanent URL & QR Locked
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <SectionLabel>Business Info</SectionLabel>
                        {/* Status selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">Card Status:</span>
                          <select
                            value={formData.status || 'available'}
                            onChange={(e) => handleFieldChange('status', e.target.value)}
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-gray-200 bg-white cursor-pointer outline-none"
                          >
                            <option value="available">🟢 Available</option>
                            <option value="assigned">🟡 Assigned</option>
                            <option value="active">🔵 Active</option>
                          </select>
                        </div>
                      </div>

                      <FieldGroup label="Business Name">
                        <input
                          type="text"
                          value={formData.business_name}
                          onChange={(e) => handleFieldChange('business_name', e.target.value)}
                          placeholder="Acme Corp"
                          className={inputCls()}
                        />
                      </FieldGroup>

                      <FieldGroup label="Welcome Message">
                        <textarea
                          value={formData.welcome_message}
                          onChange={(e) => handleFieldChange('welcome_message', e.target.value)}
                          placeholder="Welcome! We're glad you're here. Connect with us below."
                          rows={3}
                          className={inputCls('resize-none')}
                        />
                      </FieldGroup>

                      <FieldGroup label="Footer Brand Name">
                        <input
                          type="text"
                          value={formData.footer_brand}
                          onChange={(e) => handleFieldChange('footer_brand', e.target.value)}
                          placeholder="NFCCard"
                          className={inputCls()}
                        />
                        <p className="text-xs text-gray-400">Shown in "Powered by ___" footer text.</p>
                      </FieldGroup>

                      <SectionLabel>Logo / Avatar</SectionLabel>

                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center">
                          {logoPreview || formData.logo_url ? (
                            <img
                              src={logoPreview || formData.logo_url}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl font-black text-gray-200">
                              {(formData.business_name || 'B').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 flex-1">
                          <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
                            <Upload size={15} />
                            Choose Logo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFile}
                              className="hidden"
                            />
                          </label>

                          {logoFile && (
                            <button
                              onClick={handleUploadLogo}
                              disabled={uploadingLogo}
                              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                            >
                              {uploadingLogo ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                              {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                            </button>
                          )}

                          {formData.logo_url && (
                            <input
                              type="text"
                              value={formData.logo_url}
                              onChange={(e) => handleFieldChange('logo_url', e.target.value)}
                              placeholder="https://..."
                              className={inputCls('text-xs')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========== SOCIAL TAB ========== */}
                  {activeTab === 'social' && (
                    <div>
                      {/* Google Review */}
                      <SectionLabel>Google Review</SectionLabel>
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
                        <ToggleSwitch
                          checked={formData.google_review_enabled}
                          onChange={(v) => handleFieldChange('google_review_enabled', v)}
                          label="Enable Google Review button"
                          id="google-toggle"
                        />
                        {formData.google_review_enabled && (
                          <div className="mt-4 flex flex-col gap-3">
                            <FieldGroup label="Google Review URL">
                              <input
                                type="url"
                                value={formData.google_review_url}
                                onChange={(e) => handleFieldChange('google_review_url', e.target.value)}
                                placeholder="https://g.page/r/..."
                                className={inputCls()}
                              />
                            </FieldGroup>
                            <FieldGroup label="Button Text">
                              <input
                                type="text"
                                value={formData.google_review_btn_text}
                                onChange={(e) => handleFieldChange('google_review_btn_text', e.target.value)}
                                placeholder="Leave a Google Review"
                                className={inputCls()}
                              />
                            </FieldGroup>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp */}
                      <SectionLabel>WhatsApp</SectionLabel>
                      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4">
                        <ToggleSwitch
                          checked={formData.whatsapp_enabled}
                          onChange={(v) => handleFieldChange('whatsapp_enabled', v)}
                          label="Enable WhatsApp button"
                          id="whatsapp-toggle"
                        />
                        {formData.whatsapp_enabled && (
                          <div className="mt-4 flex flex-col gap-3">
                            <FieldGroup label="WhatsApp Number (with country code)">
                              <input
                                type="tel"
                                value={formData.whatsapp_number}
                                onChange={(e) => handleFieldChange('whatsapp_number', e.target.value)}
                                placeholder="+1234567890"
                                className={inputCls()}
                              />
                            </FieldGroup>
                            <FieldGroup label="Button Text">
                              <input
                                type="text"
                                value={formData.whatsapp_btn_text}
                                onChange={(e) => handleFieldChange('whatsapp_btn_text', e.target.value)}
                                placeholder="Chat on WhatsApp"
                                className={inputCls()}
                              />
                            </FieldGroup>
                            <FieldGroup label="Default Message">
                              <textarea
                                value={formData.whatsapp_message}
                                onChange={(e) => handleFieldChange('whatsapp_message', e.target.value)}
                                placeholder="Hi! I found your NFC card."
                                rows={2}
                                className={inputCls('resize-none')}
                              />
                            </FieldGroup>
                          </div>
                        )}
                      </div>

                      {/* Instagram */}
                      <SectionLabel>Instagram</SectionLabel>
                      <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4">
                        <ToggleSwitch
                          checked={formData.instagram_enabled}
                          onChange={(v) => handleFieldChange('instagram_enabled', v)}
                          label="Enable Instagram button"
                          id="instagram-toggle"
                        />
                        {formData.instagram_enabled && (
                          <div className="mt-4 flex flex-col gap-3">
                            <FieldGroup label="Instagram Profile URL">
                              <input
                                type="url"
                                value={formData.instagram_url}
                                onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
                                placeholder="https://instagram.com/yourhandle"
                                className={inputCls()}
                              />
                            </FieldGroup>
                            <FieldGroup label="Button Text">
                              <input
                                type="text"
                                value={formData.instagram_btn_text}
                                onChange={(e) => handleFieldChange('instagram_btn_text', e.target.value)}
                                placeholder="Follow on Instagram"
                                className={inputCls()}
                              />
                            </FieldGroup>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ========== DESIGN TAB ========== */}
                  {activeTab === 'design' && (
                    <div>
                      <SectionLabel>Colors</SectionLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <ColorPicker
                          label="Background Color"
                          value={formData.bg_color}
                          onChange={(v) => handleFieldChange('bg_color', v)}
                        />
                        <ColorPicker
                          label="Button Color"
                          value={formData.btn_color}
                          onChange={(v) => handleFieldChange('btn_color', v)}
                        />
                        <ColorPicker
                          label="Text Color"
                          value={formData.text_color}
                          onChange={(v) => handleFieldChange('text_color', v)}
                        />
                      </div>

                      <SectionLabel>Button Style</SectionLabel>
                      <div className="flex gap-3 mb-4 flex-wrap">
                        {['solid', 'outline', 'ghost'].map((style) => (
                          <label
                            key={style}
                            className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all capitalize ${
                              formData.button_style === style
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="button_style"
                              value={style}
                              checked={formData.button_style === style}
                              onChange={() => handleFieldChange('button_style', style)}
                              className="sr-only"
                            />
                            {style}
                          </label>
                        ))}
                      </div>

                      <SectionLabel>Typography & Shape</SectionLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <FieldGroup label="Font Family">
                          <div className="relative">
                            <select
                              value={formData.font}
                              onChange={(e) => handleFieldChange('font', e.target.value)}
                              className={inputCls('appearance-none pr-8')}
                            >
                              {FONTS.map((f) => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </FieldGroup>

                        <FieldGroup label="Border Radius">
                          <div className="relative">
                            <select
                              value={formData.border_radius}
                              onChange={(e) => handleFieldChange('border_radius', e.target.value)}
                              className={inputCls('appearance-none pr-8')}
                            >
                              {RADII.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </FieldGroup>
                      </div>

                      <SectionLabel>Layout & Theme</SectionLabel>
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">Layout</label>
                          <div className="flex gap-3">
                            {['centered', 'left'].map((l) => (
                              <label
                                key={l}
                                className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all capitalize ${
                                  formData.layout === l
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="layout"
                                  value={l}
                                  checked={formData.layout === l}
                                  onChange={() => handleFieldChange('layout', l)}
                                  className="sr-only"
                                />
                                {l === 'centered' ? 'Centered' : 'Left-aligned'}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">Theme</label>
                          <div className="flex items-center gap-3">
                            <ToggleSwitch
                              checked={formData.theme === 'dark'}
                              onChange={(v) => handleFieldChange('theme', v ? 'dark' : 'light')}
                              label={formData.theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                              id="theme-toggle"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========== DATABASE TAB ========== */}
                  {activeTab === 'database' && (
                    <div>
                      <SectionLabel>Database & Storage Engine</SectionLabel>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-5">
                        <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm mb-1">
                          <Check size={18} className="text-emerald-600" />
                          <span>Permanent Database Storage: Active</span>
                        </div>
                        <p className="text-xs text-emerald-700 leading-relaxed">
                          All changes are permanently stored in an <strong>IndexedDB Persistent Database</strong>. They remain fully saved across page refreshes, browser restarts, and tab closures without relying on simple localStorage.
                        </p>
                      </div>

                      <SectionLabel>Optional: Cloud Database (Supabase PostgreSQL)</SectionLabel>
                      <p className="text-xs text-gray-500 mb-4">
                        Connect a remote PostgreSQL Supabase database to synchronize your card edits live across different devices and teams.
                      </p>

                      <FieldGroup label="Supabase Project URL">
                        <input
                          type="url"
                          value={supabaseUrl}
                          onChange={(e) => setSupabaseUrl(e.target.value)}
                          placeholder="https://your-project.supabase.co"
                          className={inputCls()}
                        />
                      </FieldGroup>

                      <FieldGroup label="Supabase Anon Key">
                        <input
                          type="password"
                          value={supabaseKey}
                          onChange={(e) => setSupabaseKey(e.target.value)}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          className={inputCls()}
                        />
                      </FieldGroup>

                      <button
                        type="button"
                        onClick={handleSaveDbConfig}
                        className="mt-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all"
                      >
                        Save Database Keys
                      </button>
                    </div>
                  )}

                  {/* ========== PAGES TAB ========== */}
                  {activeTab === 'pages' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <SectionLabel>All Pages</SectionLabel>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          <Plus size={15} />
                          New Page
                        </button>
                      </div>

                      {pages.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <LayoutDashboard size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No pages found.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-3">Page ID</th>
                                <th className="px-4 py-3">Business Name</th>
                                <th className="px-4 py-3 hidden sm:table-cell">Created</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {pages.map((p) => {
                                const pgId = p.page_id || p.id
                                return (
                                  <tr
                                    key={pgId}
                                    className={`hover:bg-gray-50 transition-colors ${selectedPageId === pgId ? 'bg-indigo-50/40' : ''}`}
                                  >
                                    <td className="px-4 py-3 font-mono text-xs text-indigo-600">
                                      {pgId}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                      {p.settings?.business_name || p.business_name || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell text-xs">
                                      {p.created_at
                                        ? new Date(p.created_at).toLocaleDateString()
                                        : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => {
                                            setSelectedPageId(pgId)
                                            setActiveTab('business')
                                          }}
                                          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                        >
                                          <Edit2 size={12} />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirm(pgId)}
                                          className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                        >
                                          <Trash2 size={12} />
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Save & Reset buttons — not shown on bulk-cards, pages or database tab */}
              {activeTab !== 'pages' && activeTab !== 'database' && activeTab !== 'bulk-cards' && selectedPageId && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="py-3 px-5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 justify-center shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT PANEL — Live Preview (hidden on bulk-cards to allow full width) */}
            {activeTab !== 'bulk-cards' && (
              <div className="lg:w-80 xl:w-96 flex-shrink-0">
                <div className="sticky top-24">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
                    Live Preview
                  </p>

                  {/* Phone mockup */}
                  <div className="mx-auto" style={{ width: 280 }}>
                    <div
                      className="relative bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
                      style={{ padding: '10px', paddingTop: '28px', paddingBottom: '28px' }}
                    >
                      {/* Notch */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-10 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-700 rounded-full" />
                      </div>

                      {/* Screen */}
                      <div
                        className="relative bg-white rounded-[2rem] overflow-hidden"
                        style={{ height: 520 }}
                      >
                        <MiniPreview formData={formData} />
                      </div>

                      {/* Home indicator */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full" />
                    </div>
                  </div>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    Updates as you type ✦
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-bounce-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Create New Page</h2>
              <button
                onClick={() => { setShowCreateModal(false); setCreateError('') }}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-3 py-2.5 text-sm">
                <AlertCircle size={15} />
                {createError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <FieldGroup label="Page ID (URL slug)">
                <input
                  type="text"
                  value={newPageId}
                  onChange={(e) => setNewPageId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="my-business"
                  className={inputCls()}
                />
                <p className="text-xs text-gray-400">Will be accessible at /p/{newPageId || 'my-business'}</p>
              </FieldGroup>

              <FieldGroup label="Business Name">
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="Acme Corp"
                  className={inputCls()}
                />
              </FieldGroup>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setCreateError('') }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-bounce-in">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Delete Page?</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-red-600">{deleteConfirm}</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePage(deleteConfirm)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
