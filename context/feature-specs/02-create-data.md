## Goal
To create dummy data for testing, create around 100 products for luxury fashion brand, and add meta data to each product. Make the data realistic and diverse, and have realictic attributes. 

## Create
Create table in prisma schema for products.

### Requirements
columns are:
- id: primary key, auto increment
- name: string, product name
- description: string, product description
- price: decimal, product price
- fabric: string, product fabric
- category: string, product category
- size_range: string, product size range
- image_url: string, product image url (required, using PicSUM placeholder images)

## Seed Data
- 100 products seeded across categories: Outerwear, Tops, Bottoms, Dresses, Accessories, Knitwear, Footwear
- Products include realistic descriptions, prices ($95–$4,100), and diverse fabrics
- All metadata fields populated (name, description, price, fabric, category, size_range)
- Image URLs use PicSUM (picsum.dev) — free, no API key required
- URL format: `https://picsum.dev/800/600?seed={slugified-product-name}`
- Each product gets a deterministic, unique image URL via seed parameter

## Check when done
- new table is created in prisma schema
- columns are as required
- image_url populated for all products
- no lint errors
- table is ready for future use