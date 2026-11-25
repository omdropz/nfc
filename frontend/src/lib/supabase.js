import { createClient } from '@supabase/supabase-js'

export function getSupabaseCredentials() {
  const url =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('nfc_supabase_url')) ||
    ''
  const anonKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('nfc_supabase_anon_key')) ||
    ''
  return { url: url.trim(), anonKey: anonKey.trim() }
}

export function saveSupabaseCredentials(url, anonKey) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('nfc_supabase_url', url.trim())
    } else {
      localStorage.removeItem('nfc_supabase_url')
    }

    if (anonKey && anonKey.trim()) {
      localStorage.setItem('nfc_supabase_anon_key', anonKey.trim())
    } else {
      localStorage.removeItem('nfc_supabase_anon_key')
    }
  }
}

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseCredentials()
  if (!url || !anonKey) return null
  try {
    return createClient(url, anonKey, {
      auth: { persistSession: false },
    })
  } catch (err) {
    console.warn('Supabase client initialization error:', err)
    return null
  }
}

export async function testSupabaseConnection(url, anonKey) {
  if (!url || !anonKey) {
    return { ok: false, message: 'URL and Anon Key are both required.' }
  }
  try {
    const client = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false },
    })
    const { error } = await client.from('nfc_cards').select('card_id').limit(1)
    if (error) {
      return { ok: false, message: error.message || 'Failed to query nfc_cards table' }
    }
    return { ok: true, message: 'Connected successfully to Supabase!' }
  } catch (err) {
    return { ok: false, message: err.message || 'Connection test failed' }
  }
}
