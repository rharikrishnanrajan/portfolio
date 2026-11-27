import { describe, expect, it } from 'vitest'
import { safeHeroTarget, safeImageUrl, safeStorageUrl, safeUrl } from '../lib/safeUrl'

const SUPABASE_ORIGIN = 'https://anjihgkdkiipmrafevan.supabase.co'

describe('safeUrl', () => {
  it('allows http, https, mailto, and tel URLs', () => {
    expect(safeUrl('https://github.com/user/repo')).toBe('https://github.com/user/repo')
    expect(safeUrl('http://example.com/path?q=1')).toBe('http://example.com/path?q=1')
    expect(safeUrl('mailto:user@example.com')).toBe('mailto:user@example.com')
    expect(safeUrl('tel:+919367757607')).toBe('tel:+919367757607')
    expect(safeUrl('  https://example.com  ')).toBe('https://example.com')
  })

  it('rejects hostile schemes, obfuscation, and control characters', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull()
    expect(safeUrl('  javascript:alert(1)')).toBeNull()
    expect(safeUrl('JaVaScRiPt:alert(1)')).toBeNull()
    expect(safeUrl('java\tscript:alert(1)')).toBeNull()
    expect(safeUrl('java\nscript:alert(1)')).toBeNull()
    expect(safeUrl('javascript\u0000:alert(1)')).toBeNull()
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(safeUrl('DATA:text/html;base64,PHNjcmlwdD4=')).toBeNull()
    expect(safeUrl('vbscript:msgbox(1)')).toBeNull()
    expect(safeUrl('file:///etc/passwd')).toBeNull()
    expect(safeUrl('blob:https://example.com/123')).toBeNull()
    expect(safeUrl('mailto:')).toBeNull()
    expect(safeUrl('https://example.com/\u0007evil')).toBeNull()
    expect(safeUrl('')).toBeNull()
    expect(safeUrl('   ')).toBeNull()
    expect(safeUrl(null)).toBeNull()
    expect(safeUrl(undefined)).toBeNull()
  })
})

describe('safeImageUrl', () => {
  it('allows https URLs on the configured Supabase public storage path', () => {
    const valid = `${SUPABASE_ORIGIN}/storage/v1/object/public/avatars/me.png`
    expect(safeImageUrl(valid, SUPABASE_ORIGIN)).toBe(valid)
  })

  it('rejects non-https, other hosts, non-public storage paths, and traversal', () => {
    expect(
      safeImageUrl('http://anjihgkdkiipmrafevan.supabase.co/storage/v1/object/public/a/b.png', SUPABASE_ORIGIN),
    ).toBeNull()
    expect(
      safeImageUrl('https://evil.example.com/storage/v1/object/public/a/b.png', SUPABASE_ORIGIN),
    ).toBeNull()
    expect(
      safeImageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/authenticated/a/b.png`, SUPABASE_ORIGIN),
    ).toBeNull()
    expect(
      safeImageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/../../private/secret.png`, SUPABASE_ORIGIN),
    ).toBeNull()
    expect(safeImageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/`, SUPABASE_ORIGIN)).toBeNull()
    expect(safeImageUrl('javascript:alert(1)', SUPABASE_ORIGIN)).toBeNull()
    expect(safeImageUrl('data:image/png;base64,AAAA', SUPABASE_ORIGIN)).toBeNull()
    expect(safeImageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/a/b.png`, '')).toBeNull()
  })
})

describe('safeStorageUrl', () => {
  it('allows https URLs on the configured Supabase project-documents and portfolio prefixes', () => {
    const valid1 = `${SUPABASE_ORIGIN}/storage/v1/object/public/project-documents/abc123/Architecture.pdf`
    const valid2 = `${SUPABASE_ORIGIN}/storage/v1/object/public/portfolio/xyz789/resume.docx`
    expect(safeStorageUrl(valid1, SUPABASE_ORIGIN)).toBe(valid1)
    expect(safeStorageUrl(valid2, SUPABASE_ORIGIN)).toBe(valid2)
  })

  it('rejects non-https, other hosts, non-allowed prefixes, traversal, and empty paths', () => {
    expect(
      safeStorageUrl('http://anjihgkdkiipmrafevan.supabase.co/storage/v1/object/public/project-documents/a/b.pdf', SUPABASE_ORIGIN),
    ).toBeNull()
    expect(
      safeStorageUrl('https://evil.example.com/storage/v1/object/public/project-documents/a/b.pdf', SUPABASE_ORIGIN),
    ).toBeNull()
    expect(
      safeStorageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/avatars/me.png`, SUPABASE_ORIGIN),
    ).toBeNull()
    expect(
      safeStorageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/project-documents/../../private/secret.pdf`, SUPABASE_ORIGIN),
    ).toBeNull()
    expect(safeStorageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/project-documents/`, SUPABASE_ORIGIN)).toBeNull()
    expect(safeStorageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/portfolio/`, SUPABASE_ORIGIN)).toBeNull()
    expect(safeStorageUrl('javascript:alert(1)', SUPABASE_ORIGIN)).toBeNull()
    expect(safeStorageUrl('data:application/pdf;base64,AAAA', SUPABASE_ORIGIN)).toBeNull()
    expect(safeStorageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/project-documents/a/b.pdf`, '')).toBeNull()
    // Control characters
    expect(safeStorageUrl(`${SUPABASE_ORIGIN}/storage/v1/object/public/project-documents/a/\u0007evil.pdf`, SUPABASE_ORIGIN)).toBeNull()
  })
})

describe('safeHeroTarget', () => {
  it('allows valid internal anchors and safe URLs', () => {
    expect(safeHeroTarget('#projects')).toBe('#projects')
    expect(safeHeroTarget('#contact-me-1')).toBe('#contact-me-1')
    expect(safeHeroTarget('https://example.com')).toBe('https://example.com')
  })

  it('rejects invalid anchors and unsafe URLs', () => {
    expect(safeHeroTarget('#')).toBeNull()
    expect(safeHeroTarget('#UPPERCASE')).toBeNull()
    expect(safeHeroTarget('#bad anchor')).toBeNull()
    expect(safeHeroTarget(`#${'a'.repeat(61)}`)).toBeNull()
    expect(safeHeroTarget('javascript:alert(1)')).toBeNull()
  })
})
