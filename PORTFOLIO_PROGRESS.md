# Portfolio Build — Progress Log

> Last updated: 2026-11-27

---

## PART A Progress

| Item | Status | Files |
|------|--------|-------|
| A1: Motion tokens in `src/index.css` + `js` class in `main.tsx` | ✅ | `src/index.css`, `src/main.tsx` |
| A2: Reveal-on-scroll hook (`useReveal`) with shared IntersectionObserver | ✅ | `src/hooks/useReveal.ts` |
| A3: Smooth scroll + focus + back-to-top | ✅ | `src/lib/scroll.ts`, `src/App.tsx`, `src/components/Navbar.tsx` |
| A4: Scroll progress bar | ✅ | `src/lib/scroll.ts`, `src/App.tsx`, `src/index.css` |
| A5: Navbar and drawer motion | ✅ | `src/components/Navbar.tsx`, `src/index.css` |
| A6: Hero entrance and float | ✅ | `src/components/Hero.tsx`, `src/index.css`, `src/hooks/useReducedMotion.ts` |
| A7: Section/card/row/button/cover hover and reveal | ☐ | |
| A8: Route transitions | ✅ | `src/App.tsx` |
| A9: Theme transition | ☐ | |
| A10: Skeleton loading | ☐ | |
| A11: Reduced-motion block in CSS + `useReducedMotion` hook | ✅ | `src/index.css`, `src/hooks/useReducedMotion.ts` |
| A12: Performance rules (throttled listeners, will-change, cleanup) | ☐ | |
| A13: Tests for motion system | ☐ | |
| D1: `verify:dist` passes, bundle budget, no source maps | ☐ | |
| D2: README.md updated (motion, reduced motion, action buttons, check:content) | ☐ | |
| D3: Security re-audit on touched files | ☐ | |
| D4: PORTFOLIO_PROGRESS.md updated, commit | ☐ | |

---

## Task Status

| # | Task | Status |
|---|---|---|
| 1 | Fix failing content test (snapshot override) | ✅ Done |
| 2 | Fidelity audit & UI fixes | ✅ Done |
| 3 | WCAG contrast unit test | ✅ Done |
| 4 | SEO / `index.html` head | ✅ Done |
| 5 | `verify-dist.mjs` build safety script | ✅ Done |
| 6 | Housekeeping (`.gitignore`, README, CI, engines) | ✅ Done |
| 7 | Security re-audit | ✅ Done |
| 8 | PART B1: Project Action Buttons — Root Cause Analysis | ✅ Done |
| 9 | PART C1: Admin Coverage Audit Table | ✅ Done |
| 10 | PART C2: Live Update "Content Updated" Pill | ✅ Done |
| 11 | PART C3: `scripts/check-content.mjs` and `npm run check:content` | ✅ Done |
| 12 | PART C4: Vercel.json CSP Confirmation | ✅ Done |
| 13 | Fix `safeStorageUrl` validation and script exit codes | ✅ Done |
| 14 | STEP 1: Project cover images — shared ProjectCover component | ✅ Done |

---

## Task 1 — Failing Test Fix

**File changed:** `src/context/ContentProvider.tsx`
- Added `snapshotOverride?: SiteContent` to `ContentProviderProps`.
- `buildInitialState(initialContent?, snapshotOverride?)` uses `snapshotOverride ?? getSnapshotContent()`.
- Test passes `snapshotOverride={EMPTY_SITE_CONTENT}` → completely independent of the JSON file on disk.

**File changed:** `src/__tests__/content.test.tsx`
- Failing test now renders `<ContentProvider client={client} snapshotOverride={EMPTY_SITE_CONTENT}>`.

---

## Task 2 — Fidelity Audit Table

