export type AppPath =
  | "/search"
  | "/downloads"
  | "/library"
  | "/history"
  | "/settings"

export type NavItem = {
  path: AppPath
  label: string
  shortcut: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: "/search", label: "Search", shortcut: "Ctrl+1" },
  { path: "/downloads", label: "Downloads", shortcut: "Ctrl+2" },
  { path: "/library", label: "Library", shortcut: "Ctrl+3" },
  { path: "/history", label: "History", shortcut: "Ctrl+4" },
  { path: "/settings", label: "Settings", shortcut: "Ctrl+," },
]
