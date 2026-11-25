import {
  Download,
  History,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx"
import { NAV_ITEMS, type AppPath } from "@/app/navigation.ts"
import { cn } from "@/lib/utils.ts"

const ICONS: Record<AppPath, LucideIcon> = {
  "/search": Search,
  "/downloads": Download,
  "/library": Library,
  "/history": History,
  "/settings": Settings,
}

type SidebarProps = {
  collapsed: boolean
  pathname: string
  downloadCount: number
  onNavigate: (path: AppPath) => void
  onToggleCollapsed: () => void
}

export function Sidebar({
  collapsed,
  pathname,
  downloadCount,
  onNavigate,
  onToggleCollapsed,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground motion-safe:transition-[width] motion-safe:duration-200",
        collapsed ? "w-14" : "w-56",
      )}
    >
      <div className={cn("flex h-12 items-center", collapsed ? "justify-center" : "gap-2 px-3")}>
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-foreground text-xs font-semibold text-background">
          V
        </span>
        {collapsed ? null : (
          <span className="text-sm font-semibold tracking-tight">Vidora</span>
        )}
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.path]
          const active = pathname === item.path
          const showCount = item.path === "/downloads" && downloadCount > 0
          const button = (
            <Button
              type="button"
              variant="ghost"
              aria-current={active ? "page" : undefined}
              aria-label={showCount ? `${item.label}, ${downloadCount} active` : item.label}
              aria-keyshortcuts={item.shortcut.replace("Ctrl", "Control")}
              className={cn(
                "h-8 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed ? "justify-center px-0" : "justify-start px-2",
                active && "bg-foreground/10 font-medium text-sidebar-foreground",
              )}
              onClick={() => onNavigate(item.path)}
            >
              <Icon aria-hidden />
              {collapsed ? null : <span className="truncate">{item.label}</span>}
              {showCount ? (
                <span
                  aria-hidden
                  className={cn(
                    "grid min-w-5 place-items-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background",
                    collapsed ? "absolute top-0.5 right-0.5" : "ml-auto",
                  )}
                >
                  {downloadCount}
                </span>
              ) : null}
              {collapsed ? null : (
                <span
                  aria-hidden
                  className={cn(
                    "text-[10px] text-muted-foreground",
                    showCount ? null : "ml-auto",
                  )}
                >
                  {item.shortcut}
                </span>
              )}
            </Button>
          )

          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <div className="relative">{button}</div>
              </TooltipTrigger>
              {collapsed ? (
                <TooltipContent side="right">
                  {item.label}
                  <span className="text-background/70">{item.shortcut}</span>
                </TooltipContent>
              ) : null}
            </Tooltip>
          )
        })}
      </nav>

      <div className="p-2">
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "w-full" : "w-full justify-start px-2",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={onToggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {collapsed ? null : <span>Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}