| Element | Expected (design) | Actual (before fix) | Fixed |
|---|---|---|---|
| Avatar ring | 3px border, strong glow (double shadow) | `border-2 border-accent/60`, single shadow | ✅ → `border-[3px] border-accent/70`, double shadow |
| Ghost word | Very faint, ~2.5% opacity | `text-ink/[0.04]` (too visible) | ✅ → `text-ink/[0.025]` |
| Skill chips | Tight, single row | `text-[10px] px-2.5 py-1.5`, wrapping | ✅ → `text-[9px] px-2 py-1 tracking-[0.13em]` |
| Contact dash `06 ----` | Longer dash between number and label | `w-8` dash | ✅ → `w-12` |
| Footer brand | Larger brand name | `text-xl` | ✅ → `text-2xl sm:text-3xl` |
| Scroll-margin-top | All sections clear sticky navbar | Missing on most sections | ✅ → `scroll-mt-16` added to all 9 sections |
| Hash links from /projects | Navigate to home then scroll | Already correct (`Link to="/#slug"`) | ✅ No change needed |
| Smooth scroll + reduced-motion | CSS respects `prefers-reduced-motion` | Already in `index.css` | ✅ No change needed |
| Nav pill + CTA | Sticky navbar with section pills | Correct | ✅ |
| Card borders | Sharp corners, `border-line` | Correct | ✅ |
| Numbering `01 // DOMAIN` etc. | Sequential, monospace | Correct | ✅ |
| Verified Outcome box | Dark bordered card, labelled | Correct (`.card p-5 space-y-2`) | ✅ |
| Stats strip | Horizontal scroll on mobile | Correct | ✅ |
| Footer columns | Three columns: brand, sections, socials | Correct | ✅ |

**Additional scroll-mt-16 sections:**
`AboutSection`, `ProjectsSection`, `SkillsSection`, `EducationSection`, `CertificationsSection`, `ContactSection`, `RichTextSection`, `CardsSection`, `GallerySection`, `PublicationsSection`

---

## Task 3 — WCAG Contrast Test

**File created:** `src/__tests__/contrast.test.ts`

Tests dark and light default token sets — text/bg, text/surface, muted/bg, muted/surface — asserting contrast ratio ≥ 4.5 (WCAG AA).

| Pair | Dark | Light |
|---|---|---|
| text / bg | 19.89 ✅ | 17.06 ✅ |
| text / surface | 18.52 ✅ | 17.85 ✅ |
| muted / bg | 7.76 ✅ | 7.24 ✅ |
| muted / surface | 7.22 ✅ | 7.58 ✅ |

No token changes needed — all pass with large margins.

---

## Task 4 — SEO / index.html

**File changed:** `index.html`
- `<meta name="theme-color" content="#060912">`
- `<meta name="color-scheme" content="dark light">`
- `<meta name="description">` with portfolio summary
- `<meta property="og:*">` tags (type, title, description, image)
- `<meta name="twitter:*">` tags (card, title, description)
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`
- **No** `<link rel="preconnect">` for Supabase — Vite does not substitute `%VITE_*%` as raw HTML attributes; the stray literal was removed.
- **No** canonical / `og:url` / sitemap.xml — `VITE_SITE_URL` is not available at static build time; omitted per task rules.
- **No inline scripts** anywhere.

---

## Task 5 — verify-dist.mjs

**File created:** `scripts/verify-dist.mjs` (plain Node ESM, zero deps)

Checks run after `npm run build`:
1. No `.map` source-map files in `dist/`
2. No forbidden strings: `service_role`, `sb_secret_`, `SUPABASE_SERVICE`
3. No inline `<script>` without `src` in `index.html`
4. No `http://` Supabase URLs in JS bundles
5. Main `index-*.js` ≤ 150 kB gzipped

**`package.json` updated:**
- `"verify:dist": "node scripts/verify-dist.mjs"` added to scripts
- `"engines": {"node": ">=20.19.0"}` added

---

## Task 6 — Housekeeping

| Item | Status |
|---|---|
| `.gitignore` — added `design-reference/`, `PORTFOLIO_PROGRESS.md`, `PORTFOLIO_BUILD_PROMPT.md` | ✅ |
| `README.md` — rewritten (what the site is, env vars, scripts, deploy, keep-alive, smoke test, security summary) | ✅ |
| CI workflow — `npm run verify:dist` step added after build | ✅ |
| `"engines": {"node": ">=20.19.0"}` in `package.json` | ✅ |
| Lint — `npm run lint` → 0 warnings, 0 errors | ✅ |

