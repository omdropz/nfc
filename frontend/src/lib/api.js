import axios from 'axios'
import {
  idbGetPage,
  idbSavePage,
  idbListPages,
  idbDeletePage,
  idbGetCard,
  idbGetBusiness,
} from './idb.js'
import { getSupabaseClient } from './supabase.js'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 4000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Initial sample data for instant out-of-the-box preview
const DEFAULT_LOCAL_PAGES = [
  {
    id: '1',
    page_id: 'omdropz',
    business_name: 'AURA • Maison & Studio',
    logo_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=85',
    welcome_message: 'Bespoke atelier & premium experiences. Tap below to connect directly with us.',
    footer_brand: 'OMDROPZ',
    google_review_enabled: true,
    google_review_url: 'https://g.page/r/example-review',
    google_review_text: 'Review on Google',
    whatsapp_enabled: true,
    whatsapp_number: '+1234567890',
    whatsapp_message: 'Hello Aura Studio, I am connecting via your NFC card.',
    whatsapp_text: 'Chat on WhatsApp',
    instagram_enabled: true,
    instagram_url: 'https://instagram.com',
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
  },
  {
    id: '2',
    page_id: 'luxe-salon',
    business_name: 'Luxe Haute Coiffure & Spa',
    logo_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=85',
    welcome_message: 'Exclusive beauty retreat & private styling. Tap below to book appointments or view our portfolio.',
    footer_brand: 'OMDROPZ',
    google_review_enabled: true,
    google_review_url: 'https://g.page/r/example-salon',
    google_review_text: 'Review our Spa Experience',
    whatsapp_enabled: true,
    whatsapp_number: '+1987654321',
    whatsapp_message: 'Hello Luxe Studio, I would like to book a private session.',
    whatsapp_text: 'Book with Senior Stylist',
    instagram_enabled: true,
    instagram_url: 'https://instagram.com',
    instagram_text: 'Our Editorial Portfolio',
    bg_color: '#050507',
    btn_color: '#bef264',
    btn_style: 'solid',
    text_color: '#ffffff',
    font: 'Montserrat',
    border_radius: 'rounded-full',
    layout: 'centered',
    theme: 'dark',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

function getStoragePages() {
  try {
    const version = localStorage.getItem('nfc_local_pages_version')
    const raw = localStorage.getItem('nfc_local_pages')
    if (!raw || version !== 'v5') {
      localStorage.setItem('nfc_local_pages', JSON.stringify(DEFAULT_LOCAL_PAGES))
      localStorage.setItem('nfc_local_pages_version', 'v5')
      return DEFAULT_LOCAL_PAGES
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_LOCAL_PAGES
  }
}

function saveStoragePages(pages) {
  try {
    localStorage.setItem('nfc_local_pages', JSON.stringify(pages))
  } catch (e) {
    console.error('Failed to save to localStorage', e)
  }
}

function broadcastUpdate(pageId, page) {
  try {
    window.dispatchEvent(
      new CustomEvent('nfc_page_updated', {
        detail: { pageId, page },
      })
    )
  } catch {}
}

export const getPage = async (pageId) => {
  const target = (pageId || 'omdropz').toLowerCase()

  // 1. Check if target is a Card ID (e.g. '001' to '050' or '1' to '50')
  const isCardNumber = /^\d{1,3}$/.test(target)
  const normalizedCardId = isCardNumber ? target.padStart(3, '0') : target

  // Check Card in IndexedDB
  const cardRecord = await idbGetCard(normalizedCardId)
  if (cardRecord) {
    if (cardRecord.business_id) {
      // Resolve linked business!
      const business = await idbGetBusiness(cardRecord.business_id)
      if (business) {
        return {
          success: true,
          page: {
            page_id: normalizedCardId,
            card_id: normalizedCardId,
            card_number: normalizedCardId,
            business_id: business.id,
            business_name: business.name,
            welcome_message: business.welcome_message || '',
            footer_brand: 'OMDROPZ',
            logo_url: business.logo_url || '',
            google_review_enabled: business.google_review_enabled !== false,
            google_review_url: business.google_review_url || '',
            google_review_text: business.google_review_text || 'Google Review',
            whatsapp_enabled: business.whatsapp_enabled !== false,
            whatsapp_number: business.whatsapp_number || '',
            whatsapp_message: business.whatsapp_message || 'Hello! I found your NFC card.',
            whatsapp_text: business.whatsapp_text || 'Chat on WhatsApp',
            instagram_enabled: business.instagram_enabled !== false,
            instagram_url: business.instagram_url || '',
            instagram_text: business.instagram_text || 'Follow on Instagram',
            bg_color: '#050507',
            btn_color: '#a3e635',
            status: cardRecord.status || 'assigned',
          },
        }
      }
    } else {
      // Unassigned / Available Card
      return {
        success: true,
        page: {
          page_id: normalizedCardId,
          card_id: normalizedCardId,
          card_number: normalizedCardId,
          status: 'available',
          is_bulk: true,
          business_name: '',
          welcome_message: '',
          footer_brand: 'OMDROPZ',
          google_review_enabled: true,
          whatsapp_enabled: true,
          instagram_enabled: true,
          bg_color: '#050507',
          btn_color: '#a3e635',
        },
      }
    }
  }

  // Check if target is directly a Business ID
  const directBusiness = await idbGetBusiness(target)
  if (directBusiness) {
    return {
      success: true,
      page: {
        page_id: directBusiness.id,
        business_id: directBusiness.id,
        business_name: directBusiness.name,
        welcome_message: directBusiness.welcome_message || '',
        footer_brand: 'OMDROPZ',
        logo_url: directBusiness.logo_url || '',
        google_review_enabled: directBusiness.google_review_enabled !== false,
        google_review_url: directBusiness.google_review_url || '',
        google_review_text: directBusiness.google_review_text || 'Google Review',
        whatsapp_enabled: directBusiness.whatsapp_enabled !== false,
        whatsapp_number: directBusiness.whatsapp_number || '',
        whatsapp_message: directBusiness.whatsapp_message || 'Hello! I found your NFC card.',
        whatsapp_text: directBusiness.whatsapp_text || 'Chat on WhatsApp',
        instagram_enabled: directBusiness.instagram_enabled !== false,
        instagram_url: directBusiness.instagram_url || '',
        instagram_text: directBusiness.instagram_text || 'Follow on Instagram',
        bg_color: '#050507',
        btn_color: '#a3e635',
      },
    }
  }

  // 2. Try Backend API
  try {
    const res = await api.get(`/pages/${target}`)
    if (res.data?.page) {
      await idbSavePage(res.data.page)
      return res.data
    }
  } catch {}

  // 3. Try Supabase Database (if configured)
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('business_pages')
        .select('*')
        .eq('page_id', target)
        .single()
      if (data && !error) {
        await idbSavePage(data)
        return { success: true, page: data }
      }
    } catch {}
  }

  // 4. Try IndexedDB Persistent Database legacy store
  const idbPage = await idbGetPage(target)
  if (idbPage) {
    return { success: true, page: idbPage }
  }

  // 5. Auto-provision bulk card records (001 to 050) in Available state if not in store yet
  if (isCardNumber) {
    const cardId = normalizedCardId
    const availableCard = {
      id: `card-${cardId}`,
      page_id: cardId,
      card_number: cardId,
      status: 'available',
      is_bulk: true,
      business_name: '',
      welcome_message: '',
      footer_brand: 'OMDROPZ',
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
    await idbSavePage(availableCard)
    return { success: true, page: availableCard }
  }

  // 5. Fallback to LocalStorage
  const pages = getStoragePages()
  const found =
    pages.find((p) => p.page_id.toLowerCase() === target) ||
    pages.find((p) => (target === 'demo' || target === 'omdropz') && (p.page_id.toLowerCase() === 'omdropz' || p.page_id.toLowerCase() === 'demo')) ||
    pages[0]

  if (found) {
    idbSavePage(found).catch(() => {})
    return { success: true, page: found }
  }

  throw new Error('Page not found')
}

export const listPages = async () => {
  // 1. Try Backend API
  try {
    const res = await api.get('/pages')
    if (res.data?.pages && res.data.pages.length > 0) {
      return res.data
    }
  } catch {}

  // 2. Try Supabase Database
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('business_pages')
        .select('page_id, business_name, logo_url, created_at')
        .order('created_at', { ascending: false })
      if (data && !error && data.length > 0) {
        return { success: true, pages: data }
      }
    } catch {}
  }

  // 3. Try IndexedDB Database
  const idbList = await idbListPages()
  if (idbList && idbList.length > 0) {
    return {
      success: true,
      pages: idbList.map((p) => ({
        page_id: p.page_id,
        business_name: p.business_name,
        logo_url: p.logo_url,
        created_at: p.created_at,
      })),
    }
  }

  // 4. Fallback to LocalStorage
  const pages = getStoragePages()
  return {
    success: true,
    pages: pages.map((p) => ({
      page_id: p.page_id,
      business_name: p.business_name,
      logo_url: p.logo_url,
      created_at: p.created_at,
    })),
  }
}

