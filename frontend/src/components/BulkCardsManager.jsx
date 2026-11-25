import React, { useState, useEffect, useMemo } from 'react'
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  FileSpreadsheet,
  FolderArchive,
  RefreshCw,
  Sparkles,
  Zap,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  X,
  Radio,
} from 'lucide-react'
import {
  getBulk50Cards,
  initBulk50Cards,
  updateCardStatus,
  DEFAULT_BASE_URL,
  formatCardId,
} from '../lib/bulkCards.js'
import {
  generateQRDataURL,
  downloadSingleQRPNG,
  downloadAllCardsZip,
  downloadCSVFile,
} from '../lib/qrHelper.js'

export default function BulkCardsManager({ onEditCard, onSelectForPreview }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'available' | 'assigned' | 'active'
  const [baseUrl, setBaseUrl] = useState(
    localStorage.getItem('nfc_bulk_base_url') || DEFAULT_BASE_URL
  )
  const [editingBaseUrl, setEditingBaseUrl] = useState(false)

  // Copy feedback tracking
  const [copiedId, setCopiedId] = useState(null)

  // QR Modal preview
  const [previewQR, setPreviewQR] = useState(null) // { cardId, url, dataUrl }

  // ZIP download progress
  const [zipProgress, setZipProgress] = useState(null) // { percent, label }

  // Quick QR cache for thumbnails
  const [qrCache, setQrCache] = useState({})

  // Load bulk 50 cards
  const loadCards = async (forceInit = false) => {
    setLoading(true)
    try {
      const data = forceInit
        ? await initBulk50Cards(baseUrl)
        : await getBulk50Cards(baseUrl)
      setCards(data)
    } catch (err) {
      console.error('Failed to load bulk cards:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCards(false)
  }, [baseUrl])

  // Generate QR thumbnail for card on demand
  const getCardQR = async (cardId) => {
    if (qrCache[cardId]) return qrCache[cardId]
    const url = `${baseUrl.replace(/\/$/, '')}/p/${cardId}`
    try {
      const dataUrl = await generateQRDataURL(url)
      setQrCache((prev) => ({ ...prev, [cardId]: dataUrl }))
      return dataUrl
    } catch {
      return null
    }
  }

  // Pre-generate visible QR codes
  useEffect(() => {
    if (cards.length > 0) {
      cards.slice(0, 15).forEach((c) => {
        getCardQR(c.page_id)
      })
    }
  }, [cards, baseUrl])

  // Copy NFC URL
  const handleCopyNfcUrl = (cardId) => {
    const permUrl = `${baseUrl.replace(/\/$/, '')}/p/${cardId}`
    navigator.clipboard.writeText(permUrl)
    setCopiedId(cardId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Handle status toggle
  const handleStatusChange = async (cardId, newStatus) => {
    try {
      await updateCardStatus(cardId, newStatus)
      setCards((prev) =>
        prev.map((c) =>
          c.page_id.toLowerCase() === cardId.toLowerCase()
            ? { ...c, status: newStatus }
            : c
        )
      )
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  // Download single PNG
  const handleDownloadSingleQR = async (cardId) => {
    const permUrl = `${baseUrl.replace(/\/$/, '')}/p/${cardId}`
    await downloadSingleQRPNG(permUrl, cardId)
  }

  // Download All 50 ZIP
  const handleDownloadAllZip = async () => {
    setZipProgress({ percent: 5, label: 'Initializing ZIP bundle...' })
    try {
      await downloadAllCardsZip(cards, baseUrl, (percent, label) => {
        setZipProgress({ percent, label })
      })
      setTimeout(() => setZipProgress(null), 2500)
    } catch (err) {
      console.error('ZIP download failed:', err)
      setZipProgress(null)
      alert('Failed to generate ZIP. Please try again.')
    }
  }

  // Download CSV
  const handleDownloadCSV = () => {
    downloadCSVFile(cards, baseUrl)
  }

  // Enlarge QR Modal
  const handleEnlargeQR = async (cardId) => {
    const url = `${baseUrl.replace(/\/$/, '')}/p/${cardId}`
    const dataUrl = await generateQRDataURL(url)
    setPreviewQR({ cardId, url, dataUrl })
  }

  // Filtered cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const matchSearch =
        c.page_id.toLowerCase().includes(search.toLowerCase()) ||
        (c.business_name &&
          c.business_name.toLowerCase().includes(search.toLowerCase()))
      const matchStatus =
        statusFilter === 'all' || (c.status || 'available') === statusFilter
      return matchSearch && matchStatus
    })
  }, [cards, search, statusFilter])

  // Summary counts
  const stats = useMemo(() => {
    let available = 0
    let assigned = 0
    let active = 0
    cards.forEach((c) => {
      const s = c.status || 'available'
      if (s === 'active') active++
      else if (s === 'assigned') assigned++
      else available++
    })
    return { total: cards.length, available, assigned, active }
  }, [cards])

  return (
    <div className="space-y-6">
      {/* ── Top Header & Stats Card ── */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-8 h-8 rounded-xl bg-lime-400 text-black flex items-center justify-center font-bold shadow-md shadow-lime-400/20">
                <QrCode size={18} />
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Bulk QR Card Generator
              </h2>
              <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 font-mono text-xs font-bold border border-lime-400/30">
                50 PVC Cards (001 - 050)
              </span>
            </div>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              50 permanent dynamic QR codes & matching NTAG213 NFC chip URLs. Program tags in advance; assign customer business profiles later without changing URLs or re-printing QR codes.
            </p>

            {/* Base URL indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <span>Target Domain:</span>
              {editingBaseUrl ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-white text-xs font-mono outline-none"
                  />
                  <button
                    onClick={() => {
                      localStorage.setItem('nfc_bulk_base_url', baseUrl)
                      setEditingBaseUrl(false)
                    }}
                    className="px-2 py-1 bg-lime-400 text-black font-bold rounded-lg text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-mono text-lime-300 font-semibold bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  <span>{baseUrl}/p/001 ... /p/050</span>
                  <button
                    onClick={() => setEditingBaseUrl(true)}
                    className="text-gray-400 hover:text-white underline text-[11px] ml-1"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Download Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadCSV}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 border border-white/15 shadow-sm active:scale-95"
              title="Download CSV for Excel and NFC tools"
            >
              <FileSpreadsheet size={15} className="text-lime-400" />
              <span>Export CSV Manifest</span>
            </button>

            <button
              onClick={handleDownloadAllZip}
              disabled={zipProgress !== null}
              className="bg-lime-400 hover:bg-lime-300 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-lime-400/20 active:scale-95 disabled:opacity-70"
            >
              {zipProgress ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <FolderArchive size={16} />
              )}
              <span>
                {zipProgress ? `${zipProgress.percent}% Generating...` : 'Download All 50 QRs (ZIP)'}
              </span>
            </button>

            <button
              onClick={() => loadCards(true)}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all border border-white/10 active:scale-95"
              title="Re-sync Database"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Progress bar banner when downloading ZIP */}
        {zipProgress && (
          <div className="mt-5 p-3 rounded-2xl bg-black/40 border border-lime-400/30">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-lime-300 font-semibold">{zipProgress.label}</span>
              <span className="font-mono text-lime-400 font-bold">{zipProgress.percent}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-lime-400 to-emerald-400 h-2 rounded-full transition-all duration-200"
                style={{ width: `${zipProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Cards</p>
            <p className="text-2xl font-black text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-2xl p-3 border border-emerald-500/30">
            <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Available
            </p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{stats.available}</p>
          </div>
          <div className="bg-amber-500/10 rounded-2xl p-3 border border-amber-500/30">
            <p className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} />
              Assigned
            </p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">{stats.assigned}</p>
          </div>
          <div className="bg-sky-500/10 rounded-2xl p-3 border border-sky-500/30">
            <p className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={12} />
              Active
            </p>
            <p className="text-2xl font-black text-sky-400 mt-0.5">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Card ID (e.g. 001) or Name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All (${stats.total})` },
            { id: 'available', label: `Available (${stats.available})`, color: 'emerald' },
            { id: 'assigned', label: `Assigned (${stats.assigned})`, color: 'amber' },
            { id: 'active', label: `Active (${stats.active})`, color: 'sky' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards Table / List ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw size={32} className="animate-spin text-lime-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600">Generating 50 Permanent Cards...</p>
            <p className="text-xs text-gray-400">Loading IndexedDB records & QR indices</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">No cards matched your filter.</p>
            <button
              onClick={() => { setSearch(''); setStatusFilter('all') }}
              className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Card ID</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4">Customer / Profile</th>
                  <th className="py-3.5 px-4">Permanent Dynamic URL</th>
                  <th className="py-3.5 px-4">NFC Tag URL (NTAG213)</th>
                  <th className="py-3.5 px-3 text-center">QR Code</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredCards.map((card) => {
                  const id = card.page_id
                  const permUrl = `${baseUrl.replace(/\/$/, '')}/p/${id}`
                  const status = card.status || 'available'
                  const isCopied = copiedId === id
                  const qrThumbnail = qrCache[id]

                  return (
                    <tr key={id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* 1. Card ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-gray-900 text-lime-400 font-mono font-black text-xs flex items-center justify-center shadow-sm">
                            {id}
                          </span>
                          <span className="font-bold text-gray-900 font-mono">#{id}</span>
                        </div>
                      </td>

                      {/* 2. Status Selector */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition-colors ${
                            status === 'active'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : status === 'assigned'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <option value="available">🟢 Available</option>
                          <option value="assigned">🟡 Assigned</option>
                          <option value="active">🔵 Active</option>
                        </select>
                      </td>

                      {/* 3. Customer Name / Avatar */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {card.business_name ? (
                          <div className="flex items-center gap-2.5">
                            {card.logo_url ? (
                              <img
                                src={card.logo_url}
                                alt="Logo"
                                className="w-7 h-7 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {card.business_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 text-xs leading-tight">
                                {card.business_name}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {card.whatsapp_number || 'No WhatsApp set'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Ready for Assignment
                          </span>
                        )}
                      </td>

                      {/* 4. Permanent Dynamic URL */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a
                          href={permUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5"
                          title="Open Permanent URL"
                        >
                          <span>/p/{id}</span>
                          <ExternalLink size={12} className="text-gray-400" />
                        </a>
                      </td>

                      {/* 5. NFC URL Column (with Copy button) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyNfcUrl(id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              isCopied
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                            title="Copy URL for NTAG213 programming"
                          >
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{isCopied ? 'Copied!' : 'Copy NFC URL'}</span>
                          </button>
                        </div>
                      </td>

                      {/* 6. QR Code Thumbnail */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleEnlargeQR(id)}
                          className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 p-1 flex items-center justify-center transition-transform hover:scale-110 shadow-sm mx-auto group/qr"
                          title="Click to view & scan QR"
                        >
                          {qrThumbnail ? (
                            <img src={qrThumbnail} alt={`QR #${id}`} className="w-full h-full object-contain" />
                          ) : (
                            <QrCode size={18} className="text-gray-400 group-hover/qr:text-black" />
                          )}
                        </button>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadSingleQR(id)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-black transition-colors"
                            title="Download Single QR PNG"
                          >
                            <Download size={14} />
                          </button>

                          <button
                            onClick={() => onEditCard(id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                          >
                            <Edit size={12} />
                            <span>{card.business_name ? 'Edit Profile' : 'Assign Customer'}</span>
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

      {/* ── QR Enlarge Modal (Real Scannable Testing) ── */}
      {previewQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center relative border border-gray-100">
            <button
              onClick={() => setPreviewQR(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            <span className="px-3 py-1 rounded-full bg-lime-100 text-lime-800 text-[11px] font-mono font-bold tracking-wider uppercase inline-block mb-3">
              PVC NFC Card #{previewQR.cardId}
            </span>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Scannable Dynamic QR
            </h3>
            <p className="text-xs text-gray-500 mb-4 font-mono truncate px-2">
              {previewQR.url}
            </p>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner flex items-center justify-center mx-auto my-2" style={{ width: 260, height: 260 }}>
              <img
                src={previewQR.dataUrl}
                alt={`QR #${previewQR.cardId}`}
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[11px] text-gray-400 mt-3 mb-5">
              Scan with phone camera or QR scanner. Points permanently to this card URL.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopyNfcUrl(previewQR.cardId)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Copy size={13} />
                <span>Copy URL</span>
              </button>
              <button
                onClick={() => handleDownloadSingleQR(previewQR.cardId)}
                className="flex-1 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-lime-400/20"
              >
                <Download size={13} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
