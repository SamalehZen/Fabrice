import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  CreditCard, 
  ArrowLeftRight, 
  ShoppingBasket, 
  User, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Box,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { ThemeMode } from '../context/AppContext';

export type SidebarTab = 'dashboard' | 'questions' | 'editor' | 'profile' | 'transactions' | 'products' | 'messages' | 'settings';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false); // Closed by default

  const MENU_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'questions', label: 'Statistics', icon: PieChart },
    { id: 'editor', label: 'Payment', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'products', label: 'Products', icon: ShoppingBasket },
    { id: 'profile', label: 'Customer', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 5 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside 
      className={`
        relative h-screen bg-white dark:bg-[#1e1e2d] text-slate-900 dark:text-white transition-all duration-300 ease-in-out flex flex-col z-50 border-r border-slate-200 dark:border-white/5
        ${isOpen ? 'w-64' : 'w-24'}
      `}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 bg-white dark:bg-brand-600 text-slate-800 dark:text-white p-1.5 rounded-full shadow-lg border border-slate-200 dark:border-brand-500 hover:scale-110 transition-transform z-50 flex items-center justify-center"
      >
        {isOpen ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
      </button>

      {/* Logo Section */}
      <div className={`py-8 flex items-center ${!isOpen ? 'justify-center flex-col gap-2' : 'px-8 gap-4'}`}>
        <div className="bg-gradient-to-br from-brand-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/30">
           <Box size={24} className="text-white" />
        </div>
        <div className={`font-bold text-2xl tracking-tight transition-all duration-300 ${!isOpen ? 'scale-0 h-0 w-0 opacity-0 overflow-hidden' : 'scale-100 opacity-100'}`}>
          Zarss
        </div>
      </div>

      {/* User Profiles / Divider */}
      <div className={`mx-4 border-b border-slate-100 dark:border-white/5 mb-6 transition-all duration-300 ${!isOpen && 'mx-2'}`} />

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-3 overflow-y-auto custom-scrollbar">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as SidebarTab)}
            className={`
              w-full flex items-center rounded-2xl transition-all duration-200 group relative
              ${isOpen ? 'px-4 py-3.5 gap-4' : 'justify-center py-3.5 px-0'}
              ${activeTab === item.id 
                ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/25' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-brand-600 dark:hover:text-brand-400'
              }
            `}
            title={!isOpen ? item.label : undefined}
          >
            <div className={`relative flex items-center justify-center ${!isOpen ? 'w-full' : ''}`}>
                <item.icon 
                    size={isOpen ? 22 : 24} 
                    strokeWidth={activeTab === item.id ? 2.5 : 2}
                    className={`transition-transform duration-300 ${!isOpen && 'group-hover:scale-110'}`} 
                />
                
                {/* Badge for notification */}
                {item.id === 'messages' && (
                   <span className={`absolute bg-rose-500 text-white font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#1e1e2d] ${isOpen ? '-top-1 -right-1 w-5 h-5 text-[10px]' : 'top-0 right-1 w-4 h-4 text-[9px]'}`}>
                     5
                   </span>
                )}
            </div>
            
            <span className={`font-semibold tracking-wide whitespace-nowrap transition-all duration-300 ${!isOpen ? 'hidden opacity-0 w-0' : 'block opacity-100 flex-1 text-left'}`}>
              {item.label}
            </span>
            
            {/* Active Indicator Strip for Collapsed State */}
            {!isOpen && activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 mt-auto border-t border-slate-100 dark:border-white/5 space-y-2 bg-slate-50/50 dark:bg-white/[0.02]">
         {/* Theme Toggle in Sidebar */}
         <button 
            onClick={toggleTheme}
            className={`
                w-full flex items-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all duration-200
                ${isOpen ? 'px-4 py-3 gap-3' : 'justify-center py-3'}
            `}
         >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className={`font-medium transition-all duration-300 ${!isOpen ? 'hidden' : 'block'}`}>
              {isDark ? 'Mode Clair' : 'Mode Sombre'}
            </span>
         </button>

         {/* Logout */}
         <button className={`
            w-full flex items-center text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-200
            ${isOpen ? 'px-4 py-3 gap-3' : 'justify-center py-3'}
         `}>
            <LogOut size={20} />
            <span className={`font-medium transition-all duration-300 ${!isOpen ? 'hidden' : 'block'}`}>
              Déconnexion
            </span>
         </button>
      </div>

    </aside>
  );
};

export default Sidebar;
