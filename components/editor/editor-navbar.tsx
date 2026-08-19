"use client"

import { PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  className,
}: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center border-b border-border-default bg-bg-surface",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4 text-text-muted" />
          ) : (
            <PanelLeftOpen className="h-4 w-4 text-text-muted" />
          )}
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex flex-1 items-center justify-end gap-2 px-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Sign up</Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  )
}
