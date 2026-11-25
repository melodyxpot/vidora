export type ShortcutAction =
  | "/search"
  | "/downloads"
  | "/library"
  | "/history"
  | "/settings"
  | "focus-search"

export function matchShortcut(event: KeyboardEvent): ShortcutAction | null {
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) {
    return null
  }

  switch (event.key.toLowerCase()) {
    case "k":
      return "focus-search"
    case ",":
      return "/settings"
    case "1":
      return "/search"
    case "2":
      return "/downloads"
    case "3":
      return "/library"
    case "4":
      return "/history"
    default:
      return null
  }
}