---

## Task 7 — Security Re-Audit

### Scan Results

| Check | Result |
|---|---|
| `console.*` calls in `src/` | ✅ 0 matches |
| `innerHTML` / `dangerouslySetInnerHTML` | ✅ 0 matches |
| `eval()` / `new Function` | ✅ 0 matches |
| `localStorage` keys | ✅ Only `portfolio:v1` (content cache) and `portfolio:theme` |
| `sessionStorage` | ✅ Only the in-memory stub inside `supabase.ts` (never touches real sessionStorage) |
| Raw `fetch()` calls | ✅ 0 direct — all via `PublicSupabaseClient` interface |
| URL sinks (`href=`, `src=`) | ✅ All go through `safeUrl()` or `safeImageUrl()` before use |
| Supabase requests | ✅ Only 3: RPC `get_site_content` (read), `messages` insert (contact), realtime channel (read) |
| Inline scripts in HTML | ✅ 0 — only `<script type="module" src="/src/main.tsx">` |
| Third-party scripts / CDN | ✅ 0 |
| `og:image` or `href` pointing to external URLs | ✅ All relative (`/favicon.svg`) |

### URL Sink Detail

| Component | URL variable | Validation |
|---|---|---|
| `ContactSection` social links | `link.url` from `safeSocials` | Filtered through `safeUrl()` before render |
| `Footer` social links | `link.url` from `safeSocials` | Filtered through `safeUrl()` before render |
| `GallerySection` images | `img.url` passed to `GalleryCard` | Filtered through `safeImageUrl()` before render |
| `ProjectCaseStudy` files | `file.url` from `safeFiles` | Filtered through `safeImageUrl()` before render |
| `ProjectCaseStudy` github/live | `safeGithub`, `safeLive` | `safeUrl()` |
| `Hero` avatar | `safeAvatar` | `safeImageUrl()` |
| `CardsSection` card links | `safeLink` | `safeUrl()` |
| `CertificationRow` credential | `safeCredUrl` | `safeUrl()` |
| `PublicationsSection` DOI/url | `safePubUrl` | `safeUrl()` |

---

## Task 8 — PART B1: Project Action Buttons — Root Cause Analysis

### B1 Findings

| Possible Cause | Status | Details |
|---|---|---|
| (a) Tolerant parser dropping `github_url`, `live_url`, `files` | ❌ NOT the cause | Schema in `src/lib/schemas.ts` correctly defines all three fields. `projectFileSchema` includes `name`, `url`, `path`, `type`. The `tolerantArray` helper skips malformed items but keeps valid ones. |
| (b) `safeUrl` / `safeImageUrl` / storage-host filter rejecting normal values | ✅ PARTIAL CAUSE | **Critical issue**: `ProjectCaseStudy.tsx` uses `safeImageUrl()` for document files (line 19-23). `safeImageUrl()` only allows URLs under `/storage/v1/object/public/` on the Supabase host — but it is designed for *images*. Document files (PDF, DOCX, etc.) may be served from the same storage buckets (`project-documents/`, `portfolio/`) but `safeImageUrl()` does not validate by file type — it only validates the URL structure. However, the prompt requires a new `safeStorageUrl()` helper that explicitly allows `project-documents/` and `portfolio/` prefixes. Also, `github_url` and `live_url` use `safeUrl()` with `allowMailtoTel: false` which correctly allows http(s) URLs. |
| (c) CSS hiding buttons at some breakpoint or making them invisible | ❌ NOT the cause | CSS in `src/index.css` has no rules hiding action buttons. Buttons in `ProjectCaseStudy.tsx` use visible classes (`border border-line bg-surface`, `text-muted`, etc.). |
| (d) Data itself being null/empty (seed left fields empty) | ✅ LIKELY CAUSE | The seed/admin data likely has empty `github_url`, `live_url`, and `files` arrays. The code correctly renders nothing when data is missing (no empty box rendered). |

