import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  label: string;
  color: string;
  isViolet?: boolean;
  notchColor?: string; // New prop to control the "inverted border" color
  showGraph?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  label, 
  color, 
  isViolet,
  notchColor = '#0A0A0A', // Default to dark background
  showGraph = false
}) => {
  const textColor = isViolet ? '#FFFFFF' : '#000000';
  const subTextColor = isViolet ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const arrowBgColor = isViolet ? 'bg-white' : 'bg-black';
  const arrowIconColor = isViolet ? 'text-black' : 'text-[#D9FF00]';
  const barBg = isViolet ? 'bg-white/10' : 'bg-black/5';

  return (
    <div 
      className="relative p-8 sm:p-12 h-[480px] sm:h-[520px] rounded-[3rem] sm:rounded-[5rem] flex flex-col justify-between overflow-hidden shadow-2xl transition-premium hover:scale-[1.02] hover:-translate-y-1 hover:brightness-[1.05] group cursor-pointer w-full max-w-[440px]"
      style={{ backgroundColor: color }}
    >
      {/* 
        SYSTEME DE NOTCH SVG SANS GAP ("Zéro Petit Noir")
        The SVG path bites slightly into the card to ensure perfect fusion with the background.
        Now uses 'notchColor' to blend perfectly with any background (light or dark).
      */}
      <div className="absolute top-[-1px] right-[-1px] z-20 pointer-events-none drop-shadow-[-10px_10px_20px_rgba(0,0,0,0.15)]">
        <svg width="220" height="140" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[160px] h-[100px] sm:w-[220px] sm:h-[140px]">
          <path 
            d="M220 0V140C220 117.909 202.091 100 180 100H90C67.9086 100 50 82.0914 50 60V45C50 20.1472 29.8528 0 5 0H220Z" 
            fill={notchColor}
          />
        </svg>
      </div>

      {/* Action Icons in the Notch Area */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-30 flex gap-3 sm:gap-4 pointer-events-auto">
        <button 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center hover:scale-110 transition-premium group/icon"
          style={{ 
            backgroundColor: notchColor === '#0A0A0A' ? '#1A1A1A' : 'rgba(0,0,0,0.05)', 
            borderColor: notchColor === '#0A0A0A' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
          }}
        >
          <span 
            className="material-symbols-outlined text-lg sm:text-xl transition-colors"
            style={{ color: notchColor === '#0A0A0A' ? '#71717a' : '#666' }}
          >
            notifications
          </span>
        </button>
        <button className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-premium hover:scale-110 active:scale-90 shadow-xl ${arrowBgColor}`}>
          <span className={`material-symbols-outlined text-xl sm:text-2xl font-bold ${arrowIconColor}`}>north_east</span>
        </button>
      </div>

      {/* Title & Value */}
      <div className="relative z-10 pt-4">
        <p className="text-lg sm:text-xl font-black uppercase tracking-[0.25em] mb-2 sm:mb-4 opacity-80" style={{ color: textColor }}>
          {title}
        </p>
        <h3 
          className="text-[7rem] sm:text-[11rem] font-medium tracking-[-0.07em] leading-[0.7] group-hover:translate-x-2 transition-premium origin-left" 
          style={{ color: textColor }}
        >
          {value}
        </h3>
      </div>

      {/* Bottom Area: Label & Visualization */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end relative z-10 gap-6 sm:gap-0">
        <div className="pb-2 sm:pb-4">
          <p className="text-xl sm:text-2xl font-bold leading-[1.2] max-w-[240px]" style={{ color: subTextColor }}>
            {label.split(' ').slice(0, 2).join(' ')}<br/>
            <span className="opacity-100" style={{ color: textColor }}>{label.split(' ').slice(2).join(' ')}</span>
          </p>
        </div>

        {showGraph && (
        <div className="flex gap-4 sm:gap-6 self-end sm:self-auto">
          {/* Bar 1 - Stripe Pattern */}
          <div className={`w-20 h-36 sm:w-24 sm:h-44 rounded-[2rem] sm:rounded-[2.8rem] overflow-hidden relative shadow-inner transition-premium group-hover:-translate-y-2 ${barBg}`}>
             <div className="absolute inset-0 pattern-stripes-black opacity-10" />
             <div 
               className="absolute bottom-0 inset-x-0 bg-[#121212] rounded-[1.8rem] sm:rounded-[2.2rem] flex flex-col items-center justify-center animate-grow transition-premium shadow-lg" 
               style={{ '--final-height': '42%' } as React.CSSProperties}
             >
                <span className="text-white text-[8px] sm:text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest">Vol</span>
                <span className="text-white text-xs sm:text-sm font-black">42%</span>
             </div>
          </div>
          
          {/* Bar 2 - Dot Pattern */}
          <div className={`w-20 h-36 sm:w-24 sm:h-44 rounded-[2rem] sm:rounded-[2.8rem] overflow-hidden relative shadow-inner transition-premium group-hover:-translate-y-4 ${barBg}`}>
             <div 
               className={`absolute top-0 inset-x-0 rounded-[1.8rem] sm:rounded-[2.2rem] flex flex-col items-center justify-center animate-grow z-10 shadow-2xl transition-premium ${isViolet ? 'bg-white' : 'bg-[#D9FF00]'}`} 
               style={{ '--final-height': '38%' } as React.CSSProperties}
             >
                <span className="text-black text-xs sm:text-sm font-black">38%</span>
                <span className="text-black text-[8px] sm:text-[9px] font-black uppercase opacity-40 mt-1 tracking-widest">Cap</span>
             </div>
             <div className="absolute inset-0 pattern-dots-black opacity-15" />
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
