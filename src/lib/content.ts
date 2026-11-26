import snapshotJson from '../generated/content.snapshot.json'
import type { SiteContent } from '../types/content'
import { EMPTY_SITE_CONTENT, parseSiteContent } from './schemas'
import { getSupabaseClient, type PublicSupabaseClient } from './supabase'

export const CONTENT_CACHE_KEY = 'portfolio:v1'
export const FETCH_TIMEOUT_MS = 15_000
export const MAX_FETCH_RETRIES = 3
export const RETRY_BASE_DELAY_MS = 500
export const RETRY_JITTER_MS = 300

export class ContentFetchError extends Error {
  readonly retryable: boolean

  constructor(message: string, retryable: boolean) {
    super(message)
    this.name = 'ContentFetchError'
    this.retryable = retryable
  }
}

export interface FetchSiteContentOptions {
  signal?: AbortSignal
  client?: PublicSupabaseClient
  timeoutMs?: number
  maxRetries?: number
  baseDelayMs?: number
  jitterMs?: number
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
  random?: () => number
}

function defaultSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true
  if (typeof err === 'object' && err !== null && 'name' in err) {
    return (err as { name?: unknown }).name === 'AbortError'
  }
  return false
}

export function isRetryableStatus(status: number | undefined): boolean {
  if (status === undefined || status === 0) return true
  if (status === 429) return true
  return status >= 500 && status <= 599
}

export function hasMeaningfulContent(content: SiteContent): boolean {
  return (
    content.version > 0 ||
    content.sections.length > 0 ||
    content.profile !== null ||
    content.projects.length > 0 ||
    content.skill_domains.length > 0 ||
    content.education.length > 0 ||
    content.certifications.length > 0 ||
    content.publications.length > 0
  )
}

export function readCachedContent(): SiteContent | null {
  try {
    const raw = window.localStorage.getItem(CONTENT_CACHE_KEY)
    if (!raw) return null
    const decoded: unknown = JSON.parse(raw)
    return parseSiteContent(decoded)
  } catch {
    return null
  }
}

export function writeCachedContent(content: SiteContent): void {
  try {
    const validated = parseSiteContent(content)
    if (!validated) return
    window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(validated))
  } catch {
    // Ignore storage quota or private-mode failures
  }
}

export function getSnapshotContent(): SiteContent {
  return parseSiteContent(snapshotJson) ?? EMPTY_SITE_CONTENT
}

function computeBackoffDelay(
  attempt: number,
  baseDelayMs: number,
  jitterMs: number,
  random: () => number,
): number {
  const exp = baseDelayMs * Math.pow(2, attempt)
  const jitter = Math.floor(Math.max(0, Math.min(1, random())) * jitterMs)
  return exp + jitter
}

export async function fetchSiteContent(
  options: FetchSiteContentOptions = {},
): Promise<SiteContent> {
  const client = options.client ?? getSupabaseClient()
  const timeoutMs = options.timeoutMs ?? FETCH_TIMEOUT_MS
  const maxRetries = options.maxRetries ?? MAX_FETCH_RETRIES
  const baseDelayMs = options.baseDelayMs ?? RETRY_BASE_DELAY_MS
  const jitterMs = options.jitterMs ?? RETRY_JITTER_MS
  const sleep = options.sleep ?? defaultSleep
  const random = options.random ?? Math.random
  const externalSignal = options.signal

  let lastError: ContentFetchError = new ContentFetchError('Content request failed', true)

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    if (externalSignal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const attemptController = new AbortController()
    let timedOut = false

    const timeoutId = window.setTimeout(() => {
      timedOut = true
      attemptController.abort()
    }, timeoutMs)

    const onExternalAbort = () => {
      attemptController.abort()
    }
    externalSignal?.addEventListener('abort', onExternalAbort, { once: true })

    try {
      const response = await client.fetchSiteContentRpc(attemptController.signal)

      if (externalSignal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      if (timedOut) {
        lastError = new ContentFetchError('Request timed out', true)
      } else if (!response.ok) {
        const retryable = isRetryableStatus(response.status)
        lastError = new ContentFetchError('Unable to load site content', retryable)
        if (!retryable) {
          throw lastError
        }
      } else {
        const parsed = parseSiteContent(response.data)
        if (!parsed) {
          throw new ContentFetchError('Invalid site content payload', false)
        }
        return parsed
      }
    } catch (err: unknown) {
      if (externalSignal?.aborted) {
        throw err
      }
      if (err instanceof ContentFetchError && !err.retryable) {
        throw err
      }
      if (timedOut) {
        lastError = new ContentFetchError('Request timed out', true)
      } else if (isAbortError(err)) {
        lastError = new ContentFetchError('Request aborted', true)
      } else if (err instanceof ContentFetchError) {
        lastError = err
      } else {
        lastError = new ContentFetchError('Network error while loading content', true)
      }
    } finally {
      window.clearTimeout(timeoutId)
      externalSignal?.removeEventListener('abort', onExternalAbort)
    }

    if (attempt < maxRetries) {
      const delayMs = computeBackoffDelay(attempt, baseDelayMs, jitterMs, random)
      await sleep(delayMs, externalSignal)
    }
  }

  throw lastError
}
