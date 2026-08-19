import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { processBatch } from "@/lib/ai/process-product";

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

  const { processed, failed } = await processBatch(productIds);

  return NextResponse.json({ processed, failed });
}
