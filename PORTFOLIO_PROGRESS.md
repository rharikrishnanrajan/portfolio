# Portfolio Site Build Progress

## Phase 0: Scaffold, config, foundations
Completed foundation setup, theme/URL/color/date/schema validators, lazy `@fontsource` loading, and Vitest setup.

### Files
- `.gitignore` - modified - Added rules for `.env`, `.env.*` (except `.env.example`), `src/generated/`, and build/AI artifacts.
- `.oxlintrc.json` - modified - Added `ignorePatterns` for `design-reference/**`, `dist/**`, and `src/generated/**`.
- `package.json` - modified - Added allowed dependencies, `@fontsource-variable/*` and `@fontsource/ibm-plex-mono` packages, `"prebuild": "node scripts/snapshot.mjs"`, `"typecheck"`, `"test"`, `"lint"`, and `"audit"` scripts.
- `vitest.config.ts` - created - Configured Vitest with `jsdom` environment and excluded `design-reference/**`.
- `vite.config.ts` - modified - Enabled React and Tailwind v4 plugins, `build.sourcemap: false`, and Rolldown `dropConsole`/`dropDebugger` production stripping.
- `index.html` - modified - Added `data-theme="dark"`, `color-scheme`, SEO fallback meta description, and SVG favicon link.
- `public/favicon.svg` - modified - Added HK monogram SVG favicon.
- `src/index.css` - modified - Adapted admin theme RGB tokens, light-mode `[data-theme="light"]` tokens, font CSS vars, skip link, focus styles, reduced-motion rules, `.eyebrow`, `.card`, `.input`, `.btn-primary`, `.btn-secondary`, and `.reveal`.
- `src/types/content.ts` - created - Added strict TypeScript types matching the `get_site_content` RPC contract.
- `src/lib/supabase.ts` - created - Public Supabase transport (updated in Step A).
- `src/lib/safeUrl.ts` - created - Implemented `safeUrl`, `safeImageUrl` (Supabase public storage host allow-list), and `safeHeroTarget`.
- `src/lib/color.ts` - created - Implemented `"R G B"` validation (`0-255`), hex conversion, and WCAG contrast ratio helpers.
- `src/lib/dates.ts` - created - Implemented timezone-safe string-based `YYYY-MM-DD` month formatting (`formatMonthYear`, `formatDateRange`).
- `src/lib/schemas.ts` - created - Implemented tolerant Zod schemas for `get_site_content` and section `content` payloads.
- `src/lib/theme.ts` - created - Implemented validated runtime CSS variable application, `localStorage` light/dark persistence, and lazy `@fontsource` loading from `font-options.txt`.
- `src/__tests__/color.test.ts` - created - Unit tests for RGB validation, CSS injection rejection, hex conversion, and contrast.
- `src/__tests__/dates.test.ts` - created - Unit tests for string-based month/range formatting.
- `src/__tests__/safeUrl.test.ts` - created - Unit tests for `safeUrl`, `safeImageUrl`, and `safeHeroTarget` including obfuscation and control-character vectors.
- `src/__tests__/schemas.test.ts` - created - Unit tests for tolerant schemas, font aliases/allow-list, and hostile theme rejection.

---

## Phase 1: Data layer
Implemented build-time snapshot generation, resilient RPC fetching with timeout/retry/cache, realtime/polling/visibility sync, error boundary, status views, and initial verification shell.

### Files
- `scripts/snapshot.mjs` - created - Non-fatal prebuild script fetching `get_site_content` and writing `src/generated/content.snapshot.json` (or empty valid snapshot on failure).
- `src/generated/content.snapshot.json` - created (git-ignored) - Initial empty-but-valid snapshot so `tsc -b` succeeds before the first build.
- `src/lib/content.ts` - created - Implemented `portfolio:v1` localStorage cache read/write, snapshot fallback, and `fetchSiteContent` with 15 s timeout and up to 3 retries with exponential backoff and jitter on network/5xx/429 errors.
- `src/context/contentContext.ts` - created - Defined `ContentContext` and `useContent()` hook.
- `src/context/ContentProvider.tsx` - created - Implemented instant cache/snapshot hydration, live RPC revalidation, theme/SEO application, `content_version` realtime subscription (500 ms debounce, 2 s throttle), 60 s polling fallback when tab visible, and >5 minute visibility refetch.
- `src/components/ErrorBoundary.tsx` - created - Root and per-section ErrorBoundary with friendly fallback (no stack traces or raw error text).
- `src/components/StatusViews.tsx` - created - Designed `LoadingView`, `UnavailableView` (with Retry button), and `EmptyView` states.
- `src/__tests__/content.test.ts` - created - Unit tests for cache read/write, snapshot fallback, retry/backoff/4xx/abort behavior.
- `src/__tests__/content.test.tsx` - created - Component/integration tests for `ErrorBoundary`, `StatusViews`, `ContentProvider` offline cache fallback, unavailable/retry recovery, realtime debounce, 60 s polling fallback, and >5 min visibility refetch.