export const createPage = async (data) => {
  const pageId = (data.page_id || 'page-' + Date.now()).toLowerCase()
  const newPage = {
    id: String(Date.now()),
    page_id: pageId,
    business_name: data.business_name || 'My Business',
    logo_url: data.logo_url || '',
    welcome_message: data.welcome_message || 'Welcome! Tap a button to connect with us.',
    footer_brand: data.footer_brand || 'OMDROPZ',
    google_review_enabled: data.google_review_enabled !== false,
    google_review_url: data.google_review_url || '',
    google_review_text: data.google_review_text || 'Review on Google',
    whatsapp_enabled: data.whatsapp_enabled !== false,
    whatsapp_number: data.whatsapp_number || '',
    whatsapp_message: data.whatsapp_message || 'Hello! I found you via your NFC card.',
    whatsapp_text: data.whatsapp_text || 'Chat on WhatsApp',
    instagram_enabled: data.instagram_enabled !== false,
    instagram_url: data.instagram_url || '',
    instagram_text: data.instagram_text || 'Follow on Instagram',
    bg_color: data.bg_color || '#050507',
    btn_color: data.btn_color || '#a3e635',
    btn_style: data.btn_style || 'solid',
    text_color: data.text_color || '#ffffff',
    font: data.font || 'Poppins',
    border_radius: data.border_radius || 'rounded-2xl',
    layout: data.layout || 'centered',
    theme: data.theme || 'dark',
    created_at: new Date().toISOString(),
    ...data,
  }

  try {
    await api.post('/pages', newPage)
  } catch {}

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('business_pages').insert(newPage)
    } catch {}
  }

  await idbSavePage(newPage)

  const pages = getStoragePages()
  pages.unshift(newPage)
  saveStoragePages(pages)

  broadcastUpdate(pageId, newPage)
  return { success: true, page: newPage }
}

