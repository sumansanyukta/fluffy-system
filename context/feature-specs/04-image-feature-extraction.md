## Goal

After a product image is assigned, extract structured visual attributes from the image using Gemini Vision. Store the raw JSON response as a string in `Product.imageDescription`. This structured data becomes the primary input for the description generation pipeline (feature 05), which parses it to generate the final product description.

## When It Runs

Image description extraction triggers automatically after a product image is assigned (i.e., after `Product.imageUrl` is set via `PATCH /api/projects/[projectId]/products/[productId]`). The user does not need to take a separate action. If extraction fails, the image remains assigned but the product shows a "description not extracted" state, and the user can retry.

## Dependencies

- `@ai-sdk/google` and `ai` packages must be installed.
- `GOOGLE_GENERATIVE_AI_API_KEY` must be set in `.env.local`.
- Feature spec 03 (image upload) must be complete — images must already be stored in Vercel Blob with URLs on `Product.imageUrl`.

## Extraction Prompt

Gemini Vision receives the product image and a structured prompt requesting the following visual attributes:

```json
{
  "dominantColors": ["charcoal", "ivory"],
  "accentColors": [],
  "pattern": "solid",
  "texture": "smooth wool",
  "fabricAppearance": "structured, matte",
  "silhouette": "tailored, straight-cut",
  "fit": "regular",
  "length": "hip-length",
  "closureType": "single-breasted buttons",
  "neckline": "notch lapel",
  "sleeveLength": "long",
  "embellishments": [],
  "hardwareDetails": "horn buttons",
  "season": "autumn/winter",
  "formalityLevel": "smart casual",
  "styleKeywords": ["minimalist", "tailored", "classic"],
  "visibleDetails": ["back vent", "flap pockets"]
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `dominantColors` | `string[]` | 1–3 primary colors visible in the garment |
| `accentColors` | `string[]` | Secondary or contrasting colors, if any |
| `pattern` | `string` | One of: `solid`, `striped`, `plaid`, `floral`, `geometric`, `animal print`, `paisley`, `checkered`, `other` |
| `texture` | `string` | Surface texture description (e.g., `smooth leather`, `ribbed knit`, `brushed suede`) |
| `fabricAppearance` | `string` | How the fabric looks — drape, sheen, weight (e.g., `fluid, lustrous`, `structured, matte`) |
| `silhouette` | `string` | Overall shape and cut (e.g., `oversized`, `tailored`, `A-line`, `relaxed`) |
| `fit` | `string` | One of: `slim`, `regular`, `relaxed`, `oversized` |
| `length` | `string` | Garment length relative to body (e.g., `ankle-length`, `hip-length`, `knee-length`) |
| `closureType` | `string` | How the garment closes (e.g., `zipper`, `single-breasted buttons`, `pullover`, `belt`) |
| `neckline` | `string` | Neckline or collar style (e.g., `V-neck`, `notch lapel`, `crew neck`, `point collar`) — leave empty for accessories/footwear |
| `sleeveLength` | `string` | One of: `long`, `short`, `sleeveless`, `three-quarter` — leave empty for bottoms/accessories/footwear |
| `embellishments` | `string[]` | Decorative elements (e.g., `embroidered logo`, `sequin trim`, `none`) |
| `hardwareDetails` | `string` | Visible hardware — zippers, buckles, buttons (e.g., `gold-tone zipper`, `horn buttons`) |
| `season` | `string` | Apparent season: `spring/summer`, `autumn/winter`, `all-season` |
| `formalityLevel` | `string` | One of: `casual`, `smart casual`, `business`, `formal`, `black tie` |
| `styleKeywords` | `string[]` | 2–5 descriptive style keywords |
| `visibleDetails` | `string[]` | Notable construction details visible in the image (e.g., `back vent`, `contrast stitching`, `ribbed cuffs`) |

## Output Structure

Gemini returns a JSON object conforming to the schema above. This is the `ImageDescription` type.

```typescript
interface ImageDescription {
  dominantColors: string[]
  accentColors: string[]
  pattern: string
  texture: string
  fabricAppearance: string
  silhouette: string
  fit: string
  length: string
  closureType: string
  neckline: string
  sleeveLength: string
  embellishments: string[]
  hardwareDetails: string
  season: string
  formalityLevel: string
  styleKeywords: string[]
  visibleDetails: string[]
}
```

## API Route

`POST /api/projects/[projectId]/products/[productId]/extract-features`

- Protected route: only project owner or collaborators.
- Fetches `Product.imageUrl` from the database.
- If no image is assigned, returns `400` with error `{ message: "No image assigned to this product" }`.
- Calls Gemini Vision with the image (fetched from the Blob URL) and the extraction prompt.
- Validates the response matches the expected JSON schema.
- Serializes the JSON to a string and writes it to `Product.imageDescription` in the database.
- Returns `200` with `{ imageDescription: string }`.

### Batch Extraction

`POST /api/projects/[projectId]/extract-features`

- Protected route: only project owner or collaborators.
- Accepts `{ productIds: number[] }` in the request body.
- For each product, if `imageUrl` is set and `imageDescription` is null, runs extraction in parallel (max 5 concurrent).
- Returns `{ results: { productId, status, imageDescription?, error? }[] }`.
- Products without images or with existing descriptions are skipped.

## Database

Add to the `Product` model in `prisma/schema.prisma`:

```
imageDescription String? @map("image_description")
```

Run `npx prisma migrate dev --name add-image-description` after the schema change.

The column stores the raw JSON string returned by Gemini Vision. The field is nullable — products that haven't been extracted yet (no image, or extraction pending/failed) have `null`.

## Error Handling

- **No image assigned**: Route returns 400. Product stays in "no description" state.
- **Gemini API error** (rate limit, timeout, invalid response): Route returns 500 with error message. Product remains in "no description" state.
- **Invalid JSON from Gemini**: Route retries once. If still invalid, returns 500.
- **Network error fetching image from Blob**: Route returns 500. User can retry.

On the client side, products with `imageDescription: null` and an assigned image show a "Retry extraction" button next to the product.

## Design

- Extracted image descriptions are not displayed as raw JSON to the user. They are consumed internally by the description generation pipeline (feature 05).
- In the product list, each product card shows a small status indicator:
  - No image: muted icon
  - Image assigned, no description: warning dot (`text-warning`)
  - Description extracted: checkmark (`text-success`)
- A "Extract All" button appears in the project workspace header when there are products with images but no extracted descriptions. Triggers batch extraction.

## Implementation

### Server

- Install `ai` and `@ai-sdk/google` packages.
- Create `lib/ai/gemini.ts` — singleton Google Generative AI provider instance.
- Create `lib/ai/extract-features.ts` — shared function `extractImageDescription(imageUrl: string): Promise<ImageDescription>` that:
  1. Fetches the image from the Blob URL.
  2. Sends it to Gemini Vision with the structured extraction prompt.
  3. Parses and validates the JSON response.
  4. Returns the typed `ImageDescription` object.
- Create `app/api/projects/[projectId]/products/[productId]/extract-features/route.ts` — single-product extraction endpoint. Serializes the `ImageDescription` to JSON string before writing to DB.
- Create `app/api/projects/[projectId]/extract-features/route.ts` — batch extraction endpoint.

### Client

- Create `components/project/product-feature-status.tsx` — status indicator component for product cards.
- Create `components/project/extract-all-button.tsx` — batch extraction trigger button.
- Wire up extraction after image assignment in the existing upload flow: after `PATCH` sets `imageUrl`, call `extract-features` for that product.

### State

- `Product.imageDescription` is the source of truth, persisted in PostgreSQL as a JSON string.
- Client reads the field from the product list to render status indicators.
- No client-side caching of extraction results — always read from the database.

## Check When Done

- `ai` and `@ai-sdk/google` are installed and `GOOGLE_GENERATIVE_AI_API_KEY` is in `.env.local`
- `Product` model has `imageDescription String?` column, migration applied
- Single extraction route works: assigns image description to a product with an image
- Batch extraction route works: processes multiple products in parallel
- Products without images return 400 on extraction attempt
- Invalid Gemini responses are retried once before failing
- Product list shows correct status indicators (no image / pending / extracted)
- "Extract All" button triggers batch extraction and updates status in real time
- `imageDescription` contains valid JSON matching the `ImageDescription` schema
- `npm run build` passes
- `npm run lint` passes
