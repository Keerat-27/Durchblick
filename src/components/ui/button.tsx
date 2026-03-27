"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border-0 bg-clip-padding text-sm font-bold whitespace-nowrap transition-[color,background-color,border-color,transform,box-shadow] duration-150 outline-none select-none focus-visible:border-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 active:not-aria-[haspopup]:translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "border-b-[5px] border-b-[var(--primary-shadow)] bg-primary text-primary-foreground shadow-sm hover:brightness-[1.04] active:border-b-0 active:brightness-[0.98] [a]:hover:brightness-[1.04]",
        outline:
          "border-2 border-border bg-card font-semibold text-foreground shadow-[0_4px_0_0_var(--border)] hover:bg-muted hover:shadow-[0_4px_0_0_var(--muted)] aria-expanded:bg-muted aria-expanded:shadow-[0_4px_0_0_var(--muted)] active:shadow-none active:translate-y-1 dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border-b-[5px] border-b-[var(--secondary-shadow)] bg-secondary text-secondary-foreground shadow-sm hover:brightness-[1.03] active:border-b-0 dark:hover:brightness-110",
        ghost:
          "font-semibold hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 active:translate-y-0",
        destructive:
          "border-b-[5px] border-b-[var(--destructive-shadow)] bg-destructive/15 text-destructive hover:bg-destructive/25 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 active:border-b-0 dark:bg-destructive/25 dark:hover:bg-destructive/35 dark:focus-visible:ring-destructive/40",
        link: "translate-y-0 border-b-0 font-semibold text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),14px)] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 rounded-2xl px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
