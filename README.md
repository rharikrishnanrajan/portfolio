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

## Security Smoke Test

`scripts/security-smoke.ps1` is a PowerShell script that hits the live site and Supabase endpoints to verify:
- The public site returns HTTP 200.
- The CSP header is present and contains `script-src 'self'`.
- Direct Supabase RPC calls without the anon key are rejected (401).
- Storage uploads are blocked by Row-Level Security (403) — tested with `Content-Type: image/png`.

Run it after each deploy:

```powershell
# Against localhost preview:
powershell -ExecutionPolicy Bypass -File scripts\security-smoke.ps1

# Against the live Vercel deployment:
powershell -ExecutionPolicy Bypass -File scripts\security-smoke.ps1 -SiteUrl "https://your-domain.vercel.app"
```

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
