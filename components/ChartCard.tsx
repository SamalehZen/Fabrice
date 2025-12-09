import React, { memo } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string; // Will handle col-span and row-span
  fullWidth?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = memo(({ title, subtitle, children, className = '', fullWidth = false }) => {
  return (
    <article
      className={`
        relative overflow-hidden
        bg-white/70 dark:bg-slate-900/70 
        backdrop-blur-xl 
        rounded-2xl 
        border border-white/20 dark:border-slate-700/50 
        shadow-2xl shadow-slate-200/50 dark:shadow-black/50
        p-6 flex flex-col 
        transition-all duration-500 ease-out
        hover:scale-[1.02] hover:shadow-3xl hover:-translate-y-1 hover:border-brand-500/20 dark:hover:border-brand-400/20
        ${fullWidth ? 'col-span-full' : ''} 
        ${className}
      `}
    >
      <div className="flex justify-between items-start mb-6 z-10 relative">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-medium uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
        <button
          className="text-slate-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 p-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label={`Options pour ${title}`}
        >
          <MoreHorizontal size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-grow min-h-[300px] w-full relative z-10">
        {children}
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-brand-500/5 to-amber-500/5 rounded-full blur-3xl pointer-events-none" />
    </article>
  );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;