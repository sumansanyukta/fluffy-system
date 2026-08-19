# Fashion Description Generator

## Overview

A luxury fashion retailer — one of our clients — wants to automate product descriptions for their new collection. They have 8,000 products launching next month. Each product has 4-6 studio images (stored as public URLs), structured metadata (name, price, fabric, category, size range), and brand guidelines that are very specific about tone — aspirational, concise, no superlatives.

Currently, a team of 3 copywriters writes these by hand. It takes about 2 weeks. The client wants it done in 3 days, at roughly 1/10th the cost, without sacrificing quality.

## Goals (V1)

1. Bulk import product catalog (metadata + public image URLs) via CSV or direct database connection.
2. AI generates product descriptions for each product using the image and metadata.
3. User reviews, approves, or regenerates descriptions.
4. Export approved descriptions.

## Brand Guidelines

- Aspirational, concise, no superlatives.
- Follows the brand's voice and style.
- Includes product details, such as price, fabric, category, size range.
- Avoids using technical terms or jargon.

## Core User Flow (V1)

1. User signs in.
2. User selects data source: load products from the app's database, or upload a CSV.
3. User sees a product catalog with thumbnails and metadata.
4. User clicks "Generate All" (or selects specific products).
5. AI pipeline runs in background:
   - Gemini Vision extracts visual features from each product image → stored as `imageDescription`.
   - Gemini Flash generates a product description using extracted features, metadata, and brand guidelines.
   - A second Gemini pass scores each description against brand guidelines (confidence 1–10).
6. User lands on the review dashboard — products grouped by confidence score.
7. User batch-approves high-confidence descriptions, spot-checks medium, and edits/regenerates low-confidence ones.
8. User downloads approved descriptions as CSV.

## Features (V1)

### Authentication

- User sign-in and route protection via Clerk.

### Product Catalog

- Flat product catalog (no projects for V1).
- Products loaded from the app's existing Prisma database, or imported via CSV (columns: name, price, fabric, category, size_range, image_url).
- Card grid layout: each card shows product image thumbnail, name, category, price, and generation status.
- Status states: pending, extracting, generating, scored, approved, rejected, failed.

### AI Pipeline

- Three-stage pipeline per product:
  1. **Feature extraction**: Gemini Vision reads the product image and extracts visual attributes → raw JSON stored in `Product.imageDescription`.
  2. **Description generation**: Gemini Flash generates a product description using the extracted features, product metadata, and brand guidelines.
  3. **Quality scoring**: A second Gemini pass evaluates the generated description against brand guidelines and returns a confidence score (1–10).
- Products processed in batch with per-product progress tracking.
- Failed products can be retried individually or in bulk.

### Review Dashboard

- Card grid grouped by confidence score: High (8–10), Medium (5–7), Low (1–4).
- **Batch actions**:
  - Approve All High-Confidence — one click covers ~70% of products.
  - Approve by Category — review one sample card, approve entire category.
  - Regenerate Selected — re-run description generation for problem products.
  - Edit Inline — fix individual descriptions directly in the card.
- **Anomaly detection**: A second Gemini pass flags descriptions that deviate from brand voice patterns — surfaced as a dedicated filter.
- **Sampling view**: Random 5% from each category for quick confidence checks.
- **Brand Voice Check**: Final automated pass on all approved descriptions before export to catch remaining inconsistencies.

### Export

- Download all approved descriptions as CSV.

## Scope (V1)

### In Scope

- Authentication and route protection
- Load products from app's Prisma database
- CSV import for bulk product creation
- Three-stage AI pipeline (vision extraction → description generation → quality scoring)
- Batch generation with progress tracking
- Tiered review dashboard with confidence grouping, batch approve, anomaly detection
- Inline description editing
- CSV export of approved descriptions

### Out Of Scope (V1)

- Image upload / Vercel Blob storage (images are external public URLs or already in DB)
- Canvas / real-time collaboration
- Background task queues (Trigger.dev)
- Billing and subscription systems
- Mobile-native applications
- Multi-user collaboration / role-based access

## Success Criteria (V1)

1. A signed-in user can load products from the database or import via CSV.
2. AI extracts image features, generates descriptions, and scores quality for all products.
3. The user can batch-approve high-confidence descriptions with one click.
4. The user can review and edit low-confidence descriptions in a card grid.
5. Approved descriptions can be downloaded as CSV.
