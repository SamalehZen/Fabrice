import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  contentClassName?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className = '', fullWidth = false, contentClassName = 'flex-grow min-h-[300px] w-full relative' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col transition-all duration-300 hover:shadow-lg ${fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'col-span-1'} ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">{subtitle}</p>}
        </div>
        <button className="text-slate-400 hover:text-brand-600 p-1 rounded-full hover:bg-brand-50 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;