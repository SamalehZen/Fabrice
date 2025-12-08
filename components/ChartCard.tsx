import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'sage' | 'sand' | 'lavender';
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  fullWidth = false,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-charcoal-800 border-cream-300 dark:border-charcoal-700',
    sage: 'bg-sage-100 dark:bg-sage-900/20 border-sage-200 dark:border-sage-800',
    sand: 'bg-sand-100 dark:bg-sand-900/20 border-sand-200 dark:border-sand-800',
    lavender: 'bg-lavender-100 dark:bg-lavender-900/20 border-lavender-200 dark:border-lavender-800'
  };

  return (
    <div className={`rounded-2xl shadow-sm border p-6 flex flex-col transition-all duration-300 hover:shadow-md ${variantStyles[variant]} ${fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'col-span-1'} ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-semibold text-charcoal-900 dark:text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-charcoal-900/50 dark:text-cream-400 mt-1">{subtitle}</p>}
        </div>
        <button className="text-charcoal-900/30 dark:text-cream-400 hover:text-charcoal-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-700 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="flex-grow min-h-[280px] w-full relative">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
