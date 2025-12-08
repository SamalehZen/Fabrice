import React from 'react';
import { LayoutDashboard, PieChart, Database, Zap, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'questions' | 'editor';
  setActiveTab: (tab: 'dashboard' | 'questions' | 'editor') => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, isMobile }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Panorama', icon: LayoutDashboard },
    { id: 'questions', label: 'Questions', icon: PieChart },
    { id: 'editor', label: 'Données', icon: Database },
  ] as const;

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col
      ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
      ${isMobile && !isOpen ? '-translate-x-full' : ''}
      `}
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
        <div className={`flex items-center gap-3 transition-opacity duration-200 ${!isOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
            Hyper<span className="text-brand-500">A</span>
          </span>
        </div>
        
        {!isMobile && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
              ${activeTab === item.id 
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
            `}
          >
            <item.icon size={22} className={`shrink-0 transition-colors ${activeTab === item.id ? 'fill-current opacity-20' : ''}`} strokeWidth={1.5} />
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${!isOpen && !isMobile ? 'opacity-0 w-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
              {item.label}
            </span>
            
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors group
             ${!isOpen && !isMobile ? 'justify-center px-0' : ''}
        `}>
          <LogOut size={20} />
          <span className={`font-medium whitespace-nowrap transition-all duration-300 ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
