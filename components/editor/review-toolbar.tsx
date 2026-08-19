"use client"

import { Check, RotateCcw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReviewToolbarProps {
  tier: "high" | "medium" | "low"
  count: number
  onApproveAll: () => void
  onRegenerateAll: () => void
  onExportCsv: () => void
}

export function ReviewToolbar({
  tier,
  count,
  onApproveAll,
  onRegenerateAll,
  onExportCsv,
}: ReviewToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-muted">
        {count} product{count !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        {tier === "high" && (
          <Button size="sm" variant="ghost" onClick={onApproveAll}>
            <Check className="h-3 w-3" />
            Approve All
          </Button>
        )}
        {tier === "low" && (
          <Button size="sm" variant="ghost" onClick={onRegenerateAll}>
            <RotateCcw className="h-3 w-3" />
            Regenerate All
          </Button>
        )}
        {tier === "high" && (
          <Button size="sm" variant="ghost" onClick={onExportCsv}>
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
        )}
      </div>
    </div>
  )
}
