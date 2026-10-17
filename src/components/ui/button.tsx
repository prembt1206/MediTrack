import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] active:translate-y-0.5 hover:-translate-y-0.5 cursor-pointer select-none';

    const variants = {
      default:
        'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 border border-emerald-400/20',
      destructive:
        'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-md shadow-rose-500/20 hover:shadow-rose-500/30 border border-rose-400/20',
      outline:
        'border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white hover:border-slate-600 backdrop-blur-md shadow-sm',
      secondary:
        'bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/50 shadow-sm',
      ghost:
        'hover:bg-slate-800/60 text-slate-300 hover:text-white shadow-none border border-transparent',
      link:
        'text-emerald-400 underline-offset-4 hover:underline shadow-none p-0 h-auto hover:text-emerald-300',
      gradient:
        'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-300/30',
      glow:
        'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] border border-emerald-300/50',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-11 rounded-xl px-6 text-base font-bold',
      icon: 'h-10 w-10 p-0 rounded-xl',
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
