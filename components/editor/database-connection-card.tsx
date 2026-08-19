"use client"

import { Database, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DatabaseConnectionCardProps {
  isConnected: boolean | null
  isLoading: boolean
  maskedUrl: string
  onRetry: () => void
}

export function DatabaseConnectionCard({
  isConnected,
  isLoading,
  maskedUrl,
  onRetry,
}: DatabaseConnectionCardProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim">
          <Database className="h-5 w-5 text-accent-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-text-primary">
              Product Database
            </h3>
            {isLoading ? (
              <div className="h-2 w-2 rounded-full bg-text-faint animate-pulse" />
            ) : isConnected ? (
              <div className="h-2 w-2 rounded-full bg-state-success" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-state-error" />
            )}
          </div>
          <p className="mt-0.5 font-mono text-xs text-text-faint">
            {maskedUrl}
          </p>
        </div>
      </div>

      {isConnected === false && !isLoading && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-3 w-full"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  )
}
