import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#242432] text-[#ededf3] border-[#70707d]/35',
    secondary: 'bg-[#1e1e2a] text-[#c3c3cc] border-[#70707d]/30',
    destructive: 'bg-[#1e1e2a] text-[#ededf3] border-[#70707d]/35',
    outline: 'border-[#70707d]/30 text-[#c3c3cc] bg-transparent',
    success: 'bg-[#1e1e2a] text-[#ededf3] border-[#70707d]/35',
    warning: 'bg-[#1e1e2a] text-[#ededf3] border-[#70707d]/35',
    purple: 'bg-[#1e1e2a] text-[#ededf3] border-[#70707d]/35',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-normal tracking-[0.01em] transition-colors shadow-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
