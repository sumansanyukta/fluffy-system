"use client"

import { X, Plus, FolderOpen, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Project } from "@/hooks/use-project-dialogs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  selectedProjectId: string | null
  onSelectProject: (project: Project) => void
  onCreateProject: () => void
  onRenameProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
  className?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  className,
}: ProjectSidebarProps) {
  const myProjects = projects.filter((p) => p.isOwned)
  const sharedProjects = projects.filter((p) => !p.isOwned)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "absolute inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-border-default bg-bg-surface",
          "transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-default px-3">
          <span className="text-sm font-medium text-text-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-text-muted" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-border-default px-3 pt-2">
            <TabsList variant="line" className="w-full">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-projects" className="flex flex-1 flex-col overflow-hidden">
            {myProjects.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
                <FolderOpen className="h-8 w-8 text-text-faint" />
                <p className="text-sm text-text-muted">No projects yet</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-0.5 p-2">
                  {myProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isSelected={project.id === selectedProjectId}
                      onSelect={onSelectProject}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="shared" className="flex flex-1 flex-col overflow-hidden">
            {sharedProjects.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
                <FolderOpen className="h-8 w-8 text-text-faint" />
                <p className="text-sm text-text-muted">No shared projects</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-0.5 p-2">
                  {sharedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex h-8 items-center rounded-lg px-2 text-sm text-text-secondary"
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-border-default p-3">
          <Button className="w-full" size="default" onClick={onCreateProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </>
  )
}

function ProjectItem({
  project,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: {
  project: Project
  isSelected: boolean
  onSelect: (project: Project) => void
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
}) {
  return (
    <div
      onClick={() => onSelect(project)}
      className={cn(
        "group flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm transition-colors",
        isSelected
          ? "bg-accent-primary-dim text-text-primary"
          : "text-text-secondary hover:bg-bg-elevated"
      )}
    >
      <span className="flex-1 truncate">{project.name}</span>
      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRename(project)}
          aria-label={`Rename ${project.name}`}
        >
          <Pencil className="h-3 w-3 text-text-muted" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(project)}
          aria-label={`Delete ${project.name}`}
        >
          <Trash2 className="h-3 w-3 text-text-muted" />
        </Button>
      </div>
    </div>
  )
}
