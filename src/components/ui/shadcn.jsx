// client/src/components/ui/shadcn.jsx
import React from 'react';
import { X } from 'lucide-react';

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const variants = {
    default:
      'bg-[#f5efe6] text-neutral-950 hover:bg-[#eae2d5] font-semibold border border-[#d8cdbf]/80 shadow-xs',
    primary:
      'bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-semibold shadow-xs border border-neutral-300 dark:border-neutral-200',
    secondary:
      'bg-[#ede5da] hover:bg-[#e2dbcf] text-neutral-900 border border-[#d8cdbf] dark:bg-[#18191e] dark:hover:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700/80',
    outline:
      'border border-[#d8cdbf] bg-transparent hover:bg-[#ede5da] text-neutral-800 dark:border-neutral-700/80 dark:bg-transparent dark:hover:bg-neutral-800/70 dark:text-neutral-200',
    ghost:
      'bg-transparent hover:bg-[#ede5da] text-neutral-700 hover:text-neutral-950 dark:bg-transparent dark:hover:bg-neutral-800/60 dark:text-neutral-300 dark:hover:text-white',
    destructive:
      'bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 border border-rose-500/30',
    success:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 font-medium',
    warning:
      'bg-amber-500/15 text-amber-800 dark:text-[#f5efe6] hover:bg-amber-500/25 border border-amber-500/30 font-medium',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm rounded-lg',
    sm: 'h-8 px-3 py-1 text-xs rounded-md',
    lg: 'h-11 px-6 py-2.5 text-base rounded-xl',
    icon: 'h-9 w-9 rounded-lg flex items-center justify-center',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5efe6]/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#f5efe6] text-neutral-950 dark:bg-[#f5efe6]/10 dark:text-[#f5efe6] border border-[#d8cdbf] dark:border-[#f5efe6]/25 font-semibold',
    secondary: 'bg-[#ede5da] text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300 border border-[#d8cdbf] dark:border-neutral-700/80',
    cream: 'bg-[#f5efe6] text-neutral-950 font-bold border border-[#d8cdbf]',
    success: 'bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/25 font-semibold',
    warning:
      'bg-amber-100 dark:bg-amber-500/15 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-semibold',
    destructive: 'bg-rose-500/15 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/25 font-semibold',
    purple: 'bg-[#f5efe6] dark:bg-neutral-900 text-neutral-950 dark:text-white border border-[#d8cdbf] dark:border-neutral-700 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#e2dbcf] dark:border-neutral-800/90 bg-white dark:bg-[#121316]/95 text-neutral-900 dark:text-neutral-100 shadow-md dark:shadow-xl backdrop-blur-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={cn('flex flex-col space-y-1.5 p-5', className)}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-neutral-900 dark:text-white', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return <p className={cn('text-xs text-neutral-600 dark:text-neutral-400', className)}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={cn('p-5 pt-0', className)}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('flex items-center p-5 pt-0 border-t border-[#e2dbcf] dark:border-neutral-800/80 mt-4', className)}>
      {children}
    </div>
  );
}

export function Label({ children, className = '', ...props }) {
  return (
    <label
      className={cn('block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5', className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-lg border border-[#e2dbcf] dark:border-neutral-800 bg-[#f8f5ee] dark:bg-[#0f1013] px-3 py-2 text-sm text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#f5efe6]/40 focus:border-[#d8cdbf] disabled:cursor-not-allowed disabled:opacity-50 transition',
        className
      )}
      {...props}
    />
  );
}

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-lg border border-[#e2dbcf] dark:border-neutral-800 bg-[#f8f5ee] dark:bg-[#0f1013] px-3 py-2 text-sm text-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#f5efe6]/40 focus:border-[#d8cdbf] disabled:cursor-not-allowed disabled:opacity-50 transition',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-[#e2dbcf] dark:border-neutral-800 bg-[#f8f5ee] dark:bg-[#0f1013] px-3 py-2 text-sm text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#f5efe6]/40 focus:border-[#d8cdbf] disabled:cursor-not-allowed disabled:opacity-50 transition',
        className
      )}
      {...props}
    />
  );
}

export function Dialog({ open, onClose, title, subtitle, maxWidth = 'max-w-2xl', children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className={cn(
          'relative w-full rounded-2xl border border-[#e2dbcf] dark:border-neutral-800 bg-white dark:bg-[#121316] text-neutral-900 dark:text-neutral-100 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden',
          maxWidth
        )}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-[#e2dbcf] dark:border-neutral-800 px-6 py-4 bg-white/95 dark:bg-[#121316]/95 sticky top-0 z-10">
            <div>
              {title && <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h2>}
              {subtitle && <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">{subtitle}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-[#ede5da] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Avatar({ src, name = 'U', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };
  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover border border-neutral-700 flex-shrink-0',
          sizes[size] || sizes.md,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 text-[#f5efe6] font-bold flex items-center justify-center flex-shrink-0 border border-neutral-700',
        sizes[size] || sizes.md,
        className
      )}
    >
      {initials}
    </div>
  );
}
