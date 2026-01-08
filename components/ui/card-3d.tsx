import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const card3DVariants = cva(
  'bg-white dark:bg-gray-900 rounded-[2rem] transition-all duration-300',
  {
    variants: {
      variant: {
        default:
          'shadow-2xl border-b-8 border-gray-200 dark:border-gray-800 border border-gray-100 dark:border-gray-700',
        feature:
          'shadow-lg border-b-4 border-transparent hover:border-[#590df2] hover:shadow-2xl',
        interactive:
          'shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-[#590df2] hover:-translate-y-1 cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface Card3DProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card3DVariants> {}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(card3DVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
Card3D.displayName = 'Card3D';

export { Card3D, card3DVariants };
