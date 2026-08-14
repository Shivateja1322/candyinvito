# CANDYINVITO — ARCHITECTURAL DECISIONS

## D-001 — Frontend-first development
Decision: Build the complete frontend with mock data before any production
backend. Reason: the full UX must be finalized before persistence is designed.

## D-002 — Repository abstraction instead of inline mock arrays
Decision: All data access goes through `src/lib/repositories/*`, backed by
`src/lib/mock/*`. Reason: a future Supabase implementation replaces the
repository internals without rewriting UI.

## D-003 — Keep TanStack Start (no migration)
Decision: Stay on the existing TanStack Start + React 19 + Tailwind v4 stack.
Reason: it is the project's supported stack; migration would cost the entire
routing/SSR foundation for no product benefit.

## D-004 — Design tokens in `src/styles.css` only
Decision: Every color, font, radius, shadow and gradient is a semantic token.
Components never hardcode color utilities. Reason: theming, consistency and
future theme-builder support (themes are a product feature).

## D-005 — Typography: Cormorant Garamond + Jost
Decision: Display serif for emotion, geometric sans for the product surfaces.
Reason: expresses "luxury wedding + modern technology" without wedding cliché
scripts. Loaded via `<link>` in `__root.tsx` (Tailwind v4 forbids remote
`@import` in the stylesheet).

## D-006 — 3D deferred and lazy-only
Decision: No three.js dependency installed yet. When added it will be
dynamically imported and never in the initial route chunk. Reason: performance
outranks decoration.

## D-007 — Light-first single theme for v1
Decision: Ship one refined ivory/bordeaux light theme; dark tokens exist but no
user-facing toggle. Reason: focus and brand consistency; a toggle is not a
product priority.

## D-008 — Mock auth via a client-side session store
Decision: Mock ADMIN/CLIENT sessions with an explicit `authRepository`, so the
swap to Supabase Auth changes one module. Client-side role checks are UX only.
