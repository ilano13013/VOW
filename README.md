# VOW.

**Your moment. Another dimension.**

VOW. creates immersive digital wedding invitations, designed like works of digital art: a living glass and chrome sculpture in WebGL, monumental editorial typography, a private RSVP for each guest, and an organizer space.

> Status: **MVP 1.0, Phases A and B**: landing page, immersive demo invitation, personal guest invitations with a working RSVP, and an organizer space. Stripe payment arrives in Phase C. See [Known limitations](#known-limitations).

## Stack

React 19, TypeScript, Vite 6, Tailwind CSS 4, GSAP 3, Three.js and React Three Fiber, Supabase (Auth, Postgres with RLS, Storage), Vitest and Testing Library, Playwright. Stripe Checkout arrives in Phase C.

Fonts (Bodoni Moda, Jost) are self-hosted through `@fontsource-variable`. No call goes to Google Fonts.

## Installation

```bash
npm install
cp .env.example .env.local   # optional: without Supabase, the app runs in local demo mode
npm run dev                  # http://localhost:5173, also exposed on the local network
```

### Testing on an iPhone on the same Wi-Fi network

`npm run dev` listens on every interface (`server.host = true`). Open the `Network:` URL that Vite prints (for example `http://192.168.1.20:5173`) in Safari on the iPhone.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type check, then production build in `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit and component tests (Vitest, jsdom) |
| `npm run test:e2e` | End-to-end tests (Playwright: desktop Chrome and emulated iPhone 14 Pro) |
| `npm run test:db` | Database tests (RLS, permissions, RSVP validation, rate limits) on a local PostgreSQL. See [docs/SUPABASE.md](docs/SUPABASE.md) |
| `npm run plates` | Regenerates the demo images (`public/plates/`) from the real 3D sculpture. Needs `ffmpeg` with libwebp |

`npm run test:e2e` builds the app and then starts `vite preview` by itself.

## Routes

| Route | Content |
| --- | --- |
| `/` | Commercial landing page |
| `/demo` | Demo invitation for Camille & Gabriel (fictional). `?open=1` skips the opening sequence |
| `/commander/:plan` | Plan summary (`essential`, `signature`, `couture`). Payment is **not yet open** and the page says so |
| `/i/:token` | A guest's personal invitation, with its RSVP |
| `/organizer/login` | Organizer sign-in and sign-up |
| `/organizer` | Organizer dashboard: invitations, creation |
| `/organizer/events/:id` | Overview (RSVP statistics, diets, messages), Guests (personal links, rotation, CSV export), Content (editing), Publish/Unpublish |
| `/organizer/events/:id/preview` | Full preview, visible to the organizer only |

## Architecture

```
src/
  app/                 routes, 404, loading fallback
  components/
    layout/            header, footer, scroll management
    three/             3D sculpture: GLSL shaders, R3F canvas (lazy), CSS fallback, progressive stage
    ui/                buttons, icons, plates (raster images), demo badge
  data/                fictional demo content
  features/
    landing/           landing sections
    invitation/        invitation experience (opening, hero, story, day, memories)
    pricing/           offers (single source of truth for prices)
    order/             order page
  hooks/               reduced motion, countdown, scroll reveal, visibility
  lib/                 device detection, GSAP, utilities
  dev/                 development-only route /__plates (renders the plates)
e2e/                   Playwright tests
scripts/               render-plates.mjs
public/plates/         WebP stills of the sculpture and a capture of the demo, plus PROVENANCE.json
```

### Immersive 3D layer

- **Progressive loading**: a CSS poster of the sculpture shows instantly. The Three.js chunk (about 240 kB gzip) is loaded with `import()` only when it is needed, and the canvas fades in after its first frame.
- **Permanent fallback** to the CSS sculpture when WebGL is missing, when data saver is on, on a render error or on a lost WebGL context.
- **Lightweight**: no HDR environment map. Reflections come from a procedural "studio" in the shader. Geometry, particle count and pixel ratio are adjusted to the device tier.
- **Rendering paused** when the scene leaves the viewport. A single WebGL renderer per page.
- **prefers-reduced-motion**: the scene freezes on one frame, the opening becomes a crossfade, and scroll reveals are turned off. The setting is reactive.

## Backend: Supabase or local demo mode

- **With Supabase** (variables set): accounts, data and RSVPs live in Postgres, protected by RLS. Setup: [docs/SUPABASE.md](docs/SUPABASE.md).
- **Without Supabase:** `LocalBackend` stores everything in the browser. It implements the same rules as the database (isolation between accounts, plan quotas, 192-bit tokens, validation, deadline, rate limits) so the product can be tried end to end. It provides **no real security**: data stays on the device, and a banner says so throughout the organizer space.
- The demo invitation (`/demo`) has a working RSVP. The answer stays in the browser, and the page says so.

## Known limitations

### Phases A and B

- Payment: no payment is possible. The order page says so explicitly. For now, a new invitation is created on the Essential plan, and publishing does not yet require payment (the payment gate arrives in Phase C).
- Signature features (Our Story, Memories, CSV export) are not yet restricted by plan.
- Supabase has not been connected or tested in this environment (no project credentials). The SQL migrations are tested on PostgreSQL 16 with a shim of Supabase's `auth` and `storage` schemas (48 assertions). The Supabase client (`SupabaseBackend`) has not been run against a real project.
- No e-mail is sent to guests. The organizer copies each personal link and sends it through their own channel.
- Rate limiting by IP relies on the `x-forwarded-for` header supplied by the Supabase gateway.
- Memories: organizers cannot add photos yet (no upload interface). The private bucket and its permissions are ready.
- Our Story and Memories: the demo images are stills rendered from the VOW. sculpture itself (no real photos), and they are labelled as such. Their origin is listed in `public/plates/PROVENANCE.json`. Secure photo upload is not implemented.
- Couture: the custom palette and sculpture are a manual studio service, not an automated feature.
- Playwright tests emulate the iPhone (viewport, touch, user agent) on Chromium, because WebKit is not installed in the development environment. A test on a real iPhone or Safari remains necessary.

## Design

- Product context: `PRODUCT.md`.
- Surface direction contract: `.impeccable/surfaces/`.