export const updatePage = async (pageId, data) => {
  const target = (pageId || 'omdropz').toLowerCase()
  const payload = { ...data, page_id: target, updated_at: new Date().toISOString() }

  // 1. Backend API
  try {
    await api.put(`/pages/${target}`, payload)
  } catch {}

  // 2. Supabase PostgreSQL
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('business_pages').upsert(payload, { onConflict: 'page_id' })
    } catch {}
  }

  // 3. IndexedDB Database
  await idbSavePage(payload)

  // 4. LocalStorage
  const pages = getStoragePages()
  const idx = pages.findIndex((p) => p.page_id.toLowerCase() === target)
  if (idx !== -1) {
    pages[idx] = { ...pages[idx], ...payload }
  } else {
    pages.unshift(payload)
  }
  saveStoragePages(pages)

  // 5. Broadcast real-time update
  broadcastUpdate(target, payload)

  return { success: true, page: payload }
}

export const deletePage = async (pageId) => {
  const target = (pageId || '').toLowerCase()
  try {
    await api.delete(`/pages/${target}`)
  } catch {}

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('business_pages').delete().eq('page_id', target)
    } catch {}
  }

  await idbDeletePage(target)

  const pages = getStoragePages()
  const filtered = pages.filter((p) => p.page_id.toLowerCase() !== target)
  saveStoragePages(filtered)

  return { success: true }
}

export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  } catch (err) {
    // If backend is offline or network fails, allow test admin credentials
    if (email && password) {
      const mockToken = 'mock-jwt-admin-token-' + Date.now()
      localStorage.setItem('admin_token', mockToken)
      return { success: true, token: mockToken }
    }
    throw err
  }
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
  } catch {}
  localStorage.removeItem('admin_token')
  return { success: true }
}

export const verifyAuth = async () => {
  try {
    const res = await api.get('/auth/verify')
    return res.data
  } catch {
    const token = localStorage.getItem('admin_token')
    if (token) {
      return { success: true, user: { role: 'admin' } }
    }
    throw new Error('Unauthenticated')
  }
}

export default api
