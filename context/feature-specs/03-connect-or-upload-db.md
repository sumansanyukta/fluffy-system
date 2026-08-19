## Goal

After login, present a two-panel workspace where the user connects to the app's database, selects a table, and loads data for AI processing. The left panel handles connection and table selection. The right panel displays the loaded table data.

## Layout

Full-viewport two-column layout below the navbar. No sidebar.

```
+---------------------------+----------------------------------+
| LEFT PANEL (approx 1/3)   | RIGHT PANEL (approx 2/3)         |
|                           |                                  |
|  [Database Connection]    |  [Table Data / Placeholder]      |
|  [Table Selector]         |                                  |
|                           |                                  |
|  [Generate Button]        |                                  |
+---------------------------+----------------------------------+
```

- Left panel: fixed width (~380px), `bg-surface`, right border `border-default`.
- Right panel: fills remaining width, `bg-base`.

## Left Panel — Database Connection

### Database Connection Card

A card (`rounded-2xl`, `bg-elevated`) showing the connection status.

Contents:
- Icon: database icon (Lucide `Database`, `h-5 w-5`, `text-brand`)
- Title: "Product Database"
- Status indicator: a small dot — `bg-state-success` when connected, `bg-state-error` when failed
- Connection string display: masked version of `DATABASE_URL` (show last 8 chars only, e.g., `****abcd1234`)

On mount, the app pings the database to verify connectivity. If the connection fails, show an error state with a "Retry" button.

### Table Selector

Below the connection card. A dropdown/select component showing available tables.

Contents:
- Label: "Select table"
- Dropdown populated from `prisma.$queryRaw` querying `information_schema.tables` (filter to public schema)
- Each option shows: table name + row count (e.g., "Product (3 rows)")
- Default selection: "Product" if it exists, otherwise first table
- On table selection, fetch the table's columns and rows

### Generate Button

Below the table selector. Full-width button (`w-full`).

- Label: "Generate"
- Variant: `default` (brand accent fill)
- Enabled only when a table is selected and data is loaded
- On click: placeholder — shows a toast "Coming soon" (no AI pipeline yet)

## Right Panel — Table Data

### Empty State (before table selection)

Centered placeholder:
- Icon: `Table` from Lucide, `h-8 w-8`, `text-faint`
- Heading: "Select a table"
- Subtext: "Choose a table from the left panel to view its data"

### Table View (after table selection)

A data table displaying the selected table's contents.

- Use a simple `<table>` with sticky header
- Header row: `bg-elevated`, `text-secondary`, uppercase labels, `text-xs`
- Data rows: alternating `bg-base` and `bg-surface` for readability
- Cells: `text-primary`, `text-sm`, max-width truncation with tooltip for long values
- Image URLs: render as small thumbnail previews (48x48, `rounded-xl`)
- Decimal values: format with 2 decimal places
- Row count shown below the table: "Showing X rows"
- Scrollable via the right panel's overflow

## API Routes

### `GET /api/database/tables`

Returns list of tables with row counts.

Response:
```json
{
  "tables": [
    { "name": "Product", "rowCount": 3 },
    { "name": "Project", "rowCount": 1 },
    { "name": "ProjectCollaborator", "rowCount": 0 }
  ]
}
```

### `GET /api/database/tables/[tableName]`

Returns columns and rows for a specific table.

Response:
```json
{
  "columns": ["id", "name", "description", "price", "fabric", "category", "sizeRange", "imageUrl"],
  "rows": [
    { "id": 1, "name": "Silk Evening Gown", "price": 2499.00, "imageUrl": "https://..." }
  ],
  "rowCount": 3
}
```

Both routes:
- Require Clerk authentication
- Use `prisma.$queryRawUnsafe` with parameterized table name (whitelist valid table names to prevent SQL injection)
- Validate table name against `information_schema.tables` before querying

## Design Tokens

- Left panel background: `bg-surface`
- Left panel right border: `border-default`
- Right panel background: `bg-base`
- Connection card: `bg-elevated`, `border-subtle`, `rounded-2xl`
- Database icon: `text-brand`
- Connected status dot: `bg-state-success`
- Error status dot: `bg-state-error`
- Masked connection string: `text-faint`, `font-mono`, `text-xs`
- Table selector: standard shadcn Select component
- Generate button: default variant (brand fill), disabled when no table selected
- Table header: `bg-elevated`, `text-secondary`, `text-xs`, uppercase
- Table rows: alternating `bg-base` / `bg-surface`
- Table cells: `text-primary`, `text-sm`
- Row count text: `text-muted`, `text-xs`
- Placeholder heading: `text-secondary`
- Placeholder subtext: `text-muted`
- Placeholder icon: `text-faint`

## Implementation

### Route

Replace the existing `/editor` page. Remove all project-related UI.

`/app/editor/page.tsx` — client component rendering the two-panel layout.

### Components

- `DatabasePanel` — left panel containing connection card, table selector, and generate button.
- `TableDataPanel` — right panel with empty state and data table.
- `DatabaseConnectionCard` — connection status display.
- `TableSelector` — dropdown for table selection.
- `DataTable` — table rendering component.

All components live in `/components/editor/`.

### State

- `isConnected: boolean` — database connection status
- `tables: { name: string, rowCount: number }[]` — available tables
- `selectedTable: string | null` — currently selected table name
- `columns: string[]` — columns of selected table
- `rows: Record<string, any>[]` — rows of selected table
- `isLoading: boolean` — loading state for table data fetch

### API Implementation

- `/app/api/database/tables/route.ts` — query `information_schema.tables`
- `/app/api/database/tables/[tableName]/route.ts` — query table data with `SELECT * FROM "TableName" LIMIT 100`
- Whitelist table names against `information_schema.tables` to prevent injection
- Limit rows to 100 for V1 (prevent accidental large fetches)

## What This Replaces

This feature removes the entire project-based architecture from the UI:

- Delete or gut `/components/editor/project-sidebar.tsx`
- Delete or gut `/components/editor/editor-navbar.tsx` (simplify to just auth controls)
- Delete `/components/editor/dialogs/` (create/rename/delete project dialogs)
- Delete `/components/image-upload-zone.tsx` and `/components/image-thumbnail-strip.tsx`
- Remove project-related API routes (`/api/projects`, `/api/projects/[projectId]/upload`, `/api/projects/[projectId]/products/[productId]`)
- Keep `/api/products` route for future use

The Prisma schema retains the `Product` model but the `Project` and `ProjectCollaborator` models become unused in the UI for V1.

## Check When Done

- `/editor` renders a two-panel layout (left ~380px, right fills remainder)
- Left panel shows database connection card with status indicator and masked connection string
- Table selector dropdown populates with actual database tables and row counts
- Selecting "Product" table loads and displays product data in the right panel
- Table view shows columns with proper formatting (currency, images, truncation)
- Generate button is enabled when table is loaded, shows "Coming soon" toast on click
- Database query is limited to 100 rows
- Table name is validated against `information_schema` (no raw user input in SQL)
- All colors use CSS custom property tokens (no hardcoded hex or raw Tailwind color classes)
- No project sidebar, project dialogs, image upload, or thumbnail strip visible
- `npm run build` passes
