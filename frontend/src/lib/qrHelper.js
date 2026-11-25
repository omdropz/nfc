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

      // Pure numeric ID (e.g. 001) - no prefixes/suffixes
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
 * Triggers single PNG QR code download with filename matching only numeric ID (e.g. 001.png).
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
 * Generates and downloads a ZIP file containing bulk QR Code PNGs (001.png, 002.png, ...) + manifest.csv
 */
export async function downloadAllCardsZip(cards, baseUrl, onProgress) {
  if (!cards || cards.length === 0) return

  const zip = new JSZip()
  const folder = zip.folder('QR-Codes')

  const total = cards.length
  for (let i = 0; i < total; i++) {
    const card = cards[i]
    const id = card.card_id || card.page_id
    const permanentUrl =
      card.permanent_url || `${baseUrl.replace(/\/$/, '')}/c/${id}`

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 90),
        message: `Generating ${id}.png...`,
      })
    }

    const blob = await createBrandedQRPNG(permanentUrl, id)
    folder.file(`${id}.png`, blob)
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
  folder.file('manifest.csv', csvContent)

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
 * Generates CSV content string.
 */
export function generateCSVContent(cards, baseUrl) {
  const cleanBase = baseUrl.replace(/\/$/, '')
  const headers = [
    'ID',
    'Status',
    'Hardware Chip',
    'Permanent Web URL',
    'NFC Tag URL',
    'Assigned Business ID',
    'Assigned Business Name',
    'WhatsApp Number',
    'Google Review URL',
    'Instagram URL',
    'Created At',
  ]

  const rows = cards.map((c) => {
    const id = c.card_id || c.page_id
    const permUrl = c.permanent_url || `${cleanBase}/c/${id}`
    const nfcUrl = c.nfc_url || permUrl
    const status = c.status || (c.business_id ? 'assigned' : 'available')
    const bizId = c.business_id || ''
    const bizName = c.business_name || (c.business ? c.business.name : 'Unassigned')
    const wa = c.whatsapp_number || (c.business ? c.business.whatsapp_number : '') || ''
    const gUrl = c.google_review_url || (c.business ? c.business.google_review_url : '') || ''
    const igUrl = c.instagram_url || (c.business ? c.business.instagram_url : '') || ''
    const created = c.created_at || new Date().toISOString()

    return [
      `"${id}"`,
      `"${status.toUpperCase()}"`,
      `"NTAG213"`,
      `"${permUrl}"`,
      `"${nfcUrl}"`,
      `"${bizId}"`,
      `"${bizName.replace(/"/g, '""')}"`,
      `"${wa}"`,
      `"${gUrl}"`,
      `"${igUrl}"`,
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
