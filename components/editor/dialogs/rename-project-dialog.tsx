"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RenameProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  name: string
  onNameChange: (name: string) => void
  loading: boolean
  onSubmit: () => void
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  projectName,
  name,
  onNameChange,
  loading,
  onSubmit,
}: RenameProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Renaming <span className="text-text-secondary">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Project name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              onSubmit()
            }
          }}
          autoFocus
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!name.trim() || loading}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
