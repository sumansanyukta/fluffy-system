# Architecture Map

> Machine-readable project map. Update when files/folders change. Do not edit `components/ui/*` or `lib/generated/*`.
**Stack:** Next.js 16.3.1 · React 19.2.8 · Tailwind 4.3.3 · shadcn/ui ^4.18.0 · Clerk ^7.7.7 · Prisma ^7.9.1 · Vercel Blob · Yarn 4

**Theme:** Dark-only. All tokens in `app/globals.css` → `@theme inline`. No hex overrides.

---

## Directory Tree

```
├── AGENTS.md
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
├── proxy.ts
├── README.md
├── skills-lock.json
├── tsconfig.json
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── editor/
│   │   └── page.tsx
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── api/
│   │   ├── database/
│   │   │   ├── tables/
│   │   │   │   ├── [tableName]/route.ts
│   │   ├── database/
│   │   │   ├── tables/route.ts
│   │   ├── generate/
│   │   │   ├── regenerate/route.ts
│   │   ├── generate/route.ts
│   │   ├── products/
│   │   │   ├── [productId]/
│   │   │   │   ├── status/route.ts
│   │   ├── products/route.ts
├── components/
│   ├── data-table.tsx
│   ├── database-connection-card.tsx
│   ├── database-panel.tsx
│   ├── editor-navbar.tsx
│   ├── product-review-card.tsx
│   ├── review-tab.tsx
│   ├── review-toolbar.tsx
│   ├── table-data-panel.tsx
│   ├── table-selector.tsx
│   └── ui/                         # ⚠️ shadcn primitives — DO NOT MODIFY
│       └── button.tsx
│       └── card.tsx
│       └── dialog.tsx
│       └── input.tsx
│       └── scroll-area.tsx
│       └── select.tsx
│       └── tabs.tsx
│       └── textarea.tsx
├── hooks/
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   └── generated/                  # ⚠️ Auto-generated — DO NOT EDIT
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── context/
    ├── ai-workflow-rules.md
    ├── architecture-context.md
    ├── architecture-map.md
    ├── code-standards.md
    ├── progress-tracker.md
    ├── project-overview.md
    ├── ui-context.md
└── feature-specs/
```

---

## Routes

| Route | File | Method | Auth | Purpose |
|-------|------|--------|------|---------|
| `/editor` | `app/editor/page.tsx` | GET | Yes | Main editor workspace |
| `/` | `app/page.tsx` | GET | No | Redirect: → /editor or /sign-in |
| `/sign-in/[[...sign-in]]` | `app/sign-in/[[...sign-in]]/page.tsx` | GET | No | Clerk sign-in |
| `/sign-up/[[...sign-up]]` | `app/sign-up/[[...sign-up]]/page.tsx` | GET | No | Clerk sign-up |
| `/api/database/tables/[tableName]/route.ts` | `app/api/database/tables/[tableName]/route.ts` | GET  | Yes | API:  database → tables →  → route.ts |
| `/api/database/tables/route.ts` | `app/api/database/tables/route.ts` | GET  | Yes | API:  database → tables → route.ts |
| `/api/generate/regenerate/route.ts` | `app/api/generate/regenerate/route.ts` | POST  | Yes | API:  generate → regenerate → route.ts |
| `/api/generate/route.ts` | `app/api/generate/route.ts` | POST  | Yes | API:  generate → route.ts |
| `/api/products/[productId]/status/route.ts` | `app/api/products/[productId]/status/route.ts` | PATCH  | Yes | API:  products →  → status → route.ts |
| `/api/products/route.ts` | `app/api/products/route.ts` | GET  | Yes | API:  products → route.ts |

---

## Components

| File | Type | Purpose |
|------|------|---------|
| `components/editor/data-table.tsx` | Client | data table |
| `components/editor/database-connection-card.tsx` | Client | database connection card |
| `components/editor/database-panel.tsx` | Client | database panel |
| `components/editor/editor-navbar.tsx` | Client | editor navbar |
| `components/editor/product-review-card.tsx` | Client | product review card |
| `components/editor/review-tab.tsx` | Client | review tab |
| `components/editor/review-toolbar.tsx` | Client | review toolbar |
| `components/editor/table-data-panel.tsx` | Client | table data panel |
| `components/editor/table-selector.tsx` | Client | table selector |
| `components/ui/*.tsx` | RSC | shadcn/ui v4 primitives (base-ui, not Radix) |

---

## Hooks & Lib

| File | Exports | Purpose |
|------|---------|---------|
| `lib/prisma.ts` | const prisma | prisma |
| `lib/utils.ts` | function cn | utils |

---

## Data Model

```
Prisma → PostgreSQL
Enum: GenerationStatus { PENDING, EXTRACTING, GENERATING, SCORING, SCORED, APPROVED, REJECTED, FAILED }
Enum: ScoreEventType { AI_SCORED, HUMAN_DECIDED }
Enum: HumanAction { APPROVE, REJECT, EDIT }

Model: Product
  id                   Int              
  name                 String
  description          String
  price                Decimal          
  fabric               String
  category             String
  sizeRange            String           
  imageUrl             String           
  imageDescription     String
  generatedDescription String
  confidenceScore      Int
  generationStatus     GenerationStatus 
  lastScoringModel     String
  lastScoredAt         DateTime
  createdAt            DateTime         
  updatedAt            DateTime         
  scoreEvents          ScoreEvent[]
Model: ScoreEvent
  id              Int           
  productId       Int           
  product         Product       
  eventType       ScoreEventType 
  aiScore         Int
  scoringModel    String
  reasoning       String
  issues          String
  humanAction     HumanAction
  previousScore   Int
  adjustedScore   Int
  createdAt       DateTime      

Relationships:
```

---

## Environment Variables

| Variable | Used By |
|----------|---------|
| `DATABASE_URL` | `app/api/database/tables/route.ts`,`lib/prisma.ts` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `proxy.ts` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `proxy.ts` |

---

## Key Invariants

1. All `/api/*` routes require Clerk auth (enforced in `proxy.ts`).
2. `components/ui/*` and `lib/generated/*` — never modify.
3. Dark-only theme — use CSS tokens from `globals.css`, no hardcoded colors.
4. All components are `"use client"` — no RSC usage yet in app components.
5. State is local React state only — no Redux/Zustand/Jotai.
6. Images are Vercel Blob private store with signed URLs.

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
