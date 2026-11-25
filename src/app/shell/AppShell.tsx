import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { Sidebar } from "@/app/shell/Sidebar.tsx"
import { requestSearchFocus } from "@/app/searchFocus.ts"
import { matchShortcut } from "@/app/shortcuts.ts"
import type { AppPath } from "@/app/navigation.ts"
import { useUiStore } from "@/stores/uiStore.ts"

function focusSearchField() {
  const input = document.getElementById("search-input")
  if (!(input instanceof HTMLInputElement)) return false
  input.focus()
  input.select()
  return true
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const downloadCount = useUiStore((state) => state.activeDownloadCount)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = matchShortcut(event)
      if (!action) return
      event.preventDefault()
      if (action === "focus-search") {
        if (focusSearchField()) return
        requestSearchFocus()
        navigate("/search")
        return
      }
      navigate(action)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [navigate])

  return (
    <div className="flex h-full bg-background text-foreground">
      <Sidebar
        collapsed={collapsed}
        pathname={location.pathname}
        downloadCount={downloadCount}
        onNavigate={(path: AppPath) => navigate(path)}
        onToggleCollapsed={toggleSidebar}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
