"use client"

import { useMemo } from "react"
import { Sparkles } from "lucide-react"
import { ProductReviewCard } from "./product-review-card"
import { ReviewToolbar } from "./review-toolbar"

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

interface ReviewTabProps {
  products: Product[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onEdit: (id: number, description: string) => void
  onRegenerate: (id: number) => void
  onApproveAll: (ids: number[]) => void
  onRegenerateAll: (ids: number[]) => void
  onExportCsv: () => void
}

export function ReviewTab({
  products,
  onApprove,
  onReject,
  onEdit,
  onRegenerate,
  onApproveAll,
  onRegenerateAll,
  onExportCsv,
}: ReviewTabProps) {
  const scoredProducts = useMemo(
    () => products.filter((p) => ["SCORED", "APPROVED", "REJECTED"].includes(p.generationStatus)),
    [products]
  )

  const highConfidence = useMemo(
    () => scoredProducts.filter((p) => (p.confidenceScore ?? 0) >= 8),
    [scoredProducts]
  )

  const mediumConfidence = useMemo(
    () => scoredProducts.filter((p) => {
      const score = p.confidenceScore ?? 0
      return score >= 5 && score < 8
    }),
    [scoredProducts]
  )

  const lowConfidence = useMemo(
    () => scoredProducts.filter((p) => (p.confidenceScore ?? 0) < 5),
    [scoredProducts]
  )

  if (scoredProducts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-3 text-center">
          <Sparkles className="h-8 w-8 text-text-faint" />
          <h2 className="text-sm font-medium text-text-secondary">
            No descriptions yet
          </h2>
          <p className="max-w-xs text-xs text-text-muted">
            Select a table and click Generate to create descriptions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-bg-base p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        {highConfidence.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-medium text-state-success">
                High Confidence (8-10)
              </h3>
            </div>
            <ReviewToolbar
              tier="high"
              count={highConfidence.length}
              onApproveAll={() => onApproveAll(highConfidence.map((p) => p.id))}
              onRegenerateAll={() => onRegenerateAll(highConfidence.map((p) => p.id))}
              onExportCsv={onExportCsv}
            />
            <div className="mt-3 space-y-3">
              {highConfidence.map((product) => (
                <ProductReviewCard
                  key={product.id}
                  product={product}
                  onApprove={onApprove}
                  onReject={onReject}
                  onEdit={onEdit}
                  onRegenerate={onRegenerate}
                />
              ))}
            </div>
          </section>
        )}

        {mediumConfidence.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-medium text-state-warning">
                Medium Confidence (5-7)
              </h3>
            </div>
            <ReviewToolbar
              tier="medium"
              count={mediumConfidence.length}
              onApproveAll={() => onApproveAll(mediumConfidence.map((p) => p.id))}
              onRegenerateAll={() => onRegenerateAll(mediumConfidence.map((p) => p.id))}
              onExportCsv={onExportCsv}
            />
            <div className="mt-3 space-y-3">
              {mediumConfidence.map((product) => (
                <ProductReviewCard
                  key={product.id}
                  product={product}
                  onApprove={onApprove}
                  onReject={onReject}
                  onEdit={onEdit}
                  onRegenerate={onRegenerate}
                />
              ))}
            </div>
          </section>
        )}

        {lowConfidence.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-medium text-state-error">
                Low Confidence (1-4)
              </h3>
            </div>
            <ReviewToolbar
              tier="low"
              count={lowConfidence.length}
              onApproveAll={() => onApproveAll(lowConfidence.map((p) => p.id))}
              onRegenerateAll={() => onRegenerateAll(lowConfidence.map((p) => p.id))}
              onExportCsv={onExportCsv}
            />
            <div className="mt-3 space-y-3">
              {lowConfidence.map((product) => (
                <ProductReviewCard
                  key={product.id}
                  product={product}
                  onApprove={onApprove}
                  onReject={onReject}
                  onEdit={onEdit}
                  onRegenerate={onRegenerate}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
