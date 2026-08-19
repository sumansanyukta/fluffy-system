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
2. User imports product catalog (CSV upload or direct database connection).
3. User sees a product catalog with thumbnails and metadata.
4. User clicks "Generate All" (or selects specific products).
5. AI generates product descriptions using the image URL + metadata.
6. User reviews each generated description alongside the product image.
7. User approves, rejects, or requests regeneration.
8. User downloads approved descriptions as CSV.

## Features (V1)

### Authentication

- User sign-in and route protection via Clerk.

### Product Catalog

- Flat product catalog (no projects for V1).
- Products imported via CSV with columns: name, description, price, fabric, category, size_range, image_url.
- Products can also be loaded directly from a connected database.
- Each product displays: name, price, fabric, category, size range, thumbnail image, generation status.

### AI Pipeline

- Two-stage pipeline per product:
  1. Gemini Vision reads the public image URL and extracts visual attributes (color, texture, fit, style).
  2. Gemini Flash generates the description using extracted attributes, product metadata, and brand guidelines.
- Products are processed in batch with progress tracking per product.
- Status states: pending, generating, completed, failed.

### Review and Approval

- User reviews each generated description alongside the product image.
- Approve to finalize, or reject with feedback.
- Reject triggers regeneration with adjusted prompt context.

### Export

- Download all approved descriptions as CSV.

## Scope (V1)

### In Scope

- Authentication and route protection
- CSV import for bulk product creation
- Direct database connection for product import
- AI description generation (image + metadata → description)
- Batch generation with progress tracking
- Review and approval workflow
- CSV export of approved descriptions

### Out Of Scope (V1)

- Project management and collaboration
- Vercel Blob / image upload (images are external public URLs)
- Canvas / real-time collaboration
- Background task queues (Trigger.dev)
- Billing and subscription systems
- Mobile-native applications

## Success Criteria (V1)

1. A signed-in user can import 8,000 products via CSV.
2. AI generates a product description from the public image URL and metadata.
3. The user can review and approve generated descriptions.
4. Approved descriptions can be downloaded as CSV.
