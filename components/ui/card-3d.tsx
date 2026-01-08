import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const card3DVariants = cva(
  "bg-white dark:bg-gray-900 rounded-[2rem] transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "shadow-[0_8px_0_#e5e7eb] dark:shadow-[0_8px_0_#1f2937] border border-gray-200 dark:border-gray-700 hover:-translate-y-1 hover:shadow-[0_10px_0_#d1d5db] dark:hover:shadow-[0_10px_0_#374151] active:translate-y-[2px] active:shadow-[0_4px_0_#e5e7eb] dark:active:shadow-[0_4px_0_#1f2937]",
        feature:
          "shadow-[0_6px_0_#e5e7eb] dark:shadow-[0_6px_0_#1f2937] border border-gray-200 dark:border-gray-700",
        interactive:
          "shadow-[0_6px_0_#e5e7eb] dark:shadow-[0_6px_0_#1f2937] border border-gray-200 dark:border-gray-700 cursor-pointer",
        primary:
          "bg-[#2460FF] text-white shadow-[0_8px_0_#1D4ED8] border border-[#1D4ED8] hover:-translate-y-1 hover:shadow-[0_10px_0_#1D4ED8] active:translate-y-[2px] active:shadow-[0_4px_0_#1D4ED8]",
        elevated:
          "shadow-[0_12px_0_#d1d5db] dark:shadow-[0_12px_0_#374151] border border-gray-200 dark:border-gray-700 hover:-translate-y-2 hover:shadow-[0_14px_0_#9ca3af] dark:hover:shadow-[0_14px_0_#4b5563] active:translate-y-[4px] active:shadow-[0_6px_0_#d1d5db] dark:active:shadow-[0_6px_0_#374151]",
      },
      size: {
        sm: "p-4 rounded-xl",
        default: "p-6 rounded-2xl",
        lg: "p-8 rounded-[2rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface Card3DProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof card3DVariants> { }

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(card3DVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Card3D.displayName = "Card3D";

export { Card3D, card3DVariants };
