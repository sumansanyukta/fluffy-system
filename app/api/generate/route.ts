import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { processBatch } from "@/lib/ai/process-product";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

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
