/*
  Warnings:

  - Made the column `image_url` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- First update NULL values with a default placeholder
UPDATE "Product" SET "image_url" = 'https://picsum.dev/800/600?seed=placeholder' WHERE "image_url" IS NULL;

-- Then make the column required
ALTER TABLE "Product" ALTER COLUMN "image_url" SET NOT NULL;
