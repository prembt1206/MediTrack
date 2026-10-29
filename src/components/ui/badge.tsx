import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple' | 'tint';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    // Status Pill Badge: Cream Canvas (#f7f7f7) fill, 1px Warm Graphite border at low opacity, 100px radius, Messina Sans 13px weight 400, Warm Graphite text, soft shadow
    default: 'bg-[#f7f7f7] text-[#393737] border border-[#393737]/15 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    secondary: 'bg-[#ffffff] text-[#393737] border border-[#393737]/15 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    destructive: 'bg-[#ffffff] text-[#393737] border border-[#393737]/20 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    outline: 'border border-[#393737]/25 text-[#393737] bg-transparent',
    success: 'bg-[#f7f7f7] text-[#393737] border border-[#393737]/15 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    warning: 'bg-[#f7f7f7] text-[#393737] border border-[#393737]/15 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    purple: 'bg-[#f3f0f8] text-[#393737] border border-[#393737]/15 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    tint: 'bg-[#e9eff6] text-[#393737] border border-[#393737]/15 shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[100px] px-3.5 py-1 text-xs font-normal transition-colors font-sans',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
