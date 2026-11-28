import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../App'
import { RegisteredSection } from '../components/sections/SectionRegistry'
import { ProjectCaseStudy } from '../components/sections/ProjectCaseStudy'
import { PublicationsSection } from '../components/sections/PublicationsSection'
import { CertificationRow } from '../components/sections/CertificationRow'
import { ProjectCover } from '../components/ProjectCover'
import { ContentProvider } from '../context/ContentProvider'
import { EMPTY_SITE_CONTENT } from '../lib/schemas'
import type { SiteContent } from '../types/content'

function makePortfolioContent(): SiteContent {
  return {
    ...EMPTY_SITE_CONTENT,
    version: 3,
    settings: {
      ...EMPTY_SITE_CONTENT.settings,
      logo_text: 'HK',
      brand_name: 'Harikrishnan R',
      nav_cta_label: "Let's Connect",
      hero: {
        ghost_word: 'DEVOPS',
        roles: ['DEVOPS ENGINEER', 'CLOUD', 'AUTOMATION'],
        tagline: 'Building reliable systems.',
        cta_primary: { label: 'View My Work', target: '#projects' },
        cta_secondary: { label: 'Email Me', target: 'javascript:alert(1)' },
        chips_left: ['AWS & ECS'],
        chips_right: ['JENKINS AS CODE'],
        stats: [{ label: 'INFRA', value: 'AWS & ECS' }],
      },
      footer: {
        blurb: 'Reliable AWS infrastructure.',
        index_title: 'INDEX',
        direct_title: 'DIRECT',
        status_label: 'SYSTEMS OPERATIONAL',
        copyright: '© {year} Harikrishnan R. All rights reserved.',
      },
      seo: { title: 'Harikrishnan R — Portfolio', description: 'DevOps portfolio' },
    },
    profile: {
      full_name: 'Harikrishnan R',
      headline: 'DevOps Engineer',
      summary: 'Cloud & CI/CD engineer.',
      email: 'test@example.com',
      phone: null,
      location: 'Coimbatore, India',
      avatar_url: 'https://evil.example.com/avatar.png',
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
        subtitle: 'CLOUD ARCHITECTURE',
        content: {
          overview_title: 'OVERVIEW AT A GLANCE',
          competencies_title: 'CORE COMPETENCIES',
          highlights: [{ label: 'DEPLOYMENT', value: 'Multi-Region AWS' }],
        },
        position: 1,
        show_in_nav: true,
      },
      {
        id: 'sec-skills',
        slug: 'skills',
        type: 'skills',
        nav_label: 'Skills',
        eyebrow: 'CAPABILITIES',
        title: 'DevOps & Infrastructure Stack',
        subtitle: '1 SPECIALIZED DOMAIN',
        content: {},
        position: 2,
        show_in_nav: true,
      },
      {
        id: 'sec-projects',
        slug: 'projects',
        type: 'projects',
        nav_label: 'Projects',
        eyebrow: 'ARCHITECTURE',
        title: 'Selected Systems',
        subtitle: 'REPRODUCIBLE INFRASTRUCTURE',
        content: { archive_button: 'View All Projects Archive' },
        position: 3,
        show_in_nav: true,
      },
      {
        id: 'sec-education',
        slug: 'education',
        type: 'education',
        nav_label: 'Education',
        eyebrow: 'ACADEMICS',
        title: 'Education',
        subtitle: null,
        content: {},
        position: 4,
        show_in_nav: true,
      },
      {
        id: 'sec-certs',
        slug: 'certifications',
        type: 'certifications',
        nav_label: 'Certifications',
        eyebrow: 'CREDENTIALS',
        title: 'Certifications & Training',
        subtitle: null,
        content: { archive_button: 'View All Credentials Archive' },
        position: 5,
        show_in_nav: true,
      },
      {
        id: 'sec-pubs',
        slug: 'publications',
        type: 'publications',
        nav_label: 'Publications',
        eyebrow: 'RESEARCH',
        title: 'Publications',
        subtitle: null,
        content: {},
        position: 6,
        show_in_nav: false,
      },
      {
        id: 'sec-rich',
        slug: 'notes',
        type: 'rich_text',
        nav_label: null,
        eyebrow: 'NOTES',
        title: 'Engineering Notes',
        subtitle: null,
        content: { body: '<script>alert(1)</script> Plain text note.' },
        position: 7,
        show_in_nav: false,
      },
      {
        id: 'sec-cards',
        slug: 'highlights',
        type: 'cards',
        nav_label: null,
        eyebrow: 'HIGHLIGHTS',
        title: 'Focus Areas',
        subtitle: null,
        content: {
          items: [
            { title: 'Safe Card', text: 'Valid link', url: 'https://example.com/ok' },
            { title: 'Unsafe Card', text: 'Dropped link', url: 'javascript:alert(1)' },
          ],
        },
        position: 8,
        show_in_nav: false,
      },
      {
        id: 'sec-gallery',
        slug: 'gallery',
        type: 'gallery',
        nav_label: null,
        eyebrow: 'GALLERY',
        title: 'Architecture Diagrams',
        subtitle: null,
        content: {
          images: [
            {
              url: 'https://example.supabase.co/storage/v1/object/public/gallery/ok.png',
              caption: 'Allowed Supabase Diagram',
            },
            {
              url: 'https://evil.example.com/storage/v1/object/public/gallery/evil.png',
              caption: 'Blocked External Diagram',
            },
          ],
        },
        position: 9,
        show_in_nav: false,
      },
    ],
    overview_rows: [{ id: 'ov-1', label: 'Role', value: 'DevOps Engineer' }],
    competencies: [{ id: 'comp-1', text: 'Cloud Infrastructure' }],
    skill_domains: [
      {
        id: 'sk-1',
        title: 'Cloud & Infrastructure',
        tools: ['AWS EC2', 'AWS ECS'],
        status: 'PRODUCTION READY',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        kicker: 'FINAL YEAR PROJECT',
        title: 'Multi-Region Deployment',
        summary: 'Active-passive AWS setup.',
        outcome: '100% Availability',
        tagline: 'Automated Failover',
        bullets: ['Containerized app with Docker'],
        tech: ['AWS', 'DOCKER'],
        github_url: 'https://github.com/example/repo',
        live_url: 'javascript:alert(1)',
        cover_url: 'https://example.supabase.co/storage/v1/object/public/covers/p1.png',
        files: [
          {
            name: 'Architecture.pdf',
            url: 'https://example.supabase.co/storage/v1/object/public/project-documents/abc123/Architecture.pdf',
            path: 'project-documents/abc123/Architecture.pdf',
            type: 'application/pdf',
          },
          {
            name: 'Evil.pdf',
            url: 'https://evil.example.com/storage/v1/object/public/project-documents/evil.pdf',
            path: 'project-documents/evil.pdf',
            type: 'application/pdf',
          },
        ],
        featured: true,
      },
      {
        id: 'proj-2',
        kicker: 'ARCHIVE PROJECT',
        title: 'Secondary Pipeline',
        summary: 'Non-featured project.',
        outcome: null,
        tagline: null,
        bullets: [],
        tech: ['JENKINS'],
        github_url: null,
        live_url: null,
        cover_url: null,
        files: [],
        featured: false,
      },
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'Master of Computer Applications (MCA)',
        institution: 'GRD College',
        score_label: 'CGPA',
        score: '8.05',
        note: 'PURSUING',
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        title: 'DevOps and Cloud',
        issuer: 'L&T EduTech',
        start_date: '2024-01-01',
        end_date: '2024-04-01',
        credential_url: 'https://example.com/cert/1',
        featured: true,
      },
      {
        id: 'cert-2',
        title: 'Container Services',
        issuer: 'L&T EduTech',
        start_date: '2024-06-01',
        end_date: null,
        credential_url: 'javascript:alert(2)',
        featured: false,
      },
    ],
    publications: [
      {
        id: 'pub-1',
        title: 'Resilient Failover Systems',
        venue: 'Cloud Conf',
        published_on: '2025-02-15',
        summary: 'Paper summary.',
        reference: 'DOI:10.000/test',
        url: 'https://example.com/paper',
      },
    ],
  }
}

