import {
  idbGetCard,
  idbSaveCard,
  idbListCards,
  idbGetBusiness,
  idbSaveBusiness,
  idbListBusinesses,
  idbDeleteBusiness,
  idbDeleteCard,
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

/**
 * Flexible card ID formatter:
 * 1 -> '001', 50 -> '050', 100 -> '100', 1000 -> '1000'
 * Preserves alphanumeric IDs as-is.
 */
export function formatCardId(val) {
  const str = String(val ?? '').trim()
  if (/^\d+$/.test(str)) {
    return str.length < 3 ? str.padStart(3, '0') : str
  }
  return str
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
 * Determines the next sequential numeric Card ID.
 * Example: if cards 001..050 exist, returns '051'.
 */
export async function getNextCardId() {
  const existingCards = await idbListCards()
  if (!existingCards || existingCards.length === 0) {
    return '001'
  }

  let maxNum = 0
  existingCards.forEach((c) => {
    const rawId = String(c.card_id || '').trim()
    if (/^\d+$/.test(rawId)) {
      const num = parseInt(rawId, 10)
      if (num > maxNum) maxNum = num
    }
  })

  return formatCardId(maxNum + 1)
}

/**
 * Initialize system storage.
 * If database is completely fresh, seeds an initial batch (001 to 050) for immediate use.
 * Never caps or resets existing cards.
 */
export async function initBusinessStore(baseUrl = DEFAULT_BASE_URL) {
  const existingCards = await idbListCards()
  if (existingCards && existingCards.length > 0) {
    return existingCards
  }

  // Fresh setup: seed initial batch
  const initialCards = []
  const supabase = getSupabaseClient()

  for (let i = 1; i <= 50; i++) {
    const cardId = formatCardId(i)
    const permanentUrl = generateCardUrl(cardId, baseUrl)
    const newCard = {
      card_id: cardId,
      card_number: cardId,
      status: 'available', // 'available' | 'assigned' | 'linked' | 'active'
      nfc_status: 'not_programmed', // 'not_programmed' | 'programmed' | 'tested'
      business_id: null,
      permanent_url: permanentUrl,
      nfc_url: permanentUrl,
      qrhub_qr_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    initialCards.push(newCard)
    await idbSaveCard(newCard)

    if (supabase) {
      try {
        await supabase.from('nfc_cards').upsert(newCard, { onConflict: 'card_id' })
      } catch {}
    }
  }

  return initialCards
}

/**
 * Create a single new NFC Card with an automatically or custom generated Card ID.
 * Unlimited card support.
 */
export async function createCard(customCardId = null, baseUrl = DEFAULT_BASE_URL) {
  const cardId = customCardId ? formatCardId(customCardId) : await getNextCardId()
  const permanentUrl = generateCardUrl(cardId, baseUrl)
  const now = new Date().toISOString()

  const newCard = {
    card_id: cardId,
    card_number: cardId,
    status: 'available',
    nfc_status: 'not_programmed',
    business_id: null,
    permanent_url: permanentUrl,
    nfc_url: permanentUrl,
    qrhub_qr_id: null,
    created_at: now,
    updated_at: now,
  }

  await idbSaveCard(newCard)

  // Sync to Supabase
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('nfc_cards').upsert(newCard, { onConflict: 'card_id' })
    } catch (err) {
      console.warn('Supabase createCard sync warning:', err)
    }
  }

  // Dispatch real-time event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nfc_card_created', { detail: { card: newCard } }))
  }

  return newCard
}

/**
 * Bulk create any quantity of NFC Cards (e.g. 10, 50, 100, 500 or more).
 * Calculates sequential IDs and persists each card.
 */
export async function bulkCreateCards(quantity, baseUrl = DEFAULT_BASE_URL, onProgress = null) {
  const count = parseInt(quantity, 10)
  if (isNaN(count) || count <= 0) {
    throw new Error('Quantity must be a positive integer')
  }

  const existingCards = await idbListCards()
  let maxNum = 0
  existingCards.forEach((c) => {
    const rawId = String(c.card_id || '').trim()
    if (/^\d+$/.test(rawId)) {
      const num = parseInt(rawId, 10)
      if (num > maxNum) maxNum = num
    }
  })

  const newCards = []
  const supabase = getSupabaseClient()
  const now = new Date().toISOString()

  for (let i = 1; i <= count; i++) {
    const nextNum = maxNum + i
    const cardId = formatCardId(nextNum)
    const permanentUrl = generateCardUrl(cardId, baseUrl)

    const card = {
      card_id: cardId,
      card_number: cardId,
      status: 'available',
      nfc_status: 'not_programmed',
      business_id: null,
      permanent_url: permanentUrl,
      nfc_url: permanentUrl,
      qrhub_qr_id: null,
      created_at: now,
      updated_at: now,
    }

    newCards.push(card)
    await idbSaveCard(card)

    if (onProgress && (i % 25 === 0 || i === count)) {
      onProgress(i, count)
    }
  }

  // Batch sync to Supabase if connected
  if (supabase) {
    try {
      // Chunk upserts in batches of 100
      for (let i = 0; i < newCards.length; i += 100) {
        const batch = newCards.slice(i, i + 100)
        await supabase.from('nfc_cards').upsert(batch, { onConflict: 'card_id' })
      }
    } catch (err) {
      console.warn('Supabase bulkCreateCards sync warning:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nfc_cards_bulk_created', { detail: { count, cards: newCards } }))
  }

  return newCards
}

