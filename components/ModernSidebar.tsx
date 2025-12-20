import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Clock, 
  CreditCard, 
  RefreshCcw, 
  Layers, 
  Zap, 
  Settings, 
  HelpCircle,
  PieChart,
  Database,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ModernSidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen = true, onClose }) => {
  const menuItems = [
    { section: 'MAIN', items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'questions', label: 'Questions', icon: PieChart }, // Adapted from project
      { id: 'editor', label: 'Data Editor', icon: Database }, // Adapted from project
      { id: 'wallet', label: 'My Wallet', icon: Wallet },
      { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
      { id: 'transactions', label: 'Transactions', icon: Clock },
      { id: 'payment', label: 'Payment', icon: CreditCard },
      { id: 'exchange', label: 'Exchange', icon: RefreshCcw },
    ]},
    { section: 'FEATURES', items: [
      { id: 'integration', label: 'Integration', icon: Layers },
      { id: 'automation', label: 'Automation', icon: Zap },
    ]},
    { section: 'TOOLS', items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'help', label: 'Help center', icon: HelpCircle },
    ]}
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-[#0D0D0D] border-r border-[#2A2A2A] transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:relative lg:translate-x-0 flex flex-col
    `}>
      <div className="h-20 flex items-center px-8 border-b border-transparent">
        {/* Logo Icon */}
        <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-brand-orange">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <button className="ml-auto lg:hidden text-gray-400" onClick={onClose}>
            <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-4 space-y-8">
        {menuItems.map((section) => (
          <div key={section.section}>
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#2A2A2A] to-transparent text-white border-l-2 border-brand-orange shadow-lg shadow-black/20' 
                        : 'text-gray-400 hover:text-gray-100 hover:bg-[#1A1A1A]'}
                    `}
                  >
                    <item.icon size={18} className={isActive ? 'text-brand-orange' : 'text-gray-500'} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4">
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#1E1E1E] to-[#111111] border border-[#2A2A2A] overflow-hidden group">
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Zap size={20} className="text-white" fill="white" />
                </div>
                <h4 className="text-white font-bold text-base mb-1">Upgrade Pro!</h4>
                <p className="text-gray-400 text-xs mb-4">Upgrade to Pro and elevate your experience today</p>
                <button className="w-full py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeLight text-white text-xs font-bold transition-colors shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2">
                    Upgrade
                    <span className="text-[10px] font-normal opacity-80 ml-1">Learn More</span>
                </button>
            </div>
            
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500/10 blur-2xl rounded-full -ml-10 -mb-10 pointer-events-none" />
        </div>
      </div>
    </aside>
  );
};

export default ModernSidebar;
