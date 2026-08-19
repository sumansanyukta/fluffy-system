"use client"

import { useState, useCallback } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { DatabasePanel } from "@/components/editor/database-panel"
import { TableDataPanel } from "@/components/editor/table-data-panel"

export default function EditorPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectTable = useCallback(async (tableName: string) => {
    setSelectedTable(tableName)
    setIsLoading(true)
    try {
      const res = await fetch(`/api/database/tables/${encodeURIComponent(tableName)}`)
      if (res.ok) {
        const data = await res.json()
        setColumns(data.columns)
        setRows(data.rows)
        setRowCount(data.rowCount)
      } else {
        setColumns([])
        setRows([])
        setRowCount(0)
      }
    } catch {
      setColumns([])
      setRows([])
      setRowCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar />
      <div className="flex flex-1 overflow-hidden">
        <DatabasePanel
          selectedTable={selectedTable}
          onSelectTable={handleSelectTable}
          isDataLoaded={columns.length > 0}
        />
        <TableDataPanel
          columns={columns}
          rows={rows}
          rowCount={rowCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