/**
 * Delete a card (only allowed if unassigned or explicitly requested)
 */
export async function deleteCardRecord(cardId) {
  const formattedId = formatCardId(cardId)
  await idbDeleteCard(formattedId)

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('nfc_cards').delete().eq('card_id', formattedId)
    } catch {}
  }
  return true
}

/**
 * Update NFC Hardware Programming Status:
 * - 'not_programmed'
 * - 'programmed'
 * - 'tested'
 * Requirement 10: Admin must explicitly confirm after physically writing and testing.
 */
export async function updateCardNfcStatus(cardId, nfcStatus) {
  const formattedId = formatCardId(cardId)
  const card = await idbGetCard(formattedId)
  if (!card) throw new Error(`Card ${cardId} not found`)

  const valid = ['not_programmed', 'programmed', 'tested']
  if (!valid.includes(nfcStatus)) {
    throw new Error(`Invalid NFC status: ${nfcStatus}`)
  }

  const now = new Date().toISOString()
  const updated = {
    ...card,
    nfc_status: nfcStatus,
    nfc_programmed_at: nfcStatus !== 'not_programmed' ? (card.nfc_programmed_at || now) : null,
    nfc_tested_at: nfcStatus === 'tested' ? now : (nfcStatus === 'not_programmed' ? null : card.nfc_tested_at),
    updated_at: now,
  }

  await idbSaveCard(updated)

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('nfc_cards').upsert(updated, { onConflict: 'card_id' })
    } catch (err) {
      console.warn('Supabase updateCardNfcStatus warning:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nfc_card_status_updated', {
        detail: { cardId: formattedId, nfc_status: nfcStatus, card: updated },
      })
    )
  }

  return updated
}

/**
 * Get all cards (with populated business data)
 */
export async function getAllCards(baseUrl = DEFAULT_BASE_URL) {
  let cards = await idbListCards()
  if (!cards || cards.length === 0) {
    cards = await initBusinessStore(baseUrl)
  }

  // Sort natural numeric order or alphanumeric
  cards.sort((a, b) => {
    const numA = parseInt(a.card_id, 10)
    const numB = parseInt(b.card_id, 10)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return String(a.card_id).localeCompare(String(b.card_id))
  })

  const businesses = await idbListBusinesses()
  const bizMap = new Map()
  businesses.forEach((b) => {
    if (b.id) bizMap.set(String(b.id).toLowerCase(), b)
  })

  return cards.map((c) => {
    const biz = c.business_id ? bizMap.get(String(c.business_id).toLowerCase()) : null
    return {
      ...c,
      nfc_status: c.nfc_status || 'not_programmed',
      business: biz || null,
      business_name: biz ? biz.name : '',
    }
  })
}

/**
 * Scalable paginated cards query with search and status filter.
 * Ensures the dashboard stays fast even with thousands of cards.
 */
