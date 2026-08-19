# Architecture Map

> Machine-readable project map. Update when files/folders change. Do not edit `components/ui/*` or `lib/generated/*`.

**Stack:** Next.js 16 · React 19 · Tailwind v4 · shadcn/ui v4 (base-ui) · Clerk · Prisma 7 (PostgreSQL) · Vercel Blob · Yarn 4

**Theme:** Dark-only. All tokens in `app/globals.css` → `@theme inline`. No hex overrides.

---

## Directory Tree

```
app/                          # Next.js App Router
├── layout.tsx                  # Root: ClerkProvider + Geist fonts + dark theme
├── page.tsx                    # Redirect: → /editor (authed) or /sign-in
├── globals.css                 # Theme tokens + Tailwind @theme inline
├── editor/page.tsx             # Main workspace (client component)
├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up
└── api/
    ├── products/route.ts       # GET products by projectId
    └── projects/
        ├── route.ts            # GET/POST projects
        └── [projectId]/
            ├── upload/route.ts            # POST upload to Vercel Blob
            └── products/[productId]/route.ts  # PATCH update imageUrl

components/
├── editor/
│   ├── editor-navbar.tsx       # Top bar: sidebar toggle + Clerk auth
│   ├── project-sidebar.tsx     # Project list (my/shared tabs)
│   └── dialogs/
│       ├── create-project-dialog.tsx
│       ├── delete-project-dialog.tsx
│       └── rename-project-dialog.tsx
├── image-upload-zone.tsx       # Drag-drop upload (JPEG/PNG, 10MB max)
├── image-thumbnail-strip.tsx   # Horizontal scrollable image thumbnails
└── ui/                         # ⚠️ shadcn primitives — DO NOT MODIFY
    ├── button.tsx, card.tsx, dialog.tsx, input.tsx
    ├── scroll-area.tsx, tabs.tsx, textarea.tsx

hooks/
└── use-project-dialogs.ts      # Dialog state for create/rename/delete

lib/
├── prisma.ts                   # Prisma singleton (PG + Accelerate)
├── utils.ts                    # cn() — clsx + tailwind-merge
└── generated/                  # ⚠️ Auto-generated — DO NOT EDIT
    └── prisma/ (client.ts, enums.ts, models/, ...)

prisma/
├── schema.prisma               # 3 models: Project, ProjectCollaborator, Product
├── seed.ts                     # 1 project + 3 dress products
└── migrations/                 # 4 migrations applied

context/                        # Project docs (read these for context)
├── project-overview.md         # Product definition, goals, user flow
├── architecture-context.md     # System boundaries, invariants
├── ui-context.md               # Theme tokens, typography, layout rules
├── code-standards.md           # Implementation conventions
├── ai-workflow-rules.md        # Dev workflow, scoping rules
├── progress-tracker.md         # Current phase + open questions
├── architecture-map.md         # ← THIS FILE
└── feature-specs/              # Design specs (reference, not code)
```

---

## Routes

| Route | File | Method | Auth | Purpose |
|-------|------|--------|------|---------|
| `/` | `app/page.tsx` | GET | No | Redirect to /editor or /sign-in |
| `/editor` | `app/editor/page.tsx` | GET | Yes | Main editor workspace |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | GET | No | Clerk sign-in |
| `/sign-up` | `app/sign-up/[[...sign-up]]/page.tsx` | GET | No | Clerk sign-up |
| `/api/projects` | `app/api/projects/route.ts` | GET | Yes | List user's projects |
| `/api/projects` | `app/api/projects/route.ts` | POST | Yes | Create project |
| `/api/products` | `app/api/products/route.ts` | GET | Yes | List products (by projectId) |
| `/api/projects/:id/upload` | `app/api/projects/[projectId]/upload/route.ts` | POST | Yes | Upload image to Vercel Blob |
| `/api/projects/:id/products/:pid` | `app/api/projects/[projectId]/products/[productId]/route.ts` | PATCH | Yes | Update product imageUrl |

**Middleware:** `proxy.ts` — Clerk auth. Protects all routes except `/sign-in`, `/sign-up`.

---

## Components

| File | Type | Purpose |
|------|------|---------|
| `editor/editor-navbar.tsx` | Client | Top nav: sidebar toggle + Clerk UserButton |
| `editor/project-sidebar.tsx` | Client | Left sidebar: project list with tabs |
| `editor/dialogs/create-project-dialog.tsx` | Client | Modal: create new project |
| `editor/dialogs/delete-project-dialog.tsx` | Client | Modal: confirm delete project |
| `editor/dialogs/rename-project-dialog.tsx` | Client | Modal: rename project |
| `image-upload-zone.tsx` | Client | Drag-drop + click file picker, progress bar |
| `image-thumbnail-strip.tsx` | Client | Horizontal thumbnails, drag-reorder, delete |
| `ui/*.tsx` | RSC | shadcn/ui v4 primitives (base-ui, not Radix) |

---

## Hooks & Lib

| File | Exports | Purpose |
|------|---------|---------|
| `hooks/use-project-dialogs.ts` | `useProjectDialogs()`, `slugify()`, `Project` type | Dialog state for project CRUD |
| `lib/prisma.ts` | `prisma` singleton | Prisma client with globalThis cache in dev |
| `lib/utils.ts` | `cn()` | Tailwind class merging |

---

## Data Model (Prisma → PostgreSQL)

```
Project ──┬── ProjectCollaborator[]  (1:N, projectId FK)
           └── Product[]             (1:N, projectId FK)

Product fields: id, projectId, name, description, price, fabric,
                category, sizeRange, imageUrl, createdAt, updatedAt

Project fields: id, ownerId, name, description, status (DRAFT|ARCHIVED),
                canvasJsonPath, createdAt, updatedAt
```

**Enums:** `ProjectStatus { DRAFT, ARCHIVED }`

---

## Key Invariants

1. All `/api/*` routes require Clerk auth (enforced in `proxy.ts`).
2. `components/ui/*` and `lib/generated/*` — never modify.
3. Dark-only theme — use CSS tokens from `globals.css`, no hardcoded colors.
4. All components are `"use client"` — no RSC usage yet in app components.
5. State is local React state only — no Redux/Zustand/Jotai.
6. Images are Vercel Blob private store with signed URLs.

---

## Environment Variables

| Variable | Used By |
|----------|---------|
| `DATABASE_URL` | Prisma (`lib/prisma.ts`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk provider |
| `CLERK_SECRET_KEY` | Clerk API |
| `BLOB_STORE_ID` | Vercel Blob |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob |

---

## How To Update This File

When files/folders change, update the corresponding section:

- **New file/folder added** → Add row to tree or table with one-line purpose.
- **File deleted** → Remove from tree and all tables.
- **File renamed** → Update path in tree and all tables.
- **New route** → Add row to Routes table.
- **New component** → Add row to Components table.
- **New hook/lib** → Add row to Hooks & Lib table.
- **Schema change** → Update Data Model section.
- **New env var** → Add row to Environment Variables.
- **New invariant** → Add to Key Invariants.
- **New dependency** → Update Stack line at top.

Keep descriptions to 1 line. File paths are the primary lookup key.
