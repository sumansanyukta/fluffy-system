import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string; productId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, productId } = await params;

  const project = await (prisma as any).project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isOwner = project.ownerId === userId;
  const isCollaborator = project.collaborators.some(
    (c: { email: string }) => c.email === userId
  );
  if (!isOwner && !isCollaborator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { imageUrl } = body as { imageUrl: string | null };

  const product = await (prisma as any).product.update({
    where: { id: Number(productId) },
    data: { imageUrl },
  });

  return NextResponse.json(product);
}
