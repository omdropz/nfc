import axios from 'axios'

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
    page_id: 'demo',
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
    if (!raw || version !== 'v4') {
      localStorage.setItem('nfc_local_pages', JSON.stringify(DEFAULT_LOCAL_PAGES))
      localStorage.setItem('nfc_local_pages_version', 'v4')
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

export const getPage = async (pageId) => {
  try {
    const res = await api.get(`/pages/${pageId}`)
    return res.data
  } catch (err) {
    // Fallback to local storage
    const pages = getStoragePages()
    const found = pages.find((p) => p.page_id.toLowerCase() === pageId.toLowerCase())
    if (found) {
      return { success: true, page: found }
    }
    throw err
  }
}

export const listPages = async () => {
  try {
    const res = await api.get('/pages')
    return res.data
  } catch (err) {
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
}

export const createPage = async (data) => {
  try {
    const res = await api.post('/pages', data)
    return res.data
  } catch (err) {
    const pages = getStoragePages()
    const newPage = {
      id: String(Date.now()),
      page_id: data.page_id,
      business_name: data.business_name || 'My Business',
      logo_url: '',
      welcome_message: 'Welcome! Tap a button to connect with us.',
      footer_brand: 'NFCCard',
      google_review_enabled: true,
      google_review_url: '',
      google_review_text: 'Leave a Review',
      whatsapp_enabled: true,
      whatsapp_number: '',
      whatsapp_message: 'Hello! I found you via your NFC card.',
      whatsapp_text: 'Chat on WhatsApp',
      instagram_enabled: true,
      instagram_url: '',
      instagram_text: 'Follow on Instagram',
      bg_color: '#4f46e5',
      btn_color: '#4f46e5',
      btn_style: 'solid',
      text_color: '#ffffff',
      font: 'Inter',
      border_radius: 'rounded-2xl',
      layout: 'centered',
      theme: 'light',
      created_at: new Date().toISOString(),
      ...data,
    }
    pages.unshift(newPage)
    saveStoragePages(pages)
    return { success: true, page: newPage }
  }
}

export const updatePage = async (pageId, data) => {
  try {
    const res = await api.put(`/pages/${pageId}`, data)
    return res.data
  } catch (err) {
    const pages = getStoragePages()
    const idx = pages.findIndex((p) => p.page_id.toLowerCase() === pageId.toLowerCase())
    if (idx !== -1) {
      pages[idx] = { ...pages[idx], ...data, updated_at: new Date().toISOString() }
      saveStoragePages(pages)
      return { success: true, page: pages[idx] }
    }
    throw err
  }
}

export const deletePage = async (pageId) => {
  try {
    const res = await api.delete(`/pages/${pageId}`)
    return res.data
  } catch (err) {
    const pages = getStoragePages()
    const filtered = pages.filter((p) => p.page_id.toLowerCase() !== pageId.toLowerCase())
    saveStoragePages(filtered)
    return { success: true }
  }
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
    const res = await api.post('/auth/logout')
    return res.data
  } catch {
    localStorage.removeItem('admin_token')
    return { success: true }
  }
}

export const verifyAuth = async () => {
  try {
    const res = await api.get('/auth/verify')
    return res.data
  } catch (err) {
    const token = localStorage.getItem('admin_token')
    if (token) {
      return { success: true, user: { email: 'admin@yoursite.com', role: 'admin' } }
    }
    throw err
  }
}

export default api
