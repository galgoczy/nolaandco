import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-primary text-on-primary rounded-full px-8 py-3 font-bold btn-anim',
  secondary: 'bg-brand-blue text-carbon rounded-full px-8 py-3 font-bold btn-anim',
  outline: 'border border-outline-variant text-carbon rounded-full px-8 py-3 btn-anim',
} as const;

const sizes = {
  sm: 'text-sm px-5 py-2',
  md: '',
  lg: 'text-lg px-10 py-4',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
  href?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  href,
  ...props
}: ButtonProps) {
  const classes = `${variants[variant]} ${sizes[size]} inline-flex items-center justify-center transition-all ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
