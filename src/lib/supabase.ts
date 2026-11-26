import type { RealtimeClient } from '@supabase/realtime-js'

export const CONTACT_TIMEOUT_MS = 15_000

export interface RpcFetchResult {
  ok: boolean
  status: number
  data: unknown
}

export interface ContactMessageInput {
  name: string
  email: string
  subject: string | null
  body: string
}

export type ContactInsertErrorKind = 'rate_limit' | 'validation' | 'network' | 'generic'

export interface ContactInsertResult {
  ok: boolean
  status: number
  errorKind?: ContactInsertErrorKind
}

export interface ContentVersionSubscriptionHandlers {
  onUpdate: (version: number) => void
  onStatus: (status: string) => void
}

export interface PublicSupabaseClient {
  fetchSiteContentRpc: (signal?: AbortSignal) => Promise<RpcFetchResult>
  insertContactMessage: (
    payload: ContactMessageInput,
    signal?: AbortSignal,
  ) => Promise<ContactInsertResult>
  subscribeContentVersion: (
    handlers: ContentVersionSubscriptionHandlers,
  ) => Promise<() => Promise<void>>
}

export interface SupabaseClientConfig {
  url: string
  anonKey: string
  fetchFn?: typeof fetch
  timeoutMs?: number
  realtimeFactory?: (
    endpoint: string,
    options: {
      params: { apikey: string; eventsPerSecond: number }
      sessionStorage: Storage
    },
  ) => RealtimeClient
}

function createMemorySessionStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
  }
}

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

function normalizeBaseUrl(rawUrl: string): URL {
  const parsed = new URL(rawUrl)
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Invalid VITE_SUPABASE_URL protocol')
  }
  return parsed
}

function classifyContactError(status: number, rawBody: string): ContactInsertErrorKind {
  let code = ''
  let message = rawBody
  if (rawBody) {
    try {
      const parsed: unknown = JSON.parse(rawBody)
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as { code?: unknown; message?: unknown }
        if (typeof obj.code === 'string') code = obj.code
        if (typeof obj.message === 'string') message = obj.message
      }
    } catch {
      // Non-JSON response body
    }
  }

  if (status === 429 || code === 'P0001' || message.includes('Too many messages')) {
    return 'rate_limit'
  }
  if (status === 400 || code === '23514') {
    return 'validation'
  }
  return 'generic'
}

export function createPublicSupabaseClient(config: SupabaseClientConfig): PublicSupabaseClient {
  const baseUrl = normalizeBaseUrl(config.url)
  const anonKey = config.anonKey.trim()
  if (!anonKey) {
    throw new Error('Missing required environment variable: VITE_SUPABASE_ANON_KEY')
  }

  const rpcEndpoint = new URL('/rest/v1/rpc/get_site_content', baseUrl).toString()
  const messagesEndpoint = new URL('/rest/v1/messages', baseUrl).toString()
  const realtimeUrl = new URL('/realtime/v1', baseUrl)
  realtimeUrl.protocol = realtimeUrl.protocol.replace(/^http/, 'ws')

  const fetchImpl = config.fetchFn ?? fetch
  const contactTimeoutMs = config.timeoutMs ?? CONTACT_TIMEOUT_MS

  return {
    async fetchSiteContentRpc(signal?: AbortSignal): Promise<RpcFetchResult> {
      const response = await fetchImpl(rpcEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: anonKey,
        },
        body: '{}',
        signal,
      })

      if (!response.ok) {
        return { ok: false, status: response.status, data: null }
      }

      try {
        const data: unknown = await response.json()
        return { ok: true, status: response.status, data }
      } catch {
        return { ok: true, status: response.status, data: null }
      }
    },

    async insertContactMessage(
      payload: ContactMessageInput,
      signal?: AbortSignal,
    ): Promise<ContactInsertResult> {
      const controller = new AbortController()
      let timedOut = false
      const timeoutId = window.setTimeout(() => {
        timedOut = true
        controller.abort()
      }, contactTimeoutMs)

      const onExternalAbort = () => controller.abort()
      signal?.addEventListener('abort', onExternalAbort, { once: true })

      try {
        const response = await fetchImpl(messagesEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: anonKey,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        if (response.ok) {
          return { ok: true, status: response.status }
        }

        const rawBody = await response.text().catch(() => '')
        return {
          ok: false,
          status: response.status,
          errorKind: classifyContactError(response.status, rawBody),
        }
      } catch {
        if (signal?.aborted && !timedOut) {
          return { ok: false, status: 0, errorKind: 'generic' }
        }
        return { ok: false, status: 0, errorKind: 'network' }
      } finally {
        window.clearTimeout(timeoutId)
        signal?.removeEventListener('abort', onExternalAbort)
      }
    },

    async subscribeContentVersion(
      handlers: ContentVersionSubscriptionHandlers,
    ): Promise<() => Promise<void>> {
      const options = {
        params: {
          apikey: anonKey,
          eventsPerSecond: 2,
        },
        sessionStorage: createMemorySessionStorage(),
      }

      const client = config.realtimeFactory
        ? config.realtimeFactory(realtimeUrl.href, options)
        : await (async () => {
            const { RealtimeClient: LazyRealtimeClient } = await import('@supabase/realtime-js')
            return new LazyRealtimeClient(realtimeUrl.href, options)
          })()

      const ch = client
        .channel('public:content_version')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'content_version' },
          (payload) => {
            const rawNew = payload.new as { version?: unknown } | null | undefined
            const nextVersion = rawNew?.version
            if (typeof nextVersion === 'number') {
              handlers.onUpdate(nextVersion)
            }
          },
        )
        .subscribe((channelStatus) => {
          handlers.onStatus(String(channelStatus))
        })

      return async () => {
        await client.removeChannel(ch)
      }
    },
  }
}

let cachedClient: PublicSupabaseClient | null = null

export function getSupabaseClient(): PublicSupabaseClient {
  if (cachedClient) return cachedClient
  const { url, anonKey } = readEnv()
  cachedClient = createPublicSupabaseClient({ url, anonKey })
  return cachedClient
}

export function getSupabaseUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL
  return typeof url === 'string' ? url.trim() : ''
}
