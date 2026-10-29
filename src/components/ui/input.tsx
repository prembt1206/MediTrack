import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-full border border-[#70707d]/30 bg-[#1e1e2a] px-4 py-2 text-sm text-[#ededf3] placeholder:text-[#c3c3cc]/50 transition-colors duration-150 focus-visible:outline-none focus-visible:border-[#70707d] disabled:cursor-not-allowed disabled:opacity-40 shadow-none',
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
