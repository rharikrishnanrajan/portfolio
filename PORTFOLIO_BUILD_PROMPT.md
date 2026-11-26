# PORTFOLIO SITE BUILD PROMPT (public site)

You are a senior front-end engineer with an application-security mindset. Build the PUBLIC portfolio website in this repo. It reads content that the owner edits in a separate, already-finished admin site, and it must look exactly like the design in `design-reference/`.

## HOW TO WORK
- Do ONLY the phase I name. After each phase: run `npm run build` (and `npm test` once tests exist), fix every error, append to PORTFOLIO_PROGRESS.md (phase; one line per file "path - created|modified - why"; what I should test; open issues), and commit with `git add -A; git commit -m "<phase>"` if git is available. If you stop, PORTFOLIO_PROGRESS.md must let a new session resume.
- Before coding, view EVERY image in `design-reference/` (the screenshots are the visual source of truth) and read everything in `design-reference/from-admin/`.
- Never invent database columns, tables, RPCs or env variables. If something is missing or ambiguous, stop and ask.
- PowerShell 5.1: never use && in commands you give me.
- Allowed dependencies: react, react-dom, react-router-dom, @supabase/supabase-js, lucide-react, zod, tailwindcss + @tailwindcss/vite, @fontsource-variable/* packages, and dev: vitest, @testing-library/react, jsdom. Nothing else (no animation, UI or icon-brand libraries) without asking.

## STACK
Vite, React 19, TypeScript (strict, `verbatimModuleSyntax`: `import type`, no enums, no `any`), Tailwind CSS v4 (CSS-first, tokens in `src/index.css`), react-router-dom.

## FILES I WILL PROVIDE in `design-reference/`
- 12 screenshots of the current site (hero, about, skills x2, projects x3, education, certifications, contact, footer). Browser-extension overlays visible in them (a purple "t" icon in the email field, a "BLACKBOX" floating button) are NOT part of the design.
- `from-admin/rows.ts` (TypeScript row types), `from-admin/safeUrl.ts`, `from-admin/color.ts`, `from-admin/index.css` (token/class definitions), and `from-admin/font-options.txt` (the exact font names the admin Theme page offers). Reuse and adapt these; do not reinvent them.

## DATA CONTRACT (read-only; the ONLY things this site may call)
1. ONE read call: `supabase.rpc('get_site_content')` returns a JSON object with keys: `version`, `settings`, `profile`, `sections`, `social_links`, `overview_rows`, `competencies`, `skill_domains`, `projects`, `education`, `certifications`, `publications`. All lists are already filtered to visible rows and ordered by position. Shapes:
   - settings: { logo_text, brand_name, nav_cta_label, hero, footer, theme, seo }
     - hero: { ghost_word, roles: string[], tagline, cta_primary:{label,target}, cta_secondary:{label,target}, chips_left: string[], chips_right: string[], stats: {label,value}[] }
     - footer: { blurb, index_title, direct_title, status_label, copyright (may contain the placeholder {year}) }
     - theme: { default_mode: 'dark'|'light', fonts:{heading,mono}, dark:{bg,surface,border,text,muted,accent,accent2}, light:{same keys} } where colors are "R G B" strings such as "79 126 255"
     - seo: { title, description }
   - profile: { full_name, headline, summary, email, phone, location, avatar_url, resume_url } (email/phone may be null = hidden by the owner)
   - sections[]: { id, slug, type, nav_label, eyebrow, title, subtitle, content, position, show_in_nav }. Built-in types: about, skills, projects, publications, education, certifications, contact. Custom types: rich_text {body}, cards {items:[{title,text,url?}]}, gallery {images:[{url,path,caption}]}. about.content: { overview_title, competencies_title, highlights:[{label,value}] }; projects/certifications content: { archive_button }.
   - social_links[]: { id, label, url, icon } ; overview_rows[]: { id, label, value } ; competencies[]: { id, text }
   - skill_domains[]: { id, title, tools: string[], status }
   - projects[]: { id, kicker, title, summary, outcome, tagline, bullets: string[], tech: string[], github_url, live_url, cover_url, files:[{name,url,path,type}], featured }
   - education[]: { id, degree, institution, score_label, score, note }
   - certifications[]: { id, title, issuer, start_date, end_date, credential_url, featured } (dates are "YYYY-MM-DD" strings or null)
   - publications[]: { id, title, venue, published_on, summary, reference, url }
2. ONE realtime channel: `postgres_changes` UPDATE on `public.content_version` (a single row; `version` increases whenever the owner edits anything).
3. ONE write: `supabase.from('messages').insert({ name, email, subject, body })`. IMPORTANT: do NOT chain `.select()` or request the inserted row back; visitors have no read permission on messages and the request would fail. The database enforces: name 1-200, email valid format, body 1-5000, subject <= 300, and a global limit of 20 messages per 10 minutes (error text "Too many messages right now. Please try again later.").
Never read or write any other table or view. Never use a service_role/secret key. The client must be created with `{ auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, realtime: { params: { eventsPerSecond: 2 } } }` so the public site never stores or sends a login session.

## SECURITY RULES (non-negotiable)
- Treat ALL data from the database as untrusted input, even though only the owner can write it. Parse the RPC result with zod using tolerant schemas (unknown keys stripped, bad optional fields dropped, bad items skipped); one bad row must never crash the page. Each section renders inside its own error boundary.
- No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or HTML built from strings. Long text (summary, rich_text body) is plain text with `whitespace-pre-line`.
- Every stored URL rendered as a link goes through `safeUrl()` (allow http, https, mailto, tel only; returns null otherwise; null means do not render the link). Every stored image URL goes through `safeImageUrl()`: https only AND the hostname must equal the hostname of `VITE_SUPABASE_URL` and the path must start with `/storage/v1/object/public/`. Hero CTA targets must match `^#[a-z0-9-]{1,60}$` or pass `safeUrl()`. External links: `target="_blank" rel="noopener noreferrer"`.
- Theme from the database is a CSS-injection vector: validate every color against `^\d{1,3} \d{1,3} \d{1,3}$` with each channel 0-255, validate fonts against the allow-list in `font-options.txt`, and apply values ONLY via `document.documentElement.style.setProperty` with validated strings. Never build CSS text from database strings. Invalid values fall back to the built-in defaults. The visitor's light/dark choice is stored in localStorage as exactly "light" or "dark" and nothing else is stored there except the validated content cache (key `portfolio:v1`).
- Section types map to components through a fixed registry object. An unknown type renders nothing. Never import or render anything by a name taken from data.
- Dates: format "YYYY-MM-DD" strings by splitting the string; never use `new Date()` on them (it shifts days across time zones). Month names are uppercase, e.g. "AUG 2023 - NOV 2023"; if end_date is null show only the start; if both are null show nothing.
- Contact form: validate with zod (name 1-200, email format, subject <= 300 optional, message 1-5000); a hidden honeypot field `website` (aria-hidden, tabIndex -1, autoComplete off) that, when filled, silently shows the normal success message without sending; if the form is submitted less than 3 seconds after it appeared do the same; a 60-second client cooldown between sends; disable the button while sending (no double submit); map errors to friendly text (rate limit, network, generic) and never show raw Supabase/Postgres error text; keep the typed message if sending fails.
- Never log data, errors or tokens in production (`console.*` calls are stripped or absent). No source maps in production. Do not add analytics, third-party scripts, fonts from CDNs, or iframes.
- `vercel.json` (provided) sets a strict CSP (no inline scripts, no external script/style hosts) plus security headers; the build must work under it (no inline `<script>`, no `eval`, no CDN assets). Fonts are self-hosted through @fontsource and loaded lazily only for the font names chosen in the theme.
- Secrets: the only env vars are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. `.gitignore` must contain `.env`, `.env.*`, `!.env.example`.

## RELIABILITY RULES
- Data loading: render instantly from the validated cache in localStorage (`portfolio:v1`) or the build-time snapshot, then revalidate from `get_site_content`. Reads time out after 15 s and retry up to 3 times with exponential backoff and jitter (network errors, 5xx and 429 only). If everything fails and nothing is cached, show a designed "temporarily unavailable, try again" state with a Retry button, never a blank page.
- Realtime: subscribe to `content_version`; on an UPDATE whose version is newer than the current one, refetch after a 500 ms debounce (at most once every 2 s). If the channel errors or closes, fall back to polling `get_site_content` every 60 s while the tab is visible, and refetch when the tab becomes visible after more than 5 minutes. Unsubscribe on unmount.
- Build-time snapshot (non-fatal): `scripts/snapshot.mjs` runs before `vite build`, calls the same RPC over fetch with the anon key from env, validates it, and writes `src/generated/content.snapshot.json` (git-ignored). If the call fails, write an empty-but-valid snapshot and continue; the build must never fail because Supabase is unreachable.
- An ErrorBoundary at the app root with a friendly fallback (no stack traces or raw messages).

## DESIGN (details; the screenshots win on any conflict)
Dark navy theme by default, all colors from tokens (bg, surface, border, text, muted, accent, accent2) so the owner's theme changes re-skin everything, including light mode. Headings: bold, very tight tracking, large (hero name ~ 7rem desktop, section titles ~ 4rem). Labels: monospace, uppercase, wide tracking (~0.2em), small (~0.7rem). Cards and rows: sharp corners with 1px borders; only the hero frame and the nav pill are rounded. Primary button: gradient accent -> accent2 with a soft accent glow; secondary: bordered. Subtle scroll-reveal using IntersectionObserver and CSS transitions; honour `prefers-reduced-motion`.
- Navbar: sticky, blurred background, bottom border. Left: logo box (logo_text) + brand_name. Center: rounded pill with links from `sections` where `show_in_nav` (label = nav_label or title), scroll-spy highlights the current one. Right: theme toggle (sun/moon icon button) + gradient CTA (nav_cta_label -> #contact). Below lg: hamburger opening an accessible drawer (focus trap, Escape closes).
- Hero (large rounded bordered frame): circular avatar with glowing accent ring (avatar_url via safeImageUrl, eager, fetchpriority high, fixed width/height; initials fallback), giant ghost word (hero.ghost_word) behind at ~4% text opacity, name (profile.full_name), roles joined by dots in spaced mono, tagline, two CTAs (hero.cta_primary gradient with arrow icon, cta_secondary bordered with mail icon), floating chip groups left and right (hidden below lg), bottom stats strip of `LABEL: VALUE` pairs.
- Section header (reused): mono eyebrow, huge title, mono subtitle/meta on the right on desktop. The contact section also shows a number prefix like "06 ---- CONNECT" (its position among visible sections, two digits).
- About (type about): left column title + subtitle and a bordered "overview at a glance" card of overview_rows (label left, value right, divider lines); right column: summary paragraph with a left border, then the competencies title with "NN DOMAINS" count at the right, a 2-column grid of numbered cards (01, 02...), then a row of 3 highlight tiles (mono label over bold mono value).
- Skills (type skills): one bordered container with a 3 / 2 / 1 column grid of cells; each cell: "NN // DOMAIN" label left and "N TOOLS" right, a rule, the domain title, tool chips (mono uppercase bordered tags), a rule, then "STATUS: <STATUS>" in mono.
- Projects (type projects): meta line "N OF M FEATURED CASE STUDIES - <subtitle>" (N = shown featured, M = total). Show featured projects only on the main page, each as a case study: big number (01, 02...) + kicker on the left with a bordered "VERIFIED OUTCOME" box (outcome) and the tagline with a small square bullet; right: title, github and live icon buttons (only when safe URLs exist), summary, "ENGINEERING IMPLEMENTATION" list with dashes in a left-bordered block (bullets), tech tags, and a small "Documents" row of links when `files` exist (only urls on the Supabase storage host). If M > N show the wide gradient button "<content.archive_button> (M)" linking to `/projects`.
- Education: rows "NN // DEGREE" | degree + institution + mono note | "<score_label>" with the score in a bordered badge.
- Certifications: header meta with a shield icon: "N OF M ACCREDITED CREDENTIALS" (N = featured shown). Rows "NN // CERT" | title + issuer (mono uppercase) | date range (mono) | external-link icon button only when credential_url passes safeUrl. Hover highlights the row. Archive button "<content.archive_button> (M)" -> `/certifications` when M > N.
- Publications (type publications; hidden unless the owner enables it): same row style as certifications with venue, date, summary, reference and a link icon.
- Contact: left: number + CONNECT label, big title, subtitle, bordered list of contact rows (email as mailto, phone as tel, location, github, linkedin, plus a "Download resume" row when resume_url is safe). Right: the form (name, email, subject, message, SEND MESSAGE button with a send icon). Show inline field errors, a success panel, and a failure message.
- Footer: logo box + brand name large, hero.roles line, footer.blurb; "INDEX" column of nav links; "DIRECT" column of contact items; bottom bar: footer.copyright with {year} replaced by the current year (plain text replace) on the left, a green dot + footer.status_label on the right.
- Custom sections: rich_text (title + paragraphs), cards (grid of bordered cards, optional safe link), gallery (responsive image grid with captions, lazy-loaded with fixed aspect ratio).
- Archive pages `/projects` (all projects: cover image if safe, number, title, kicker, summary, tech tags, links, documents) and `/certifications` (all credentials) in the same style, with a "Back to portfolio" link and a 404 route.
- Accessibility: semantic landmarks (header, nav, main, section with aria-labelledby, footer), skip link, visible focus rings, labelled inputs, AA contrast, keyboard-operable menu and theme toggle. SEO: set document.title and the meta description from settings.seo at runtime; static fallback tags and a favicon in index.html.
- Performance: initial JS under ~200 KB gzipped; archive routes lazy-loaded; fonts lazy by chosen name; below-the-fold images lazy with width/height; no layout shift.

---

# PHASE 0: Scaffold, config, foundations
1. Confirm the project was created with Vite react-ts and dependencies installed; add the allowed dependencies. Copy the provided kit files if they are not already in place (`vercel.json`, `public/robots.txt`, `.env.example`, `.github/`).
2. `.gitignore` rules for env files and `src/generated/`. `vite.config.ts` with the React and Tailwind plugins, `build.sourcemap: false`, and console/debugger stripped from production output (verify with a search of `dist/` for the app's own log strings; the option name depends on the installed Vite version).
3. `src/index.css` tokens and base classes adapted from `from-admin/index.css` (`.eyebrow`, `.card`, `.btn-primary`, etc.) with a light-mode token set selected by `data-theme="light"` on `<html>`.
4. `src/lib/supabase.ts` (client with the options above; throw a clear error if env vars are missing), `src/lib/safeUrl.ts` (+ `safeImageUrl`), `src/lib/color.ts`, `src/lib/dates.ts` (string-based month formatting), `src/types/content.ts` + zod schemas in `src/lib/schemas.ts` for the contract above (tolerant parsing).
5. Theme loader `src/lib/theme.ts`: validated apply of colors and fonts, light/dark toggle persistence, lazy font loading map from `font-options.txt`.
6. Vitest set up. Tests for safeUrl, safeImageUrl, color validation, dates and the tolerant schemas (including hostile input such as `javascript:alert(1)`, `data:text/html,...`, "  javascript:", mixed case, control characters, colors like "999 0 0", "red", and "1 2 3; background:url(x)").
Acceptance: `npm run build` and `npm test` pass; the app shows a placeholder page.

# PHASE 1: Data layer
`scripts/snapshot.mjs` + `prebuild` script; `src/lib/content.ts` (RPC fetch with timeout, retry/backoff/jitter, zod parse, cache read/write, snapshot fallback); `ContentProvider` with `useContent()`; realtime subscription with debounce, polling fallback and visibility refetch; root ErrorBoundary; designed loading, empty and unavailable states. Render a temporary debug-free page that shows the brand name and section titles from the data to prove the pipeline.
Acceptance: content appears; editing something in the admin updates the page without a refresh; disconnecting the network shows cached content, not a blank page.

# PHASE 2: Layout, hero, about, skills
Navbar (+ mobile drawer, scroll-spy, theme toggle), Hero, SectionHeader, About, Skills, section registry with per-section error boundaries, scroll-reveal hook.

# PHASE 3: Projects, education, certifications, publications, archives
All as specified, including the "N of M" counts, archive routes `/projects` and `/certifications` (lazy), 404 route and the "Back to portfolio" link.

# PHASE 4: Contact, footer, custom sections
Contact form with every rule above, contact list, footer, rich_text/cards/gallery sections.

# PHASE 5: Security, quality and tests
1. Audit: search the code for innerHTML-style sinks, unvalidated URLs in href/src, any query other than the three allowed calls, console.* calls, TODO/debug leftovers. Fix everything found.
2. Tests: components for the contact form (honeypot, validation, cooldown, error mapping), section registry (unknown type renders nothing), theme application (hostile values rejected), image URL allow-listing.
3. Create `scripts/security-smoke.ps1` (Windows PowerShell 5.1, `curl.exe`; reads URL and anon key from `.env.local`; takes `-SiteUrl`; prints PASS/FAIL; never prints keys; non-zero exit on failure). With the ANON key it must verify: the `get_site_content` RPC works and returns the expected keys; reading `profile`, `messages` and `admins` returns nothing or is denied; insert/update/delete on projects is refused; inserting into `admins` is refused; storage upload to both buckets is refused; a valid contact message is accepted; an invalid email is refused. With `-SiteUrl` it must also fetch the deployed site's headers and check for Content-Security-Policy, X-Frame-Options, X-Content-Type-Options and Strict-Transport-Security.
4. Accessibility pass (keyboard-only walkthrough, landmarks, focus order, contrast on both themes) and a performance pass (bundle size, lazy routes, image dimensions). Fix what you find.
5. Add npm scripts `typecheck`, `test`, `audit`; make sure `.github/workflows/ci.yml` would pass.

# PHASE 6: Final report
Update PORTFOLIO_PROGRESS.md with the full file list, a status table of every security rule above (done / not applicable / needs my action), a numbered manual test checklist for me, and the deployment checklist (Vercel project, env vars, GitHub secrets SUPABASE_URL and SUPABASE_ANON_KEY for the keep-alive workflow, security smoke test against the live URL). Do not claim anything works that you did not run; say which items need my testing.
