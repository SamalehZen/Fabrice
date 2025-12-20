import React from 'react';
import { 
  Bell, 
  Mail, 
  Search, 
  Plus, 
  MoreHorizontal, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  ChevronRight
} from 'lucide-react';

const ModernRightPanel: React.FC = () => {
  return (
    <aside className="w-80 bg-[#0D0D0D] border-l border-[#2A2A2A] flex flex-col h-full overflow-y-auto custom-scrollbar hidden xl:flex">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-transparent">
        <div className="flex items-center gap-3 ml-auto">
            <button className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <ClockIcon size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
                <Mail size={18} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-orange rounded-full border-2 border-[#1A1A1A]"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-purple-600 p-[2px]">
                <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Profile" 
                    className="w-full h-full rounded-full border-2 border-[#0D0D0D]" 
                />
            </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Search */}
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
                type="text" 
                placeholder="Search Anything..." 
                className="w-full bg-[#1A1A1A] text-gray-200 text-sm py-3 pl-12 pr-4 rounded-xl border border-[#2A2A2A] focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all placeholder:text-gray-600"
            />
        </div>

        {/* My Wallet / Cards */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex bg-[#1A1A1A] rounded-full p-1 border border-[#2A2A2A]">
                    <button className="px-4 py-1.5 rounded-full bg-[#2A2A2A] text-white text-xs font-semibold shadow-sm">Credit</button>
                    <button className="px-4 py-1.5 rounded-full text-gray-500 text-xs font-medium hover:text-gray-300">Debit</button>
                </div>
                <button className="px-3 py-1.5 bg-brand-orange hover:bg-brand-orangeLight text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
                    <Plus size={14} /> Add Card
                </button>
            </div>

            {/* Credit Card Visual */}
            <div className="relative w-full aspect-[1.586] rounded-2xl bg-gradient-to-br from-[#2A2A2A] to-[#151515] border border-[#333] p-5 flex flex-col justify-between overflow-hidden shadow-2xl">
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex flex-col">
                         <SignalIcon className="text-gray-400 rotate-90" size={20} />
                    </div>
                    <span className="text-gray-300 font-mono text-xs tracking-wider">**** **** 6541</span>
                </div>

                <div className="relative z-10 flex flex-col gap-1">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-7 bg-white/10 rounded-md backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <div className="w-6 h-4 border border-white/50 rounded-sm flex items-center justify-center gap-[2px]">
                                <div className="w-[1px] h-full bg-white/50"></div>
                                <div className="w-[1px] h-full bg-white/50"></div>
                            </div>
                        </div>
                     </div>
                     <span className="text-[10px] text-gray-400 mt-2">Card Holder Name</span>
                     <div className="flex justify-between items-end">
                        <span className="text-white font-medium tracking-wide">Anjuman Sharear</span>
                        <span className="text-white font-bold italic text-lg">VISA</span>
                     </div>
                </div>

                {/* Glass effect blobs */}
                <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </div>
        </div>

        {/* Quick Actions */}
        <div>
            <h3 className="text-gray-400 text-sm font-medium mb-4">Quick Action</h3>
            <div className="flex gap-3">
                <button className="flex-1 py-3 px-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl flex items-center justify-center gap-2 text-gray-300 text-xs font-medium transition-all group">
                    <Plus size={14} className="group-hover:text-brand-orange transition-colors" /> Top up
                </button>
                <button className="flex-1 py-3 px-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl flex items-center justify-center gap-2 text-gray-300 text-xs font-medium transition-all group">
                    <ArrowUpRight size={14} className="group-hover:text-brand-orange transition-colors" /> Transfers
                </button>
                <button className="flex-1 py-3 px-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl flex items-center justify-center gap-2 text-gray-300 text-xs font-medium transition-all group">
                    <ArrowDownLeft size={14} className="group-hover:text-brand-orange transition-colors" /> Request
                </button>
                <button className="w-10 flex-none py-3 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2A2A2A] rounded-xl flex items-center justify-center text-gray-400 transition-all">
                    <History size={16} />
                </button>
            </div>
        </div>

        {/* Daily Limit */}
        <div>
             <h3 className="text-gray-400 text-sm font-medium mb-2">Daily Limit</h3>
             <div className="flex items-end gap-2 mb-2">
                <span className="text-white font-bold text-lg">$1200 used</span>
                <span className="text-gray-500 text-xs mb-1">from $2,000 limit</span>
             </div>
             <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full bg-brand-orange w-[60%] rounded-full shadow-[0_0_10px_rgba(255,95,0,0.5)]"></div>
             </div>
        </div>

        {/* Smart Spending Limits */}
        <div>
            <h3 className="text-gray-400 text-sm font-medium mb-3">Smart Spending Limits</h3>
            <div className="flex h-2 w-full rounded-full overflow-hidden mb-4 gap-[2px]">
                <div className="h-full w-[27%] bg-brand-orange" />
                <div className="h-full w-[35%] bg-blue-400" />
                <div className="h-full w-[18%] bg-white" />
                <div className="h-full w-[20%] bg-gray-600" />
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <LegendItem color="bg-brand-orange" label="Shopping (27%)" />
                <LegendItem color="bg-blue-400" label="Subscriptions (35%)" />
                <LegendItem color="bg-white" label="Dinning Out (18%)" />
                <LegendItem color="bg-gray-600" label="Other (20%)" />
            </div>
        </div>

        {/* Bill & Payment */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Bill & Payment</h3>
                <button className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white">
                    <Plus size={12} />
                </button>
            </div>

            <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] hover:border-brand-orange/30 transition-colors cursor-pointer group mb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-red-900/40">
                            N
                        </div>
                        <div>
                            <h4 className="text-white text-sm font-semibold group-hover:text-brand-orange transition-colors">Netflix Subscription</h4>
                            <p className="text-gray-500 text-xs">Jul 24, 2025</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-white font-medium">$25.30</span>
                    <span className="text-[10px] text-gray-400 border border-[#333] px-2 py-0.5 rounded-full bg-[#111]">Scheduled</span>
                </div>
            </div>

            <button className="w-full py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300 text-xs font-medium hover:bg-[#252525] hover:text-white transition-all">
                View All
            </button>
        </div>

      </div>
    </aside>
  );
};

// Helper Components
const ClockIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const SignalIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-[2px] ${color}`}></div>
        <span className="text-gray-400 text-[10px] whitespace-nowrap">{label}</span>
    </div>
);

export default ModernRightPanel;
