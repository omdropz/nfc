import { createClient } from '@supabase/supabase-js'

export function getSupabaseCredentials() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem('nfc_supabase_url') ||
    ''
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem('nfc_supabase_anon_key') ||
    ''
  return { url: url.trim(), anonKey: anonKey.trim() }
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
