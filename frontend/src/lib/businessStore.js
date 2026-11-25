import {
  idbGetCard,
  idbSaveCard,
  idbListCards,
  idbGetBusiness,
  idbSaveBusiness,
  idbListBusinesses,
  idbDeleteBusiness,
  idbGetPage,
  idbSavePage,
} from './idb.js'
import { getSupabaseClient } from './supabase.js'

export const DEFAULT_BASE_URL = 'https://nfc-sage.vercel.app'

export const BUSINESS_CATEGORIES = [
  'Salon',
  'Restaurant',
  'Cafe',
  'Hotel',
  'Retail Shop',
  'Gym',
  'Clinic',
  'Real Estate',
  'Other',
]

export function formatCardId(num) {
  return String(num).padStart(3, '0')
}

export function generateCardUrl(cardId, baseUrl = DEFAULT_BASE_URL) {
  const cleanBase = baseUrl.replace(/\/+$/, '')
  return `${cleanBase}/c/${formatCardId(cardId)}`
}

export function generateBusinessId() {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  const timestamp = Date.now().toString().slice(-4)
  return `BIZ-${rand}-${timestamp}`
}

/**
 * Initialize 50 permanent PVC NFC Cards (001 to 050)
 * Syncs with existing cards and indexedDB storage.
 */
