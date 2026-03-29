import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variantClass = variant === 'secondary' ? 'text-brand-blue' : 'text-primary';

  return (
    <span
      className={`glass-nav px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
}
