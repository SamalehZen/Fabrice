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
  ChevronRight
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
        relative h-screen bg-[#1e1e2d] text-white transition-all duration-300 ease-in-out flex flex-col z-50
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-1 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Logo Section */}
      <div className={`p-6 flex items-center gap-4 ${!isOpen && 'justify-center p-4'}`}>
        <div className="bg-white/10 p-2 rounded-xl">
           <Box size={24} className="text-white" />
        </div>
        <div className={`font-bold text-xl tracking-wide transition-opacity duration-300 ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          Zarss
        </div>
      </div>

      {/* User Profile Snippet (Only visible when open) */}
      <div className={`px-6 mb-8 flex flex-col items-center transition-all duration-300 ${!isOpen ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden mb-3">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">Welcome Back,</p>
            <h3 className="font-bold text-lg">Mark Johnson</h3>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as SidebarTab)}
            className={`
              w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
              ${activeTab === item.id 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }
              ${!isOpen && 'justify-center'}
            `}
            title={!isOpen ? item.label : undefined}
          >
            <div className="relative">
                <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-white' : 'group-hover:text-white'}`} />
                {item.badge && !isOpen && (
                   <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#1e1e2d]">
                     {item.badge}
                   </span>
                )}
            </div>
            
            <span className={`font-medium transition-all duration-300 ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 flex-1 text-left'}`}>
              {item.label}
            </span>

            {item.badge && isOpen && (
               <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                 {item.badge}
               </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 mt-auto border-t border-white/5 space-y-2">
         {/* Logout */}
         <button className={`
            w-full flex items-center gap-4 px-3 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all duration-200
            ${!isOpen && 'justify-center'}
         `}>
            <LogOut size={20} />
            <span className={`font-medium transition-all duration-300 ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 flex-1 text-left'}`}>
              Log Out
            </span>
         </button>
      </div>

    </aside>
  );
};

export default Sidebar;
