import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

async function processProduct(productId: number) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return "failed";

  try {
    const { extractImageDescription } = await import("@/lib/ai/extract-features");
    const { generateDescription } = await import("@/lib/ai/generate-description");
    const { scoreDescription } = await import("@/lib/ai/score-description");

    await db.product.update({
      where: { id: productId },
      data: { generationStatus: "EXTRACTING" },
    });

    const imageDesc = await extractImageDescription(product.imageUrl as string);
    const imageDescJson = JSON.stringify(imageDesc);

    await db.product.update({
      where: { id: productId },
      data: {
        imageDescription: imageDescJson,
        generationStatus: "GENERATING",
      },
    });

    const generated = await generateDescription({
      id: product.id as number,
      name: product.name as string,
      price: product.price as { toNumber(): number },
      fabric: product.fabric as string,
      category: product.category as string,
      sizeRange: product.sizeRange as string,
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
      name: product.name as string,
      price: product.price as { toNumber(): number },
      fabric: product.fabric as string,
      category: product.category as string,
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
    console.error(`[Regenerate] Product ${productId} failed:`, error);
    await db.product.update({
      where: { id: productId },
      data: { generationStatus: "FAILED" },
    });
    return "failed";
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { productIds } = body as { productIds: number[] };

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "productIds array required" }, { status: 400 });
  }

  let processed = 0;
  let failed = 0;

  for (let i = 0; i < productIds.length; i += 3) {
    const batch = productIds.slice(i, i + 3);
    const results = await Promise.allSettled(batch.map((id) => processProduct(id)));

    for (const result of results) {
      if (result.status === "fulfilled" && result.value === "scored") {
        processed++;
      } else {
        failed++;
      }
    }
  }

  return NextResponse.json({ processed, failed });
}