export async function getCardsPaginated({
  page = 1,
  pageSize = 25,
  search = '',
  status = 'all',
  baseUrl = DEFAULT_BASE_URL,
}) {
  const allCards = await getAllCards(baseUrl)

  // Overall metrics across ALL cards
  const metrics = {
    totalCards: allCards.length,
    availableCards: allCards.filter((c) => c.status === 'available' || !c.business_id).length,
    assignedCards: allCards.filter((c) => c.status === 'assigned' || c.status === 'linked' || c.status === 'active').length,
    linkedCards: allCards.filter((c) => c.status === 'linked').length,
  }

  const query = search.trim().toLowerCase()

  const filtered = allCards.filter((c) => {
    const matchesSearch =
      !query ||
      String(c.card_id).toLowerCase().includes(query) ||
      (c.business_name && c.business_name.toLowerCase().includes(query)) ||
      (c.business_id && String(c.business_id).toLowerCase().includes(query))

    if (!matchesSearch) return false

    if (status === 'available') return c.status === 'available' || !c.business_id
    if (status === 'assigned') return c.status === 'assigned'
    if (status === 'linked') return c.status === 'linked'
    if (status === 'active') return c.status === 'active'

    return true
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const items = filtered.slice(startIndex, startIndex + pageSize)

  return {
    items,
    total,
    totalPages,
    currentPage,
    pageSize,
    metrics,
  }
}

/**
 * Get a single card and its linked business details
 */
export async function getCardById(cardId, baseUrl = DEFAULT_BASE_URL) {
  const formattedId = formatCardId(cardId)
  let card = await idbGetCard(formattedId)

  if (!card) {
    card = await idbGetCard(String(cardId).toLowerCase())
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
 * Get all businesses with their linked cards array (Unlimited businesses)
 */
export async function getAllBusinesses() {
  const businesses = await idbListBusinesses()
  const cards = await idbListCards()

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
    linkedCards.sort((x, y) => {
      const numX = parseInt(x, 10)
      const numY = parseInt(y, 10)
      if (!isNaN(numX) && !isNaN(numY)) return numX - numY
      return String(x).localeCompare(String(y))
    })
    return {
      ...b,
      linkedCards,
      cardCount: linkedCards.length,
    }
  })
}

/**
 * Scalable paginated businesses query with search
 */
export async function getBusinessesPaginated({ page = 1, pageSize = 25, search = '' }) {
  const allBiz = await getAllBusinesses()
  const query = search.trim().toLowerCase()

  const filtered = allBiz.filter((b) => {
    if (!query) return true
    return (
      (b.name && b.name.toLowerCase().includes(query)) ||
      (b.category && b.category.toLowerCase().includes(query)) ||
      (b.id && String(b.id).toLowerCase().includes(query))
    )
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const items = filtered.slice(startIndex, startIndex + pageSize)

  return {
    items,
    total,
    totalPages,
    currentPage,
    pageSize,
  }
}

/**
 * Get single business by ID
 */
export async function getBusinessById(businessId) {
  if (!businessId) return null
  return idbGetBusiness(businessId)
}

/**
 * Create a new business and optionally link a card.
 * Unlimited businesses supported.
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
    owner_phone: data.owner_phone ? String(data.owner_phone).trim() : '',
    owner_pin: data.owner_pin ? String(data.owner_pin).trim() : '',
    owner_access_enabled: Boolean(data.owner_access_enabled && data.owner_phone && data.owner_pin),
    created_at: now,
    updated_at: now,
  }

  await idbSaveBusiness(newBusiness)

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('businesses').upsert(newBusiness, { onConflict: 'id' })
    } catch (err) {
      console.warn('Supabase createBusiness sync warning:', err)
    }
  }

  if (initialCardId) {
    await linkCardToBusiness(initialCardId, bizId, baseUrl)
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nfc_business_updated', { detail: { business: newBusiness } }))
  }

  return newBusiness
}

/**
 * Update business details (ONLY business info and toggles - design remains untouched)
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
    ...(updates.owner_phone !== undefined && { owner_phone: updates.owner_phone }),
    ...(updates.owner_pin !== undefined && { owner_pin: updates.owner_pin }),
    ...(updates.owner_access_enabled !== undefined && { owner_access_enabled: updates.owner_access_enabled }),
    updated_at: new Date().toISOString(),
  }

  await idbSaveBusiness(updated)

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
 * Link an NFC Card to a Business.
 * One business can have multiple cards linked to it.
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

  const allCards = await idbListCards()
  const alreadyLinkedCount = allCards.filter(
    (c) => c.business_id && String(c.business_id).toLowerCase() === String(businessId).toLowerCase()
  ).length

  const newStatus = alreadyLinkedCount === 0 ? 'assigned' : 'linked'

  const updatedCard = {
    ...card,
    business_id: business.id,
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  await idbSaveCard(updatedCard)

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('nfc_cards').upsert(updatedCard, { onConflict: 'card_id' })
    } catch (err) {
      console.warn('Supabase linkCardToBusiness warning:', err)
    }
  }

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
 * Unlink a card, returning it to 'available' state
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
 * Delete a business and unlink all its attached cards
 */
export async function deleteBusiness(businessId) {
  const cards = await idbListCards()
  const linked = cards.filter(
    (c) => c.business_id && String(c.business_id).toLowerCase() === String(businessId).toLowerCase()
  )

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
