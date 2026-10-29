import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[100px] border border-[#393737]/20 bg-[#ffffff] px-5 py-2.5 text-base text-[#393737] placeholder:text-[#888787] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-colors duration-150 focus-visible:outline-none focus-visible:border-[#393737] disabled:cursor-not-allowed disabled:opacity-40 font-sans',
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
