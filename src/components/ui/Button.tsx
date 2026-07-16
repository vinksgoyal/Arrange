import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  // FIXED: Changed dark:text-ink to dark:text-black for primary variant
  primary: 'bg-ink text-white hover:bg-ink/90 dark:bg-white dark:text-black hover:dark:bg-white/90',
  secondary:
    'bg-white text-ink border border-border hover:border-border-strong hover:bg-surface-subtle dark:bg-dark-surface dark:text-white dark:border-dark-border',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink dark:hover:bg-white/5 dark:text-white/70',
  danger: 'bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
          'disabled:opacity-40 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
