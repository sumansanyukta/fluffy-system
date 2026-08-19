"use client"

import { useCallback } from "react"
import { X, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface UploadedImage {
  blobUrl: string
  fileName: string
  assignedProductId: number | null
}

interface ImageThumbnailStripProps {
  images: UploadedImage[]
  onDelete: (index: number) => void
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent, index: number) => void
  dragOverIndex: number | null
}

export function ImageThumbnailStrip({
  images,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverIndex,
}: ImageThumbnailStripProps) {
  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      onDragOver(e, index)
    },
    [onDragOver]
  )

  if (!images.length) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-text-muted">
        {images.length} image{images.length > 1 ? "s" : ""} uploaded
      </span>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {images.map((img, index) => (
            <div
              key={img.blobUrl}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(index))
                onDragStart(index)
              }}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => onDrop(e, index)}
              className={cn(
                "group relative shrink-0 w-20 h-20 overflow-hidden rounded-xl border-2 transition-colors",
                dragOverIndex === index
                  ? "border-accent-primary"
                  : "border-transparent hover:border-border-subtle",
                img.assignedProductId !== null && "ring-2 ring-accent-primary/30"
              )}
            >
              <img
                src={img.blobUrl}
                alt={img.fileName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-3 w-3 text-text-primary drop-shadow" />
              </div>
              <button
                onClick={() => onDelete(index)}
                className="absolute right-1 top-1 rounded-full bg-bg-base/80 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3 text-text-muted" />
              </button>
              {img.assignedProductId !== null && (
                <div className="absolute bottom-0 left-0 right-0 bg-accent-primary/80 px-1 py-0.5 text-center text-[10px] font-medium text-bg-base">
                  Assigned
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
