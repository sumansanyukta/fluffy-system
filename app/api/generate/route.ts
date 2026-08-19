import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { extractImageDescription } from "@/lib/ai/extract-features";
import { generateDescription } from "@/lib/ai/generate-description";
import { scoreDescription } from "@/lib/ai/score-description";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const MAX_CONCURRENT = 3;

async function processProduct(productId: number) {
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

async function processBatch(productIds: number[]) {
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

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tableName } = body as { tableName: string };

  if (tableName !== "Product") {
    return NextResponse.json({ error: "Only Product table is supported" }, { status: 400 });
  }

  const products = await db.product.findMany({
    where: {
      generationStatus: { in: ["PENDING", "FAILED"] },
    },
    take: 100,
    orderBy: { id: "asc" },
  });

  console.log(`[Generate] Found ${products.length} products to process`);

  const skipped = await db.product.count({
    where: {
      generationStatus: { in: ["SCORED", "APPROVED"] },
    },
  });

  if (products.length === 0) {
    return NextResponse.json({ processed: 0, skipped, failed: 0 });
  }

  const productIds = products.map((p: Record<string, unknown>) => p.id as number);
  const { processed, failed } = await processBatch(productIds);

  return NextResponse.json({ processed, skipped, failed });
}
