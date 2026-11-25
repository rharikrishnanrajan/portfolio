import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function readEnv(): { url: string; anonKey: string } {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error('Missing required environment variable: VITE_SUPABASE_URL')
  }
  if (!anonKey || typeof anonKey !== 'string' || !anonKey.trim()) {
    throw new Error('Missing required environment variable: VITE_SUPABASE_ANON_KEY')
  }

  return { url: url.trim(), anonKey: anonKey.trim() }
}

let cachedClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient
  const { url, anonKey } = readEnv()
  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  })
  return cachedClient
}

export function getSupabaseUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL
  return typeof url === 'string' ? url.trim() : ''
}
