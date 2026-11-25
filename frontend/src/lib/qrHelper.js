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
 * Creates a branded printable PNG image with the QR Code and card metadata label.
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

      // Card ID Header
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 28px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`NFC PVC CARD #${cardId}`, width / 2, 668)

      // Encoded URL Label
      ctx.fillStyle = '#6b7280'
      ctx.font = '500 16px monospace, sans-serif'
      ctx.fillText(url, width / 2, 702)

      canvas.toBlob((blob) => resolve(blob), 'image/png')
    }
    img.src = qrDataUrl
  })
}

/**
 * Triggers single PNG QR code download.
 */
export async function downloadSingleQRPNG(url, cardId) {
  const blob = await createBrandedQRPNG(url, cardId)
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `NFC-Card-${cardId}-QR.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

/**
 * Generates and downloads a ZIP file containing all 50 QR Code PNGs + manifest.csv
 */
export async function downloadAllCardsZip(cards, baseUrl, onProgress) {
  const zip = new JSZip()
  const folder = zip.folder('NFC-50-Cards-QR-Codes')

  const total = cards.length
  for (let i = 0; i < total; i++) {
    const card = cards[i]
    const id = card.page_id
    const permanentUrl = `${baseUrl.replace(/\/$/, '')}/p/${id}`

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 90), `Generating QR for Card #${id}...`)
    }

    const blob = await createBrandedQRPNG(permanentUrl, id)
    folder.file(`Card-${id}-QR.png`, blob)
  }

  // Generate Manifest CSV and add to zip
  if (onProgress) {
    onProgress(95, 'Building Manifest CSV...')
  }
  const csvContent = generateCSVContent(cards, baseUrl)
  folder.file('NFC-50-Cards-Index.csv', csvContent)

  if (onProgress) {
    onProgress(98, 'Compressing ZIP package...')
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  // Download
  const downloadUrl = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `NFC-50-PVC-Cards-Bundle.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)

  if (onProgress) {
    onProgress(100, 'Complete!')
  }
}

/**
 * Generates CSV content string.
 */
export function generateCSVContent(cards, baseUrl) {
  const cleanBase = baseUrl.replace(/\/$/, '')
  const headers = [
    'Card ID',
    'Status',
    'Permanent Web URL',
    'NFC Tag URL (NTAG213)',
    'Assigned Business Name',
    'WhatsApp Number',
    'Google Review URL',
    'Instagram URL',
    'Created At',
  ]

  const rows = cards.map((c) => {
    const id = c.page_id
    const permUrl = `${cleanBase}/p/${id}`
    const status = c.status || 'available'
    const name = c.business_name || 'Unassigned'
    const wa = c.whatsapp_number || ''
    const gUrl = c.google_review_url || ''
    const igUrl = c.instagram_url || ''
    const created = c.created_at || new Date().toISOString()

    return [
      `"${id}"`,
      `"${status.toUpperCase()}"`,
      `"${permUrl}"`,
      `"${permUrl}"`,
      `"${name.replace(/"/g, '""')}"`,
      `"${wa}"`,
      `"${gUrl}"`,
      `"${igUrl}"`,
      `"${created}"`,
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\r\n')
}

/**
 * Triggers CSV file download.
 */
export function downloadCSVFile(cards, baseUrl) {
  const csv = generateCSVContent(cards, baseUrl)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'NFC-50-Cards-Index.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
