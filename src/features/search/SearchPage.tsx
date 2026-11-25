import { useEffect } from "react"
import { EmptyState, Page } from "@/app/shell/Page.tsx"
import { consumeSearchFocus } from "@/app/searchFocus.ts"
import { Input } from "@/components/ui/input.tsx"

export function SearchPage() {
  useEffect(() => {
    if (!consumeSearchFocus()) return
    const input = document.getElementById("search-input")
    if (!(input instanceof HTMLInputElement)) return
    input.focus()
    input.select()
  }, [])
  return (
    <Page
      title="Search"
      description="Find a YouTube video by keyword, or paste a video link."
    >
      <form
        className="max-w-xl"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <label className="sr-only" htmlFor="search-input">
          Search
        </label>
        <div className="relative">
          <Input
            id="search-input"
            className="h-10 pr-16"
            placeholder="Search or paste a YouTube link"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Ctrl K
          </kbd>
        </div>
      </form>
      <EmptyState
        title="No results yet"
        description="Enter a keyword or a YouTube link to look up a video."
      />
    </Page>
  )
}