---

## Step A: Shrink data client (`fetch` + lazy `@supabase/realtime-js`)
Removed `@supabase/supabase-js` from `package.json` and replaced it with plain `fetch` for RPC reads and contact inserts, plus lazy-loaded `@supabase/realtime-js` (dynamic `import()` after first content render) for the `content_version` channel. Switched `IBM Plex Mono` lazy loader to `latin-*.css` entry points.

### Files
- `package.json` - modified - Removed `@supabase/supabase-js`; added `"@supabase/realtime-js": "^2.119.2"`.
- `scripts/snapshot.mjs` - modified - Removed `Authorization` header (uses `apikey`, `Content-Type: application/json`, `Accept: application/json`), added clear one-line failure reason (including 404).
- `src/lib/supabase.ts` - modified - Implemented `createPublicSupabaseClient`: plain `fetch` for `POST /rest/v1/rpc/get_site_content` (`apikey`, `Content-Type`, `Accept`, no `Authorization`), plain `fetch` for `POST /rest/v1/messages` (`apikey`, `Prefer: return=minimal`, 15 s timeout, no retry, error classification for `429`/`P0001`, `400`/`23514`, network, generic), and lazy dynamic `import('@supabase/realtime-js')` with `apikey`, `eventsPerSecond: 2`, in-memory `sessionStorage`, and no auth token.
- `src/lib/content.ts` - modified - Switched `FetchSiteContentOptions.client` and RPC call to `PublicSupabaseClient.fetchSiteContentRpc`.
- `src/lib/theme.ts` - modified - Switched `@fontsource/ibm-plex-mono` lazy imports to `latin-400.css`..`latin-700.css`.
- `src/context/contentContext.ts` - modified - Added `sendContactMessage` to `ContentContextValue`.
- `src/context/ContentProvider.tsx` - modified - Switched to `PublicSupabaseClient`, deferred `subscribeContentVersion` (dynamic `import('@supabase/realtime-js')`) until after initial content check/render, and exposed `sendContactMessage`.
- `src/__tests__/content.test.ts` - modified - Updated mock client to `PublicSupabaseClient`.
- `src/__tests__/content.test.tsx` - modified - Updated `ContentProvider` mock client to `PublicSupabaseClient`.
- `src/__tests__/supabase.test.ts` - created - Unit tests for RPC headers/body, `Prefer: return=minimal` contact insert, `P0001`/`429`/`23514`/network error classification, and lazy `RealtimeClient` options.

---

## Phase 2: Layout, hero, about, skills
Built sticky Navbar (scroll-spy, theme toggle, accessible mobile `<dialog>` drawer), Hero, SectionHeader, About, Skills, scroll-reveal hook, and fixed section registry with per-section error boundaries.

### Files
- `src/hooks/useReveal.ts` - created - `IntersectionObserver` scroll-reveal hook honoring `prefers-reduced-motion: reduce`.
- `src/components/SectionHeader.tsx` - created - Reusable section heading with eyebrow, optional numeric prefix, right/below metadata, and divider.
- `src/components/Navbar.tsx` - created - Sticky blurred header, logo box + brand, pill nav with scroll-spy (`aria-current="true"`), theme toggle (`aria-pressed`), CTA button, and accessible `<dialog>` mobile drawer.
- `src/components/Hero.tsx` - created - Rounded hero frame, radial glow, circular avatar (`safeImageUrl`, `fetchPriority="high"`, `loading="eager"`, `176x176`, initials fallback), ghost word, desktop chip groups, roles, tagline, `safeHeroTarget` CTAs, and stats strip.
- `src/components/sections/AboutSection.tsx` - created - 2-column About layout with overview card, left-bordered summary, numbered competency cards (`NN DOMAINS`), and highlight tiles.
- `src/components/sections/SkillsSection.tsx` - created - Bordered 3/2/1-column skill domain grid with `NN // DOMAIN`, tool count, tool chips, and `STATUS`.
- `src/components/sections/SectionRegistry.tsx` - created - Fixed `SECTION_REGISTRY` mapping known section types with per-section `ErrorBoundary` (unknown types render `null`).

