import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ContactSection } from '../components/sections/ContactSection'
import { ContentProvider } from '../context/ContentProvider'
import { CONTACT_COOLDOWN_MS, MIN_FORM_FILL_MS } from '../lib/contact'
import { EMPTY_SITE_CONTENT } from '../lib/schemas'
import type { ContactInsertResult, PublicSupabaseClient } from '../lib/supabase'
import type { SectionItem, SiteContent } from '../types/content'

const CONTACT_SECTION: SectionItem = {
  id: 'sec-contact',
  slug: 'contact',
  type: 'contact',
  nav_label: 'Contact',
  eyebrow: 'CONNECT',
  title: "Let's Build Something Reliable",
  subtitle: 'Available for DevOps roles.',
  content: {},
  position: 6,
  show_in_nav: true,
}

function makeContactContent(): SiteContent {
  return {
    ...EMPTY_SITE_CONTENT,
    version: 1,
    profile: {
      full_name: 'Harikrishnan R',
      headline: 'DevOps Engineer',
      summary: null,
      email: 'owner@example.com',
      phone: '+91 90000 00000',
      location: 'Coimbatore, India',
      avatar_url: null,
      resume_url: 'https://example.com/resume.pdf',
    },
    social_links: [
      { id: 's1', label: 'github.com/owner', url: 'https://github.com/owner', icon: 'github' },
      { id: 's2', label: 'bad-social', url: 'javascript:alert(1)', icon: 'globe' },
    ],
    sections: [CONTACT_SECTION],
  }
}

function createContactMockClient(
  insertImpl: () => Promise<ContactInsertResult>,
): PublicSupabaseClient {
  return {
    fetchSiteContentRpc: vi.fn().mockResolvedValue({ ok: true, status: 200, data: makeContactContent() }),
    insertContactMessage: vi.fn(insertImpl),
    subscribeContentVersion: vi.fn().mockResolvedValue(async () => undefined),
  }
}

function renderContact(client: PublicSupabaseClient) {
  return render(
    <ContentProvider initialContent={makeContactContent()} client={client} disableLiveUpdates>
      <ContactSection section={CONTACT_SECTION} displayNumber="06" />
    </ContentProvider>,
  )
}

function fillValidFields() {
  fireEvent.change(screen.getByLabelText('NAME'), { target: { value: 'Alice' } })
  fireEvent.change(screen.getByLabelText('EMAIL'), { target: { value: 'alice@example.com' } })
  fireEvent.change(screen.getByLabelText('SUBJECT'), { target: { value: 'Role inquiry' } })
  fireEvent.change(screen.getByLabelText('MESSAGE'), {
    target: { value: 'Interested in discussing a DevOps role.' },
  })
}

