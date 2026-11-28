import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  FileDown,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react'
import { useContent } from '../../context/contentContext'
import { useReveal } from '../../hooks/useReveal'
import {
  CONTACT_COOLDOWN_MS,
  contactFormSchema,
  mapContactErrorMessage,
  MIN_FORM_FILL_MS,
} from '../../lib/contact'
import { safeUrl } from '../../lib/safeUrl'
import type { SectionItem } from '../../types/content'
import { SectionHeader } from '../SectionHeader'
import { BrandIcon } from '../BrandIcon'

export interface ContactSectionProps {
  section: SectionItem
  displayNumber?: string
}

interface FieldErrors {
  name?: string
  email?: string
  subject?: string
  body?: string
}

export function ContactSection({ section, displayNumber }: ContactSectionProps) {
  const { content, sendContactMessage } = useContent()
  const { ref, isVisible } = useReveal<HTMLElement>()
  const titleId = `section-title-${section.id}`
  const formId = useId()

  const appearedAtRef = useRef<number | null>(null)
  const lastSentAtRef = useRef<number | null>(null)
  const submittingRef = useRef<boolean>(false)

  useEffect(() => {
    appearedAtRef.current = Date.now()
  }, [])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const { profile, social_links: socialLinks } = content

  const safeEmailHref = profile?.email ? safeUrl(`mailto:${profile.email.trim()}`) : null
  const safePhoneHref = profile?.phone
    ? safeUrl(`tel:${profile.phone.replace(/\s+/g, '')}`)
    : null
  const safeResumeHref = safeUrl(profile?.resume_url, { allowMailtoTel: false })

  const safeSocials = socialLinks
    .map((link) => {
      const url = safeUrl(link.url, { allowMailtoTel: false })
      return url ? { ...link, url } : null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const handleReset = () => {
    setName('')
    setEmail('')
    setSubject('')
    setBody('')
    setHoneypot('')
    setFieldErrors({})
    setSubmitError(null)
    setSentSuccess(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submittingRef.current || isSending) return

    setSubmitError(null)

    const parsed = contactFormSchema.safeParse({ name, email, subject, body })
    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'name' && !nextErrors.name) nextErrors.name = issue.message
        if (key === 'email' && !nextErrors.email) nextErrors.email = issue.message
        if (key === 'subject' && !nextErrors.subject) nextErrors.subject = issue.message
        if (key === 'body' && !nextErrors.body) nextErrors.body = issue.message
      }
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})

    // Silent bot trap: honeypot filled OR submitted less than 3 seconds after form appeared
    const elapsedSinceAppear =
      appearedAtRef.current === null ? 0 : Date.now() - appearedAtRef.current
    if (honeypot.trim().length > 0 || elapsedSinceAppear < MIN_FORM_FILL_MS) {
      setSentSuccess(true)
      return
    }

    // Client-side 60s cooldown between real sends
    if (lastSentAtRef.current !== null) {
      const elapsed = Date.now() - lastSentAtRef.current
      if (elapsed < CONTACT_COOLDOWN_MS) {
        const remaining = Math.max(1, Math.ceil((CONTACT_COOLDOWN_MS - elapsed) / 1000))
        setSubmitError(`Please wait ${remaining} seconds before sending another message.`)
        return
      }
    }

    submittingRef.current = true
    setIsSending(true)

    try {
      const result = await sendContactMessage({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject ? parsed.data.subject : null,
        body: parsed.data.body,
      })

      if (result.ok) {
        lastSentAtRef.current = Date.now()
        setSentSuccess(true)
        setName('')
        setEmail('')
        setSubject('')
        setBody('')
        setHoneypot('')
      } else {
        setSubmitError(mapContactErrorMessage(result.errorKind))
      }
    } catch {
      setSubmitError(mapContactErrorMessage('generic'))
    } finally {
      submittingRef.current = false
      setIsSending(false)
    }
  }

  return (
    <section
      ref={ref}
      id={section.slug}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={`py-20 sm:py-24 border-t border-line/60 scroll-mt-16 reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 space-y-8">
            <div className="reveal-header mb-8">
              <SectionHeader
                eyebrow={section.eyebrow || 'CONNECT'}
                prefixNumber={displayNumber}
                title={section.title || "Let's Build Something Reliable"}
                titleId={titleId}
              />
              {section.subtitle ? (
                <p className="mt-5 text-base text-muted leading-relaxed animate-fade-up" style={{ '--reveal-i': 2 }}>
                  {section.subtitle}
                </p>
              ) : null}
            </div>

            <div className="border-t border-b border-line divide-y animate-fade-up" style={{ '--reveal-i': 3 }}>
              {profile?.email && safeEmailHref ? (
                <a
                  href={safeEmailHref}
                  className="py-4 flex items-center gap-4 text-sm text-ink/90 hover:text-ink transition-colors group row-interactive"
                >
                  <Mail
                    className="h-4 w-4 text-muted group-hover:text-accent shrink-0 transition-colors link-icon"
                    aria-hidden="true"
                  />
                  <span className="truncate">{profile.email}</span>
                </a>
              ) : null}

              {profile?.phone && safePhoneHref ? (
                <a
                  href={safePhoneHref}
                  className="py-4 flex items-center gap-4 text-sm text-ink/90 hover:text-ink transition-colors group row-interactive"
                >
                  <Phone
                    className="h-4 w-4 text-muted group-hover:text-accent shrink-0 transition-colors link-icon"
                    aria-hidden="true"
                  />
                  <span>{profile.phone}</span>
                </a>
              ) : null}

              {profile?.location ? (
                <div className="py-4 flex items-center gap-4 text-sm text-muted row-interactive">
                  <MapPin className="h-4 w-4 shrink-0 link-icon" aria-hidden="true" />
                  <span>{profile.location}</span>
                </div>
              ) : null}

              {safeSocials.map((link, idx) => {
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-4 flex items-center gap-4 text-sm text-ink/90 hover:text-ink transition-colors group row-interactive animate-fade-up"
                    style={{ '--reveal-i': 4 + idx }}
                  >
                    <BrandIcon
                      name={link.icon ?? ''}
                      className="h-4 w-4 text-muted group-hover:text-accent shrink-0 transition-colors link-icon"
                    />
                    <span className="truncate">{link.label}</span>
                  </a>
                )
              })}

              {safeResumeHref ? (
                <a
                  href={safeResumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 flex items-center gap-4 text-sm text-ink/90 hover:text-ink transition-colors group row-interactive"
                >
                  <FileDown
                    className="h-4 w-4 text-muted group-hover:text-accent shrink-0 transition-colors link-icon"
                    aria-hidden="true"
                  />
                  <span>Download resume</span>
                </a>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-7 animate-fade-up" style={{ '--reveal-i': 5 }}>
            {sentSuccess ? (
              <div className="card p-8 space-y-5" role="status" aria-live="polite">
                <p className="eyebrow text-accent">Message Dispatched</p>
                <h3 className="text-2xl font-bold tracking-tight text-ink">
                  Thanks for reaching out
                </h3>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Your message has been received. I will review it and get back to you soon.
                </p>
                <div>
                  <button type="button" onClick={handleReset} className="btn-secondary">
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Honeypot field: hidden from human visitors and assistive tech */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <label htmlFor={`${formId}-website`}>Website</label>
                  <input
                    id={`${formId}-website`}
                    name="website"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor={`${formId}-name`} className="eyebrow block">
                      NAME
                    </label>
                    <input
                      id={`${formId}-name`}
                      name="name"
                      type="text"
                      required
                      maxLength={200}
                      autoComplete="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={fieldErrors.name ? 'true' : undefined}
                      aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
                      className="input"
                    />
                    {fieldErrors.name ? (
                      <p
                        id={`${formId}-name-error`}
                        role="alert"
                        className="text-xs font-mono text-red-400"
                      >
                        {fieldErrors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`${formId}-email`} className="eyebrow block">
                      EMAIL
                    </label>
                    <input
                      id={`${formId}-email`}
                      name="email"
                      type="email"
                      required
                      maxLength={320}
                      autoComplete="email"
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={fieldErrors.email ? 'true' : undefined}
                      aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
                      className="input"
                    />
                    {fieldErrors.email ? (
                      <p
                        id={`${formId}-email-error`}
                        role="alert"
                        className="text-xs font-mono text-red-400"
                      >
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-subject`} className="eyebrow block">
                    SUBJECT
                  </label>
                  <input
                    id={`${formId}-subject`}
                    name="subject"
                    type="text"
                    maxLength={300}
                    placeholder="e.g. DevOps Role / Cloud Architecture Inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    aria-invalid={fieldErrors.subject ? 'true' : undefined}
                    aria-describedby={
                      fieldErrors.subject ? `${formId}-subject-error` : undefined
                    }
                    className="input"
                  />
                  {fieldErrors.subject ? (
                    <p
                      id={`${formId}-subject-error`}
                      role="alert"
                      className="text-xs font-mono text-red-400"
                    >
                      {fieldErrors.subject}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-body`} className="eyebrow block">
                    MESSAGE
                  </label>
                  <textarea
                    id={`${formId}-body`}
                    name="body"
                    rows={5}
                    required
                    maxLength={5000}
                    placeholder="Describe your project, systems requirements, or opportunity..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    aria-invalid={fieldErrors.body ? 'true' : undefined}
                    aria-describedby={fieldErrors.body ? `${formId}-body-error` : undefined}
                    className="input resize-y"
                  />
                  {fieldErrors.body ? (
                    <p
                      id={`${formId}-body-error`}
                      role="alert"
                      className="text-xs font-mono text-red-400"
                    >
                      {fieldErrors.body}
                    </p>
                  ) : null}
                </div>

                {submitError ? (
                  <div
                    role="alert"
                    className="border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-start gap-3 text-sm text-ink"
                  >
                    <AlertTriangle
                      className="h-4 w-4 text-red-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{submitError}</span>
                  </div>
                ) : null}

                <div>
                  <button type="submit" disabled={isSending} className="btn-primary">
                    <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
