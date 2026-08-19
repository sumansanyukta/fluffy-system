"use client"

import { Table2, Sparkles } from "lucide-react"
import { DataTable } from "./data-table"
import { ReviewTab } from "./review-tab"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  price: number
  fabric: string
  category: string
  imageUrl: string
  generatedDescription: string | null
  confidenceScore: number | null
  generationStatus: string
}

interface TableDataPanelProps {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  isLoading: boolean
  activeTab: "data" | "review"
  onTabChange: (tab: "data" | "review") => void
  reviewProducts: Product[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onEdit: (id: number, description: string) => void
  onRegenerate: (id: number) => void
  onApproveAll: (ids: number[]) => void
  onRegenerateAll: (ids: number[]) => void
  onExportCsv: () => void
}

export function TableDataPanel({
  columns,
  rows,
  rowCount,
  isLoading,
  activeTab,
  onTabChange,
  reviewProducts,
  onApprove,
  onReject,
  onEdit,
  onRegenerate,
  onApproveAll,
  onRegenerateAll,
  onExportCsv,
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
    <div className="flex flex-1 flex-col overflow-hidden bg-bg-base">
      <div className="flex shrink-0 border-b border-border-default">
        <button
          onClick={() => onTabChange("data")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "data"
              ? "border-b-2 border-accent-primary text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          <Table2 className="h-4 w-4" />
          Data Table
        </button>
        <button
          onClick={() => onTabChange("review")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "review"
              ? "border-b-2 border-accent-primary text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Review
        </button>
      </div>

      {activeTab === "data" ? (
        <div className="flex-1 overflow-auto p-6">
          <DataTable columns={columns} rows={rows} rowCount={rowCount} />
        </div>
      ) : (
        <ReviewTab
          products={reviewProducts}
          onApprove={onApprove}
          onReject={onReject}
          onEdit={onEdit}
          onRegenerate={onRegenerate}
          onApproveAll={onApproveAll}
          onRegenerateAll={onRegenerateAll}
          onExportCsv={onExportCsv}
        />
      )}
    </div>
  )
}