describe('ContactSection security, validation, and cooldown', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders contact prefix number and filters unsafe social links', () => {
    const client = createContactMockClient(async () => ({ ok: true, status: 201 }))
    renderContact(client)

    expect(screen.getByText('06')).toBeTruthy()
    expect(screen.getByText('CONNECT')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'owner@example.com' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'github.com/owner' })).toBeTruthy()
    expect(screen.queryByText('bad-social')).toBeNull()
    expect(screen.getByRole('link', { name: 'Download resume' })).toBeTruthy()
  })

  it('validates fields with zod and shows inline errors without submitting', () => {
    const client = createContactMockClient(async () => ({ ok: true, status: 201 }))
    renderContact(client)

    fireEvent.change(screen.getByLabelText('EMAIL'), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }))

    expect(screen.getByText('Please enter your name.')).toBeTruthy()
    expect(screen.getByText('Please enter a valid email address.')).toBeTruthy()
    expect(screen.getByText('Please enter a message.')).toBeTruthy()
    expect(client.insertContactMessage).not.toHaveBeenCalled()
  })

  it('silently fakes success when honeypot is filled or submitted under 3 seconds', async () => {
    vi.useFakeTimers()
    const client = createContactMockClient(async () => ({ ok: true, status: 201 }))
    const { container } = renderContact(client)

    // Under 3 seconds
    fillValidFields()
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }))
    expect(screen.getByText('Thanks for reaching out')).toBeTruthy()
    expect(client.insertContactMessage).not.toHaveBeenCalled()

    // Reset, advance past 3s, fill honeypot
    fireEvent.click(screen.getByRole('button', { name: /Send another message/i }))
    vi.advanceTimersByTime(MIN_FORM_FILL_MS + 100)
    fillValidFields()
    const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement
    fireEvent.change(honeypot, { target: { value: 'https://spam.example' } })
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }))

    expect(screen.getByText('Thanks for reaching out')).toBeTruthy()
    expect(client.insertContactMessage).not.toHaveBeenCalled()
  })

  it('disables submit while sending, enforces 60s cooldown, and maps server errors while keeping typed text', async () => {
    vi.useFakeTimers()
    let resolveSend: ((res: ContactInsertResult) => void) | null = null
    let mode: 'pending' | 'rate_limit' | 'ok' = 'pending'

    const client = createContactMockClient(
      () =>
        new Promise<ContactInsertResult>((resolve) => {
          if (mode === 'pending') {
            resolveSend = resolve
          } else if (mode === 'rate_limit') {
            resolve({ ok: false, status: 429, errorKind: 'rate_limit' })
          } else {
            resolve({ ok: true, status: 201 })
          }
        }),
    )

    renderContact(client)
    vi.advanceTimersByTime(MIN_FORM_FILL_MS + 100)
    fillValidFields()

    // Submit once -> stays disabled while in flight, second click ignored
    const submitBtn = screen.getByRole('button', { name: /Send Message/i }) as HTMLButtonElement
    fireEvent.click(submitBtn)
    expect(submitBtn.disabled).toBe(true)
    fireEvent.click(submitBtn)
    expect(client.insertContactMessage).toHaveBeenCalledTimes(1)

    // Reject with rate limit -> keeps typed text
    await act(async () => {
      resolveSend?.({ ok: false, status: 429, errorKind: 'rate_limit' })
      await Promise.resolve()
    })
    expect(screen.getByText('Too many messages right now. Please try again later.')).toBeTruthy()
    expect((screen.getByLabelText('MESSAGE') as HTMLTextAreaElement).value).toBe(
      'Interested in discussing a DevOps role.',
    )

    // Retry and succeed -> triggers 60s cooldown
    mode = 'ok'
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send Message/i }))
      await Promise.resolve()
    })
    expect(screen.getByText('Thanks for reaching out')).toBeTruthy()

    // Try sending another immediately -> blocked by 60s cooldown
    fireEvent.click(screen.getByRole('button', { name: /Send another message/i }))
    fillValidFields()
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }))
    expect(screen.getByText(/Please wait \d+ seconds before sending another message\./)).toBeTruthy()
    expect(client.insertContactMessage).toHaveBeenCalledTimes(2)

    // Advance past 60s -> allowed again
    vi.advanceTimersByTime(CONTACT_COOLDOWN_MS + 100)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send Message/i }))
      await Promise.resolve()
    })
    expect(client.insertContactMessage).toHaveBeenCalledTimes(3)
  })

  it('maps validation and network error kinds to friendly text without losing input', async () => {
    vi.useFakeTimers()
    let currentError: 'validation' | 'network' = 'validation'
    const client = createContactMockClient(async () => ({
      ok: false,
      status: currentError === 'validation' ? 400 : 0,
      errorKind: currentError,
    }))

    renderContact(client)
    vi.advanceTimersByTime(MIN_FORM_FILL_MS + 100)
    fillValidFields()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send Message/i }))
      await Promise.resolve()
    })
    expect(screen.getByText('Please check your details and try again.')).toBeTruthy()
    expect((screen.getByLabelText('NAME') as HTMLInputElement).value).toBe('Alice')

    currentError = 'network'
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send Message/i }))
      await Promise.resolve()
    })
    expect(
      screen.getByText('Unable to reach the server. Please check your connection and try again.'),
    ).toBeTruthy()
  })
})
