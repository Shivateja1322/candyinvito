# CANDYINVITO — PROJECT CONTEXT

## 1. Purpose & vision

CandyInvito is a premium digital wedding invitation platform. It replaces the
paper card with a fast, cinematic, personal web experience that couples can
customize and share, and that an operator (admin) can manage as a business.

Vision: the invitation itself is the product's marketing. Opening a CandyInvito
link should feel expensive, emotional and effortless on any device.

## 2. Users & roles

- ADMIN — platform operator. Manages clients, invitations, templates, themes,
  deployment approvals, analytics, settings.
- CLIENT — the couple. Creates and customizes invitations, previews, requests
  deployment, reads RSVP + analytics.
- GUEST — receives a link. Views the invitation, submits RSVP, watches
  livestream, toggles music. No account.

## 3. Technology stack (locked)

- TanStack Start v1 (file-based routing, SSR) + React 19 + TypeScript
- Vite 7/8 build
- Tailwind CSS v4 (CSS-first config in `src/styles.css`, no tailwind.config.js)
- shadcn/ui + Radix primitives + lucide-react icons
- TanStack Query for data access (wraps the repository layer)
- recharts for analytics charts
- sonner for toasts
- 3D (later, lazy-only): three / @react-three/fiber / drei — NOT yet installed

## 4. Architecture

```
src/routes/            file-based routes (public, auth, admin, client, invite)
src/components/site/   public marketing shell + sections
src/components/ui/     shadcn primitives
src/lib/mock/          mock datasets (typed, realistic)
src/lib/repositories/  repository layer (async, latency-simulated)
src/lib/types.ts       domain model types
```

Data flow: UI → hooks/TanStack Query → repository → mock implementation.
A future Supabase implementation replaces only the repository internals.

## 5. Route structure (target)

```
/                      home
/templates             template gallery
/templates/$slug       template detail/preview
/features
/how-it-works
/pricing
/about
/contact
/admin/login
/client/login
/admin                 admin shell + dashboard
/admin/clients | invitations | templates | themes | deployments | analytics | settings
/client                client shell + dashboard
/client/invitations | templates | editor/$id | preview/$id | rsvp | deployment | analytics | settings
/i/$slug               guest invitation experience
```

## 6. Design philosophy

Hybrid luxury wedding + modern technology. Warm ivory paper, deep bordeaux ink,
champagne gold accent. Display serif (Cormorant Garamond) paired with a
geometric sans (Jost). Generous spacing, hairline rules, restrained motion,
no glassmorphism, no gradient soup, no generic SaaS card grids everywhere.

Tokens live in `src/styles.css`:

- Colors: `--background --foreground --primary --secondary --muted --accent
--gold --ink --border ...`
- Typography: `--font-display`, `--font-sans`
- Effects: `--shadow-soft`, `--shadow-lift`, `--gradient-veil`

## 7. Mock data architecture

`src/lib/mock/*` exports typed seed datasets. `src/lib/repositories/*` exposes
async CRUD-ish APIs (`list`, `get`, `create`, `update`, `remove`) with simulated
latency, so loading/empty/error states are real. In-memory mutations persist for
the session only.

## 8. Loading philosophy

- App shell: subtle monogram reveal, only if the app is not ready (~500–800ms).
- Navigation: thin top progress bar.
- Dashboards/editor: skeletons. Templates: image fade-in reveal.
- No percentages, no fake progress, no artificial delay.

## 9. Animation philosophy

Fade / transform / scale / reveal / subtle parallax. 150–400ms. Easing:
`cubic-bezier(0.22, 1, 0.36, 1)`. All motion disabled under
`prefers-reduced-motion`.

## 10. 3D philosophy

3D is optional garnish, lazy-loaded, never blocking first paint, disabled or
simplified on low-power/mobile. Candidate uses: hero depth object, template
preview, invitation seal.

## 11. Performance requirements

- Initial route JS kept small; heavy features dynamically imported.
- Images sized + lazy (hero excluded), explicit width/height.
- No global heavy providers. Charts, editor and 3D are route-level lazy chunks.

## 12. Key workflows

Deployment: DRAFT → PENDING_REVIEW → APPROVED → LIVE → EXPIRING → EXPIRED, plus
REJECTED. Invitation = Template + Sections + Content + Theme + Animations.

## 13. Constraints

Frontend-only for now; mock auth; no secrets; no framework migration; phases in
order (see MASTER_PROMPT + DEVELOPMENT_STATUS).

## 14. Future backend (not built)

Supabase + Postgres + Auth + Storage + RLS. Entities: users, profiles, clients,
invitations, invitation_sections, templates, themes, rsvps, deployments,
analytics, media, settings.
