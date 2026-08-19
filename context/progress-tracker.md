# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 2: Data Layer and Product Schema

## Current Goal

- Set up product database schema, seed data with images, and prepare for AI pipeline.

## Completed

- Phase 1: Design System and UI Primitives
  - Initialized shadcn/ui with Tailwind v4 support
  - Installed shadcn components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
  - Installed lucide-react for iconography
  - Created `lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)
  - Configured `globals.css` with dark-only theme tokens matching ui-context.md spec
  - Added custom theme variables: bg-base, bg-surface, bg-elevated, bg-subtle, border-default, border-subtle, text-primary/secondary/muted/faint, accent-primary, accent-ai, state-error/success/warning
  - Mapped all CSS variables to Tailwind utility classes via `@theme inline`
  - Verified TypeScript compilation, Next.js build, and ESLint all pass cleanly
- Phase 2: Data Layer
  - Created Product model in Prisma schema with required `imageUrl` field
  - Created migration to make `image_url` column required
  - Seeded 3 demo products with Vercel Blob image URLs
  - Updated feature spec `02-create-data.md` with PicSUM and image requirements

## In Progress

- None

## Next Up

- Authentication and project scaffolding (Clerk integration)
- AI pipeline implementation (Gemini Vision + Flash)
- Product catalog UI with image display

## Open Questions

- Image URL expiration: Vercel Blob signed URLs expire. Need runtime URL generation for production.

## Architecture Decisions

- Dark-only theme: no light mode support. All shadcn CSS variables hardcoded to dark palette values.
- Custom theme tokens defined alongside shadcn standard tokens in globals.css for use in app-level components.
- Product images stored in Vercel Blob (private store with signed URLs).
- Database: PostgreSQL via Prisma with Product model linked to Project.

## Session Notes

- shadcn/ui v4.18.0 uses `@base-ui/react` primitives (not Radix). Components are in `components/ui/`.
- Next.js 16.3.1 uses Turbopack by default. No webpack config issues encountered.
- Tailwind v4: configuration via CSS `@theme inline` block, no `tailwind.config.js` needed.
- Vercel Blob private store URLs require delegation tokens; tokens expire after ~24 hours.
- Seed file uses `dotenv/config` to load DATABASE_URL from `.env`.
