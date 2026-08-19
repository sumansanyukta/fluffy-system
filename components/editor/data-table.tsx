"use client"

interface DataTableProps {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
}

function formatCellValue(value: unknown, column: string): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "number") {
    if (column.toLowerCase().includes("price") || column.toLowerCase().includes("cost")) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
    return String(value)
  }
  if (typeof value === "string" && value.length > 80) {
    return value.slice(0, 80) + "…"
  }
  return String(value)
}

function isImageUrl(column: string): boolean {
  const lower = column.toLowerCase()
  return lower.includes("image") || lower.includes("url") || lower.includes("photo")
}

export function DataTable({ columns, rows, rowCount }: DataTableProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-auto rounded-2xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-elevated">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-secondary"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={
                  i % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"
                }
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="max-w-[200px] truncate px-3 py-2 text-text-primary"
                    title={String(row[col] ?? "")}
                  >
                    {isImageUrl(col) && typeof row[col] === "string" && row[col] ? (
                      <img
                        src={String(row[col])}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      formatCellValue(row[col], col)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-text-muted">
        Showing {rows.length} of {rowCount} rows
      </p>
    </div>
  )
}
