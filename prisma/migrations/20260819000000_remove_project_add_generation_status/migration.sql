-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'EXTRACTING', 'GENERATING', 'SCORING', 'SCORED', 'APPROVED', 'REJECTED', 'FAILED');

-- DropForeignKey
ALTER TABLE "ProjectCollaborator" DROP CONSTRAINT "ProjectCollaborator_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_projectId_fkey";

-- DropTable
DROP TABLE "ProjectCollaborator";

-- DropTable
DROP TABLE "Project";

-- DropEnum
DROP TYPE "ProjectStatus";

-- DropIndex
DROP INDEX "Product_projectId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "projectId",
ADD COLUMN     "confidence_score" INTEGER,
ADD COLUMN     "generated_description" TEXT,
ADD COLUMN     "generationStatus" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "image_description" TEXT;

-- CreateIndex
CREATE INDEX "Product_generationStatus_idx" ON "Product"("generationStatus");
