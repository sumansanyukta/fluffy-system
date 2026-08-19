import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

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

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results: Array<{ blobUrl: string; fileName: string }> = [];
  const errors: Array<{ fileName: string; reason: string }> = [];

  const uploadPromises = files.map(async (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push({ fileName: file.name, reason: "Unsupported format" });
      return;
    }

    if (file.size > MAX_SIZE) {
      errors.push({ fileName: file.name, reason: "File too large" });
      return;
    }

    const ext = file.type === "image/png" ? "png" : "jpg";
    const blobPath = `products/${projectId}/${Date.now()}-${file.name}.${ext}`;

    try {
      const blob = await put(blobPath, file, {
        access: "public",
        contentType: file.type,
      });
      results.push({ blobUrl: blob.url, fileName: file.name });
    } catch {
      errors.push({ fileName: file.name, reason: "Upload failed" });
    }
  });

  await Promise.all(uploadPromises);

  return NextResponse.json({ results, errors });
}
