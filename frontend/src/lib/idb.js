/**
 * Persistent IndexedDB Database Store
 * Multi-store transactional database for NFC Cards and Businesses
 */

const DB_NAME = 'OMDROPZ_NFC_DATABASE'
const DB_VERSION = 2
const STORE_PAGES = 'business_pages'
const STORE_CARDS = 'nfc_cards'
const STORE_BUSINESSES = 'businesses'

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'))
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_PAGES)) {
        db.createObjectStore(STORE_PAGES, { keyPath: 'page_id' })
      }
      if (!db.objectStoreNames.contains(STORE_CARDS)) {
        db.createObjectStore(STORE_CARDS, { keyPath: 'card_id' })
      }
      if (!db.objectStoreNames.contains(STORE_BUSINESSES)) {
        db.createObjectStore(STORE_BUSINESSES, { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

// ── Generic store helpers ──

async function getFromStore(storeName, key) {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.get(String(key).toLowerCase())
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function putToStore(storeName, item, keyField = 'id') {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const keyVal = String(item[keyField] || '').toLowerCase()
      const payload = {
        ...item,
        [keyField]: keyVal,
        updated_at: new Date().toISOString(),
      }
      const req = store.put(payload)
      req.onsuccess = () => resolve(payload)
      req.onerror = (e) => reject(e.target.error)
    })
  } catch (err) {
    console.warn(`putToStore ${storeName} error:`, err)
    return item
  }
}

async function getAllFromStore(storeName) {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}

async function deleteFromStore(storeName, key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.delete(String(key).toLowerCase())
      req.onsuccess = () => resolve(true)
      req.onerror = (e) => reject(e.target.error)
    })
  } catch {
    return false
  }
}

// ── Cards API ──
export const idbGetCard = (cardId) => getFromStore(STORE_CARDS, cardId)
export const idbSaveCard = (card) => putToStore(STORE_CARDS, card, 'card_id')
export const idbListCards = () => getAllFromStore(STORE_CARDS)
export const idbDeleteCard = (cardId) => deleteFromStore(STORE_CARDS, cardId)

// ── Businesses API ──
export const idbGetBusiness = (bizId) => getFromStore(STORE_BUSINESSES, bizId)
export const idbSaveBusiness = (biz) => putToStore(STORE_BUSINESSES, biz, 'id')
export const idbListBusinesses = () => getAllFromStore(STORE_BUSINESSES)
export const idbDeleteBusiness = (bizId) => deleteFromStore(STORE_BUSINESSES, bizId)

// ── Legacy Pages API (backward-compatibility) ──
export const idbGetPage = (pageId) => getFromStore(STORE_PAGES, pageId)
export const idbSavePage = (pageData) => putToStore(STORE_PAGES, pageData, 'page_id')
export const idbListPages = () => getAllFromStore(STORE_PAGES)
export const idbDeletePage = (pageId) => deleteFromStore(STORE_PAGES, pageId)
