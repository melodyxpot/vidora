import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemePreference = "light" | "dark" | "system"

type UiState = {
  theme: ThemePreference
  sidebarCollapsed: boolean
  activeDownloadCount: number
  setTheme: (theme: ThemePreference) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarCollapsed: false,
      activeDownloadCount: 0,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: "vidora-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
)
