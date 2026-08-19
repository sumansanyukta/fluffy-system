import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) {
    where.generationStatus = status;
  }

  const products = await db.product.findMany({
    where,
    orderBy: { id: "asc" },
    take: 100,
  });

  return NextResponse.json(products);
}
