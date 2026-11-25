import type { ReactNode } from "react"

type PageProps = {
  title: string
  description?: string
  children?: ReactNode
}

export function Page({ title, description, children }: PageProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-6 py-5">
        {children}
      </div>
    </section>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
