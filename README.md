# WeatherCore

A production-grade, full-stack weather intelligence platform — real-time weather, AI-powered analysis, interactive severe weather mapping, global disaster tracking (hurricanes, tornadoes, floods, blizzards, wildfires), and smart news/alert feeds — wrapped in a moody, atmospheric UI.

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 15 (App Router) · React 19 · TypeScript strict |
| Styling | Tailwind CSS v4 (`@theme` CSS variables) |
| Database | Neon Postgres (serverless) + Drizzle ORM |
| Auth | NextAuth v5 (Google + Resend magic link) |
| AI | Google Gemini (`gemini-2.0-flash`, streaming) |
| Weather | OpenWeatherMap + Open-Meteo (forecast & historical) |
| Severe weather | NOAA/NWS · NHC · ReliefWeb |
| News | NewsAPI.org |
| Maps | MapLibre GL JS + OpenFreeMap dark style (free, no API key) |
| State | Zustand + TanStack Query v5 |
| Animations | Framer Motion |
| Charts | Recharts |
| Deployment | Vercel |

## Pages

| Route | What it does |
| --- | --- |
| `/` | Main dashboard — hero, hourly + 7-day forecast, 2×2 stat grid, precipitation chart, alert banner, AI summary |
| `/analysis` | 14-day extended table, historical comparison, pressure trend, wind analysis, precipitation deep dive, UV/solar, thermal comfort matrix, **full streaming Gemini analysis** |
| `/map` | MapLibre dark map (OpenFreeMap) with toggleable layers (temp / precip / wind / clouds / tornado / hurricane / wildfire / flood), pulsing user marker, disaster pins with popovers, global sidebar, AI nearby briefing |
| `/disasters` | Live counts, hurricane tracker, tornado/severe board, mini globe, AI disaster briefing, recent-by-type panel |
| `/alerts` | Two-column: NWS alerts feed (5-min polling) + categorized news feed with per-card "Summarize" via Gemini. Client mute phrases, red banner on extremes |
| `/compare` | Two-city snapshot vs saved slot + YoY rolling 7-day archive chart |
| `/widget` | Minimal forecast strip for docks / Shortcut windows (?lat=&lon=) |
| `/changelog` | Curated roadmap bullets synced from code |
| `/settings` | Units, thresholds, briefing length, digest opt-in, reduced motion |
| `/signin` | Google OAuth + Resend magic link |
| `/status` | Lightweight DB ping + env presence checklist |

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in DATABASE_URL, AUTH_*, OPENWEATHERMAP_API_KEY, NEXT_PUBLIC_OPENWEATHERMAP_API_KEY,
# NEWSAPI_KEY, GEMINI_API_KEY, RESEND_API_KEY, EMAIL_FROM
npm run db:push          # apply schema to Neon (re-run when `db/schema.ts` gains columns like digest flags)
npm run dev
```

## Environment variables

```
DATABASE_URL=postgresql://...@neon.tech/...
AUTH_SECRET=                 # openssl rand -base64 32
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
RESEND_API_KEY=
EMAIL_FROM="WeatherCore <noreply@yourdomain>"
OPENWEATHERMAP_API_KEY=
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=    # same key, exposed for tile layer URLs on the map
NEWSAPI_KEY=
GEMINI_API_KEY=
# Optional: nightly digest email cron (authorize with Bearer CRON_SECRET)
CRON_SECRET=
# Optional privacy-friendly analytics — set your Plausible hostname
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
# Set to 1 to register the service worker in dev (offline QA)
NEXT_PUBLIC_ENABLE_SW_DEV=
# Maps use MapLibre + OpenFreeMap — no API key needed.
```

### Google OAuth redirect URIs

In the Google Cloud Console OAuth client, add authorized redirect URIs that match **both** environments:

- `http://localhost:3000/api/auth/callback/google` (local development)
- `{AUTH_URL}/api/auth/callback/google` for production, e.g. `https://your-domain.com/api/auth/callback/google`

`AUTH_URL` must equal the canonical origin visitors use so the OAuth callback resolves correctly (already required for magic links).

## Architecture

- **API routes** all DB-cache aggressively. Weather: 10-min TTL. AI: 30-min TTL with `?regenerate=1` to bust. News: 1-hr TTL.
- **AI endpoints** (`/api/ai-analysis`, `/api/ai-analysis/map`, `/api/ai-analysis/disaster`, `/api/ai-analysis/summarize-news`) are auth-gated, rate-limited (10 / user / hour, table-backed), and stream Gemini chunks via `ReadableStream` + `TransformStream` that tees output into a DB cache write on flush.
- **Disaster events** are upserted from NWS + NHC + ReliefWeb on every `/api/severe` fan-out; stale events (`updated_at < NOW() - 6h`) are auto-deactivated.
- **Map** uses `maplibre-gl` with the free [OpenFreeMap](https://openfreemap.org) dark vector style — no API key, no signup, no rate limits. Tile overlays (temp / precip / wind / clouds) come from OpenWeatherMap's tile API. Disaster markers are rendered from the DB as GeoJSON circle layers.
- **PWA**: `public/manifest.webmanifest` + `public/sw.js`. Service worker network-first caches `/api/weather` for offline dashboards. Registered only in production.

## Scripts

```
npm run dev          Start the dev server
npm run build        Production build
npm run start        Run production build
npm run typecheck    tsc --noEmit
npm run db:generate  Drizzle: generate SQL migration
npm run db:push      Drizzle: push schema to DB
npm run db:studio    Drizzle Studio
```

## Design system

| Token | Value | Usage |
| --- | --- | --- |
| `--color-primary` | `#344973` | Headers, primary buttons |
| `--color-secondary` | `#818DA6` | Card surfaces accents |
| `--color-light` | `#B4C0D9` | Backgrounds, input fields, info |
| `--color-earth` | `#70735A` | Badges, severity, nature |
| `--color-neutral` | `#ABA5AF` | Muted text, borders |
| `--color-bg-dark` | `#1E2435` | Page background |
| `--color-bg-card` | `#2A3248` | Card surfaces |
| `--color-text-primary` | `#E8ECF4` | Primary text |
| `--color-text-muted` | `#ABA5AF` | Secondary text |
| `--color-danger` | `#C0392B` | Warnings & emergencies |
| `--color-warning` | `#E67E22` | Watches |
| `--color-info` | `#B4C0D9` | Informational |
| `--color-safe` | `#70735A` | Good / safe |

Glassmorphism cards use `.glass` (`background: rgba(52,73,115,0.25); backdrop-filter: blur(12px); border: 1px solid rgba(180,192,217,0.15)`). The animated background (`<AnimatedBackground />`) switches gradients and particle systems based on the current weather condition.

## Accessibility

- WCAG AA — `--color-text-primary` (`#E8ECF4`) on `--color-bg-card` (`#2A3248`) → ~12.4:1 (AAA).
- Severity badges combine color + iconography, never color alone.
- Interactive elements expose `aria-pressed` / `aria-expanded` / `aria-label`.

## Known limitations / TODOs

- Push notifications are not yet implemented (PWA install + offline only).
- No i18n yet (English only).
- Hurricane forecast cone polygons require parsing NHC KMZ — currently only the storm point + advisory link is rendered.
