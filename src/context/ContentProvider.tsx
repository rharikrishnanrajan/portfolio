import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  fetchSiteContent,
  getSnapshotContent,
  hasMeaningfulContent,
  readCachedContent,
  writeCachedContent,
} from '../lib/content'
import { EMPTY_SITE_CONTENT } from '../lib/schemas'
import {
  getSupabaseClient,
  type ContactInsertResult,
  type ContactMessageInput,
  type PublicSupabaseClient,
} from '../lib/supabase'
import { applyTheme, resolveThemeMode, writeStoredThemeMode } from '../lib/theme'
import type { SiteContent, ThemeMode } from '../types/content'
import {
  ContentContext,
  type ContentContextValue,
  type ContentSource,
  type ContentStatus,
} from './contentContext'
import { cleanupRevealObserver } from '../hooks/useReveal'

export const REALTIME_DEBOUNCE_MS = 500
export const REALTIME_MIN_INTERVAL_MS = 2_000
export const POLL_INTERVAL_MS = 60_000
export const VISIBILITY_STALE_MS = 5 * 60 * 1000
export const CONTENT_UPDATED_DISPLAY_MS = 2000

interface InitialState {
  content: SiteContent
  status: ContentStatus
  source: ContentSource
  hasFallback: boolean
}

function buildInitialState(initialContent?: SiteContent, snapshotOverride?: SiteContent): InitialState {
  if (initialContent) {
    return {
      content: initialContent,
      status: hasMeaningfulContent(initialContent) ? 'ready' : 'empty',
      source: 'live',
      hasFallback: true,
    }
  }

  const cached = readCachedContent()
  if (cached) {
    return {
      content: cached,
      status: hasMeaningfulContent(cached) ? 'ready' : 'empty',
      source: 'cache',
      hasFallback: true,
    }
  }

  const snapshot = snapshotOverride ?? getSnapshotContent()
  if (hasMeaningfulContent(snapshot)) {
    return {
      content: snapshot,
      status: 'ready',
      source: 'snapshot',
      hasFallback: true,
    }
  }

  return {
    content: EMPTY_SITE_CONTENT,
    status: 'loading',
    source: 'none',
    hasFallback: false,
  }
}

function applyDocumentSeo(content: SiteContent): void {
  const title = content.settings.seo.title?.trim() || content.settings.brand_name.trim() || 'Portfolio'
  document.title = title

  const description = content.settings.seo.description?.trim()
  if (description) {
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }
}

export interface ContentProviderProps {
  children: ReactNode
  client?: PublicSupabaseClient
  initialContent?: SiteContent
  snapshotOverride?: SiteContent
  disableLiveUpdates?: boolean
}

