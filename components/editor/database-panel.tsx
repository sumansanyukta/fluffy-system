"use client"

import { useEffect, useState, useCallback } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatabaseConnectionCard } from "./database-connection-card"
import { TableSelector } from "./table-selector"

interface TableInfo {
  name: string
  rowCount: number
}

interface DatabasePanelProps {
  selectedTable: string | null
  onSelectTable: (tableName: string) => void
  isDataLoaded: boolean
}

export function DatabasePanel({
  selectedTable,
  onSelectTable,
  isDataLoaded,
}: DatabasePanelProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [maskedUrl, setMaskedUrl] = useState("****")

  const checkConnection = useCallback(async () => {
    setIsChecking(true)
    try {
      const res = await fetch("/api/database/tables")
      if (res.ok) {
        const data = await res.json()
        setIsConnected(true)
        setTables(data.tables)
        setMaskedUrl(data.maskedUrl ?? "****")

        const defaultTable = data.tables.find(
          (t: TableInfo) => t.name === "Product"
        )
        if (defaultTable && !selectedTable) {
          onSelectTable(defaultTable.name)
        }
      } else {
        setIsConnected(false)
      }
    } catch {
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }, [selectedTable, onSelectTable])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-r border-border-default bg-bg-surface p-4">
      <div className="flex flex-col gap-4">
        <DatabaseConnectionCard
          isConnected={isConnected}
          isLoading={isChecking}
          maskedUrl={maskedUrl}
          onRetry={checkConnection}
        />

        <TableSelector
          tables={tables}
          selectedTable={selectedTable}
          onSelect={onSelectTable}
          disabled={!isConnected}
        />

        <Button
          className="w-full"
          disabled={!selectedTable || !isDataLoaded}
          onClick={() => {
            alert("Coming soon")
          }}
        >
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      </div>
    </div>
  )
}
