import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublicSupabaseClient, RpcFetchResult } from '../lib/supabase'
import {
  CONTENT_CACHE_KEY,
  ContentFetchError,
  fetchSiteContent,
  getSnapshotContent,
  hasMeaningfulContent,
  isRetryableStatus,
  readCachedContent,
  writeCachedContent,
} from '../lib/content'
import { EMPTY_SITE_CONTENT } from '../lib/schemas'
import type { SiteContent } from '../types/content'

function makeSampleContent(version = 1, brandName = 'Harikrishnan R'): SiteContent {
  return {
    ...EMPTY_SITE_CONTENT,
    version,
    settings: {
      ...EMPTY_SITE_CONTENT.settings,
      brand_name: brandName,
      seo: {
        title: `${brandName} — Portfolio`,
        description: 'Engineering portfolio',
      },
    },
    profile: {
      full_name: brandName,
      headline: 'DevOps Engineer',
      summary: 'Cloud and automation',
      email: null,
      phone: null,
      location: 'Coimbatore, India',
      avatar_url: null,
      resume_url: null,
    },
    sections: [
      {
        id: 'sec-about',
        slug: 'about',
        type: 'about',
        nav_label: 'About',
        eyebrow: 'ABOUT',
        title: 'Professional Summary',
        subtitle: null,
        content: {},
        position: 1,
        show_in_nav: true,
      },
    ],
  }
}

function createRpcMockClient(
  rpcImpl: (signal?: AbortSignal) => Promise<RpcFetchResult>,
): PublicSupabaseClient {
  return {
    fetchSiteContentRpc: vi.fn((signal?: AbortSignal) => rpcImpl(signal)),
    insertContactMessage: vi.fn().mockResolvedValue({ ok: true, status: 201 }),
    subscribeContentVersion: vi.fn().mockResolvedValue(async () => undefined),
  }
}

describe('content cache and snapshot helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('writes and reads validated cache under portfolio:v1', () => {
    const sample = makeSampleContent(3)
    writeCachedContent(sample)
    const cached = readCachedContent()
    expect(cached).not.toBeNull()
    expect(cached?.version).toBe(3)
    expect(cached?.settings.brand_name).toBe('Harikrishnan R')
  })

  it('returns null for corrupt or non-object cache data', () => {
    window.localStorage.setItem(CONTENT_CACHE_KEY, '{not-valid-json')
    expect(readCachedContent()).toBeNull()

    window.localStorage.setItem(CONTENT_CACHE_KEY, '"just-a-string"')
    expect(readCachedContent()).toBeNull()
  })

  it('returns valid snapshot content and detects meaningful content', () => {
    const snap = getSnapshotContent()
    expect(snap).toBeDefined()
    expect(Array.isArray(snap.sections)).toBe(true)
    expect(hasMeaningfulContent(EMPTY_SITE_CONTENT)).toBe(false)
    expect(hasMeaningfulContent(makeSampleContent(1))).toBe(true)
  })
})

describe('fetchSiteContent retry, backoff, and timeout', () => {
  it('identifies retryable HTTP statuses', () => {
    expect(isRetryableStatus(0)).toBe(true)
    expect(isRetryableStatus(429)).toBe(true)
    expect(isRetryableStatus(500)).toBe(true)
    expect(isRetryableStatus(503)).toBe(true)
    expect(isRetryableStatus(400)).toBe(false)
    expect(isRetryableStatus(404)).toBe(false)
  })

  it('retries up to 3 times on 5xx/429/network errors and succeeds on final attempt', async () => {
    let calls = 0
    const delays: number[] = []
    const sample = makeSampleContent(7)

    const client = createRpcMockClient(async () => {
      calls += 1
      if (calls === 1) return { ok: false, data: null, status: 500 }
      if (calls === 2) return { ok: false, data: null, status: 429 }
      if (calls === 3) throw new Error('Network failure')
      return { ok: true, data: sample, status: 200 }
    })

    const result = await fetchSiteContent({
      client,
      sleep: async (ms) => {
        delays.push(ms)
      },
      random: () => 0.5,
      baseDelayMs: 100,
      jitterMs: 20,
    })

    expect(calls).toBe(4)
    expect(delays).toEqual([110, 210, 410])
    expect(result.version).toBe(7)
  })

  it('does not retry on 4xx client errors other than 429', async () => {
    let calls = 0
    const client = createRpcMockClient(async () => {
      calls += 1
      return { ok: false, data: null, status: 400 }
    })

    await expect(
      fetchSiteContent({
        client,
        sleep: async () => undefined,
      }),
    ).rejects.toBeInstanceOf(ContentFetchError)
    expect(calls).toBe(1)
  })

  it('stops retrying when external AbortSignal aborts', async () => {
    const controller = new AbortController()
    let calls = 0

    const client = createRpcMockClient(async (signal) => {
      calls += 1
      controller.abort()
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      return { ok: true, data: makeSampleContent(1), status: 200 }
    })

    await expect(
      fetchSiteContent({
        client,
        signal: controller.signal,
        sleep: async () => undefined,
      }),
    ).rejects.toThrow()
    expect(calls).toBe(1)
  })
})
