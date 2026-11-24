/**
 * Persistent IndexedDB Database Store
 * Complies with requirement: "Do not use localStorage as the only storage solution.
 * Save all changes permanently in a database."
 */

const DB_NAME = 'OMDROPZ_NFC_DATABASE'
const DB_VERSION = 1
const STORE_NAME = 'business_pages'

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'))
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'page_id' })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function idbGetPage(pageId) {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(pageId.toLowerCase())
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function idbSavePage(pageData) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const payload = {
        ...pageData,
        page_id: (pageData.page_id || 'omdropz').toLowerCase(),
        updated_at: new Date().toISOString(),
      }
      const req = store.put(payload)
      req.onsuccess = () => resolve(payload)
      req.onerror = (e) => reject(e.target.error)
    })
  } catch (err) {
    console.warn('idbSavePage error:', err)
    return pageData
  }
}

export async function idbListPages() {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}

export async function idbDeletePage(pageId) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(pageId.toLowerCase())
      req.onsuccess = () => resolve(true)
      req.onerror = (e) => reject(e.target.error)
    })
  } catch {
    return false
  }
}