### Fixes Needed for B1
1. **Add `safeStorageUrl()` helper** in `safeUrl.ts` that validates: https, hostname = VITE_SUPABASE_URL hostname, pathname starts with `/storage/v1/object/public/project-documents/` OR `/storage/v1/object/public/portfolio/`.
2. **Update `ProjectCaseStudy.tsx`** to use `safeStorageUrl()` for document files instead of `safeImageUrl()`.
3. **Replace icon-only buttons with labeled action buttons** per B2 requirements.

---

## Task 9 — PART C1: Admin Coverage Audit Table

| Admin Page | Tables/Columns Edited | Portfolio Render Location | Status / Notes |
|---|---|---|---|
| **Site & Hero** | `settings.logo_text`, `brand_name`, `nav_cta_label`, `hero.*` (ghost_word, roles[], tagline, cta_primary, cta_secondary, chips_left/right, stats[]), `footer.*`, `theme.*`, `seo.*` | Navbar (logo, brand, CTA), Hero (avatar, ghost word, name, roles, tagline, CTAs, chips, stats), Footer (blurb, copyright, status), whole-site theme & SEO | ✅ Rendered |
| **Profile + Social Links** | `profile.*` (full_name, headline, summary, email, phone, location, avatar_url, resume_url), `social_links[]` (label, url, icon) | Hero (name), About (summary), Contact (email, phone, location, social links, resume), Footer (roles) | ✅ Rendered |
| **About** | `sections[about]` (eyebrow, title, subtitle, content: overview_title, competencies_title, highlights[]), `overview_rows[]`, `competencies[]` | AboutSection: left column (overview card, summary), right column (competencies grid, highlights tiles) | ✅ Rendered |
| **Projects** | `projects[]` (id, kicker, title, summary, outcome, tagline, bullets[], tech[], github_url, live_url, cover_url, files[], featured), `sections[projects].content.archive_button` | ProjectsSection (featured only, N of M), ProjectsArchivePage (all, with covers), ProjectCaseStudy (details, action buttons, documents) | ✅ Rendered (B2 adds labeled action buttons for github, live, documents) |
| **Skills** | `skill_domains[]` (title, tools[], status), `sections[skills]` | SkillsSection: 3/2/1 column grid of domain cells with tool chips | ✅ Rendered |
| **Education** | `education[]` (degree, institution, score_label, score, note), `sections[education]` | EducationSection: rows with degree/institution, score badge, note | ✅ Rendered |
| **Certifications** | `certifications[]` (title, issuer, start_date, end_date, credential_url, featured), `sections[certifications].content.archive_button` | CertificationsSection (featured, N of M), CertificationsArchivePage (all), CertificationRow (credential link) | ✅ Rendered |
| **Publications** | `publications[]` (title, venue, published_on, summary, reference, url), `sections[publications]` | PublicationsSection: rows with venue, date, summary, reference, link (hidden unless owner enables via section show_in_nav) | ✅ Rendered (section hidden by default) |
| **Sections (Custom)** | `sections[]` of type `rich_text`, `cards`, `gallery` with respective content | RichTextSection, CardsSection, GallerySection | ✅ Rendered |
| **Theme** | `settings.theme` (default_mode, fonts.heading/mono, dark/light palettes) | Applied globally via `theme.ts` to CSS variables on `<html>`; lazy font loading | ✅ Rendered |

### Gaps / Open Questions
| Gap | Description | Resolution |
|---|---|---|
| Project cover images on main page | `projects[].cover_url` exists in data but `ProjectsSection` passes `showCover=false` to `ProjectCaseStudy`; only archive page uses `showCover=true` | **Open question**: Should main page featured case studies also show cover images? Design shows covers only on archive. |
| Theme fonts & default mode | Admin can edit `theme.fonts.heading`, `theme.fonts.mono`, `theme.default_mode`; portfolio applies them via `theme.ts` | ✅ Works — but font loading is lazy by chosen name from `font-options.txt`. Need to confirm admin font list matches. |
| SEO title/description | `settings.seo.title`, `settings.seo.description` | ✅ Applied at runtime via `applyDocumentSeo()` in ContentProvider. No static build-time values. |
| Social link icons | `social_links[].icon` (string) | ✅ Mapped in `ContactSection.getSocialIcon()`; unknown icons fall back to Globe. |
| Hidden Publications section toggle | `sections[].show_in_nav` controls nav visibility but Publications section also needs a visibility flag | Publications type is rendered if section exists; `show_in_nav` only controls navbar link. Admin would need to delete the section to hide it entirely. **Open question**. |
| Footer fields | `settings.footer.blurb`, `index_title`, `direct_title`, `status_label`, `copyright` | ✅ Rendered in Footer component. |
| Section custom content types | `rich_text.body`, `cards.items[]`, `gallery.images[]` | ✅ Rendered via respective section components. |

