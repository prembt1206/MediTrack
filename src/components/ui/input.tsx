import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[32px] border border-[#e2e3ed]/30 bg-[#1e1e2a] px-5 py-2.5 text-base text-[#ededf3] placeholder:text-[#c3c3cc] transition-colors duration-150 focus-visible:outline-none focus-visible:border-[#e2e3ed] disabled:cursor-not-allowed disabled:opacity-40 shadow-none',
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
