"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TableInfo {
  name: string
  rowCount: number
}

interface TableSelectorProps {
  tables: TableInfo[]
  selectedTable: string | null
  onSelect: (tableName: string) => void
  disabled: boolean
}

export function TableSelector({
  tables,
  selectedTable,
  onSelect,
  disabled,
}: TableSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-text-secondary">
        Select table
      </label>
      <Select
        value={selectedTable ?? undefined}
        onValueChange={(value) => {
          if (value) onSelect(value)
        }}
        disabled={disabled || tables.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a table..." />
        </SelectTrigger>
        <SelectContent>
          {tables.map((table) => (
            <SelectItem key={table.name} value={table.name}>
              {table.name} ({table.rowCount} {table.rowCount === 1 ? "row" : "rows"})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
