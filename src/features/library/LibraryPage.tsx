import { EmptyState, Page } from "@/app/shell/Page.tsx"

export function LibraryPage() {
  return (
    <Page title="Library" description="Files saved on this PC.">
      <EmptyState
        title="Library is empty"
        description="Downloaded video and audio files will be listed here."
      />
    </Page>
  )
}