export async function initBusinessStore(baseUrl = DEFAULT_BASE_URL) {
  const existingCards = await idbListCards()
  const existingMap = new Map()
  existingCards.forEach((c) => {
    if (c.card_id) existingMap.set(String(c.card_id).toLowerCase(), c)
  })

  // Check legacy business_pages store for backward compatibility
  const legacyPages = await idbListCards().catch(() => [])

  const cards = []
  const supabase = getSupabaseClient()

  for (let i = 1; i <= 50; i++) {
    const cardId = formatCardId(i)
    const existing = existingMap.get(cardId.toLowerCase())
    const permanentUrl = generateCardUrl(cardId, baseUrl)

    if (existing) {
      const updated = {
        ...existing,
        card_id: cardId,
        card_number: cardId,
        permanent_url: existing.permanent_url || permanentUrl,
        nfc_url: existing.nfc_url || permanentUrl,
        status: existing.status || (existing.business_id ? 'assigned' : 'available'),
      }
      cards.push(updated)
      await idbSaveCard(updated)
    } else {
      const newCard = {
        card_id: cardId,
        card_number: cardId,
        status: 'available', // 'available' | 'assigned' | 'linked' | 'active'
        business_id: null,
        permanent_url: permanentUrl,
        nfc_url: permanentUrl,
        qrhub_qr_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      cards.push(newCard)
      await idbSaveCard(newCard)

      if (supabase) {
        try {
          await supabase.from('nfc_cards').upsert(newCard, { onConflict: 'card_id' })
        } catch {}
      }
    }
  }

  return cards
}

/**
 * Get all 50 cards with their linked business details
 */
export async function getAllCards(baseUrl = DEFAULT_BASE_URL) {
  let cards = await idbListCards()
  if (!cards || cards.length < 50) {
    cards = await initBusinessStore(baseUrl)
  }

  // Sort 001 to 050
  cards.sort((a, b) => parseInt(a.card_id, 10) - parseInt(b.card_id, 10))

  const businesses = await idbListBusinesses()
  const bizMap = new Map()
  businesses.forEach((b) => {
    if (b.id) bizMap.set(String(b.id).toLowerCase(), b)
  })

  return cards.map((c) => {
    const biz = c.business_id ? bizMap.get(String(c.business_id).toLowerCase()) : null
    return {
      ...c,
      business: biz || null,
      business_name: biz ? biz.name : '',
    }
  })
}

/**
 * Get a single card and its business details
 */
export async function getCardById(cardId, baseUrl = DEFAULT_BASE_URL) {
  const formattedId = formatCardId(cardId)
  let card = await idbGetCard(formattedId)

  if (!card) {
    // Attempt lazy init
    await initBusinessStore(baseUrl)
    card = await idbGetCard(formattedId)
  }

  if (!card) return null

  let business = null
  if (card.business_id) {
    business = await idbGetBusiness(card.business_id)
  }

  return {
    ...card,
    business,
  }
}

/**
 * Get all businesses with their linked cards array
 */
export async function getAllBusinesses() {
  const businesses = await idbListBusinesses()
  const cards = await idbListCards()

  // Group card IDs by business_id
  const cardGroup = new Map()
  cards.forEach((c) => {
    if (c.business_id) {
      const bid = String(c.business_id).toLowerCase()
      if (!cardGroup.has(bid)) cardGroup.set(bid, [])
      cardGroup.get(bid).push(c.card_id)
    }
  })

  return businesses.map((b) => {
    const linkedCards = cardGroup.get(String(b.id).toLowerCase()) || []
    linkedCards.sort((x, y) => parseInt(x, 10) - parseInt(y, 10))
    return {
      ...b,
      linkedCards,
      cardCount: linkedCards.length,
    }
  })
}

/**
 * Get single business by ID
 */
export async function getBusinessById(businessId) {
  if (!businessId) return null
  return idbGetBusiness(businessId)
}

/**
 * Create a new business and optionally link a card
 */
export async function createBusiness(data, initialCardId = null, baseUrl = DEFAULT_BASE_URL) {
  const bizId = data.id || generateBusinessId()
  const now = new Date().toISOString()

  const newBusiness = {
    id: bizId,
    name: data.name?.trim() || 'Untitled Business',
    category: data.category || 'Other',
    logo_url: data.logo_url || '',
    google_review_url: data.google_review_url || '',
    google_review_text: data.google_review_text || 'Google Review',
    google_review_enabled: data.google_review_enabled !== false,
    whatsapp_number: data.whatsapp_number || '',
    whatsapp_message: data.whatsapp_message || 'Hello! I found your NFC card.',
    whatsapp_text: data.whatsapp_text || 'Chat on WhatsApp',
    whatsapp_enabled: data.whatsapp_enabled !== false,
    instagram_url: data.instagram_url || '',
    instagram_text: data.instagram_text || 'Follow on Instagram',
    instagram_enabled: data.instagram_enabled !== false,
    welcome_message: data.welcome_message || '',
    footer_brand: 'OMDROPZ',
    // Owner Access
    owner_phone: data.owner_phone ? String(data.owner_phone).trim() : '',
    owner_pin: data.owner_pin ? String(data.owner_pin).trim() : '',
    owner_access_enabled: Boolean(data.owner_access_enabled && data.owner_phone && data.owner_pin),
    created_at: now,
    updated_at: now,
  }

  // Save business
  await idbSaveBusiness(newBusiness)

  // Sync to Supabase
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('businesses').upsert(newBusiness, { onConflict: 'id' })
    } catch (err) {
      console.warn('Supabase createBusiness sync warning:', err)
    }
  }

  // If initial card provided, link it
  if (initialCardId) {
    await linkCardToBusiness(initialCardId, bizId, baseUrl)
  }

  // Dispatch real-time update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nfc_business_updated', { detail: { business: newBusiness } }))
  }

  return newBusiness
}

/**
 * Update business details (ONLY business details and social button toggles)
 */
