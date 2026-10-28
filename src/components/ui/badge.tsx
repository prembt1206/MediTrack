import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#0071e3]/15 text-[#2997ff] border-[#0071e3]/30',
    secondary: 'bg-[#1d1d1f] text-[#86868b] border-[#333336]',
    destructive: 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30',
    outline: 'border-[#424245] text-[#86868b] bg-transparent',
    success: 'bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30',
    warning: 'bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30',
    purple: 'bg-[#bf5af2]/15 text-[#bf5af2] border-[#bf5af2]/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors focus:outline-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
