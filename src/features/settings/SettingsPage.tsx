import { Page } from "@/app/shell/Page.tsx"
import { type ThemePreference, useUiStore } from "@/stores/uiStore.ts"

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export function SettingsPage() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)

  return (
    <Page title="Settings" description="Appearance for this window.">
      <section className="max-w-xl">
        <h2 className="text-sm font-medium">Theme</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use a light or dark appearance, or follow Windows.
        </p>
        <div
          role="radiogroup"
          aria-label="Theme"
          className="mt-3 inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
        >
          {THEMES.map((option) => {
            const selected = theme === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={
                  selected
                    ? "rounded-md bg-background px-3 py-1 text-sm font-medium text-foreground shadow-none"
                    : "rounded-md px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                }
                onClick={() => setTheme(option.value)}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </section>
    </Page>
  )
}