export async function updateBusiness(businessId, updates) {
  const current = await idbGetBusiness(businessId)
  if (!current) throw new Error(`Business ${businessId} not found`)

  const updated = {
    ...current,
    name: updates.name !== undefined ? updates.name.trim() : current.name,
    category: updates.category !== undefined ? updates.category : current.category,
    logo_url: updates.logo_url !== undefined ? updates.logo_url : current.logo_url,
    google_review_url: updates.google_review_url !== undefined ? updates.google_review_url : current.google_review_url,
    google_review_text: updates.google_review_text !== undefined ? updates.google_review_text : current.google_review_text,
    google_review_enabled: updates.google_review_enabled !== undefined ? updates.google_review_enabled : current.google_review_enabled,
    whatsapp_number: updates.whatsapp_number !== undefined ? updates.whatsapp_number : current.whatsapp_number,
    whatsapp_message: updates.whatsapp_message !== undefined ? updates.whatsapp_message : current.whatsapp_message,
    whatsapp_text: updates.whatsapp_text !== undefined ? updates.whatsapp_text : current.whatsapp_text,
    whatsapp_enabled: updates.whatsapp_enabled !== undefined ? updates.whatsapp_enabled : current.whatsapp_enabled,
    instagram_url: updates.instagram_url !== undefined ? updates.instagram_url : current.instagram_url,
    instagram_text: updates.instagram_text !== undefined ? updates.instagram_text : current.instagram_text,
    instagram_enabled: updates.instagram_enabled !== undefined ? updates.instagram_enabled : current.instagram_enabled,
    welcome_message: updates.welcome_message !== undefined ? updates.welcome_message : current.welcome_message,
    // Owner Access updates if provided
    ...(updates.owner_phone !== undefined && { owner_phone: updates.owner_phone }),
    ...(updates.owner_pin !== undefined && { owner_pin: updates.owner_pin }),
    ...(updates.owner_access_enabled !== undefined && { owner_access_enabled: updates.owner_access_enabled }),
    updated_at: new Date().toISOString(),
  }

  await idbSaveBusiness(updated)

  // Sync to Supabase
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('businesses').upsert(updated, { onConflict: 'id' })
    } catch (err) {
      console.warn('Supabase updateBusiness sync warning:', err)
    }
  }

  // Also sync legacy business_pages for backward compatibility
  try {
    const legacyPage = {
      page_id: businessId,
      business_name: updated.name,
      welcome_message: updated.welcome_message,
      logo_url: updated.logo_url,
      google_review_url: updated.google_review_url,
      google_review_text: updated.google_review_text,
      google_review_enabled: updated.google_review_enabled,
      whatsapp_number: updated.whatsapp_number,
      whatsapp_message: updated.whatsapp_message,
      whatsapp_text: updated.whatsapp_text,
      whatsapp_enabled: updated.whatsapp_enabled,
      instagram_url: updated.instagram_url,
      instagram_text: updated.instagram_text,
      instagram_enabled: updated.instagram_enabled,
      footer_brand: 'OMDROPZ',
    }
    await idbSavePage(legacyPage)
  } catch {}

  // Dispatch real-time event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nfc_page_updated', {
        detail: {
          businessId,
          business: updated,
          page: {
            business_name: updated.name,
            logo_url: updated.logo_url,
            google_review_url: updated.google_review_url,
            google_review_text: updated.google_review_text,
            google_review_enabled: updated.google_review_enabled,
            whatsapp_number: updated.whatsapp_number,
            whatsapp_message: updated.whatsapp_message,
            whatsapp_text: updated.whatsapp_text,
            whatsapp_enabled: updated.whatsapp_enabled,
            instagram_url: updated.instagram_url,
            instagram_text: updated.instagram_text,
            instagram_enabled: updated.instagram_enabled,
            welcome_message: updated.welcome_message,
            footer_brand: 'OMDROPZ',
          },
        },
      })
    )
  }

  return updated
}

/**
 * Link an NFC Card to a Business
 * One business can have multiple cards (e.g. Salon buys cards 001, 002, 003).
 * One card belongs to only one business at a time.
 */