export function ContentProvider({
  children,
  client,
  initialContent,
  snapshotOverride,
  disableLiveUpdates = false,
}: ContentProviderProps) {
  const [initial] = useState<InitialState>(() => buildInitialState(initialContent, snapshotOverride))
  const [content, setContent] = useState<SiteContent>(initial.content)
  const [status, setStatus] = useState<ContentStatus>(initial.status)
  const [source, setSource] = useState<ContentSource>(initial.source)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [userThemeOverride, setUserThemeOverride] = useState<ThemeMode | undefined>(() => undefined)
  const [contentUpdateTrigger, setContentUpdateTrigger] = useState<number>(0)

  const hasFallbackRef = useRef<boolean>(initial.hasFallback)
  const currentVersionRef = useRef<number>(initial.content.version)
  const activeAbortRef = useRef<AbortController | null>(null)
  const lastFetchAtRef = useRef<number>(0)
  const mountedRef = useRef<boolean>(true)
  const isInitialLoadRef = useRef<boolean>(true)

  const themeMode: ThemeMode = useMemo(() => {
    if (userThemeOverride) return userThemeOverride
    return resolveThemeMode(content.settings.theme)
  }, [content.settings.theme, userThemeOverride])

  useEffect(() => {
    applyTheme(content.settings.theme, userThemeOverride)
    applyDocumentSeo(content)
  }, [content, userThemeOverride])

  const setThemeMode = useCallback((mode: ThemeMode) => {
    writeStoredThemeMode(mode)
    setUserThemeOverride(mode)
  }, [])

  const toggleThemeMode = useCallback(() => {
    const next: ThemeMode = themeMode === 'dark' ? 'light' : 'dark'
    // A9: Add theme-transition class for smooth color transitions
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('theme-transition')
      // Remove after transition completes
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition')
      }, 350)
    }
    writeStoredThemeMode(next)
    setUserThemeOverride(next)
  }, [themeMode])

  const loadLiveContent = useCallback(
    async (options?: { markLoadingIfEmpty?: boolean; showRefreshing?: boolean }) => {
      if (disableLiveUpdates) return

      let resolvedClient: PublicSupabaseClient
      try {
        resolvedClient = client ?? getSupabaseClient()
      } catch {
        if (!hasFallbackRef.current && mountedRef.current) {
          setStatus('unavailable')
        }
        return
      }

      activeAbortRef.current?.abort()
      const controller = new AbortController()
      activeAbortRef.current = controller

      if (options?.markLoadingIfEmpty && !hasFallbackRef.current) {
        setStatus('loading')
      }
      if (options?.showRefreshing) {
        setIsRefreshing(true)
      }
      lastFetchAtRef.current = Date.now()

      try {
        const next = await fetchSiteContent({
          client: resolvedClient,
          signal: controller.signal,
        })
        if (!mountedRef.current || controller.signal.aborted) return

        const prevVersion = currentVersionRef.current
        writeCachedContent(next)
        currentVersionRef.current = next.version
        hasFallbackRef.current = true
        setContent(next)
        setSource('live')
        setStatus(hasMeaningfulContent(next) ? 'ready' : 'empty')
        // Trigger content updated pill only when version increases (not on initial load or same-version refetches)
        if (!isInitialLoadRef.current && next.version > prevVersion) {
          setContentUpdateTrigger((t) => t + 1)
        }
        isInitialLoadRef.current = false
      } catch {
        if (!mountedRef.current || controller.signal.aborted) return
        if (!hasFallbackRef.current) {
          setStatus('unavailable')
        }
      } finally {
        if (mountedRef.current && activeAbortRef.current === controller) {
          setIsRefreshing(false)
        }
      }
    },
    [client, disableLiveUpdates],
  )

  const retry = useCallback(() => {
    void loadLiveContent({ markLoadingIfEmpty: true, showRefreshing: true })
  }, [loadLiveContent])

  const sendContactMessage = useCallback(
    async (payload: ContactMessageInput): Promise<ContactInsertResult> => {
      try {
        const resolvedClient = client ?? getSupabaseClient()
        return await resolvedClient.insertContactMessage(payload)
      } catch {
        return { ok: false, status: 0, errorKind: 'generic' }
      }
    },
    [client],
  )

  useEffect(() => {
    mountedRef.current = true

    if (disableLiveUpdates) {
      return () => {
        mountedRef.current = false
        activeAbortRef.current?.abort()
      }
    }

    let resolvedClient: PublicSupabaseClient | null = null
    try {
      resolvedClient = client ?? getSupabaseClient()
    } catch {
      resolvedClient = null
    }

    let disposed = false
    let debounceTimer: number | null = null
    let throttleTimer: number | null = null
    let pollTimer: number | null = null
    let unsubscribeRealtime: (() => Promise<void>) | null = null
    let hiddenAt: number | null = document.visibilityState === 'hidden' ? Date.now() : null

    const clearScheduledRefetch = () => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer)
        debounceTimer = null
      }
      if (throttleTimer !== null) {
        window.clearTimeout(throttleTimer)
        throttleTimer = null
      }
    }

    const stopPolling = () => {
      if (pollTimer !== null) {
        window.clearInterval(pollTimer)
        pollTimer = null
      }
    }

    const startPolling = () => {
      if (pollTimer !== null) return
      pollTimer = window.setInterval(() => {
        if (!mountedRef.current) return
        if (document.visibilityState === 'visible') {
          void loadLiveContent()
        }
      }, POLL_INTERVAL_MS)
    }

    const scheduleRealtimeRefetch = () => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer)
      }
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null
        if (!mountedRef.current) return

        const elapsed = Date.now() - lastFetchAtRef.current
        if (elapsed >= REALTIME_MIN_INTERVAL_MS) {
          void loadLiveContent()
          return
        }

        if (throttleTimer !== null) return
        throttleTimer = window.setTimeout(() => {
          throttleTimer = null
          if (mountedRef.current) {
            void loadLiveContent()
          }
        }, REALTIME_MIN_INTERVAL_MS - elapsed)
      }, REALTIME_DEBOUNCE_MS)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
        return
      }
      if (document.visibilityState === 'visible') {
        const wasHiddenLongEnough =
          hiddenAt !== null && Date.now() - hiddenAt > VISIBILITY_STALE_MS
        hiddenAt = null
        if (wasHiddenLongEnough) {
          void loadLiveContent()
        }
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    const startRealtime = () => {
      if (disposed || !resolvedClient) return
      void resolvedClient
        .subscribeContentVersion({
          onUpdate: (nextVersion) => {
            if (nextVersion > currentVersionRef.current) {
              scheduleRealtimeRefetch()
            }
          },
          onStatus: (channelStatus) => {
            if (channelStatus === 'SUBSCRIBED') {
              stopPolling()
            } else if (
              mountedRef.current &&
              (channelStatus === 'CHANNEL_ERROR' ||
                channelStatus === 'TIMED_OUT' ||
                channelStatus === 'CLOSED')
            ) {
              startPolling()
            }
          },
        })
        .then((unsub) => {
          if (disposed) {
            void unsub()
          } else {
            unsubscribeRealtime = unsub
          }
        })
        .catch(() => {
          if (mountedRef.current && !disposed) {
            startPolling()
          }
        })
    }

    const initialTimer = window.setTimeout(() => {
      void loadLiveContent({ markLoadingIfEmpty: false, showRefreshing: false }).finally(() => {
        startRealtime()
      })
    }, 0)

    return () => {
      disposed = true
      mountedRef.current = false
      window.clearTimeout(initialTimer)
      activeAbortRef.current?.abort()
      clearScheduledRefetch()
      stopPolling()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (unsubscribeRealtime) {
        void unsubscribeRealtime()
      }
      cleanupRevealObserver()
    }
  }, [client, disableLiveUpdates, loadLiveContent])

  const value: ContentContextValue = useMemo(
    () => ({
      content,
      status,
      source,
      isRefreshing,
      themeMode,
      setThemeMode,
      toggleThemeMode,
      retry,
      sendContactMessage,
      contentUpdateTrigger,
    }),
    [
      content,
      status,
      source,
      isRefreshing,
      themeMode,
      setThemeMode,
      toggleThemeMode,
      retry,
      sendContactMessage,
      contentUpdateTrigger,
    ],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
