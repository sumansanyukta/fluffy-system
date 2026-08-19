"use client"

import { useState } from "react"
import { Check, X, Pencil, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

interface ProductReviewCardProps {
  product: Product
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onEdit: (id: number, description: string) => void
  onRegenerate: (id: number) => void
}

function getScoreColor(score: number | null): string {
  if (!score) return "text-text-muted"
  if (score >= 8) return "text-state-success"
  if (score >= 5) return "text-state-warning"
  return "text-state-error"
}

function getScoreBg(score: number | null): string {
  if (!score) return "bg-bg-subtle"
  if (score >= 8) return "bg-state-success/10"
  if (score >= 5) return "bg-state-warning/10"
  return "bg-state-error/10"
}

export function ProductReviewCard({
  product,
  onApprove,
  onReject,
  onEdit,
  onRegenerate,
}: ProductReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(product.generatedDescription ?? "")

  const handleSave = () => {
    onEdit(product.id, editText)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(product.generatedDescription ?? "")
    setIsEditing(false)
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-border-default">
      <div className="flex gap-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-20 w-20 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border-subtle bg-bg-subtle text-[10px] text-text-faint">
            No img
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-text-primary">
                {product.name}
              </h3>
              <p className="text-xs text-text-muted">
                ${product.price} · {product.fabric} · {product.category}
              </p>
            </div>

            {product.confidenceScore && (
              <div
                className={cn(
                  "flex shrink-0 items-center rounded-lg px-2 py-1 text-xs font-medium",
                  getScoreBg(product.confidenceScore),
                  getScoreColor(product.confidenceScore)
                )}
              >
                {product.confidenceScore}/10
              </div>
            )}
          </div>

          <div className="mt-2">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-3 w-3" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-text-secondary">
                {product.generatedDescription ?? (
                  <span className="italic text-text-faint">No description generated</span>
                )}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onApprove(product.id)}
                className="text-state-success hover:bg-state-success/10"
              >
                <Check className="h-3 w-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject(product.id)}
                className="text-state-error hover:bg-state-error/10"
              >
                <X className="h-3 w-3" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
              {product.generationStatus === "SCORED" && product.confidenceScore && product.confidenceScore < 5 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRegenerate(product.id)}
                  className="text-accent-ai hover:bg-accent-ai/10"
                >
                  <RotateCcw className="h-3 w-3" />
                  Regenerate
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
