import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-[#333336] bg-[#1d1d1f] px-3.5 py-2 text-sm text-[#f5f5f7] placeholder:text-[#86868b] transition-all duration-200 focus-visible:outline-none focus-visible:border-[#0071e3] focus-visible:ring-2 focus-visible:ring-[#0071e3]/25 disabled:cursor-not-allowed disabled:opacity-40',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
