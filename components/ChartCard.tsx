import React, { memo } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = memo(({ title, subtitle, children, className = '', fullWidth = false }) => {
  return (
    <article
      className={`bg-white/90 dark:bg-slate-900/70 rounded-xl shadow-sm shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 p-6 flex flex-col transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/60 ${
        fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'col-span-1'
      } ${className}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium uppercase tracking-wide">{subtitle}</p>
          )}
        </div>
        <button
          className="text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-300 p-1 rounded-xl hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={`Options pour ${title}`}
        >
          <MoreHorizontal size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-grow min-h-[300px] w-full relative">{children}</div>
    </article>
  );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;
