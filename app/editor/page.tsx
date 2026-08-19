"use client"

import { useState, useCallback, useEffect } from "react"
import { Plus } from "lucide-react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { ImageUploadZone } from "@/components/image-upload-zone"
import {
  ImageThumbnailStrip,
  type UploadedImage,
} from "@/components/image-thumbnail-strip"
import { Button } from "@/components/ui/button"
import {
  useProjectDialogs,
  slugify,
  type Project,
} from "@/hooks/use-project-dialogs"

interface Product {
  id: number
  name: string
  category: string
  imageUrl: string | null
}

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [thumbDragIndex, setThumbDragIndex] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  const {
    dialog,
    form,
    loading,
    openCreate,
    openRename,
    openDelete,
    close,
    updateName,
    simulateSubmit,
  } = useProjectDialogs()

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        const mapped: Project[] = data.map((p: { id: string; name: string; ownerId: string }) => ({
          id: p.id,
          name: p.name,
          slug: slugify(p.name),
          isOwned: true,
        }))
        setProjects(mapped)
      })
      .catch(() => setProjects([]))
  }, [])

  useEffect(() => {
    if (!selectedProjectId) {
      setProducts([])
      return
    }
    fetch(`/api/products?projectId=${selectedProjectId}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
  }, [selectedProjectId])

  const handleCreate = useCallback(() => {
    simulateSubmit(async () => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim() }),
      })
      if (res.ok) {
        const newProject = await res.json()
        setProjects((prev) => [
          ...prev,
          { id: newProject.id, name: newProject.name, slug: slugify(newProject.name), isOwned: true },
        ])
      }
    })
  }, [form.name, simulateSubmit])

  const handleRename = useCallback(() => {
    if (!dialog.project) return
    simulateSubmit(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === dialog.project!.id
            ? { ...p, name: form.name.trim(), slug: slugify(form.name) }
            : p
        )
      )
    })
  }, [dialog.project, form.name, simulateSubmit])

  const handleDelete = useCallback(() => {
    if (!dialog.project) return
    simulateSubmit(() => {
      setProjects((prev) => prev.filter((p) => p.id !== dialog.project!.id))
      if (selectedProjectId === dialog.project!.id) {
        setSelectedProjectId(null)
        setUploadedImages([])
        setProducts([])
      }
    })
  }, [dialog.project, simulateSubmit, selectedProjectId])

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProjectId(project.id)
    setUploadedImages([])
    setSidebarOpen(false)
  }, [])

  const handleUploadComplete = useCallback(
    (images: Array<{ blobUrl: string; fileName: string }>) => {
      const newImages: UploadedImage[] = images.map((img) => ({
        blobUrl: img.blobUrl,
        fileName: img.fileName,
        assignedProductId: null,
      }))
      setUploadedImages((prev) => [...prev, ...newImages])
    },
    []
  )

  const handleDeleteImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleThumbDragStart = useCallback((index: number) => {
    setThumbDragIndex(index)
  }, [])

  const handleThumbDragOver = useCallback(
    (_e: React.DragEvent, index: number) => {
      setDragOverIndex(index)
    },
    []
  )

  const handleThumbDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      if (thumbDragIndex === null || thumbDragIndex === dropIndex) return

      setUploadedImages((prev) => {
        const next = [...prev]
        const [moved] = next.splice(thumbDragIndex, 1)
        next.splice(dropIndex, 0, moved)
        return next
      })
      setThumbDragIndex(null)
      setDragOverIndex(null)
    },
    [thumbDragIndex]
  )

  const handleAssignImage = useCallback(
    async (imageIndex: number, productId: number) => {
      const imageUrl = uploadedImages[imageIndex]?.blobUrl
      if (!imageUrl || !selectedProjectId) return

      setUploadedImages((prev) =>
        prev.map((img, i) =>
          i === imageIndex ? { ...img, assignedProductId: productId } : img
        )
      )
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, imageUrl } : p
        )
      )

      await fetch(
        `/api/projects/${selectedProjectId}/products/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        }
      )
    },
    [uploadedImages, selectedProjectId]
  )

  const handleProductDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleProductDrop = useCallback(
    (e: React.DragEvent, productId: number) => {
      e.preventDefault()
      const imageIndexStr = e.dataTransfer.getData("text/plain")
      const imageIndex = parseInt(imageIndexStr, 10)
      if (!isNaN(imageIndex) && imageIndex >= 0 && imageIndex < uploadedImages.length) {
        handleAssignImage(imageIndex, productId)
      }
    },
    [handleAssignImage, uploadedImages.length]
  )

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="relative flex-1 overflow-hidden">
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={openCreate}
          onRenameProject={openRename}
          onDeleteProject={openDelete}
        />

        {!selectedProjectId ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-xl font-medium text-text-primary">
              Create a project or open an existing one
            </h1>
            <p className="max-w-sm text-sm text-text-muted">
              Start a new architecture workspace, or choose a project from the
              sidebar.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        ) : (
          <div className="flex h-full flex-col overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-3xl space-y-6">
              <div>
                <h2 className="text-lg font-medium text-text-primary">
                  {selectedProject?.name}
                </h2>
                <p className="text-sm text-text-muted">
                  Upload product images and assign them to products.
                </p>
              </div>

              <ImageUploadZone
                projectId={selectedProjectId}
                onUploadComplete={handleUploadComplete}
              />

              <ImageThumbnailStrip
                images={uploadedImages}
                onDelete={handleDeleteImage}
                onDragStart={handleThumbDragStart}
                onDragOver={handleThumbDragOver}
                onDrop={handleThumbDrop}
                dragOverIndex={dragOverIndex}
              />

              <div className="space-y-2">
                <span className="text-xs font-medium text-text-muted">
                  Products — drop an image to assign
                </span>
                <div className="grid gap-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onDragOver={handleProductDragOver}
                      onDrop={(e) => handleProductDrop(e, product.id)}
                      className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-3 transition-colors hover:border-border-default"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-border-subtle bg-bg-subtle text-[10px] text-text-faint">
                          No img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm text-text-primary">
                          {product.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {product.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={dialog.type === "create"}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        name={form.name}
        onNameChange={updateName}
        loading={loading}
        onSubmit={handleCreate}
      />

      <RenameProjectDialog
        open={dialog.type === "rename"}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        projectName={dialog.project?.name ?? ""}
        name={form.name}
        onNameChange={updateName}
        loading={loading}
        onSubmit={handleRename}
      />

      <DeleteProjectDialog
        open={dialog.type === "delete"}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        projectName={dialog.project?.name ?? ""}
        loading={loading}
        onConfirm={handleDelete}
      />
    </div>
  )
}
