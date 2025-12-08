import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className = '', fullWidth = false }) => {
  return (
    <div className={`bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'col-span-1'} ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && (
            <div className="flex items-center gap-2 mt-1">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               <p className="text-sm text-slate-400 font-medium">{subtitle}</p>
            </div>
          )}
        </div>
        <button className="text-slate-300 hover:text-slate-800 transition-colors p-2 hover:bg-slate-50 rounded-xl">
          <ArrowUpRight size={20} />
        </button>
      </div>
      <div className="flex-grow min-h-[250px] w-full relative">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;