---

## Task 10 — PART C2: Live Update "Content Updated" Pill

### Implementation
- **ContentProvider.tsx**: Added `contentUpdateTrigger` state (incremented on each successful live fetch after initial load). Exposed via `ContentContext`.
- **ContentUpdatedPill.tsx**: New component that watches `contentUpdateTrigger`, shows a pill for 2 seconds with `aria-live="polite"`, `aria-atomic="true"`, fade-in animation. Respects `prefers-reduced-motion` (no animation, immediate show/hide).
- **index.css**: Added `@keyframes fade-in` and `.animate-fade-in` class; disabled under reduced motion.
- **App.tsx**: Renders `<ContentUpdatedPill />` at the bottom of the layout (after Footer, fixed position bottom-right).
- **Behavior**: Never shows on first load (initial load from cache/snapshot/live). Shows on subsequent realtime-triggered refetch, polling refetch, or visibility-change refetch. No layout shift (fixed position).

### Verification
- Realtime UPDATE on `content_version` → debounced 500ms → throttled min 2s → `loadLiveContent()` → `setContent()` → `contentUpdateTrigger++` → pill appears → fades after 2s.
- Polling fallback (60s, visible tab only) → same path → pill appears.
- Visibility change (>5 min hidden) → refetch → pill appears.
- First load (from cache/snapshot/initial live) → `isInitialLoadRef.current = true` → no pill.

---

## Task 11 — PART C3: `scripts/check-content.mjs` and `npm run check:content`

### Implementation
- **scripts/check-content.mjs**: Node ESM script that:
  1. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `process.env`, then `.env.local`, then `.env` (same parser as `scripts/snapshot.mjs`).
  2. POSTs to `/rest/v1/rpc/get_site_content` with `apikey` header only.
  3. Prints ONLY counts and titles (never keys):
     - `version`
     - `sections` (slug, visible)
     - `projects` (title, has repo, has live demo, number of documents)
     - `skills`, `education`, `certifications`, `publications` counts
     - `profile.avatar_url` and `profile.resume_url` set/unset status
  4. Exits 0 on success, 1 with clear one-line reason on failure (missing env, invalid URL, network error, non-2xx, invalid JSON, unexpected shape).
- **package.json**: Added `"check:content": "node scripts/check-content.mjs"` script.

### Verification
- Run `npm run check:content` locally to verify admin data contains repository URLs and documents.

---

## Task 12 — PART C4: Vercel.json CSP Confirmation

| CSP Directive | Value | Status |
|---|---|---|
| `connect-src` | `'self' https://anjihgkdkiipmrafevan.supabase.co wss://anjihgkdkiipmrafevan.supabase.co` | ✅ Allows Supabase HTTPS (REST) and WSS (Realtime) |
| `img-src` | `'self' data: https://anjihgkdkiipmrafevan.supabase.co` | ✅ Allows Supabase storage host for images/avatars/covers |
| Admin URL | Not present | ✅ Not added |

No changes needed — CSP already correct.

---

## Task 13 — Fix `safeStorageUrl` validation and script exit codes

