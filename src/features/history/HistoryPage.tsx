import { EmptyState, Page } from "@/app/shell/Page.tsx"

export function HistoryPage() {
  return (
    <Page title="History" description="Keywords and links you have searched.">
      <EmptyState
        title="No search history"
        description="Searches you run will be kept here."
      />
    </Page>
  )
}
