import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const racingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 racing-transition",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground racing-shadow hover:bg-primary/90 hover:scale-105",
        racing: "racing-gradient text-white racing-shadow hover:scale-105 hover:shadow-lg font-bold",
        metallic: "metallic-gradient text-foreground metallic-shadow hover:scale-105 border border-border",
        neon: "neon-gradient text-accent-foreground neon-shadow hover:scale-105 font-bold",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105",
        pit: "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground pit-stop-hover"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-lg px-10 text-base font-bold",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface RacingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof racingButtonVariants> {
  asChild?: boolean
}

const RacingButton = React.forwardRef<HTMLButtonElement, RacingButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(racingButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
RacingButton.displayName = "RacingButton"

export { RacingButton, racingButtonVariants }