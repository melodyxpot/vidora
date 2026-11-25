import { RouterProvider } from "react-router"
import { router } from "@/app/router.tsx"
import { useApplyTheme } from "@/app/useApplyTheme.ts"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"

export function App() {
  useApplyTheme()

  return (
    <TooltipProvider delayDuration={400}>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}
