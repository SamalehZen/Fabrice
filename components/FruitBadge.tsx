import React from 'react';
import { type ThemeMode } from '../App';

export const FruitBadge: React.FC<{ theme: ThemeMode; className?: string }> = ({ theme, className = '' }) => {
  const peelGradient = theme === 'dark' ? 'from-amber-300 via-orange-400 to-rose-500' : 'from-amber-200 via-orange-300 to-rose-400';
  const glossGradient = theme === 'dark' ? 'from-white/25 to-transparent' : 'from-white/70 to-transparent';
  const leafPrimary = theme === 'dark' ? 'bg-emerald-300' : 'bg-emerald-500';
  const leafSecondary = theme === 'dark' ? 'bg-emerald-400/80' : 'bg-emerald-400/60';
  const seedColor = theme === 'dark' ? 'bg-slate-900/60' : 'bg-white/70';

  return (
    <span className={`relative inline-flex w-10 h-10 ${className}`} aria-hidden>
      <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${peelGradient} shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition-all duration-500`}></span>
      <span className="absolute inset-[1px] rounded-full border border-white/30 dark:border-white/10"></span>
      <span className={`absolute inset-[4px] rounded-full bg-gradient-to-br ${glossGradient} opacity-90 mix-blend-screen`}></span>
      <span className={`absolute -top-1 left-1.5 w-5 h-2.5 rounded-full ${leafPrimary} rotate-[-18deg] origin-left blur-[0.3px]`}></span>
      <span className={`absolute -top-2 left-3 w-3 h-3 rounded-full ${leafSecondary} rotate-[-34deg] origin-bottom`}></span>
      <span className={`absolute bottom-3 left-4 w-1 h-1 rounded-full ${seedColor}`}></span>
      <span className={`absolute bottom-2.5 right-3 w-1 h-1 rounded-full ${seedColor}`}></span>
    </span>
  );
};