---

## Phase 3: Projects, education, certifications, publications, archives
Implemented featured case studies, education rows, featured certifications, publications, lazy-loaded `/projects` and `/certifications` archive pages, and 404 route.

### Files
- `src/components/sections/ProjectCaseStudy.tsx` - created - Shared project case-study renderer with `NN` + kicker, `VERIFIED OUTCOME`, tagline, sanitized GitHub/live buttons, bullets, tech tags, Supabase-host-allow-listed `Documents` links, and optional lazy cover image.
- `src/components/sections/ProjectsSection.tsx` - created - Featured projects section with `"N OF M FEATURED CASE STUDIES"` count and archive button to `/projects` when `M > N`.
- `src/components/sections/EducationSection.tsx` - created - Education rows with `NN // DEGREE`, degree, institution, note, and score badge.
- `src/components/sections/CertificationRow.tsx` - created - Shared certification row with `NN // CERT`, title, issuer, timezone-safe `formatDateRange`, and sanitized credential button.
- `src/components/sections/CertificationsSection.tsx` - created - Featured certifications section with shield icon, `"N OF M ACCREDITED CREDENTIALS"` count, and archive button to `/certifications` when `M > N`.
- `src/components/sections/PublicationsSection.tsx` - created - Publications section (`NN // PUB`) rendered when enabled in `sections`.
- `src/pages/PortfolioHomePage.tsx` - created - Main `/` route rendering `Hero` and ordered sections with 1-based two-digit `displayNumber`.
- `src/pages/ProjectsArchivePage.tsx` - created - Lazy `/projects` route showing all projects with lazy cover images and `"Back to portfolio"` link.
- `src/pages/CertificationsArchivePage.tsx` - created - Lazy `/certifications` route showing all certifications and `"Back to portfolio"` link.
- `src/pages/NotFoundPage.tsx` - created - Designed 404 route with `"Back to portfolio"` link.
- `src/App.tsx` - modified - Wired `BrowserRouter`, skip link, `Navbar`, lazy `/projects` and `/certifications` routes, `*` 404 route, and `Footer` inside `ErrorBoundary` and `ContentProvider`.

---

## Phase 4: Contact, footer, custom sections
Implemented validated Contact form with anti-spam protections, contact rows, Footer, and `rich_text`, `cards`, and `gallery` custom sections.

### Files
- `src/lib/contact.ts` - created - Zod `contactFormSchema`, 3 s / 60 s timing constants, and `mapContactErrorMessage`.
- `src/components/sections/ContactSection.tsx` - created - `"NN ---- CONNECT"` header, sanitized contact rows (mailto, tel, location, social links, resume), Zod-validated form, hidden `website` honeypot, <3 s silent trap, 60 s client cooldown, disabled button while sending, friendly error banner preserving inputs, and confirmation panel.
- `src/components/Footer.tsx` - created - Logo + brand, roles, blurb, `INDEX` nav links, `DIRECT` contact links, plain-text `{year}` copyright replacement, and green status indicator.
- `src/components/sections/RichTextSection.tsx` - created - Plain-text `rich_text` section (`whitespace-pre-line`).
- `src/components/sections/CardsSection.tsx` - created - Responsive `cards` grid with `safeUrl`-validated optional links.
- `src/components/sections/GallerySection.tsx` - created - Responsive `gallery` grid with `safeImageUrl`-validated lazy images (`4:3`, explicit `600x450`) and captions.

---

## Phase 5: Security, quality, and tests
Completed static security audit, added contact/section/routing tests, and created Windows PowerShell 5.1 security smoke script.

### Files
- `src/__tests__/contact.test.tsx` - created - Component tests for `ContactSection` (Zod validation, honeypot trap, <3 s submit trap, double-submit lock, 60 s cooldown, error mapping preserving typed message).
- `src/__tests__/sections.test.tsx` - created - Component and routing tests for Navbar, Hero, About, Skills, Projects (`N of M`, document host allow-list), Education, Certifications (`N of M`, dates), Publications, RichText, Cards, Gallery, Footer, unknown section ignoring, `/projects`, `/certifications`, and 404.
- `scripts/security-smoke.ps1` - created - PowerShell 5.1 + `curl.exe` smoke test verifying `get_site_content` RPC, RLS read/write blocks on `profile`/`messages`/`admins`/`projects`, storage upload refusals on `avatars` & `projects`, valid/invalid message checks, and `-SiteUrl` security response headers.

