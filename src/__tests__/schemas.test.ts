import { describe, expect, it } from 'vitest'
import {
  parseAboutContent,
  parseCardsContent,
  parseGalleryContent,
  parseSiteContent,
} from '../lib/schemas'
import {
  applyTheme,
  resolveHeadingFontName,
  resolveMonoFontName,
} from '../lib/theme'

describe('tolerant siteContentSchema', () => {
  it('strips unknown keys, drops bad optional fields, and skips malformed array items', () => {
    const raw = {
      version: 42,
      extra_root_key: 'should be stripped',
      settings: {
        logo_text: 'HK',
        brand_name: 'Harikrishnan R',
        nav_cta_label: "Let's Connect",
        secret_admin_flag: true,
        hero: {
          ghost_word: 'DEVOPS',
          roles: ['DEVOPS ENGINEER', 123, 'CLOUD'],
          tagline: 999,
          cta_primary: { label: 'View Work', target: '#projects' },
          cta_secondary: { invalid: true },
          chips_left: ['AWS', null],
          chips_right: ['DOCKER'],
          stats: [
            { label: 'INFRA', value: 'AWS' },
            { label: 'BAD' },
          ],
        },
        footer: {
          blurb: 'Reliable systems',
          copyright: '© {year} Owner',
        },
        theme: {
          default_mode: 'dark',
          fonts: { heading: 'Inter', mono: 'JetBrains Mono' },
          dark: {
            bg: '6 9 18',
            accent: '999 0 0',
          },
        },
        seo: {
          title: 'Harikrishnan R',
          description: 42,
        },
      },
      profile: {
        full_name: 'Harikrishnan R',
        headline: null,
        summary: 'DevOps Engineer',
        email: 12345,
        phone: null,
        location: 'Coimbatore, India',
        avatar_url: 'https://anjihgkdkiipmrafevan.supabase.co/storage/v1/object/public/a/b.png',
        resume_url: null,
      },
      sections: [
        {
          id: 's1',
          slug: 'about',
          type: 'about',
          nav_label: 'About',
          eyebrow: 'ABOUT',
          title: 'Professional Summary',
          subtitle: null,
          content: { overview_title: 'Overview', highlights: [{ label: 'X', value: 'Y' }, { bad: 1 }] },
          position: 1,
          show_in_nav: true,
        },
        {
          // Missing required title/slug -> skipped
          id: '',
          type: 'broken',
        },
      ],
      social_links: [
        { id: '1', label: 'GitHub', url: 'https://github.com/example', icon: 'github' },
        { id: '2', label: 'Bad' },
      ],
      overview_rows: [
        { id: '1', label: 'Role', value: 'DevOps Engineer' },
        { bad: true },
      ],
      competencies: [
        { id: '1', text: 'Cloud Infrastructure' },
        { id: '2', text: 123 },
      ],
      skill_domains: [
        { id: '1', title: 'Cloud', tools: ['EC2', 55, 'ECS'], status: 'PRODUCTION READY' },
        { id: '2' },
      ],
      projects: [
        {
          id: 'p1',
          kicker: 'FINAL YEAR',
          title: 'Multi-Region Deployment',
          summary: 'Active-passive deployment',
          outcome: '100% availability',
          tagline: null,
          bullets: ['Dockerized app', false],
          tech: ['AWS', 'Docker'],
          github_url: 'https://github.com/user/repo',
          live_url: null,
          cover_url: null,
          files: [
            { name: 'Arch.pdf', url: 'https://example.com/a.pdf', path: 'a.pdf', type: 'application/pdf' },
            { broken: true },
          ],
          featured: true,
        },
        { title: 'Missing ID project' },
      ],
      education: [
        { id: 'e1', degree: 'MCA', institution: 'College', score_label: 'CGPA', score: '8.05', note: null },
        { id: 'e2', degree: 'No institution' },
      ],
      certifications: [
        {
          id: 'c1',
          title: 'DevOps and Cloud',
          issuer: 'L&T',
          start_date: '2024-01-01',
          end_date: '2024-04-01',
          credential_url: null,
          featured: true,
        },
        { id: 'c2' },
      ],
      publications: [],
    }

    const parsed = parseSiteContent(raw)
    expect(parsed).not.toBeNull()
    expect(parsed!.version).toBe(42)
    expect('extra_root_key' in parsed!).toBe(false)
    expect('secret_admin_flag' in parsed!.settings).toBe(false)
    expect(parsed!.settings.hero.roles).toEqual(['DEVOPS ENGINEER', 'CLOUD'])
    expect(parsed!.settings.hero.tagline).toBeUndefined()
    expect(parsed!.settings.hero.cta_secondary).toBeUndefined()
    expect(parsed!.settings.hero.stats).toEqual([{ label: 'INFRA', value: 'AWS' }])
    expect(parsed!.settings.seo.description).toBeUndefined()
    expect(parsed!.profile?.email).toBeNull()
    expect(parsed!.sections).toHaveLength(1)
    expect(parsed!.social_links).toHaveLength(1)
    expect(parsed!.overview_rows).toHaveLength(1)
    expect(parsed!.competencies).toHaveLength(1)
    expect(parsed!.skill_domains[0].tools).toEqual(['EC2', 'ECS'])
    expect(parsed!.projects).toHaveLength(1)
    expect(parsed!.projects[0].bullets).toEqual(['Dockerized app'])
    expect(parsed!.projects[0].files).toHaveLength(1)
    expect(parsed!.education).toHaveLength(1)
    expect(parsed!.certifications).toHaveLength(1)
  })

  it('handles section content parsers tolerantly', () => {
    expect(parseAboutContent({ overview_title: 'O', highlights: [{ label: 'A', value: 'B' }, 'bad'] })).toEqual({
      overview_title: 'O',
      competencies_title: undefined,
      highlights: [{ label: 'A', value: 'B' }],
    })
    expect(parseCardsContent({ items: [{ title: 'T', text: 'D' }, { text: 'no title' }] })).toEqual({
      items: [{ title: 'T', text: 'D', url: undefined }],
    })
    expect(parseGalleryContent({ images: [{ url: 'https://x/y.png' }, { caption: 'no url' }] })).toEqual({
      images: [{ url: 'https://x/y.png', path: undefined, caption: undefined }],
    })
  })
})

