"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

const ACCEPTED_TYPES = ["image/jpeg", "image/png"]
const MAX_SIZE = 10 * 1024 * 1024

interface UploadError {
  fileName: string
  reason: string
}

interface ImageUploadZoneProps {
  projectId: string
  onUploadComplete: (images: Array<{ blobUrl: string; fileName: string }>) => void
}

export function ImageUploadZone({ projectId, onUploadComplete }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<UploadError[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback((files: File[]) => {
    const valid: File[] = []
    const errs: UploadError[] = []

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errs.push({ fileName: file.name, reason: "Unsupported format" })
      } else if (file.size > MAX_SIZE) {
        errs.push({ fileName: file.name, reason: "File too large" })
      } else {
        valid.push(file)
      }
    }

    return { valid, errs }
  }, [])

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const { valid, errs } = validateFiles(files)
      if (errs.length) setErrors((prev) => [...prev, ...errs])
      if (!valid.length) return

      setIsUploading(true)
      setProgress(0)

      const formData = new FormData()
      for (const file of valid) {
        formData.append("files", file)
      }

      try {
        const res = await fetch(`/api/projects/${projectId}/upload`, {
          method: "POST",
          body: formData,
        })

        const data = await res.json()
        setProgress(100)

        if (data.errors?.length) {
          setErrors((prev) => [...prev, ...data.errors])
        }

        if (data.results?.length) {
          onUploadComplete(data.results)
        }
      } catch {
        setErrors((prev) => [...prev, { fileName: "Batch", reason: "Network error" }])
      } finally {
        setIsUploading(false)
        setTimeout(() => setProgress(0), 500)
      }
    },
    [projectId, onUploadComplete, validateFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      uploadFiles(files)
    },
    [uploadFiles]
  )

  const handleClick = () => inputRef.current?.click()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) uploadFiles(files)
    e.target.value = ""
  }

  const dismissErrors = () => setErrors([])

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-accent-primary bg-accent-primary-dim"
            : "border-border-subtle hover:border-border-default"
        )}
      >
        <Upload className="h-8 w-8 text-text-muted" />
        <div className="text-center">
          <p className="text-sm text-text-primary">
            Drop images here or click to browse
          </p>
          <p className="mt-1 text-xs text-text-muted">
            JPEG or PNG, up to 10MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {isUploading && (
        <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
          <div
            className="h-full bg-accent-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-bg-elevated p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-state-error">
              {errors.length} file{errors.length > 1 ? "s" : ""} failed
            </span>
            <button
              onClick={dismissErrors}
              className="text-text-muted hover:text-text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-text-muted">
                <span className="text-state-error">{err.fileName}</span>{" "}
                {err.reason}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
