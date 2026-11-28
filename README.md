# Portfolio Site

A personal portfolio website built with **React 19 + TypeScript + Vite + Tailwind CSS v4**, backed by **Supabase** for live content and contact form submissions.

The site loads its content (projects, certifications, skills, profile data) dynamically from Supabase via an authenticated RPC, falls back to a build-time snapshot, and then to an in-memory cache — so it always shows something even if the network is down.

---

## Environment Variables

Create a `.env` file (never commit it — it is in `.gitignore`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

Both variables are required at build time. The site will not function without them.

An `.env.example` file is provided with placeholder values.

---

## npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + build to `dist/` |
| `npm run typecheck` | Run `tsc -b` only |
| `npm run lint` | Lint with Oxlint |
| `npm test` | Run Vitest unit tests |
| `npm run verify:dist` | Post-build safety checks (see below) |
| `npm run preview` | Serve the production `dist/` locally |
| `npm run audit` | `npm audit --audit-level=high` |
| `npm run check:content` | Fetch and print admin content summary (see below) |

---

## Deploy to Vercel

1. Push your repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Set the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in **Settings → Environment Variables**.
4. Build command: `npm run build` — Vercel detects Vite automatically.
5. Output directory: `dist`.

The `vercel.json` in the repo configures:
- Strict CSP (`script-src 'self'`, `connect-src` only the Supabase hostname)
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, HSTS)
- SPA rewrites (`/*` → `/index.html`)

---

## Keep-Alive Workflow

`.github/workflows/keep-alive.yml` runs on a cron schedule (by default weekly) and pings the deployed site to keep Supabase's free-tier database from going idle. Update the URL in that file to match your Vercel deployment.

---

## Motion System

The portfolio uses a lightweight, CSS-first motion system built on native browser APIs:

- **CSS variables** for easing (`--ease-out`, `--ease-in-out`) and durations (`--dur-fast` 150ms, `--dur-base` 300ms, `--dur-slow` 600ms)
- **Keyframes**: `fade-up`, `float`, `glow-pulse`, `shimmer`, `drawer-in`
- **IntersectionObserver** for reveal-on-scroll (shared observer, staggered delays, unobserves after first reveal)
- **Smooth scroll** with focus management: `scrollToSection()` updates URL hash, honors `scroll-margin-top`, moves focus to section heading
- **Scroll progress bar**: 2px accent bar driven by `transform: scaleX()` via CSS variable, updated in `requestAnimationFrame`
- **Navbar**: background/blur/border strengthen on scroll (>8px), sliding active link indicator, animated drawer
- **Hero**: staggered entrance, avatar glow pulse, floating chips, ghost word parallax (≤24px)
- **Hover/focus**: cards lift 2px with accent border, rows highlight with icon nudge, buttons scale to 0.98 on press, focus rings transition
- **Route transitions**: fade/slide-up on pathname change, scroll to top unless hash present
- **Theme toggle**: temporary `theme-transition` class (350ms) animates colors, icon rotates/crossfades
- **Skeleton loading**: shimmer placeholders for loading states

### Reduced Motion

All motion respects `prefers-reduced-motion: reduce`:
- CSS `@media` block disables transitions/animations, sets `scroll-behavior: auto`
- `useReducedMotion` hook for JS-driven motion
- Reveal elements show immediately, progress bar and back-to-top work without animation
- Content is always visible when JavaScript fails or observer never fires

## Project Action Buttons

Projects now display labeled action buttons (never icon-only):

