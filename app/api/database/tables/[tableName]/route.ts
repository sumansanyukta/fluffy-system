import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tableName: string }> }
) {
  const { tableName } = await params;

  try {
    const validTables = await (prisma as any).$queryRawUnsafe(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'`
    );

    const allowedNames = (validTables as { table_name: string }[]).map(
      (t) => t.table_name
    );
    if (!allowedNames.includes(tableName)) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      );
    }

    const columns = await (prisma as any).$queryRawUnsafe(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      tableName
    );

    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "${tableName}" LIMIT 100`
    );

    const rowCountResult = await (prisma as any).$queryRawUnsafe(
      `SELECT COUNT(*)::int AS count FROM "${tableName}"`
    );

    return NextResponse.json({
      columns: (columns as { column_name: string }[]).map(
        (c) => c.column_name
      ),
      rows,
      rowCount: rowCountResult[0]?.count ?? 0,
    });
  } catch (error) {
    console.error("Failed to fetch table data:", error);
    return NextResponse.json(
      { error: "Failed to fetch table data" },
      { status: 500 }
    );
  }
}
