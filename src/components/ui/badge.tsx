import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#272735] text-[#ededf3] border-0',
    secondary: 'bg-[#1e1e2a] text-[#c3c3cc] border-0',
    destructive: 'bg-[#272735] text-[#ededf3] border border-[#70707d]/35',
    outline: 'border border-[#e2e3ed]/25 text-[#ededf3] bg-transparent',
    success: 'bg-[#272735] text-[#ededf3] border-0',
    warning: 'bg-[#272735] text-[#ededf3] border-0',
    purple: 'bg-[#272735] text-[#ededf3] border-0',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[40px] px-3.5 py-1 text-xs font-[480] tracking-[0.12px] transition-colors shadow-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
