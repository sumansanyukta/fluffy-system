# Architecture Context

## Stack (V1)

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                   |
| UI               | Tailwind + shadcn/ui    | Component composition and styling                              |
| Auth             | Clerk                   | User identity and route protection                             |
| Database         | Prisma + PostgreSQL     | Product catalog: metadata, image URLs, generated descriptions  |
| AI               | Google Gemini           | Vision extraction + description generation                     |

## System Boundaries

- `app/api` — Authenticated request handlers: CSV import, product CRUD, AI generation, export.
- `lib` — Shared infrastructure: Prisma client, AI client (Gemini), utilities.
- `components` — UI composition: product catalog, generation controls, review cards.
- `prisma` — Database schema and generated client output.

## Storage Model

- **Database**: All product data — metadata, public image URLs, generated descriptions, generation status.
- Images are external public URLs — no blob storage needed in V1.

## Auth Model

- Only authenticated users can access protected routes.
- All products are global (no project ownership for V1).

## AI Generation Model (V1)

- Per-product generation: image URL + metadata → Gemini Vision (extract attributes) → Gemini Flash (generate description).
- Batch processing with per-product status tracking.
- Status states: pending, generating, completed, failed.

## Invariants

1. All API routes require Clerk authentication.
2. Products are a flat catalog — no project hierarchy in V1.
3. Image URLs must be publicly accessible for AI to read them.
4. Generated descriptions are persisted to the database immediately.
5. Export produces a CSV with all approved descriptions.
