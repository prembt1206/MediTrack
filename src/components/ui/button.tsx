import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] cursor-pointer select-none';

    const variants = {
      default:
        'bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#0062c4] shadow-sm border border-transparent',
      destructive:
        'bg-[#ff453a] text-white hover:bg-[#ff3b30] active:bg-[#d70015] shadow-sm border border-transparent',
      outline:
        'border border-[#424245] bg-[#1d1d1f]/60 hover:bg-[#2c2c2e] hover:border-[#6e6e73] text-[#f5f5f7] active:bg-[#3a3a3c] backdrop-blur-sm shadow-sm',
      secondary:
        'bg-[#1d1d1f] text-[#f5f5f7] hover:bg-[#2c2c2e] active:bg-[#3a3a3c] border border-[#333336] shadow-sm',
      ghost:
        'hover:bg-[#1d1d1f] text-[#86868b] hover:text-[#f5f5f7] active:bg-[#2c2c2e] shadow-none border border-transparent',
      link:
        'text-[#2997ff] underline-offset-4 hover:underline shadow-none p-0 h-auto hover:text-[#70baff]',
      gradient:
        'bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#0062c4] shadow-sm border border-transparent',
      glow:
        'bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-[0_0_20px_rgba(0,113,227,0.35)] hover:shadow-[0_0_25px_rgba(0,113,227,0.5)] border border-[#2997ff]/40',
    };

    const sizes = {
      default: 'h-10 px-5 rounded-full',
      sm: 'h-8 px-3.5 rounded-full text-xs',
      lg: 'h-12 px-7 rounded-full text-base font-semibold',
      icon: 'h-10 w-10 p-0 rounded-full',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
