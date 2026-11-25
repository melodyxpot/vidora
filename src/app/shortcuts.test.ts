import { matchShortcut } from "@/app/shortcuts.ts"
import { describe, expect, it } from "vitest"

function key(partial: Partial<KeyboardEvent>): KeyboardEvent {
  return {
    key: "",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...partial,
  } as KeyboardEvent
}

describe("matchShortcut", () => {
  it("maps the section shortcuts", () => {
    expect(matchShortcut(key({ ctrlKey: true, key: "1" }))).toBe("/search")
    expect(matchShortcut(key({ ctrlKey: true, key: "2" }))).toBe("/downloads")
    expect(matchShortcut(key({ ctrlKey: true, key: "3" }))).toBe("/library")
    expect(matchShortcut(key({ ctrlKey: true, key: "4" }))).toBe("/history")
    expect(matchShortcut(key({ metaKey: true, key: "," }))).toBe("/settings")
  })

  it("focuses search for ctrl+k", () => {
    expect(matchShortcut(key({ ctrlKey: true, key: "K" }))).toBe("focus-search")
  })

  it("ignores unmodified keys and shortcuts with alt or shift", () => {
    expect(matchShortcut(key({ key: "1" }))).toBeNull()
    expect(matchShortcut(key({ ctrlKey: true, shiftKey: true, key: "1" }))).toBeNull()
    expect(matchShortcut(key({ ctrlKey: true, altKey: true, key: "k" }))).toBeNull()
  })
})
