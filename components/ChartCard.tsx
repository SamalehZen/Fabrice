import React from 'react';
import { MoreHorizontal, Info } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className = '', headerAction }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-6 pb-2">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        
        {headerAction ? headerAction : (
          <button className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>
      
      <div className="flex-1 w-full p-4 relative min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
