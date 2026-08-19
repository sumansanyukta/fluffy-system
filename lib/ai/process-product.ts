import { prisma } from "@/lib/prisma";
import { extractImageDescription } from "@/lib/ai/extract-features";
import { generateDescription } from "@/lib/ai/generate-description";
import { scoreDescription } from "@/lib/ai/score-description";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function processProduct(productId: number): Promise<"scored" | "failed"> {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return "failed";

  try {
    await db.product.update({
      where: { id: productId },
      data: { generationStatus: "EXTRACTING" },
    });

    const imageDesc = await extractImageDescription(product.imageUrl);
    const imageDescJson = JSON.stringify(imageDesc);

    await db.product.update({
      where: { id: productId },
      data: {
        imageDescription: imageDescJson,
        generationStatus: "GENERATING",
      },
    });

    const generated = await generateDescription({
      id: product.id,
      name: product.name,
      price: product.price,
      fabric: product.fabric,
      category: product.category,
      sizeRange: product.sizeRange,
      imageDescription: imageDescJson,
    });

    await db.product.update({
      where: { id: productId },
      data: {
        generatedDescription: generated,
        generationStatus: "SCORING",
      },
    });

    const scoreResult = await scoreDescription(generated, {
      name: product.name,
      price: product.price,
      fabric: product.fabric,
      category: product.category,
    });

    await db.product.update({
      where: { id: productId },
      data: {
        confidenceScore: scoreResult.score,
        generationStatus: "SCORED",
      },
    });

    return "scored";
  } catch (error) {
    console.error(`[Generate] Product ${productId} failed:`, error);
    await db.product.update({
      where: { id: productId },
      data: { generationStatus: "FAILED" },
    });
    return "failed";
  }
}

const MAX_CONCURRENT = 3;

export async function processBatch(productIds: number[]) {
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < productIds.length; i += MAX_CONCURRENT) {
    const batch = productIds.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.allSettled(batch.map((id) => processProduct(id)));

    for (const result of results) {
      if (result.status === "fulfilled" && result.value === "scored") {
        processed++;
      } else {
        failed++;
      }
    }
  }

  return { processed, failed };
}
