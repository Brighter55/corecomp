import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--main-dust-grey)] text-[var(--main-pine-teal)] hover:bg-[var(--surface-soft)]",
        ghost: "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-soft)]",
        forest: "bg-[var(--main-fern)] text-[var(--main-dust-grey)] hover:bg-[var(--main-hunter-green)]",
        outline: "border border-[var(--line-muted)] text-[var(--text-main)] hover:bg-[var(--surface-soft)]",
        closeOut: "bg-[var(--main-brick)] hover:bg-[var(--surface-soft)] text-[var(--card-main)] "
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