- **Repository** — GitHub icon, appears when `github_url` passes `safeUrl()` (http/https only)
- **Live demo** — external-link icon, appears when `live_url` passes `safeUrl()` (http/https only)
- **Documents** — chip buttons per file in `files[]`, each with file-type icon (pdf, word, presentation, spreadsheet, image, generic), truncated name with full name in `title`, extension badge. Only rendered when `url` passes `safeStorageUrl()`: https, Supabase hostname, path under `/storage/v1/object/public/project-documents/` or `/storage/v1/object/public/portfolio/`. Hostile URLs (javascript:, data:, http://, wrong host, wrong prefix) are silently skipped.

All links use `target="_blank" rel="noopener noreferrer"` with descriptive `aria-label` including project title.

## Content Check Script (`check:content`)

`npm run check:content` fetches the live Supabase content and prints a summary for verifying admin data:

```powershell
npm run check:content
```

Output example:
```
version: 5
sections: 6
  - about (visible)
  - skills (visible)
  - projects (visible)
  - education (visible)
  - certifications (visible)
  - contact (visible)
projects: 3
  - Multi-Region Deployment [repo ✓, live ✓, docs 2, cover ✓]
  - Secondary Pipeline [repo ✗, live ✗, docs 0, cover ✗]
skills: 1
education: 1
certifications: 2
publications: 1
profile.avatar_url: set
profile.resume_url: unset
```

Exits 0 on success, 1 with a clear one-line reason on failure (missing env, invalid URL, network error, non-2xx, invalid JSON, unexpected shape).

## Security Smoke Test

---

## Post-Build Verification (`verify:dist`)

`scripts/verify-dist.mjs` is a plain Node.js script (no dependencies) that exits 1 if `dist/` contains:
- Any `.map` source-map files
- Forbidden strings: `service_role`, `sb_secret_`, `SUPABASE_SERVICE`
- An inline `<script>` without `src` (CSP violation)
- Any `http://` (non-HTTPS) Supabase URLs
- A main `index-*.js` bundle over 150 kB gzipped

Run it after `npm run build`:

```powershell
npm run verify:dist
```

---

## Security Summary

- **No secrets in the browser bundle.** Only the public anon key (safe to expose) is embedded.
- **No inline scripts.** All JavaScript is loaded from `/src/main.tsx` via `<script type="module" src="...">`.
- **No third-party scripts, CDN fonts, or iframes.**
- **CSP is enforced at the CDN edge** via `vercel.json` response headers.
- **All image URLs** are validated against the Supabase storage hostname before being used in `<img src>` or `<a href>`.
- **Contact form** inserts into Supabase with `Prefer: return=minimal` (no data returned to the client). No `.select()` follows the insert.
- **Cache and theme** are the only values written to `localStorage` (`portfolio:v1` and `portfolio:theme`).
- **Realtime channel** subscribes to `postgres_changes` for the `site_content` table only (read-only, public data).

---

## Node Version

Requires Node.js **≥ 20.19.0** (or Node 22+). Declared in `package.json` `"engines"` field.

---

## Motion Engine, Publications & Certificate Actions

- **Spiral 3D scroll & parallax (`src/lib/spiral.ts`, `src/hooks/useSpiral.ts`)**: Inner wrappers opt in via `data-spiral="block" | "card" | "layer"` with a shared `IntersectionObserver` and single `requestAnimationFrame` loop that stops when settled (`e >= 0.999` removes inline transforms and `will-change`). Disabled automatically for `prefers-reduced-motion: reduce`, `html[data-motion="reduced"]`, `saveData`, and viewports narrower than `768px`, and never applied to `#contact`, `nav`, or `dialog`.
- **Motion preference switch (`src/hooks/useMotionPreference.ts`)**: Footer button ("Motion: on/off") stores `"on"` or `"off"` under `portfolio:motion` in `localStorage` and toggles `data-motion="reduced"` on `<html>`.
- **Action buttons (`src/components/IconButton.tsx`, `src/components/BrandIcon.tsx`)**: Icon-only 44×44 px (`min-h-11 min-w-11`) buttons with CSS-only tooltips (`data-tip`), used across project case studies (GitHub, up to 3 storage document buttons with `+N` archive link, live demo), certifications (PDF vs credential verification), and publications (`DD MON YYYY` formatting, `PRESENTED & PUBLISHED` badge, PDF/external link).

---

## Third-party Icons and Fonts

- **Icons**: Font Awesome Free icons via [`react-icons`](https://react-icons.github.io/react-icons/) (CC BY 4.0, attribution; `lucide-react` used as fallback until `npm install react-icons` is run).
- **Fonts**: Self-hosted open-source `@fontsource` fonts (SIL OFL 1.1 or Apache 2.0), defaulting to `Inter Variable` and `JetBrains Mono Variable` with open-source fallbacks only.
