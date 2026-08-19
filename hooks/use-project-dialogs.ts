"use client"

import { useState, useCallback } from "react"

export interface Project {
  id: string
  name: string
  slug: string
  isOwned: boolean
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

type DialogType = "create" | "rename" | "delete" | null

interface DialogState {
  type: DialogType
  project: Project | null
}

interface FormState {
  name: string
}

export function useProjectDialogs() {
  const [dialog, setDialog] = useState<DialogState>({
    type: null,
    project: null,
  })
  const [form, setForm] = useState<FormState>({ name: "" })
  const [loading, setLoading] = useState(false)

  const openCreate = useCallback(() => {
    setDialog({ type: "create", project: null })
    setForm({ name: "" })
  }, [])

  const openRename = useCallback((project: Project) => {
    setDialog({ type: "rename", project })
    setForm({ name: project.name })
  }, [])

  const openDelete = useCallback((project: Project) => {
    setDialog({ type: "delete", project })
  }, [])

  const close = useCallback(() => {
    setDialog({ type: null, project: null })
    setForm({ name: "" })
    setLoading(false)
  }, [])

  const updateName = useCallback((name: string) => {
    setForm({ name })
  }, [])

  const simulateSubmit = useCallback(
    (onComplete: () => void) => {
      setLoading(true)
      setTimeout(() => {
        onComplete()
        close()
      }, 300)
    },
    [close]
  )

  return {
    dialog,
    form,
    loading,
    openCreate,
    openRename,
    openDelete,
    close,
    updateName,
    simulateSubmit,
  }
}