---

## Phase 6: Final Status & Checklists

### Security & Reliability Rule Status
| Rule | Status | Notes |
| :--- | :--- | :--- |
| Read-only RPC (`POST /rest/v1/rpc/get_site_content`, `apikey` only, no `Authorization`) | Done | Implemented in `src/lib/supabase.ts` and `scripts/snapshot.mjs`; verified by `src/__tests__/supabase.test.ts` |
| Realtime channel (`content_version` UPDATE, `apikey`, `eventsPerSecond: 2`, no auth token, no persisted session, lazy loaded) | Done | Dynamic `import('@supabase/realtime-js')` after initial render/fetch, in-memory `sessionStorage` stub |
| Contact write (`POST /rest/v1/messages`, `Prefer: return=minimal`, no row returned) | Done | Implemented in `src/lib/supabase.ts`; verified by `src/__tests__/supabase.test.ts` |
| Tolerant Zod parsing & per-section `ErrorBoundary` | Done | `src/lib/schemas.ts`, `src/components/ErrorBoundary.tsx`, `src/components/sections/SectionRegistry.tsx` |
| Root `ErrorBoundary` & designed loading/empty/unavailable states | Done | `src/App.tsx`, `src/components/StatusViews.tsx` |
| No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or HTML from strings | Done | Verified 0 matches across `src/` and `scripts/`; long text uses `whitespace-pre-line` |
| URL sanitization (`safeUrl`, `safeImageUrl`, `safeHeroTarget`, `rel="noopener noreferrer"`) | Done | Applied on every stored URL and image/document URL; verified by audit grep |
| Theme CSS-injection defense (RGB regex `0-255`, font allow-list, `style.setProperty` only) | Done | `src/lib/color.ts`, `src/lib/theme.ts`, `src/__tests__/schemas.test.ts` |
| Fixed section registry (unknown type renders nothing) | Done | `src/components/sections/SectionRegistry.tsx` |
| String-based date formatting (no `new Date()` on `YYYY-MM-DD`) | Done | `src/lib/dates.ts` |
| Contact form protections (Zod, honeypot `website`, <3 s trap, 60 s cooldown, double-submit lock, friendly errors, keep message on failure) | Done | `src/lib/contact.ts`, `src/components/sections/ContactSection.tsx`, `src/__tests__/contact.test.tsx` |
| No `console.*` in app code, no source maps, no third-party scripts/CDN fonts/iframes | Done | Verified 0 `console.` matches in `src/` and `scripts/`; `vite.config.ts` strips console/debugger and sets `sourcemap: false` |
| Cache (`portfolio:v1`), 15 s timeout, 3 retries with backoff/jitter, snapshot fallback, polling & visibility refetch | Done | `src/lib/content.ts`, `src/context/ContentProvider.tsx`, `scripts/snapshot.mjs` |
| Strict CSP & security headers (`vercel.json`) + `.gitignore` env rules | Done | Verified in `vercel.json` and `.gitignore` |
| `node_modules` sync, `tsc -b`, `vitest run`, `vite build`, live smoke test, and bundle measurement | Needs owner action | Blocked by sandbox network/EPERM restrictions; commands listed below |

### Commands for the owner to run
Run these in PowerShell 5.1 (never use `&&`) from `D:\portfolio\portfolio-site`:
1. Sync `node_modules` and `package-lock.json` (removes `@supabase/supabase-js`, installs `@supabase/realtime-js`):
   `npm install`
2. Run typecheck, tests, lint, build, and dependency audit:
   `npm run typecheck`
   `npm test`
   `npm run lint`
   `npm run build`
   `npm audit --audit-level=high`
