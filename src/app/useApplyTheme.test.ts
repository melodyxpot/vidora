import { describe, expect, it } from "vitest"
import { applyThemeClass } from "@/app/useApplyTheme.ts"

describe("applyThemeClass", () => {
  it("toggles the dark class and color scheme", () => {
    applyThemeClass("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe("dark")

    applyThemeClass("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe("light")
  })
})
