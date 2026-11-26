import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type {
  ContentVersionSubscriptionHandlers,
  PublicSupabaseClient,
  RpcFetchResult,
} from '../lib/supabase'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { EmptyView, LoadingView, UnavailableView } from '../components/StatusViews'
import {
  ContentProvider,
  POLL_INTERVAL_MS,
  VISIBILITY_STALE_MS,
} from '../context/ContentProvider'
import { useContent } from '../context/contentContext'
import { writeCachedContent } from '../lib/content'
import { EMPTY_SITE_CONTENT } from '../lib/schemas'
import type { SiteContent } from '../types/content'

vi.mock('../generated/content.snapshot.json', () => ({
  default: {
    version: 0,
    settings: {
      logo_text: '',
      brand_name: '',
      nav_cta_label: '',
      hero: { roles: [], chips_left: [], chips_right: [], stats: [] },
      footer: {},
      theme: { default_mode: 'dark', fonts: {} },
      seo: {},
    },
    profile: null,
    sections: [],
    social_links: [],
    overview_rows: [],
    competencies: [],
    skill_domains: [],
    projects: [],
    education: [],
    certifications: [],
    publications: [],
  },
}))

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

interface MockChannelControls {
  emitUpdate: (version: number) => void
  emitStatus: (status: string) => void
  removeChannel: ReturnType<typeof vi.fn>
}

function createMockSupabaseClient(
  rpcImpl: (signal?: AbortSignal) => Promise<RpcFetchResult>,
): { client: PublicSupabaseClient; controls: MockChannelControls } {
  let activeHandlers: ContentVersionSubscriptionHandlers | null = null
  const removeChannel = vi.fn().mockResolvedValue('ok')

  const client: PublicSupabaseClient = {
    fetchSiteContentRpc: vi.fn((signal?: AbortSignal) => rpcImpl(signal)),
    insertContactMessage: vi.fn().mockResolvedValue({ ok: true, status: 201 }),
    subscribeContentVersion: vi.fn(async (handlers: ContentVersionSubscriptionHandlers) => {
      activeHandlers = handlers
      return async () => {
        await removeChannel()
      }
    }),
  }

  return {
    client,
    controls: {
      emitUpdate: (version: number) => {
        activeHandlers?.onUpdate(version)
      },
      emitStatus: (status: string) => {
        activeHandlers?.onStatus(status)
      },
      removeChannel,
    },
  }
}

describe('ErrorBoundary and StatusViews', () => {
  afterEach(() => {
    cleanup()
  })

  it('catches render errors and hides raw error messages', () => {
    function Bomb(): null {
      throw new Error('SENSITIVE_DB_TOKEN_LEAK')
    }

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Something went wrong')).toBeTruthy()
    expect(screen.queryByText(/SENSITIVE_DB_TOKEN_LEAK/)).toBeNull()
  })

  it('renders LoadingView, EmptyView, and UnavailableView', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<LoadingView />)
    expect(screen.getByRole('status')).toBeTruthy()

    rerender(<EmptyView brandName="Test Brand" onRefresh={onRetry} />)
    expect(screen.getByText('Test Brand')).toBeTruthy()

    rerender(<UnavailableView onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('ContentProvider lifecycle', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  function Consumer() {
    const { content, status, source, retry } = useContent()
    return (
      <div>
        <span data-testid="status">{status}</span>
        <span data-testid="source">{source}</span>
        <span data-testid="brand">{content.settings.brand_name}</span>
        <span data-testid="version">{content.version}</span>
        <button type="button" onClick={retry}>
          retry
        </button>
      </div>
    )
  }

  it('renders cached content immediately when offline/failing', () => {
    writeCachedContent(makeSampleContent(2, 'Cached Brand'))

    const { client } = createMockSupabaseClient(async () => ({
      ok: false,
      data: null,
      status: 400,
    }))

    render(
      <ContentProvider client={client}>
        <Consumer />
      </ContentProvider>,
    )

    expect(screen.getByTestId('status').textContent).toBe('ready')
    expect(screen.getByTestId('source').textContent).toBe('cache')
    expect(screen.getByTestId('brand').textContent).toBe('Cached Brand')
  })

  it('shows unavailable state when nothing is cached and fetch fails, then recovers on retry', async () => {
    let shouldFail = true
    const { client } = createMockSupabaseClient(async () => {
      if (shouldFail) {
        return { ok: false, data: null, status: 400 }
      }
      return { ok: true, data: makeSampleContent(5, 'Recovered Brand'), status: 200 }
    })

    render(
      <ContentProvider client={client}>
        <Consumer />
      </ContentProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('unavailable')
    })

    shouldFail = false
    fireEvent.click(screen.getByRole('button', { name: 'retry' }))

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('ready')
      expect(screen.getByTestId('brand').textContent).toBe('Recovered Brand')
      expect(screen.getByTestId('version').textContent).toBe('5')
    })
  })

  it('refetches on newer realtime content_version updates, polls on channel error, and refetches after long visibility hide', async () => {
    vi.useFakeTimers()
    let currentVersion = 1
    const { client, controls } = createMockSupabaseClient(async () => ({
      ok: true,
      data: makeSampleContent(currentVersion, `Brand v${currentVersion}`),
      status: 200,
    }))

    const { unmount } = render(
      <ContentProvider client={client}>
        <Consumer />
      </ContentProvider>,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(screen.getByTestId('version').textContent).toBe('1')

    currentVersion = 2
    act(() => {
      controls.emitUpdate(2)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(screen.getByTestId('version').textContent).toBe('2')

    // Channel error triggers 60s polling while visible
    currentVersion = 3
    act(() => {
      controls.emitStatus('CHANNEL_ERROR')
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS + 10)
    })

    expect(screen.getByTestId('version').textContent).toBe('3')

    // Visibility refetch after > 5 minutes hidden
    currentVersion = 4
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VISIBILITY_STALE_MS + 1000)
    })

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    })
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(screen.getByTestId('version').textContent).toBe('4')

    unmount()
    expect(controls.removeChannel).toHaveBeenCalledTimes(1)
  })
})
