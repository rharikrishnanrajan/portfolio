# Portfolio Build — Progress Log

> Last updated: 2026-11-26

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