3. Measure raw and gzipped sizes of every JS chunk in `dist\assets\` (verify initial `index-*.js` is under ~120 kB gzipped and `@supabase/realtime-js` is in a separate lazy chunk):
   `node -e "const fs=require('fs'),zlib=require('zlib'),path=require('path'); for (const f of fs.readdirSync('dist/assets').filter(f=>f.endsWith('.js'))) { const b=fs.readFileSync(path.join('dist/assets',f)); console.log(f, 'raw:', (b.length/1024).toFixed(1)+' kB', 'gzip:', (zlib.gzipSync(b).length/1024).toFixed(1)+' kB'); }"`
4. Confirm no `console.*` calls from app code in `dist\`:
   `Get-ChildItem dist\assets\*.js | Select-String -Pattern "console\."`
5. Preview locally and test:
   `npm run preview`
6. Run the security smoke test (first against Supabase only, then with `-SiteUrl` after deploying):
   `powershell -ExecutionPolicy Bypass -File scripts\security-smoke.ps1`
   `powershell -ExecutionPolicy Bypass -File scripts\security-smoke.ps1 -SiteUrl "https://your-vercel-domain.vercel.app"`
7. Commit when all checks pass:
   `git add -A; git commit -m "step-a-and-phases-2-to-6"`

### Manual Test Checklist
1. Open the preview URL: verify Hero (avatar, ghost word, chips, roles, tagline, CTAs, stats), About (overview card, summary, competencies, 3 highlights), Skills (6 domains grid), Projects (`3 OF 4 FEATURED CASE STUDIES`, bullets, tags, archive button), Education, Certifications (`3 OF 6 ACCREDITED CREDENTIALS`, date ranges, archive button), Contact (`06 ---- CONNECT`, contact rows, form), and Footer (`INDEX`, `DIRECT`, copyright year, green status dot) match `design-reference/`.
2. Toggle light/dark theme in the Navbar and reload: verify theme persists under `portfolio:theme` in `localStorage` and text/controls remain readable in both modes.
3. Resize below `lg`: verify the hamburger menu opens the mobile drawer, `Tab` stays inside the drawer, and `Escape` or backdrop click closes it.
4. Click archive buttons to visit `/projects` and `/certifications`, plus an unknown route `/does-not-exist` (404), and use `"Back to portfolio"` to return.
5. In DevTools Network tab: verify `POST /rest/v1/rpc/get_site_content` has `apikey` without `Authorization`, `realtime-js` loads lazily in its own chunk after initial render, and `wss://.../realtime/v1` connects with `apikey` and `eventsPerSecond=2` and stores nothing in `sessionStorage` or `localStorage` auth keys.
6. Edit a field in the admin app and verify the public page updates without refreshing.
7. Enable Network Offline in DevTools and reload: verify cached content renders cleanly without a blank page.
8. Test the Contact form: verify inline errors on invalid input, successful send (after waiting >= 3 s) with `Prefer: return=minimal`, and the 60 s cooldown on immediate second send.

### Deployment Checklist
- Create/link Vercel project pointing to this repository (`vercel.json` is included).
- Set Vercel environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (never `service_role`).
- Set GitHub repository secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` if using keep-alive workflows.
- Deploy to Vercel and run `powershell -ExecutionPolicy Bypass -File scripts\security-smoke.ps1 -SiteUrl "https://<your-deployed-domain>"` to verify live CSP, HSTS, `X-Frame-Options`, and `X-Content-Type-Options` headers.

### Files
- `scripts/snapshot.mjs` - modified - Removed `Authorization` header (uses `apikey`, `Content-Type: application/json`, `Accept: application/json`), joined RPC path without double slash, and logged host + HTTP status + `supabase/05_public_api.sql` / env-var hint (never printing keys).
- `src/components/SectionHeader.tsx` - modified - Added `as?: 'h1' | 'h2'` prop so archive pages render semantic `<h1>` headings.
- `src/pages/ProjectsArchivePage.tsx` - modified - Passed `as="h1"` to `SectionHeader`.
- `src/pages/CertificationsArchivePage.tsx` - modified - Passed `as="h1"` to `SectionHeader`.
- `src/__tests__/supabase.test.ts` - modified - Typed `realtimeFactory` mock parameters explicitly and guarded `mock.calls[0]` checks without `any`.
- `src/__tests__/sections.test.tsx` - modified - Stubbed `window.scrollTo = () => {}` in `beforeEach` and added `{ timeout: 5000 }` on lazy archive `findByRole` assertions.

### Open issues / Unverified in sandbox
- Because this sandbox has no network and blocks writes to `node_modules/.tmp`, `.vite-temp`, `.vitest`, `dist`, and `.git/index.lock`, `npm install`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit`, `scripts/security-smoke.ps1`, and `git commit` were not executed here.
- `npm run lint` (`oxlint`) was run after the final edit and passed with 0 warnings and 0 errors across all 49 files.
