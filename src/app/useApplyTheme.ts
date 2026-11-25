import { useEffect } from "react"
import { type ThemePreference, useUiStore } from "@/stores/uiStore.ts"

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function resolveDark(theme: ThemePreference) {
  if (theme === "system") return prefersDark()
  return theme === "dark"
}

export function applyThemeClass(theme: ThemePreference) {
  const dark = resolveDark(theme)
  document.documentElement.classList.toggle("dark", dark)
  document.documentElement.style.colorScheme = dark ? "dark" : "light"
}

export function useApplyTheme() {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    applyThemeClass(theme)
    if (theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyThemeClass("system")
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])
}
