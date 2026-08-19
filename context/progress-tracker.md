# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 4: AI Pipeline and Review Dashboard (Feature 04)

## Current Goal

- Implement three-stage AI pipeline, schema changes, and review dashboard.

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
- Phase 3: Database Connection UI (Feature 03)
  - Two-panel layout: left panel (380px) for database connection/table selection, right panel for data display
  - Database connection card with status indicator and masked connection string
  - Table selector dropdown populated from `information_schema.tables` with row counts
  - Data table view with proper formatting (currency, image thumbnails, truncation)
  - API routes: `GET /api/database/tables` and `GET /api/database/tables/[tableName]`
  - SQL injection protection via table name whitelisting
  - Removed project-related UI components (sidebar, dialogs, image upload)
  - Removed project-related API routes
  - Simplified editor navbar to auth controls only
- Phase 4: AI Pipeline and Review Dashboard (Feature 04)
  - Schema changes: Removed Project/ProjectCollaborator models, added GenerationStatus enum, added imageDescription/generatedDescription/confidenceScore/generationStatus to Product
  - Installed `ai` and `@ai-sdk/google` packages
  - Created `lib/ai/gemini.ts` — singleton Google Generative AI provider
  - Created `lib/ai/extract-features.ts` — Stage 1: Gemini Vision feature extraction
  - Created `lib/ai/generate-description.ts` — Stage 2: Gemini Flash description generation with few-shot learning
  - Created `lib/ai/score-description.ts` — Stage 3: Gemini Flash quality scoring
  - Created `POST /api/generate` — batch pipeline endpoint (max 100 products, 3 concurrent)
  - Created `PATCH /api/products/[productId]/status` — approve/reject/edit with score adjustment
  - Created `POST /api/generate/regenerate` — re-run pipeline for selected products
  - Updated `GET /api/products` — supports status filter
  - Created `components/editor/product-review-card.tsx` — card with image, description, score badge, actions
  - Created `components/editor/review-toolbar.tsx` — batch action buttons (Approve All, Regenerate All, Export CSV)
  - Created `components/editor/review-tab.tsx` — review dashboard with confidence-tiered card grid
  - Updated `components/editor/table-data-panel.tsx` — added tab bar (Data Table | Review)
  - Updated `app/editor/page.tsx` — generation state, tab switching, action handlers, CSV export
  - Updated `components/editor/database-panel.tsx` — Generate button triggers pipeline, loading state
  - Updated seed file — 51 luxury fashion products with PicSUM image URLs
  - Updated feature spec `04-image-feature-extraction.md` — comprehensive pipeline spec
  - Updated `context/project-overview.md` — revised user journey
  - Updated `context/architecture-context.md` — removed Project model, added AI pipeline

## In Progress

- None

## Next Up

- Seed 100 diverse luxury fashion products (currently 51)
- Test end-to-end pipeline with real Gemini API key
- Error handling refinement for production use
- Consider real-time progress updates via SSE (future enhancement)

## Open Questions

- None currently.

## Architecture Decisions

- Dark-only theme: no light mode support. All shadcn CSS variables hardcoded to dark palette values.
- Custom theme tokens defined alongside shadcn standard tokens in globals.css for use in app-level components.
- Database: PostgreSQL via Prisma. Product model is standalone (no Project FK in V1).
- AI pipeline: three stages — Gemini Vision extraction → Gemini Flash generation → Gemini Flash scoring.
- Confidence score: LLM-evaluated initially, adjusted by human approve/reject/edit actions.
- Few-shot reinforcement: approved descriptions from same category injected as examples in future generation prompts.
- Review UI: tabbed right panel (Data Table | Review), card grid grouped by confidence tier.
- Processing: simple loading state during generation, no real-time progress per product.
- Prisma client: cast to typed wrapper for accelerate-compatible type safety.

## Session Notes

- shadcn/ui v4.18.0 uses `@base-ui/react` primitives (not Radix). Components are in `components/ui/`.
- Next.js 16.3.1 uses Turbopack by default. No webpack config issues encountered.
- Tailwind v4: configuration via CSS `@theme inline` block, no `tailwind.config.js` needed.
- Seed file uses `dotenv/config` to load DATABASE_URL from `.env`.
- Pullfrog replaced project-based UI with two-panel database connection workspace.
- Prisma accelerate extension changes type signatures — use typed wrapper pattern for API routes.
- `@ai-sdk/google` requires `zod` as a peer dependency.