describe('theme allow-lists and hostile CSS rejection', () => {
  it('resolves aliases and rejects unknown or hostile font names', () => {
    expect(resolveHeadingFontName('Inter')).toBe('Inter Variable')
    expect(resolveHeadingFontName('Georgia')).toBe('Merriweather')
    expect(resolveHeadingFontName('Playfair Display')).toBe('Playfair Display')
    expect(resolveHeadingFontName('Comic Sans; } body { display:none')).toBe('Inter Variable')

    expect(resolveMonoFontName('JetBrains Mono')).toBe('JetBrains Mono Variable')
    expect(resolveMonoFontName('IBM Plex Mono')).toBe('IBM Plex Mono')
    expect(resolveMonoFontName('Courier New')).toBe('Source Code Pro')
    expect(resolveMonoFontName('url(evil)')).toBe('JetBrains Mono Variable')
  })

  it('rejects hostile theme colors and falls back to defaults', () => {
    applyTheme({
      default_mode: 'dark',
      fonts: { heading: 'Georgia; } * { color: red', mono: 'Courier New' },
      dark: {
        bg: '1 2 3; background:url(x)',
        surface: '999 0 0',
        border: 'red',
        text: '250 250 250',
      },
    })

    const style = document.documentElement.style
    expect(style.getPropertyValue('--bg')).toBe('6 9 18')
    expect(style.getPropertyValue('--surface')).toBe('14 19 33')
    expect(style.getPropertyValue('--border')).toBe('30 38 58')
    expect(style.getPropertyValue('--text')).toBe('250 250 250')
    expect(style.getPropertyValue('--theme-font-heading')).toContain('Inter Variable')
    expect(style.getPropertyValue('--theme-font-mono')).toContain('Source Code Pro Variable')
  })
})
