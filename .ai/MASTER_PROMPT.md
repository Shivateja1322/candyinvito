# CANDYINVITO — MASTER PROMPT (permanent rules)

This file holds the permanent development rules for CandyInvito. Do not rewrite
it during normal development. Modify only when fundamental rules change.

## Product

CandyInvito is a premium digital wedding invitation platform. Admins manage
clients, invitations, templates, themes, deployments, analytics and settings.
Clients create/customize/preview/deploy invitations. Guests experience a
cinematic invitation.

## Non-negotiable rules

1. FRONTEND FIRST. No production backend (Supabase auth/DB/RLS/storage/APIs)
   unless explicitly requested. Use realistic mock data behind repositories.
2. MOCK ABSTRACTION. UI → repository/service layer → mock implementation.
   Never scatter large mock arrays inside components.
3. PERSISTENT MEMORY. `.ai/` files are mandatory and must be updated at the end
   of every meaningful session (STATUS + LOG at minimum).
4. NO FALSE COMPLETION. Distinguish COMPLETE / IMPLEMENTED / MOCKED / PARTIAL /
   PLANNED / BLOCKED / NEEDS TESTING. Percentages must reflect real work.
5. PERFORMANCE IS A FEATURE. Fast initial render, code splitting, lazy loading,
   lazy 3D, optimized images. Never trade real speed for effects.
6. DESIGN SYSTEM ONLY. All colors/gradients/shadows/typography come from
   semantic tokens in `src/styles.css`. Never hardcode color utilities
   (`text-white`, `bg-[#...]`) in components.
7. LOADING must be subtle and short (~500–800ms max when needed). No fake
   progress, no percentages, no forced cinematic loaders.
8. ANIMATION must be short, purposeful, and respect `prefers-reduced-motion`.
9. DO NOT DESTROY EXISTING WORK. Inspect before changing. Record major rewrites
   in `.ai/DECISIONS.md`.
10. PHASE DISCIPLINE. Follow the phase order in PROJECT_CONTEXT.md. Do not jump
    randomly between phases.
11. STACK LOCK. TanStack Start + React 19 + TypeScript + Tailwind v4 +
    shadcn/ui. No framework migration. No unnecessary dependencies.
12. SECURITY. No secrets in frontend code. Client-side role checks are UX only.

## Continuation protocol

Read all `.ai/` files → inspect repo → identify current phase/task → understand
existing code → implement → verify → update STATUS + LOG → state the next exact
task.
