import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function maskDatabaseUrl(url: string): string {
  try {
    return "****" + url.slice(-8);
  } catch {
    return "****";
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tables = await (prisma as any).$queryRawUnsafe(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       ORDER BY table_name`
    );

    const tablesWithCounts = await Promise.all(
      (tables as { table_name: string }[]).map(async (t) => {
        try {
          const countResult = await (prisma as any).$queryRawUnsafe(
            `SELECT COUNT(*)::int AS count FROM "${t.table_name}"`
          );
          return {
            name: t.table_name,
            rowCount: countResult[0]?.count ?? 0,
          };
        } catch {
          return {
            name: t.table_name,
            rowCount: 0,
          };
        }
      })
    );

    const databaseUrl = process.env.DATABASE_URL ?? "";

    return NextResponse.json({
      maskedUrl: maskDatabaseUrl(databaseUrl),
      tables: tablesWithCounts,
    });
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}
