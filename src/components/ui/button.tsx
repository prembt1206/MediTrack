import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap text-base font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#393737] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none font-sans rounded-[100px]';

    const variants = {
      // Pill CTA Button: Dark filled pill, 100px radius, Messina Sans 16px weight 600, white text on Warm Graphite (#393737), no border, no shadow
      default:
        'bg-[#393737] text-white hover:bg-[#2b2929] active:bg-[#1f1e1e] border-0 shadow-none',
      // Secondary: Paper White (#ffffff), 1px Warm Graphite border at low opacity, Warm Graphite text, soft shadow
      secondary:
        'bg-[#ffffff] text-[#393737] border border-[#393737]/15 hover:bg-[#f7f7f7] active:bg-[#eeeeee] shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
      // Ghost Outline Button: Transparent bg, 1px Warm Graphite border at 20% opacity, Warm Graphite text
      outline:
        'border border-[#393737]/25 bg-transparent hover:bg-[#393737]/5 text-[#393737] active:bg-[#393737]/10 shadow-none',
      destructive:
        'bg-[#ffffff] text-[#393737] hover:bg-[#f3f0f8] border border-[#393737]/20 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
      ghost:
        'hover:bg-[#393737]/5 text-[#393737] active:bg-[#393737]/10 shadow-none border-0',
      link:
        'text-[#393737] underline-offset-4 hover:underline shadow-none p-0 h-auto rounded-none',
      gradient:
        'bg-[#393737] text-white hover:bg-[#2b2929] shadow-none border-0',
      glow:
        'bg-[#393737] text-white hover:bg-[#2b2929] shadow-none border-0',
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
