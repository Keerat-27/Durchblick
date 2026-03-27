import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(function Input({ className, type, ...props }, ref) {
  return (
    <InputPrimitive
      ref={ref as React.Ref<HTMLElement>}
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-2xl border-2 border-[var(--duo-border-strong)] bg-card px-4 py-2 font-sans text-base font-bold transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-extrabold file:text-foreground placeholder:text-muted-foreground placeholder:font-bold focus-visible:border-[var(--chart-2)] focus-visible:ring-[3px] focus-visible:ring-[var(--chart-2)]/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:border-input dark:bg-input/30 dark:focus-visible:border-ring dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
})

export { Input }
