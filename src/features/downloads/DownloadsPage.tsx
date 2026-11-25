import { EmptyState, Page } from "@/app/shell/Page.tsx"

export function DownloadsPage() {
  return (
    <Page title="Downloads" description="The queue, progress, and finished jobs.">
      <EmptyState
        title="No downloads"
        description="Videos and audio you queue will show up here, with progress and status."
      />
    </Page>
  )
}
