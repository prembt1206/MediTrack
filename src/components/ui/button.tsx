import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap text-base font-normal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#70707d] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none';

    const variants = {
      // Primary CTA Button (Cobalt): Sole chromatic action (#5266eb), 32px radius, no border, no shadow
      default:
        'bg-[#5266eb] text-white hover:bg-[#4355d6] active:bg-[#3846b8] border-0 shadow-none rounded-[32px]',
      // Ghost Outline Button: Transparent bg, 1px solid #ededf3 Ivory border, Ivory text, 40px radius
      outline:
        'border border-[#ededf3] bg-transparent hover:bg-[#ededf3]/10 text-[#ededf3] active:bg-[#ededf3]/15 shadow-none rounded-[40px]',
      // Obsidian Button: #272735 fill, Ivory text, 32px radius
      secondary:
        'bg-[#272735] text-[#ededf3] hover:bg-[#323244] active:bg-[#1e1e2a] border-0 shadow-none rounded-[32px]',
      destructive:
        'bg-[#272735] text-[#ededf3] hover:text-[#ff6b6b] hover:bg-[#3a2228] border border-[#70707d]/40 shadow-none rounded-[32px]',
      ghost:
        'hover:bg-[#272735] text-[#ededf3] active:bg-[#1e1e2a] shadow-none border-0 rounded-[40px]',
      link:
        'text-[#ededf3] underline-offset-4 hover:underline shadow-none p-0 h-auto hover:text-white rounded-none',
      gradient:
        'bg-[#5266eb] text-white hover:bg-[#4355d6] shadow-none border-0 rounded-[32px]',
      glow:
        'bg-[#5266eb] text-white hover:bg-[#4355d6] shadow-none border-0 rounded-[32px]',
    };

    const sizes = {
      default: 'h-11 px-6 text-base',
      sm: 'h-9 px-4 text-sm',
      lg: 'h-13 px-8 text-base',
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
