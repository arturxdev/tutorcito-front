import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button3DVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[#2460FF] text-white shadow-[0_4px_0_#1D4ED8] hover:bg-[#1D4ED8] hover:-translate-y-1 active:translate-y-[2px] active:shadow-none",
        outline:
          "bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none",
        white:
          "bg-white border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:bg-gray-50 dark:hover:bg-white/10 hover:-translate-y-1 active:translate-y-[2px] active:shadow-none",
        red: " bg-[#ED5565] text-white shadow-[0_4px_0_#DA4453] hover:bg-[#DA4453] hover:-translate-y-1 active:translate-y-[2px] active:shadow-none",
        blue: "bg-[#5D9CEC] text-white shadow-[0_4px_0_#4A89DC] hover:bg-[#4A89DC] hover:-translate-y-1 active:translate-y-[2px] active:shadow-none",
        yellow:
          "bg-[#E99D4A] text-white shadow-[0_4px_0_#E99D4A] hover:bg-[#E99D4A] hover:-translate-y-1 active:translate-y-[2px] active:shadow-none",
        green:
          "bg-[#00995E] text-white shadow-[0_4px_0_#008040] hover:bg-[#008040] hover:-translate-y-1 active:translate-y-[2px] active:shadow-none",
      },
      size: {
        sm: "h-10 px-5 text-sm",
        default: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface Button3DProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button3DVariants> {
  asChild?: boolean;
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(button3DVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button3D.displayName = "Button3D";

export { Button3D, button3DVariants };
