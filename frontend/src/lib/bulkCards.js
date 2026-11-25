import { idbGetPage, idbSavePage, idbListPages } from './idb.js'
import { getSupabaseClient } from './supabase.js'
import { updatePage } from './api.js'

export const DEFAULT_BASE_URL = 'https://nfc-sage.vercel.app'

/**
 * Ensures IDs are formatted as 3-digit strings: '001', '002', ..., '050'
 */
export function formatCardId(num) {
  return String(num).padStart(3, '0')
}

/**
 * Initializes or syncs the 50 permanent PVC NFC cards in the database.
 * If a card record already exists, its customer edits are preserved.
 */
export async function initBulk50Cards(baseUrl = DEFAULT_BASE_URL) {
  const existingList = await idbListPages()
  const existingMap = new Map()
  existingList.forEach((p) => {
    if (p.page_id) existingMap.set(p.page_id.toLowerCase(), p)
  })

  // Also check LocalStorage fallback
  try {
    const raw = localStorage.getItem('nfc_local_pages')
    if (raw) {
      const parsed = JSON.parse(raw)
      parsed.forEach((p) => {
        if (p.page_id && !existingMap.has(p.page_id.toLowerCase())) {
          existingMap.set(p.page_id.toLowerCase(), p)
        }
      })
    }
  } catch {}

  const bulkCards = []
  const supabase = getSupabaseClient()

  for (let i = 1; i <= 50; i++) {
    const cardId = formatCardId(i)
    const existing = existingMap.get(cardId.toLowerCase())

    if (existing) {
      // Keep existing record, ensure card_number and status fields are set
      const updated = {
        ...existing,
        page_id: cardId,
        card_number: cardId,
        status: existing.status || (existing.business_name ? 'assigned' : 'available'),
        is_bulk: true,
      }
      bulkCards.push(updated)
      await idbSavePage(updated)
    } else {
      // Create new Available card
      const newCard = {
        id: `card-${cardId}`,
        page_id: cardId,
        card_number: cardId,
        status: 'available', // 'available' | 'assigned' | 'active'
        is_bulk: true,
        business_name: '',
        welcome_message: '',
        footer_brand: 'OMDROPZ',
        logo_url: '',
        google_review_enabled: true,
        google_review_url: '',
        google_review_text: 'Google Review',
        whatsapp_enabled: true,
        whatsapp_number: '',
        whatsapp_message: 'Hello! I found your NFC card.',
        whatsapp_text: 'Chat on WhatsApp',
        instagram_enabled: true,
        instagram_url: '',
        instagram_text: 'Follow on Instagram',
        bg_color: '#050507',
        btn_color: '#a3e635',
        btn_style: 'solid',
        text_color: '#ffffff',
        font: 'Poppins',
        border_radius: 'rounded-2xl',
        layout: 'centered',
        theme: 'dark',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      bulkCards.push(newCard)
      await idbSavePage(newCard)

      // Sync to Supabase if connected
      if (supabase) {
        try {
          await supabase.from('business_pages').upsert(newCard, { onConflict: 'page_id' })
        } catch {}
      }
    }
  }

  // Also sync to LocalStorage
  try {
    const raw = localStorage.getItem('nfc_local_pages')
    let allPages = raw ? JSON.parse(raw) : []
    bulkCards.forEach((c) => {
      const idx = allPages.findIndex((p) => p.page_id.toLowerCase() === c.page_id.toLowerCase())
      if (idx !== -1) allPages[idx] = { ...allPages[idx], ...c }
      else allPages.push(c)
    })
    localStorage.setItem('nfc_local_pages', JSON.stringify(allPages))
  } catch {}

  return bulkCards
}

/**
 * Loads the 50 bulk cards from database, initializing if not present.
 */
export async function getBulk50Cards(baseUrl = DEFAULT_BASE_URL) {
  const allPages = await idbListPages()
  const map = new Map()
  allPages.forEach((p) => {
    if (p.page_id) map.set(p.page_id.toLowerCase(), p)
  })

  // Check if all 50 exist
  let hasAll50 = true
  for (let i = 1; i <= 50; i++) {
    if (!map.has(formatCardId(i).toLowerCase())) {
      hasAll50 = false
      break
    }
  }

  if (!hasAll50) {
    return await initBulk50Cards(baseUrl)
  }

  // Return sorted 001 to 050
  const list = []
  for (let i = 1; i <= 50; i++) {
    const cardId = formatCardId(i)
    list.push(map.get(cardId.toLowerCase()))
  }
  return list
}

/**
 * Updates status of a specific card: 'available' | 'assigned' | 'active'
 */
export async function updateCardStatus(cardId, newStatus) {
  const formattedId = formatCardId(cardId)
  return await updatePage(formattedId, { status: newStatus })
}
