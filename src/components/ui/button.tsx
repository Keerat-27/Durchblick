"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border-0 bg-clip-padding font-sans text-sm font-extrabold whitespace-nowrap transition-[color,background-color,border-color,transform,box-shadow] duration-100 outline-none select-none focus-visible:border-2 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 active:not-aria-[haspopup]:translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "border-b-[5px] border-b-[var(--primary-shadow)] bg-primary text-primary-foreground shadow-[0_2px_0_0_rgb(0_0_0_/0.08)] hover:brightness-[1.06] active:border-b-0 active:translate-y-1 active:brightness-[0.97] [a]:hover:brightness-[1.06]",
        outline:
          "border-2 border-[var(--duo-border-strong)] bg-card font-extrabold text-foreground shadow-[0_4px_0_0_var(--duo-border-strong)] hover:bg-muted hover:brightness-[1.02] aria-expanded:bg-muted aria-expanded:shadow-[0_4px_0_0_var(--duo-border-strong)] active:shadow-none active:translate-y-1 dark:border-input dark:bg-input/30 dark:shadow-[0_4px_0_0_var(--border)] dark:hover:bg-input/50",
        secondary:
          "border-b-[5px] border-b-[var(--secondary-shadow)] bg-secondary text-secondary-foreground shadow-[0_2px_0_0_rgb(0_0_0_/0.06)] hover:brightness-[1.04] active:border-b-0 active:translate-y-1 dark:hover:brightness-110",
        ghost:
          "font-extrabold hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 active:translate-y-0",
        destructive:
          "border-b-[5px] border-b-[var(--destructive-shadow)] bg-destructive/15 text-destructive hover:bg-destructive/25 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 active:border-b-0 active:translate-y-1 dark:bg-destructive/25 dark:hover:bg-destructive/35 dark:focus-visible:ring-destructive/40",
        link: "translate-y-0 border-b-0 font-extrabold text-[var(--chart-2)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-7 gap-1 rounded-xl px-2.5 text-xs in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-2xl px-3.5 text-[0.8125rem] in-data-[slot=button-group]:rounded-2xl has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[3.25rem] gap-2 rounded-2xl px-7 text-[17px] tracking-wide has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
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
