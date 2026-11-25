import { createMemoryRouter, Navigate } from "react-router"
import { AppShell } from "@/app/shell/AppShell.tsx"
import { DownloadsPage } from "@/features/downloads/DownloadsPage.tsx"
import { HistoryPage } from "@/features/history/HistoryPage.tsx"
import { LibraryPage } from "@/features/library/LibraryPage.tsx"
import { SearchPage } from "@/features/search/SearchPage.tsx"
import { SettingsPage } from "@/features/settings/SettingsPage.tsx"

export const router = createMemoryRouter(
  [
    {
      path: "/",
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to="/search" replace /> },
        { path: "search", element: <SearchPage /> },
        { path: "downloads", element: <DownloadsPage /> },
        { path: "library", element: <LibraryPage /> },
        { path: "history", element: <HistoryPage /> },
        { path: "settings", element: <SettingsPage /> },
      ],
    },
  ],
  { initialEntries: ["/search"] },
)
