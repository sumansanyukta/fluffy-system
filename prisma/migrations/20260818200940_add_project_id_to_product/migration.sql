/*
  Warnings:

  - Added the required column `projectId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "projectId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Product_projectId_idx" ON "Product"("projectId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
