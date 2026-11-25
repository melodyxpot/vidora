import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Sidebar } from "@/app/shell/Sidebar.tsx"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"

function renderSidebar(downloadCount = 0, pathname = "/search") {
  const onNavigate = vi.fn()
  const onToggleCollapsed = vi.fn()
  render(
    <TooltipProvider>
      <Sidebar
        collapsed={false}
        pathname={pathname}
        downloadCount={downloadCount}
        onNavigate={onNavigate}
        onToggleCollapsed={onToggleCollapsed}
      />
    </TooltipProvider>,
  )
  return { onNavigate, onToggleCollapsed }
}

describe("Sidebar", () => {
  it("navigates from each primary item", async () => {
    const user = userEvent.setup()
    const { onNavigate } = renderSidebar()

    await user.click(screen.getByRole("button", { name: "Downloads" }))
    await user.click(screen.getByRole("button", { name: "Library" }))
    await user.click(screen.getByRole("button", { name: "History" }))
    await user.click(screen.getByRole("button", { name: "Settings" }))

    expect(onNavigate.mock.calls.map((call) => call[0])).toEqual([
      "/downloads",
      "/library",
      "/history",
      "/settings",
    ])
  })

  it("shows the active download count only when jobs are running", () => {
    const { unmount } = render(
      <TooltipProvider>
        <Sidebar
          collapsed={false}
          pathname="/downloads"
          downloadCount={3}
          onNavigate={vi.fn()}
          onToggleCollapsed={vi.fn()}
        />
      </TooltipProvider>,
    )
    expect(screen.getByText("3")).toBeTruthy()
    unmount()

    renderSidebar(0, "/downloads")
    expect(screen.queryByText("0")).toBeNull()
  })

  it("marks the current section", () => {
    renderSidebar(0, "/library")
    expect(screen.getByRole("button", { name: "Library" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  })
})