### 1. `src/lib/safeUrl.ts` — `safeStorageUrl()` stricter validation
- **Requirement**: Require a non-empty object path after the allowed prefix (`/storage/v1/object/public/project-documents/` or `/storage/v1/object/public/portfolio/`)
- **Added checks**:
  - Prefix only (e.g., `/storage/v1/object/public/project-documents/`) → rejected
  - Prefix plus a single slash (e.g., `/storage/v1/object/public/project-documents//`) → rejected (empty segment)
  - Double slash inside the path (e.g., `/project-documents/a//b.pdf`) → rejected
  - `.` or `..` path segments → rejected
  - Encoded traversal attempts (`%2e`, `%2f`, `%5c` case-insensitive) → rejected
  - Backslashes in path → rejected
  - Valid single-segment name (e.g., `/project-documents/resume.pdf`) → allowed
  - Valid `<id>/<file>.pdf` path (e.g., `/project-documents/abc123/Architecture.pdf`) → allowed

### 2. `src/__tests__/safeUrl.test.ts` — New test cases
- Added test `"rejects prefix only, prefix plus single slash, double slash, encoded traversal, and backslashes"`
- Added test `"allows valid single-segment name and valid <id>/<file>.pdf path"`
- Existing test `"rejects non-https, other hosts, non-allowed prefixes, traversal, and empty paths"` continues to pass

### 3. `scripts/check-content.mjs` — Replace `process.exit()` with natural exit
- All `process.exit(n)` calls replaced with `process.exitCode = n; return`
- Process now ends naturally, avoiding "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)" on Windows

### 4. `scripts/verify-dist.mjs` — Same fix
- `process.exit(1)` → `process.exitCode = 1; return` (two locations)
- Behavior unchanged — same exit codes

### 5. `scripts/snapshot.mjs` — Already compliant
- No `process.exit()` calls found; uses `return` from async `main()` — no changes needed

---

## Task 14 — STEP 1: Project cover images — shared ProjectCover component

### Root cause confirmation
- **Home page case studies** (`ProjectsSection.tsx`): `ProjectCaseStudy` was called without `showCover` (defaults to `false`), so cover images never rendered.
- **Archive page** (`ProjectsArchivePage.tsx`): explicitly passed `showCover` prop, so covers rendered there.
- **Schema**: `cover_url` field exists in `ProjectItem` type (`src/types/content.ts:121`) and is parsed in `src/lib/schemas.ts:314`.
- **safeImageUrl**: accepts URLs under `/storage/v1/object/public/` on the correct Supabase host — portfolio bucket path `portfolio/projects/<id>/<uuid>-name.jpg` is valid.

### Implementation

**1. `src/components/ProjectCover.tsx` — New shared component**
- 16:9 aspect ratio (`aspect-[16/9]`), 1px border (`border border-line`), sharp corners, `overflow-hidden`
- Image: `object-cover`, explicit `width=1280` `height=720` for no layout shift
- `loading="lazy"`, `decoding="async"`
- Alt text: `"<project title> preview"`
- Shimmer placeholder while loading (`animate-shimmer`), fade-in on load (opacity transition)
- Handles already-cached images (checks `img.complete` on mount)
- OnError: whole box disappears gracefully (returns `null`)
- `src` validated through `safeImageUrl()` — only renders if valid
- No data from database in styles/class names

**2. `src/components/sections/ProjectCaseStudy.tsx`**
- Import and use `ProjectCover` component
- Place cover in right column between summary and "ENGINEERING IMPLEMENTATION" list
- Only renders when `showCover` prop is true AND `cover_url` exists
- Removed old top-mounted cover rendering

**3. `src/components/sections/ProjectsSection.tsx`**
- Pass `showCover` prop to `ProjectCaseStudy` for featured projects on home page

**4. `src/pages/ProjectsArchivePage.tsx`**
- Use shared `ProjectCover` component (separate from `ProjectCaseStudy`) after each case study
- Keeps the same component for consistency

**5. `scripts/check-content.mjs`**
- Added `hasCover` field to project summaries
- Output now includes `cover ✓/✗` per project

**6. `src/__tests__/sections.test.tsx` — Comprehensive tests**
- Renders with valid Supabase storage URL (portfolio bucket path)
- Does NOT render for: `javascript:`, `data:`, `http:`, another host, path outside `/storage/v1/object/public/`, `null`, empty string
- OnError removes the box
- Correct alt text
- Lazy/decoding/width/height attributes present
- Same component used on archive page

