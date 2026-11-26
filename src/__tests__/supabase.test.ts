import { describe, expect, it, vi } from 'vitest'
import type { RealtimeClient } from '@supabase/realtime-js'
import { createPublicSupabaseClient } from '../lib/supabase'

describe('createPublicSupabaseClient', () => {
  it('calls get_site_content via POST fetch with apikey, Content-Type, Accept headers and no Authorization header', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ version: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const client = createPublicSupabaseClient({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key-123',
      fetchFn: fetchMock,
    })

    const res = await client.fetchSiteContentRpc()

    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.data).toEqual({ version: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const call = fetchMock.mock.calls[0]
    if (!call) throw new Error('fetchMock was not called')
    const [url, init] = call
    expect(url).toBe('https://example.supabase.co/rest/v1/rpc/get_site_content')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{}')
    const headers = init?.headers as Record<string, string>
    expect(headers.apikey).toBe('anon-key-123')
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers.Accept).toBe('application/json')
    expect(headers.Authorization).toBeUndefined()
    expect(headers.authorization).toBeUndefined()
  })

  it('posts contact messages with Prefer: return=minimal and maps P0001, 429, 400/23514, and network errors without retrying', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'P0001', message: 'Too many messages right now.' }), {
          status: 400,
        }),
      )
      .mockResolvedValueOnce(new Response('', { status: 429 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: '23514', message: 'check_email_format' }), {
          status: 400,
        }),
      )
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const client = createPublicSupabaseClient({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key-123',
      fetchFn: fetchMock,
    })

    const okRes = await client.insertContactMessage({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'Hello',
      body: 'Testing',
    })
    expect(okRes).toEqual({ ok: true, status: 201 })

    const call = fetchMock.mock.calls[0]
    if (!call) throw new Error('fetchMock was not called')
    const [url, init] = call
    expect(url).toBe('https://example.supabase.co/rest/v1/messages')
    expect(init?.method).toBe('POST')
    const headers = init?.headers as Record<string, string>
    expect(headers.apikey).toBe('anon-key-123')
    expect(headers.Prefer).toBe('return=minimal')
    expect(headers.Authorization).toBeUndefined()

    const p0001Res = await client.insertContactMessage({
      name: 'Bob',
      email: 'bob@example.com',
      subject: null,
      body: 'Too fast',
    })
    expect(p0001Res).toEqual({ ok: false, status: 400, errorKind: 'rate_limit' })

    const res429 = await client.insertContactMessage({
      name: 'Bob',
      email: 'bob@example.com',
      subject: null,
      body: 'Too fast',
    })
    expect(res429).toEqual({ ok: false, status: 429, errorKind: 'rate_limit' })

    const res23514 = await client.insertContactMessage({
      name: 'Bob',
      email: 'invalid',
      subject: null,
      body: 'Check',
    })
    expect(res23514).toEqual({ ok: false, status: 400, errorKind: 'validation' })

    const netRes = await client.insertContactMessage({
      name: 'Bob',
      email: 'bob@example.com',
      subject: null,
      body: 'Offline',
    })
    expect(netRes).toEqual({ ok: false, status: 0, errorKind: 'network' })
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })

  it('configures lazy realtime-js with wss endpoint, apikey param, eventsPerSecond 2, and in-memory sessionStorage', async () => {
    const channelMock = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }
    const realtimeMock = {
      channel: vi.fn(() => channelMock),
      removeChannel: vi.fn().mockResolvedValue('ok'),
    } as unknown as RealtimeClient

    const realtimeFactory = vi.fn(
      (
        _endpoint: string,
        _opts: { params: { apikey: string; eventsPerSecond: number }; sessionStorage: Storage },
      ) => realtimeMock,
    )

    const client = createPublicSupabaseClient({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key-123',
      realtimeFactory,
    })

    const unsubscribe = await client.subscribeContentVersion({
      onUpdate: vi.fn(),
      onStatus: vi.fn(),
    })
    await unsubscribe()

    expect(realtimeFactory).toHaveBeenCalledTimes(1)
    const call = realtimeFactory.mock.calls[0]
    if (!call) throw new Error('realtimeFactory was not called')
    const [endpoint, opts] = call
    expect(endpoint).toBe('wss://example.supabase.co/realtime/v1')
    expect(opts.params).toEqual({ apikey: 'anon-key-123', eventsPerSecond: 2 })
    expect(opts.sessionStorage).not.toBe(window.sessionStorage)
    expect('accessToken' in opts).toBe(false)
  })
})
