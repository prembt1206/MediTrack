import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap text-sm font-normal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#70707d] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none rounded-full';

    const variants = {
      // Primary conversion button: The ONLY chromatic accent permitted (#5266eb Cobalt)
      default:
        'bg-[#5266eb] text-white hover:bg-[#4355d6] active:bg-[#3846b8] border border-transparent shadow-none',
      destructive:
        'bg-[#1e1e2a] text-[#ededf3] hover:text-[#ff6b6b] hover:bg-[#281e22] hover:border-[#ff6b6b]/40 border border-[#70707d]/35 shadow-none',
      outline:
        'border border-[#70707d]/35 bg-[#1e1e2a] hover:bg-[#242432] hover:border-[#70707d]/60 text-[#ededf3] active:bg-[#171721] shadow-none',
      secondary:
        'bg-[#242432] text-[#ededf3] hover:bg-[#2c2c3e] active:bg-[#1a1a26] border border-[#70707d]/30 shadow-none',
      ghost:
        'hover:bg-[#1e1e2a] text-[#c3c3cc] hover:text-[#ededf3] active:bg-[#242432] shadow-none border border-transparent',
      link:
        'text-[#ededf3] underline-offset-4 hover:underline shadow-none p-0 h-auto hover:text-white',
      gradient:
        'bg-[#5266eb] text-white hover:bg-[#4355d6] active:bg-[#3846b8] shadow-none border border-transparent',
      glow:
        'bg-[#5266eb] text-white hover:bg-[#4355d6] shadow-none border border-transparent',
    };

    const sizes = {
      default: 'h-10 px-5 text-sm',
      sm: 'h-8 px-3.5 text-xs',
      lg: 'h-12 px-7 text-sm font-normal',
      icon: 'h-10 w-10 p-0',
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