export async function linkCardToBusiness(cardId, businessId, baseUrl = DEFAULT_BASE_URL) {
  const formattedId = formatCardId(cardId)
  let card = await idbGetCard(formattedId)

  if (!card) {
    const permanentUrl = generateCardUrl(formattedId, baseUrl)
    card = {
      card_id: formattedId,
      card_number: formattedId,
      permanent_url: permanentUrl,
      nfc_url: permanentUrl,
      created_at: new Date().toISOString(),
    }
  }

  const business = await idbGetBusiness(businessId)
  if (!business) throw new Error(`Business ${businessId} not found`)

  // Check how many cards already linked to this business
  const allCards = await idbListCards()
  const alreadyLinkedCount = allCards.filter(
    (c) => c.business_id && String(c.business_id).toLowerCase() === String(businessId).toLowerCase()
  ).length

  // First card is 'assigned', subsequent cards are 'linked' (or 'active')
  const newStatus = alreadyLinkedCount === 0 ? 'assigned' : 'linked'

  const updatedCard = {
    ...card,
    business_id: business.id,
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  await idbSaveCard(updatedCard)

  // Sync to Supabase
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('nfc_cards').upsert(updatedCard, { onConflict: 'card_id' })
    } catch (err) {
      console.warn('Supabase linkCardToBusiness warning:', err)
    }
  }

  // Also sync to legacy business_pages so legacy /p/:cardId resolves immediately
  try {
    const legacyPage = {
      page_id: formattedId,
      card_number: formattedId,
      status: newStatus,
      business_name: business.name,
      welcome_message: business.welcome_message,
      logo_url: business.logo_url,
      google_review_url: business.google_review_url,
      google_review_text: business.google_review_text,
      google_review_enabled: business.google_review_enabled,
      whatsapp_number: business.whatsapp_number,
      whatsapp_message: business.whatsapp_message,
      whatsapp_text: business.whatsapp_text,
      whatsapp_enabled: business.whatsapp_enabled,
      instagram_url: business.instagram_url,
      instagram_text: business.instagram_text,
      instagram_enabled: business.instagram_enabled,
      footer_brand: 'OMDROPZ',
    }
    await idbSavePage(legacyPage)
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nfc_card_linked', {
        detail: { cardId: formattedId, businessId: business.id },
      })
    )
  }

  return updatedCard
}

/**
 * Unlink a card from its business, resetting it back to 'available'
 */
export async function unlinkCard(cardId) {
  const formattedId = formatCardId(cardId)
  const card = await idbGetCard(formattedId)
  if (!card) return null

  const updatedCard = {
    ...card,
    business_id: null,
    status: 'available',
    updated_at: new Date().toISOString(),
  }

  await idbSaveCard(updatedCard)

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('nfc_cards').upsert(updatedCard, { onConflict: 'card_id' })
    } catch {}
  }

  // Reset legacy page record as well
  try {
    const legacyPage = {
      page_id: formattedId,
      card_number: formattedId,
      status: 'available',
      business_name: '',
      welcome_message: '',
      logo_url: '',
      google_review_url: '',
      whatsapp_number: '',
      instagram_url: '',
      footer_brand: 'OMDROPZ',
    }
    await idbSavePage(legacyPage)
  } catch {}

  return updatedCard
}

/**
 * Delete a business and unlink all its cards
 */
export async function deleteBusiness(businessId) {
  const cards = await idbListCards()
  const linked = cards.filter(
    (c) => c.business_id && String(c.business_id).toLowerCase() === String(businessId).toLowerCase()
  )

  // Unlink each card
  for (const c of linked) {
    await unlinkCard(c.card_id)
  }

  await idbDeleteBusiness(businessId)

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('businesses').delete().eq('id', businessId)
    } catch {}
  }

  return true
}

/**
 * Verify Owner Login with Mobile Number and PIN
 */
export async function verifyOwnerLogin(mobileNumber, pin) {
  const cleanPhone = String(mobileNumber || '').replace(/\D/g, '')
  const cleanPin = String(pin || '').trim()

  if (!cleanPhone || !cleanPin) return null

  const businesses = await idbListBusinesses()
  const match = businesses.find((b) => {
    if (!b.owner_access_enabled || !b.owner_phone || !b.owner_pin) return false
    const bPhone = String(b.owner_phone).replace(/\D/g, '')
    const bPin = String(b.owner_pin).trim()
    return bPhone === cleanPhone && bPin === cleanPin
  })

  if (match) {
    // Return sanitized owner profile session
    return {
      businessId: match.id,
      businessName: match.name,
      ownerPhone: match.owner_phone,
    }
  }

  return null
}

/**
 * Reset Owner PIN (Admin action)
 */
export async function resetOwnerPin(businessId, newPin, newPhone = null) {
  const business = await idbGetBusiness(businessId)
  if (!business) throw new Error('Business not found')

  const updates = {
    owner_pin: String(newPin).trim(),
    owner_access_enabled: true,
  }
  if (newPhone) {
    updates.owner_phone = String(newPhone).trim()
  }

  return updateBusiness(businessId, updates)
}
