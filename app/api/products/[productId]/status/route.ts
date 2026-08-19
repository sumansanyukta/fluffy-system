import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const body = await request.json();
  const { action, generatedDescription } = body as {
    action: "approve" | "reject" | "edit";
    generatedDescription?: string;
  };

  const product = await db.product.findUnique({
    where: { id: Number(productId) },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let updateData: Record<string, unknown> = {};

  switch (action) {
    case "approve":
      updateData = {
        generationStatus: "APPROVED",
        confidenceScore: Math.min(((product.confidenceScore as number) ?? 5) + 1, 10),
      };
      break;
    case "reject":
      updateData = {
        generationStatus: "REJECTED",
        confidenceScore: Math.max(((product.confidenceScore as number) ?? 5) - 2, 1),
      };
      break;
    case "edit":
      if (!generatedDescription) {
        return NextResponse.json({ error: "generatedDescription required for edit" }, { status: 400 });
      }
      updateData = {
        generationStatus: "APPROVED",
        generatedDescription,
        confidenceScore: 8,
      };
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await db.product.update({
    where: { id: Number(productId) },
    data: updateData,
  });

  return NextResponse.json(updated);
}
