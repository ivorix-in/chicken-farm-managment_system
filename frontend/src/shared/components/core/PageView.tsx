import type { ReactNode } from 'react';

export type PageViewProps = {
  children: ReactNode;
  className?: string;
  /** No inner padding — use when the page owns spacing (e.g. full-bleed layouts). */
  flush?: boolean;
};

/**
 * Bordered, rounded content shell for admin pages (aligned with shadcn-style page frames).
 * Wrap route content so every screen shares the same outer panel on the gray canvas.
 * Padding balances inner spacing; outer gray gutter comes from AdminLayout `main` — tweak both if the frame feels too loose.
 */
export default function PageView({ children, className = '', flush = false }: PageViewProps) {
  return (
    <div
      className={[
        'rounded-md border border-gray-200/80 bg-white shadow-sm',
        flush
          ? ''
          : [
              'px-3 py-4',
              'sm:px-4 sm:py-4',
              'md:px-4 md:py-5',
              'lg:px-5 lg:py-5',
              'xl:px-6 xl:py-6',
            ].join(' '),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
