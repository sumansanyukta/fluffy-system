"use client"

import { Table2 } from "lucide-react"
import { DataTable } from "./data-table"

interface TableDataPanelProps {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  isLoading: boolean
}

export function TableDataPanel({
  columns,
  rows,
  rowCount,
  isLoading,
}: TableDataPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-accent-primary" />
          <p className="text-sm text-text-muted">Loading table data...</p>
        </div>
      </div>
    )
  }

  if (columns.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-3 text-center">
          <Table2 className="h-8 w-8 text-text-faint" />
          <h2 className="text-sm font-medium text-text-secondary">
            Select a table
          </h2>
          <p className="max-w-xs text-xs text-text-muted">
            Choose a table from the left panel to view its data
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-bg-base p-6">
      <DataTable columns={columns} rows={rows} rowCount={rowCount} />
    </div>
  )
}
