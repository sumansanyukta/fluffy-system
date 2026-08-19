## Goal

Let users upload product images to Vercel Blob and assign them to products in a project. Each product gets exactly one image. Users can upload single images or batches, then assign uploaded images to product slots.

## Upload Interaction

A drag-and-drop zone centered in the project workspace. Users can also click the zone to open the system file picker. The zone accepts multiple files at once.

The drop zone should show:
- A dashed border outline on idle state
- A highlight state when files are dragged over it
- A clear label indicating accepted formats and size limit

## Constraints

- Accepted formats: JPEG, PNG
- Max file size: 10MB per image
- One image per product
- Images are stored in Vercel Blob under `products/{projectId}/{productId}.ext`
- The blob URL is saved to `Product.imageUrl` in the database

## Batch Upload Flow

1. User drops (or selects) multiple images into the drop zone.
2. All images upload to Vercel Blob in parallel with an overall batch progress indicator.
3. After upload completes, uploaded images appear as a row of thumbnails in the workspace.
4. User drags or assigns each thumbnail to a product slot in the product list.
5. Assigned images update `Product.imageUrl` via API.

## Post-Upload Image Management

- Each uploaded thumbnail shows a small preview.
- User can reorder images within the uploaded set by dragging.
- User can delete individual uploaded images (removes from Blob and unassigns from product if assigned).
- User can re-assign an image to a different product by dragging it to a new slot.

## Progress Indication

A single overall progress bar above the drop zone shows batch upload completion percentage. No per-image progress indicators. Once complete, the bar disappears and thumbnails render.

## Error Handling

- Failed uploads are skipped automatically.
- After the batch completes, a summary lists which files failed and why (format rejected, too large, network error).
- User can re-drop failed files to retry.

## API Route

`POST /api/projects/[projectId]/upload`

- Protected route: only project owner or collaborators.
- Accepts `multipart/form-data` with one or more image files.
- Validates file type and size server-side.
- Uploads each valid file to Vercel Blob.
- Returns array of `{ productId: null, blobUrl: string, fileName: string }` for successfully uploaded images.
- Returns errors array for failed files.

## Database

Use the existing `Product.imageUrl` column. No schema changes needed. The upload flow writes the blob URL to this field when the user assigns an image to a product.

## Design

- Use the dark theme tokens. No hardcoded colors.
- Drop zone uses `border-dashed` with `border-subtle` token. Highlight state uses `border-brand` and `bg-accent-dim`.
- Thumbnails rendered in a horizontal scrollable strip with `rounded-xl` per image.
- Progress bar uses `bg-brand` fill on `bg-subtle` track.
- Error summary uses `text-error` for failed file names.

## Implementation

### Server

- Create `/app/api/projects/[projectId]/upload/route.ts`.
- Use `@vercel/blob` `put` for each file.
- Validate auth via existing project membership check.
- Validate file type (JPEG/PNG MIME) and size (<=10MB) before blob upload.

### Client

- Create an `ImageUploadZone` component using native drag-and-drop events and a hidden file input.
- Create an `ImageThumbnailStrip` component for the uploaded image row.
- Create an `ImageAssignmentDragDrop` component that connects thumbnails to product slots.
- Use `react-dropzone` or native HTML5 drag events — do not install additional heavy libraries.

### State

- Uploaded images tracked in client state as `{ blobUrl, fileName, assignedProductId }[]`.
- Assignment updates call `PATCH /api/projects/[projectId]/products/[productId]` to set `imageUrl`.

## Check When Done

- Drop zone accepts JPEG/PNG only, rejects others with error message
- Files over 10MB are rejected client-side before upload
- Batch upload shows overall progress bar
- Failed uploads are skipped and summarized after batch completes
- Uploaded thumbnails render and can be assigned to product slots
- Assigned image URL is persisted to `Product.imageUrl` in DB
- Blob is stored at `products/{projectId}/{productId}.ext`
- Only project owner/collaborators can upload
- `npm run build` passes