function renderAtRoute(route: string, content = makePortfolioContent()) {
  return render(
    <ContentProvider initialContent={content} disableLiveUpdates>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </ContentProvider>,
  )
}

describe('Phase 2 & 3 portfolio sections and routes', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    window.scrollTo = () => {}
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })

  it('renders hero, about, skills, featured projects, education, featured certifications, and publications with URL sanitization', () => {
    renderAtRoute('/')

    // Navbar & Hero
    expect(screen.getByRole('heading', { level: 1, name: 'Harikrishnan R' })).toBeTruthy()
    // Hostile avatar URL falls back to initials instead of rendering untrusted <img>
    expect(screen.queryByRole('img', { name: 'Harikrishnan R' })).toBeNull()
    expect(screen.getByText('HR')).toBeTruthy()
    // Hero CTA with javascript: target is dropped, valid #projects CTA renders
    expect(screen.getByRole('link', { name: /View My Work/i }).getAttribute('href')).toBe('#projects')
    expect(screen.queryByRole('link', { name: 'Email Me' })).toBeNull()

    // About & Skills
    expect(screen.getByText('OVERVIEW AT A GLANCE')).toBeTruthy()
    expect(screen.getByText('01 DOMAINS')).toBeTruthy()
    expect(screen.getByText('2 TOOLS')).toBeTruthy()

    // Projects: featured only + N of M count + safe document host allow-list
    expect(screen.getByText(/1 OF 2 FEATURED CASE STUDIES/)).toBeTruthy()
    expect(screen.getByText('Multi-Region Deployment')).toBeTruthy()
    expect(screen.queryByText('Secondary Pipeline')).toBeNull()
    // Icon-only action buttons (no visible text, no Documents label or extension badge)
    const repoLink = screen.getByRole('link', { name: 'GitHub repository for Multi-Region Deployment (opens in a new tab)' })
    expect(repoLink).toBeTruthy()
    expect(repoLink.textContent?.trim()).toBe('')
    expect(screen.queryByRole('link', { name: 'Live demo of Multi-Region Deployment (opens in a new tab)' })).toBeNull()
    // Document icon button: valid file with safeStorageUrl passes, hostile file fails
    const docLink = screen.getByRole('link', { name: 'Open document Architecture.pdf for Multi-Region Deployment (opens in a new tab)' })
    expect(docLink).toBeTruthy()
    expect(docLink.textContent?.trim()).toBe('')
    expect(screen.queryByRole('link', { name: 'Open document Evil.pdf for Multi-Region Deployment (opens in a new tab)' })).toBeNull()
    expect(screen.queryByText(/Documents \(/i)).toBeNull()
    expect(screen.queryByText('PDF')).toBeNull()
    expect(
      screen.getByRole('link', { name: /View All Projects Archive \(2\)/i }).getAttribute('href'),
    ).toBe('/projects')

    // Education & Certifications
    expect(screen.getByText('8.05')).toBeTruthy()
    expect(screen.getByText(/1 OF 2 ACCREDITED CREDENTIALS/)).toBeTruthy()
    expect(screen.getByText('JAN 2024 - APR 2024')).toBeTruthy()
    expect(screen.queryByText('Container Services')).toBeNull()
    expect(
      screen.getByRole('link', { name: /View All Credentials Archive \(2\)/i }).getAttribute('href'),
    ).toBe('/certifications')

    // Publications
    expect(screen.getByText('Resilient Failover Systems')).toBeTruthy()
    expect(screen.getByText('15 FEB 2025')).toBeTruthy()

    // Custom sections: rich_text (plain text, no script), cards (safeUrl), gallery (safeImageUrl)
    expect(screen.getByText('<script>alert(1)</script> Plain text note.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open Safe Card' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Open Unsafe Card' })).toBeNull()
    expect(screen.getByAltText('Allowed Supabase Diagram')).toBeTruthy()
    expect(screen.queryByAltText('Blocked External Diagram')).toBeNull()

    // Footer with {year} plain-text replacement and status label
    const currentYear = String(new Date().getFullYear())
    expect(screen.getByText(`© ${currentYear} Harikrishnan R. All rights reserved.`)).toBeTruthy()
    expect(screen.getByText('SYSTEMS OPERATIONAL')).toBeTruthy()
  })

  it('renders /projects archive, /certifications archive, and 404 route', async () => {
    const first = renderAtRoute('/projects')
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: /Projects & Architecture Archive/i },
        { timeout: 5000 },
      ),
    ).toBeTruthy()
    expect(screen.getByText('Secondary Pipeline')).toBeTruthy()
    // Cover image on archive page (now uses shared ProjectCover component)
    expect(screen.getByRole('img', { name: 'Multi-Region Deployment preview' })).toBeTruthy()
    // Archive page also shows icon-only action buttons
    expect(screen.getByRole('link', { name: 'GitHub repository for Multi-Region Deployment (opens in a new tab)' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open document Architecture.pdf for Multi-Region Deployment (opens in a new tab)' })).toBeTruthy()
    expect(screen.queryByText('PDF')).toBeNull()
    expect(screen.getByRole('link', { name: /Back to portfolio/i }).getAttribute('href')).toBe('/')
    first.unmount()

    const second = renderAtRoute('/certifications')
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: /Certifications & Training Archive/i },
        { timeout: 5000 },
      ),
    ).toBeTruthy()
    expect(screen.getByText('Container Services')).toBeTruthy()
    expect(screen.getByText('JUN 2024')).toBeTruthy()
    second.unmount()

    renderAtRoute('/unknown-route')
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Back to portfolio/i }).getAttribute('href')).toBe('/')
  })

  describe('ProjectCover component', () => {
    function renderProjectCover(project: { cover_url: string | null; title: string }, variant: 'natural' | 'cropped' = 'cropped') {
      return render(
        <ContentProvider initialContent={makePortfolioContent()} disableLiveUpdates>
          <MemoryRouter initialEntries={['/']}>
            <ProjectCover project={{ ...makePortfolioContent().projects[0], ...project }} variant={variant} />
          </MemoryRouter>
        </ContentProvider>,
      )
    }

    it('renders with a valid Supabase storage URL (cropped variant default)', () => {
      const validCover = 'https://example.supabase.co/storage/v1/object/public/portfolio/projects/uuid/uuid-name.jpg'
      renderProjectCover({ cover_url: validCover, title: 'Test Project' }, 'cropped')

      const img = screen.getByRole('img', { name: 'Test Project preview' })
      expect(img).toBeTruthy()
      expect(img.getAttribute('src')).toBe(validCover)
      expect(img.getAttribute('width')).toBe('1280')
      expect(img.getAttribute('height')).toBe('720')
      expect(img.getAttribute('loading')).toBe('lazy')
      expect(img.getAttribute('decoding')).toBe('async')
      // Wrapper has correct styling
      const wrapper = img.parentElement
      expect(wrapper?.className).toContain('aspect-[16/9]')
      expect(wrapper?.className).toContain('overflow-hidden')
      expect(wrapper?.className).toContain('border')
      expect(wrapper?.className).toContain('border-line')
      expect(wrapper?.className).toContain('bg-surface')
    })

    it('does not render for javascript: URLs', () => {
      renderProjectCover({ cover_url: 'javascript:alert(1)', title: 'Test Project' })
      expect(screen.queryByRole('img', { name: 'Test Project preview' })).toBeNull()
    })

    it('does not render for data: URLs', () => {
      renderProjectCover({ cover_url: 'data:image/png;base64,AAAA', title: 'Test Project' })
      expect(screen.queryByRole('img', { name: 'Test Project preview' })).toBeNull()
    })

    it('does not render for http: URLs', () => {
      renderProjectCover({ cover_url: 'http://example.supabase.co/storage/v1/object/public/portfolio/test.jpg', title: 'Test Project' })
      expect(screen.queryByRole('img', { name: 'Test Project preview' })).toBeNull()
    })

    it('does not render for another host', () => {
      renderProjectCover({ cover_url: 'https://evil.example.com/storage/v1/object/public/portfolio/test.jpg', title: 'Test Project' })
      expect(screen.queryByRole('img', { name: 'Test Project preview' })).toBeNull()
    })

    it('does not render for path outside /storage/v1/object/public/', () => {
      renderProjectCover({ cover_url: 'https://example.supabase.co/storage/v1/object/authenticated/portfolio/test.jpg', title: 'Test Project' })
      expect(screen.queryByRole('img', { name: 'Test Project preview' })).toBeNull()
    })

    it('does not render for null cover_url', () => {
      renderProjectCover({ cover_url: null, title: 'Test Project' })
      expect(screen.queryByRole('img', { name: 'Test Project preview' })).toBeNull()
    })

    it('does not render for empty string cover_url', () => {
      renderProjectCover({ cover_url: '', title: 'Test Project' })
      expect(screen.queryByRole('img', { name: 'Test Project preview' })).toBeNull()
    })

    it('removes the box on load error', async () => {
      renderProjectCover({ cover_url: 'https://example.supabase.co/storage/v1/object/public/portfolio/test.jpg', title: 'Test Project' })
      const img = screen.getByRole('img', { name: 'Test Project preview' })
      expect(img).toBeTruthy()

      // Simulate error
      fireEvent.error(img)

      // The box should disappear
      expect(screen.queryByRole('img', { name: 'Test Project preview' })).toBeNull()
    })

    it('has correct alt text', () => {
      renderProjectCover({ cover_url: 'https://example.supabase.co/storage/v1/object/public/portfolio/test.jpg', title: 'My Awesome Project' })
      const img = screen.getByRole('img', { name: 'My Awesome Project preview' })
      expect(img.getAttribute('alt')).toBe('My Awesome Project preview')
    })

    it('has lazy loading and async decoding attributes', () => {
      renderProjectCover({ cover_url: 'https://example.supabase.co/storage/v1/object/public/portfolio/test.jpg', title: 'Test Project' })
      const img = screen.getByRole('img', { name: 'Test Project preview' })
      expect(img.getAttribute('loading')).toBe('lazy')
      expect(img.getAttribute('decoding')).toBe('async')
    })

    it('has explicit width and height attributes', () => {
      renderProjectCover({ cover_url: 'https://example.supabase.co/storage/v1/object/public/portfolio/test.jpg', title: 'Test Project' })
      const img = screen.getByRole('img', { name: 'Test Project preview' })
      expect(img.getAttribute('width')).toBe('1280')
      expect(img.getAttribute('height')).toBe('720')
    })

    it('renders on the archive page with the cropped variant', async () => {
      const { unmount } = renderAtRoute('/projects')
      // The archive page uses the cropped variant
      const img = screen.getByRole('img', { name: 'Multi-Region Deployment preview' })
      expect(img).toBeTruthy()
      expect(img.getAttribute('width')).toBe('1280')
      expect(img.getAttribute('height')).toBe('720')
      expect(img.getAttribute('loading')).toBe('lazy')
      expect(img.getAttribute('decoding')).toBe('async')
      // Wrapper should have aspect-[16/9] for cropped variant
      const wrapper = img.parentElement
      expect(wrapper?.getAttribute('data-variant')).toBe('cropped')
      unmount()
    })

    it('renders with natural variant: no object-fit cover, no fixed aspect ratio before and after load', () => {
      const validCover = 'https://example.supabase.co/storage/v1/object/public/portfolio/projects/uuid/uuid-name.jpg'
      renderProjectCover({ cover_url: validCover, title: 'Test Project' }, 'natural')

      const img = screen.getByRole('img', { name: 'Test Project preview' }) as HTMLImageElement
      expect(img).toBeTruthy()
      expect(img.getAttribute('src')).toBe(validCover)
      // Natural variant: no width/height attributes, no object-fit cover
      expect(img.getAttribute('width')).toBeNull()
      expect(img.getAttribute('height')).toBeNull()
      expect(img.className).not.toContain('object-cover')
      expect(img.className).toContain('object-contain')
      expect(img.parentElement?.getAttribute('data-variant')).toBe('natural')

      // Wrapper should be w-full, not aspect-[16/9], starting with 16 / 9 placeholder ratio
      const wrapper = img.parentElement as HTMLElement
      expect(wrapper.className).toContain('w-full')
      expect(wrapper.className).not.toContain('aspect-[16/9]')
      expect(wrapper.style.getPropertyValue('aspect-ratio')).toBe('16 / 9')

      // Simulate image load with natural dimensions
      Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true })
      Object.defineProperty(img, 'naturalHeight', { value: 600, configurable: true })
      fireEvent.load(img)

      // After load: still no object-cover or aspect-[16/9], wrapper switches to natural ratio
      expect(img.className).not.toContain('object-cover')
      expect(wrapper.className).not.toContain('aspect-[16/9]')
      expect(wrapper.style.getPropertyValue('aspect-ratio')).toBe('800 / 600')
    })

    it('renders cropped variant with explicit dimensions and object-fit cover', () => {
      const validCover = 'https://example.supabase.co/storage/v1/object/public/portfolio/projects/uuid/uuid-name.jpg'
      renderProjectCover({ cover_url: validCover, title: 'Test Project' }, 'cropped')

      const img = screen.getByRole('img', { name: 'Test Project preview' })
      expect(img).toBeTruthy()
      expect(img.getAttribute('width')).toBe('1280')
      expect(img.getAttribute('height')).toBe('720')
      expect(img.className).toContain('object-cover')
      // Wrapper should have data-variant="cropped"
      const wrapper = img.parentElement
      expect(wrapper?.getAttribute('data-variant')).toBe('cropped')
    })

    it('natural variant wraps image in anchor with correct attributes', () => {
      const validCover = 'https://example.supabase.co/storage/v1/object/public/portfolio/projects/uuid/uuid-name.jpg'
      renderProjectCover({ cover_url: validCover, title: 'Test Project' }, 'natural')

      const link = screen.getByRole('link', { name: /View full-size preview of Test Project \(opens in a new tab\)/i })
      expect(link).toBeTruthy()
      expect(link.getAttribute('href')).toBe(validCover)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
      expect(link.className).toContain('cursor-zoom-in')
      expect(link.className).toContain('hover:border-accent')
    })

    it('cropped variant does not wrap image in anchor', () => {
      const validCover = 'https://example.supabase.co/storage/v1/object/public/portfolio/projects/uuid/uuid-name.jpg'
      renderProjectCover({ cover_url: validCover, title: 'Test Project' }, 'cropped')

      expect(screen.queryByRole('link', { name: /View full-size preview of Test Project \(opens in a new tab\)/i })).toBeNull()
    })
  })

  describe('ProjectCaseStudy cover placement', () => {
    it('renders cover in left column (not right column) on home page', () => {
      const { container } = renderAtRoute('/')

      // The cover image should exist in the document
      const coverImg = container.querySelector('img[alt="Multi-Region Deployment preview"]')
      expect(coverImg).toBeTruthy()

      // The cover should NOT be inside a right-column context
      // (the right column is the second lg:col-span-8 child of the grid)
      const rightColumn = container.querySelector('[class*="lg:col-span-8"]')
      // The right column exists but should not contain the cover
      if (rightColumn) {
        expect(rightColumn.contains(coverImg!)).toBe(false)
      }

      // The cover should be inside a left-column context
      // (the left column is the first lg:col-span-4 child of the grid)
      const leftColumn = container.querySelector('[class*="lg:col-span-4"]')
      expect(leftColumn).toBeTruthy()
      expect(leftColumn?.contains(coverImg!)).toBe(true)
    })

    it('cover appears after tagline in left column', () => {
      const { container } = renderAtRoute('/')

      // The cover image should exist
      const coverImg = container.querySelector('img[alt="Multi-Region Deployment preview"]')
      expect(coverImg).toBeTruthy()

      // Find the tagline - it's a p element containing a span with aria-hidden
      const tagline = container.querySelector('p > span[aria-hidden="true"]')
      expect(tagline).toBeTruthy()

      // Both tagline and cover should be in the same column (left), and cover comes after tagline
      const taglineParent = tagline?.closest('[class*="lg:col-span"]')
      const coverParent = coverImg?.closest('[class*="lg:col-span"]')
      expect(taglineParent).toBeTruthy()
      expect(coverParent).toBeTruthy()
      expect(taglineParent).toBe(coverParent)
      expect(tagline!.compareDocumentPosition(coverImg!) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
    })
  })

  it('toggles light/dark theme from Navbar and ignores unknown section types', () => {
    renderAtRoute('/')
    const toggleBtn = screen.getByRole('button', { name: /Switch to light theme/i })
    fireEvent.click(toggleBtn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    const { container } = render(
      <RegisteredSection
        section={{
          id: 'sec-unknown',
          slug: 'unknown',
          type: 'totally_unknown_type',
          nav_label: null,
          eyebrow: null,
          title: 'Nope',
          subtitle: null,
          content: {},
          position: 99,
          show_in_nav: false,
        }}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  describe('ProjectCaseStudy action buttons', () => {
    const VALID_DOC_BASE = 'https://example.supabase.co/storage/v1/object/public/project-documents/proj-1'

    function renderCaseStudy(overrides: Partial<SiteContent['projects'][number]>) {
      const base = makePortfolioContent().projects[0]
      return render(
        <MemoryRouter>
          <ProjectCaseStudy
            project={{
              ...base,
              github_url: null,
              live_url: null,
              files: [],
              ...overrides,
            }}
            index={0}
          />
        </MemoryRouter>,
      )
    }

    it('renders repo only with icon-only link, matching title, target and rel', () => {
      const { container } = renderCaseStudy({
        title: 'Repo Only',
        github_url: 'https://github.com/example/repo',
      })
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0].getAttribute('aria-label')).toBe('GitHub repository for Repo Only (opens in a new tab)')
      expect(links[0].getAttribute('target')).toBe('_blank')
      expect(links[0].getAttribute('rel')).toBe('noopener noreferrer')
      expect(links[0].textContent?.trim()).toBe('')
      expect(links[0].classList.contains('icon-btn')).toBe(true)
      expect(container.querySelector('svg[aria-hidden="true"]')).toBeTruthy()
    })

    it('renders live demo only with icon-only link', () => {
      renderCaseStudy({
        title: 'Live Only',
        live_url: 'https://demo.example.com',
      })
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0].getAttribute('aria-label')).toBe('Live demo of Live Only (opens in a new tab)')
      expect(links[0].getAttribute('target')).toBe('_blank')
      expect(links[0].getAttribute('rel')).toBe('noopener noreferrer')
      expect(links[0].textContent?.trim()).toBe('')
    })

    it('renders document only with icon-only link', () => {
      renderCaseStudy({
        title: 'Doc Only',
        files: [{ name: 'Spec.pdf', url: `${VALID_DOC_BASE}/Spec.pdf`, path: 'project-documents/proj-1/Spec.pdf', type: 'application/pdf' }],
      })
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0].getAttribute('aria-label')).toBe('Open document Spec.pdf for Doc Only (opens in a new tab)')
      expect(links[0].getAttribute('target')).toBe('_blank')
      expect(links[0].getAttribute('rel')).toBe('noopener noreferrer')
      expect(links[0].textContent?.trim()).toBe('')
    })

    it('renders all three button types in order (GitHub, documents, live demo) with no visible text', () => {
      renderCaseStudy({
        title: 'All Three',
        github_url: 'https://github.com/example/all',
        live_url: 'https://all.example.com',
        files: [{ name: 'Guide.pdf', url: `${VALID_DOC_BASE}/Guide.pdf`, path: 'project-documents/proj-1/Guide.pdf', type: 'application/pdf' }],
      })
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(3)
      expect(links[0].getAttribute('aria-label')).toBe('GitHub repository for All Three (opens in a new tab)')
      expect(links[1].getAttribute('aria-label')).toBe('Open document Guide.pdf for All Three (opens in a new tab)')
      expect(links[2].getAttribute('aria-label')).toBe('Live demo of All Three (opens in a new tab)')
      for (const link of links) {
        expect(link.textContent?.trim()).toBe('')
        expect(link.getAttribute('target')).toBe('_blank')
        expect(link.getAttribute('rel')).toBe('noopener noreferrer')
      }
    })

    it('renders no button row when project has no valid links or files', () => {
      renderCaseStudy({ title: 'No Actions' })
      expect(screen.queryAllByRole('link')).toHaveLength(0)
      const heading = screen.getByRole('heading', { level: 3, name: 'No Actions' })
      expect(heading.parentElement?.children).toHaveLength(1)
      expect(heading.parentElement?.querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('caps document buttons at 3 and links +N button to /projects archive section', () => {
      const files = ['One.pdf', 'Two.pdf', 'Three.pdf', 'Four.pdf', 'Five.pdf'].map((name) => ({
        name,
        url: `${VALID_DOC_BASE}/${name}`,
        path: `project-documents/proj-1/${name}`,
        type: 'application/pdf',
      }))
      renderCaseStudy({ id: 'proj-overflow', title: 'Many Docs', files })

      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(4)
      expect(links.slice(0, 3).map((l) => l.getAttribute('aria-label'))).toEqual([
        'Open document One.pdf for Many Docs (opens in a new tab)',
        'Open document Two.pdf for Many Docs (opens in a new tab)',
        'Open document Three.pdf for Many Docs (opens in a new tab)',
      ])
      expect(screen.queryByRole('link', { name: /Four\.pdf/ })).toBeNull()

      const overflowLink = links[3]
      expect(overflowLink.textContent).toBe('+2')
      expect(overflowLink.getAttribute('href')).toBe('/projects#project-proj-overflow')
    })

    it('rejects hostile URLs for github, live, and document files', () => {
      renderCaseStudy({
        title: 'Hostile',
        github_url: 'javascript:alert(1)',
        live_url: 'data:text/html,<script>alert(1)</script>',
        files: [
          { name: 'js.pdf', url: 'javascript:alert(1)', path: 'a', type: 'application/pdf' },
          { name: 'data.pdf', url: 'data:application/pdf;base64,AA==', path: 'b', type: 'application/pdf' },
          { name: 'http.pdf', url: 'http://example.supabase.co/storage/v1/object/public/project-documents/a.pdf', path: 'c', type: 'application/pdf' },
          { name: 'other-host.pdf', url: 'https://evil.example.com/storage/v1/object/public/project-documents/a.pdf', path: 'd', type: 'application/pdf' },
          { name: 'bad-prefix.pdf', url: 'https://example.supabase.co/storage/v1/object/public/avatars/a.pdf', path: 'e', type: 'application/pdf' },
          { name: 'empty-obj.pdf', url: 'https://example.supabase.co/storage/v1/object/public/project-documents/', path: 'f', type: 'application/pdf' },
        ],
      })
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('CertificationRow PDF/verify button (F4)', () => {
    it('renders PDF icon button when credential_url ends with .pdf', () => {
      render(
        <CertificationRow
          index={0}
          certification={{
            id: 'cert-pdf',
            title: 'AWS Solutions Architect',
            issuer: 'Amazon Web Services',
            start_date: '2025-01-01',
            end_date: null,
            credential_url: 'https://example.com/certs/aws.pdf',
            featured: true,
          }}
        />,
      )
      const link = screen.getByRole('link')
      expect(link.getAttribute('aria-label')).toBe('Open certificate PDF for AWS Solutions Architect (opens in a new tab)')
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    })

    it('renders verify icon button for non-PDF https credential_url', () => {
      render(
        <CertificationRow
          index={1}
          certification={{
            id: 'cert-ext',
            title: 'CKA',
            issuer: 'CNCF',
            start_date: '2025-02-01',
            end_date: null,
            credential_url: 'https://credly.com/badges/1234',
            featured: true,
          }}
        />,
      )
      const link = screen.getByRole('link')
      expect(link.getAttribute('aria-label')).toBe('Verify credential for CKA (opens in a new tab)')
    })

    it('rejects hostile credential_url and renders no button', () => {
      render(
        <CertificationRow
          index={2}
          certification={{
            id: 'cert-bad',
            title: 'Hostile Cert',
            issuer: 'Test',
            start_date: '2025-02-01',
            end_date: null,
            credential_url: 'javascript:alert(1)',
            featured: true,
          }}
        />,
      )
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('PublicationsSection (F3)', () => {
    it('formats date as DD MON YYYY, shows badge, wraps long text, and filters hostile urls', async () => {
      const pubContent: SiteContent = {
        ...makePortfolioContent(),
        publications: [
          {
            id: 'pub-1',
            title: 'Zero-Downtime Blue/Green Deployments on ECS',
            venue: 'IEEE Cloud Engineering Conference',
            published_on: '2025-03-21',
            summary: 'Detailed architecture paper on zero-downtime ECS deployments.',
            reference: 'ISBN 978-1-2345-6789-0 · pp. 12-19 · Co-author: A. Dev',
            url: 'https://ieeexplore.ieee.org/document/123456.pdf',
          },
          {
            id: 'pub-2',
            title: 'Hostile URL Paper',
            venue: 'Local Symposium',
            published_on: '2024-11-05',
            summary: null,
            reference: null,
            url: 'javascript:alert(1)',
          },
        ],
      }

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(pubContent), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      )

      render(
        <ContentProvider snapshotOverride={pubContent}>
          <PublicationsSection
            section={{
              id: 'sec-pub',
              slug: 'publications',
              type: 'publications',
              nav_label: 'Papers',
              eyebrow: 'RESEARCH',
              title: 'Publications',
              subtitle: null,
              content: {},
              position: 6,
              show_in_nav: false,
            }}
          />
        </ContentProvider>,
      )

      expect(await screen.findByText('21 MAR 2025')).toBeTruthy()
      expect(screen.getAllByText('PRESENTED & PUBLISHED').length).toBeGreaterThanOrEqual(1)
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(1)
      expect(links[0].getAttribute('aria-label')).toBe(
        'Open paper document for Zero-Downtime Blue/Green Deployments on ECS (opens in a new tab)',
      )
    })
  })
})
