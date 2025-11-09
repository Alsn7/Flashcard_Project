import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Respect aria-invalid / data-invalid to force error styling at the component level
    const isInvalid = Boolean((props as any)["aria-invalid"]) || Boolean((props as any)["data-invalid"]);
    return (
      <input
        type={type}
        className={cn(
          // Base styles (no explicit border color so it can be overridden by consumers)
          "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          // Built-in error visuals when invalid
          isInvalid && "border-destructive ring-2 ring-destructive bg-destructive/5",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
