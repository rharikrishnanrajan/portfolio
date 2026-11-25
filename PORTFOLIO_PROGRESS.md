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
- `src/lib/supabase.ts` - created - Created read/write anonymous Supabase client with `persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`, and `realtime.eventsPerSecond: 2`.
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
Implemented build-time snapshot generation, resilient RPC fetching with timeout/retry/cache, realtime/polling/visibility sync, error boundary, status views, and a temporary Phase 1 page.

### Files
- `scripts/snapshot.mjs` - created - Non-fatal prebuild script fetching `get_site_content` and writing `src/generated/content.snapshot.json` (or empty valid snapshot on failure).
- `src/generated/content.snapshot.json` - created (git-ignored) - Initial empty-but-valid snapshot so `tsc -b` succeeds before the first build.
- `src/lib/content.ts` - created - Implemented `portfolio:v1` localStorage cache read/write, snapshot fallback, and `fetchSiteContent` with 15 s timeout and up to 3 retries with exponential backoff and jitter on network/5xx/429 errors.
- `src/context/contentContext.ts` - created - Defined `ContentContext` and `useContent()` hook.
- `src/context/ContentProvider.tsx` - created - Implemented instant cache/snapshot hydration, live RPC revalidation, theme/SEO application, `content_version` realtime subscription (500 ms debounce, 2 s throttle), 60 s polling fallback when tab visible, and >5 minute visibility refetch.
- `src/components/ErrorBoundary.tsx` - created - Root and reusable ErrorBoundary with friendly fallback (no stack traces or raw error text).
- `src/components/StatusViews.tsx` - created - Designed `LoadingView`, `UnavailableView` (with Retry button), and `EmptyView` states.
- `src/App.tsx` - modified - Temporary debug-free Phase 1 view displaying `logo_text`, `brand_name`, `profile.full_name`, `version`, theme toggle, and published section titles from `useContent()`.
- `src/__tests__/content.test.ts` - created - Unit tests for cache read/write, snapshot fallback, retry/backoff/4xx/abort behavior.
- `src/__tests__/content.test.tsx` - created - Component/integration tests for `ErrorBoundary`, `StatusViews`, `ContentProvider` offline cache fallback, unavailable/retry recovery, realtime debounce, 60 s polling fallback, and >5 min visibility refetch.

### Commands for the owner to run
Run these in PowerShell 5.1 (not `&&`) from `D:\portfolio\portfolio-site`:
1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. Verify console stripping in `dist/`: `Select-String -Path dist\assets\*.js -Pattern "console\."` (expect no matches from app code).
6. `npm run preview` (open the printed URL and verify: content loads; editing a section/title in the admin updates the page without refreshing; blocking network in DevTools still renders cached content instead of a blank page).
7. Commit after checks pass: `git add -A; git commit -m "phase-1"`

### Open issues
- Inside this sandbox, `tsc -b`, `vitest run`, `vite build`, and `git add`/`git commit` fail with `EPERM` / `Access is denied` / `Permission denied` when writing to `node_modules/.tmp`, `node_modules/.vite-temp`, `node_modules/.vitest`, `dist/assets`, or `.git/index.lock`. `npm run lint` (`oxlint`) was run and passed with 0 warnings and 0 errors. Typecheck, Vitest, Vite build, and git commit must be run by the owner in their terminal before proceeding to Phase 2.
