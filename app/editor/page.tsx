"use client"

import { useState, useCallback } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { DatabasePanel } from "@/components/editor/database-panel"
import { TableDataPanel } from "@/components/editor/table-data-panel"

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

export default function EditorPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"data" | "review">("data")
  const [reviewProducts, setReviewProducts] = useState<Product[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

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

  const fetchReviewProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products")
      if (res.ok) {
        const data = await res.json()
        setReviewProducts(data)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!selectedTable) return
    setIsGenerating(true)
    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName: selectedTable }),
      })
      await fetchReviewProducts()
      setActiveTab("review")
    } catch {
      // ignore
    } finally {
      setIsGenerating(false)
    }
  }, [selectedTable, fetchReviewProducts])

  const handleApprove = useCallback(async (id: number) => {
    await fetch(`/api/products/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    await fetchReviewProducts()
  }, [fetchReviewProducts])

  const handleReject = useCallback(async (id: number) => {
    await fetch(`/api/products/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    })
    await fetchReviewProducts()
  }, [fetchReviewProducts])

  const handleEdit = useCallback(async (id: number, description: string) => {
    await fetch(`/api/products/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", generatedDescription: description }),
    })
    await fetchReviewProducts()
  }, [fetchReviewProducts])

  const handleRegenerate = useCallback(async (id: number) => {
    await fetch("/api/generate/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: [id] }),
    })
    await fetchReviewProducts()
  }, [fetchReviewProducts])

  const handleApproveAll = useCallback(async (ids: number[]) => {
    for (const id of ids) {
      await fetch(`/api/products/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
    }
    await fetchReviewProducts()
  }, [fetchReviewProducts])

  const handleRegenerateAll = useCallback(async (ids: number[]) => {
    await fetch("/api/generate/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids }),
    })
    await fetchReviewProducts()
  }, [fetchReviewProducts])

  const handleExportCsv = useCallback(() => {
    const approved = reviewProducts.filter((p) => p.generationStatus === "APPROVED")
    if (approved.length === 0) return

    const headers = ["Name", "Category", "Price", "Fabric", "Description"]
    const csvRows = [
      headers.join(","),
      ...approved.map((p) =>
        [
          `"${p.name}"`,
          `"${p.category}"`,
          p.price,
          `"${p.fabric}"`,
          `"${(p.generatedDescription ?? "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ]

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "approved-descriptions.csv"
    a.click()
    URL.revokeObjectURL(url)
  }, [reviewProducts])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar />
      <div className="flex flex-1 overflow-hidden">
        <DatabasePanel
          selectedTable={selectedTable}
          onSelectTable={handleSelectTable}
          isDataLoaded={columns.length > 0}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
        <TableDataPanel
          columns={columns}
          rows={rows}
          rowCount={rowCount}
          isLoading={isLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reviewProducts={reviewProducts}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={handleEdit}
          onRegenerate={handleRegenerate}
          onApproveAll={handleApproveAll}
          onRegenerateAll={handleRegenerateAll}
          onExportCsv={handleExportCsv}
        />
      </div>
    </div>
  )
}
