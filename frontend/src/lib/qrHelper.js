import QRCode from 'qrcode'
import JSZip from 'jszip'

/**
 * Generates high-resolution data URL for a given URL.
 */
export async function generateQRDataURL(url) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    width: 600,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

/**
 * Generates vector SVG string for a given URL.
 */
export async function generateQRSVG(url) {
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

/**
 * Creates a printable PNG image with the QR Code and only the numeric ID label (e.g. 001).
 * Zero prefixes or suffixes: no "NFC", "PVC", "CARD", or "#".
 * Returns a Blob.
 */
export async function createBrandedQRPNG(url, cardId) {
  const qrDataUrl = await generateQRDataURL(url)
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const width = 640
    const height = 740
    canvas.width = width
    canvas.height = height

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Load QR Image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Draw QR Code centered
      ctx.drawImage(img, 20, 20, 600, 600)

      // Divider line
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(40, 630)
      ctx.lineTo(600, 630)
      ctx.stroke()

      // Pure numeric ID (e.g. 001 or 101) - no prefixes/suffixes
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 36px monospace, Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(cardId), width / 2, 668)

      // Encoded URL Label
      ctx.fillStyle = '#6b7280'
      ctx.font = '500 16px monospace, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(url, width / 2, 702)

      canvas.toBlob((blob) => resolve(blob), 'image/png')
    }
    img.src = qrDataUrl
  })
}

/**
 * Triggers single PNG QR code download with filename matching only numeric ID (e.g. 101.png).
 */
export async function downloadSingleQRPNG(url, cardId) {
  const blob = await createBrandedQRPNG(url, cardId)
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `${cardId}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

/**
 * Triggers single vector SVG QR code download with filename matching only numeric ID (e.g. 101.svg).
 */
export async function downloadSingleQRSVG(url, cardId) {
  const svgString = await generateQRSVG(url)
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `${cardId}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

/**
 * Generates and downloads a ZIP file containing bulk QR Codes (PNGs and/or SVGs) + manifest.csv
 */
export async function downloadAllCardsZip(cards, baseUrl, options = { includePng: true, includeSvg: true }, onProgress = null) {
  if (!cards || cards.length === 0) return

  const zip = new JSZip()
  const total = cards.length
  const includePng = options?.includePng !== false
  const includeSvg = options?.includeSvg !== false

  for (let i = 0; i < total; i++) {
    const card = cards[i]
    const id = card.card_id || card.page_id
    const permanentUrl =
      card.permanent_url || `${baseUrl.replace(/\/$/, '')}/p/${id}`

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 90),
        message: `Processing QR ${id}...`,
      })
    }

    if (includePng) {
      const pngBlob = await createBrandedQRPNG(permanentUrl, id)
      zip.file(`${id}.png`, pngBlob)
    }

    if (includeSvg) {
      const svgString = await generateQRSVG(permanentUrl)
      zip.file(`${id}.svg`, svgString)
    }
  }

  // Generate Manifest CSV and add to zip
  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 95,
      message: 'Building Manifest CSV...',
    })
  }
  const csvContent = generateCSVContent(cards, baseUrl)
  zip.file('manifest.csv', csvContent)

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 98,
      message: 'Compressing ZIP package...',
    })
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  // Download
  const downloadUrl = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = 'QR-Codes.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)

  if (onProgress) {
    onProgress(null)
  }
}

/**
 * Generates CSV content string with QR Type and Destination details.
 */
export function generateCSVContent(cards, baseUrl) {
  const cleanBase = baseUrl.replace(/\/$/, '')
  const headers = [
    'ID',
    'QR Type',
    'Status',
    'Hardware Chip',
    'NFC Programming Status',
    'Destination Target URL',
    'Permanent Web URL',
    'NFC Tag URL',
    'Assigned Business ID',
    'Business / Profile Name',
    'WhatsApp Number',
    'Created At',
  ]

  const formatTypeLabel = (type) => {
    if (type === 'google_review') return 'Google Review QR'
    if (type === 'instagram') return 'Instagram QR'
    if (type === 'whatsapp') return 'WhatsApp QR'
    return '3-in-1 QR Card'
  }

  const rows = cards.map((c) => {
    const id = c.card_id || c.page_id
    const permUrl = c.permanent_url || `${cleanBase}/p/${id}`
    const nfcUrl = c.nfc_url || permUrl
    const cType = c.card_type || '3in1'
    const status = c.status || (c.destination_url || c.business_id ? 'active' : 'available')
    const nfcStatus = c.nfc_status || 'not_programmed'
    const bizId = c.business_id || ''
    const bizName = c.business_name || (c.business ? c.business.name : 'Unassigned')
    const destination = c.destination_url || (c.business ? c.business.google_review_url : '') || ''
    const wa = c.whatsapp_number || (c.business ? c.business.whatsapp_number : '') || ''
    const created = c.created_at || new Date().toISOString()

    return [
      `"${id}"`,
      `"${formatTypeLabel(cType)}"`,
      `"${status.toUpperCase()}"`,
      `"NTAG213"`,
      `"${nfcStatus.toUpperCase()}"`,
      `"${destination.replace(/"/g, '""')}"`,
      `"${permUrl}"`,
      `"${nfcUrl}"`,
      `"${bizId}"`,
      `"${bizName.replace(/"/g, '""')}"`,
      `"${wa}"`,
      `"${created}"`,
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\r\n')
}

/**
 * Triggers CSV manifest file download.
 */
export function downloadCSVFile(cards, baseUrl) {
  const csv = generateCSVContent(cards, baseUrl)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'manifest.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