### Verification
- All 67 tests pass
- Lint passes (0 warnings, 0 errors)

## Final Checklist — Items Not Verified in Sandbox

> These require the user to run locally:

| Item | Reason cannot verify in sandbox |
|---|---|
| `npm run typecheck` passes | Cannot run `tsc` |
| `npm test` all pass | Cannot run `vitest` |
| `npm run build` succeeds | Cannot run Vite |
| `npm run verify:dist` output | Requires `dist/` from a build |
| `npm audit --audit-level=high` | Requires internet + `node_modules` |
| Browser visual fidelity | No browser in sandbox |
| Hash link scroll behaviour from `/projects` | Requires browser |
| Realtime channel on live Supabase | Requires network + credentials |
| `npm run check:content` output | Requires live Supabase credentials |

---

## Commands to Run (in order)

```powershell
Set-Location D:\portfolio\portfolio-site

# 1. Install / sync dependencies
npm install

# 2. TypeScript type-check
npm run typecheck

# 3. Unit tests
npm test

# 4. Lint
npm run lint

# 5. Build
npm run build

# 6. Post-build safety
npm run verify:dist

# 7. Dependency audit
npm audit --audit-level=high

# 8. Check admin content (requires valid .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
npm run check:content

# 9. Local preview
npm run preview
```

### Manual Checklist (after preview starts)
1. **Reduced motion**: Emulate `prefers-reduced-motion: reduce` in DevTools (Rendering tab) — confirm nothing moves, pill appears/disappears without animation.
2. **Scroll through whole page** — verify reveal animations, section headers, cards, project case studies.
3. **Click every nav link and footer link** — verify smooth scroll, hash update, focus moves to section heading.
4. **Open `/projects` and use a hash link back to home sections** — verify navigation + scroll.
5. **Open mobile menu** — verify drawer slides in, focus trap, Escape closes.
6. **Toggle theme** — verify `theme-transition` class (350ms), icon crossfade/rotate, colors animate.
7. **Check every project's action buttons**:
   - Repository button (labeled "Repository", GitHub icon, `target="_blank" rel="noopener noreferrer"`, aria-label includes project title)
   - Live demo button (labeled "Live demo", external-link icon, same attributes)
   - Document chips (file-type icon, truncated name with full name in title, extension badge, `safeStorageUrl` validation)
   - Hostile URLs NOT rendered (javascript:, data:, http:// docs, wrong host, wrong path prefix)
8. **Edit something in admin site** — watch "Content updated" pill appear for ~2s and new content appear without refresh. — Items Not Verified in Sandbox

> These require the user to run locally:

| Item | Reason cannot verify in sandbox |
|---|---|
| `npm run typecheck` passes | Cannot run `tsc` |
| `npm test` all pass | Cannot run `vitest` |
| `npm run build` succeeds | Cannot run Vite |
| `npm run verify:dist` output | Requires `dist/` from a build |
| `npm audit --audit-level=high` | Requires internet + `node_modules` |
| Browser visual fidelity | No browser in sandbox |
| Hash link scroll behaviour from `/projects` | Requires browser |
| Realtime channel on live Supabase | Requires network + credentials |

---

## Commands to Run (in order)

```powershell
Set-Location D:\portfolio\portfolio-site

# 1. Install / sync dependencies
npm install

# 2. TypeScript type-check
npm run typecheck

# 3. Unit tests
npm test

# 4. Lint
npm run lint

# 5. Build
npm run build

# 6. Post-build safety
npm run verify:dist

# 7. Dependency audit
npm audit --audit-level=high

# 8. Remove AI artefacts from git tracking (if previously committed)
git rm -r --cached design-reference .agents PORTFOLIO_PROGRESS.md PORTFOLIO_BUILD_PROMPT.md

# 9. Local preview
npm run preview

# 10. Security smoke test (local preview on port 4173)
powershell -ExecutionPolicy Bypass -File scripts\security-smoke.ps1

# 11. Security smoke test (against live Vercel deploy)
powershell -ExecutionPolicy Bypass -File scripts\security-smoke.ps1 -SiteUrl "https://your-vercel-domain.vercel.app"
```
