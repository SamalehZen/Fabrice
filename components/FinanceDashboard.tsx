import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Clock, 
  CreditCard, 
  RefreshCw, 
  Puzzle, 
  Zap, 
  Settings, 
  HelpCircle, 
  ChevronDown, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { motion } from 'motion/react';

interface FinanceDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: any) => void;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ activeTab = 'finance', onTabChange }) => {
  const cashFlowData = [
    { name: 'Mon', value: 8 },
    { name: 'Tue', value: 12 },
    { name: 'Wed', value: 10 },
    { name: 'Thu', value: 9 },
    { name: 'Fri', value: 15, highlighted: true },
    { name: 'Sat', value: 11 },
    { name: 'Sun', value: 8 },
  ];

  const transactions = [
    { id: 'PAY-12345XYZ', user: 'Savannah Nguyen', amount: '$1,164.99 USD', period: 'Jun 10 - Jun 15', status: 'Received', avatar: 'https://i.pravatar.cc/150?u=savannah' },
    { id: 'TXN-98765A9', user: 'Jordan Lee', amount: '$1,072.98 USD', period: 'Jun 16 - Jun 17', status: 'Failed', avatar: 'https://i.pravatar.cc/150?u=jordan' },
    { id: 'INV-56789LMN', user: 'Alexis Kim', amount: '$977.98 USD', period: 'Jun 20 - Jun 29', status: 'Processed', avatar: 'https://i.pravatar.cc/150?u=alexis' },
  ];

  return (
    <div className="flex h-full min-h-screen bg-finance-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-finance-sidebar border-r border-finance-border flex flex-col p-6 gap-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1 px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-finance-orange"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none">Fabrice</span>
            <span className="text-[10px] text-finance-muted">Finance</span>
          </div>
          <div className="w-6 h-6 border border-finance-border rounded-lg flex items-center justify-center ml-auto cursor-pointer hover:border-white/20">
            <ChevronDown size={14} className="text-finance-muted rotate-90" />
          </div>
        </div>

        <nav className="flex flex-col gap-8">
          <div>
            <div className="flex items-center justify-between text-finance-muted text-xs font-semibold mb-4 uppercase tracking-wider">
              <span>Main</span>
              <ChevronDown size={14} />
            </div>
            <ul className="flex flex-col gap-2">
              <li 
                onClick={() => onTabChange?.('finance')}
                className={`flex items-center gap-3 p-3 rounded-r-xl cursor-pointer transition-all ${
                  activeTab === 'finance' 
                  ? 'bg-gradient-to-r from-finance-orange/20 to-transparent border-l-2 border-finance-orange text-finance-orange' 
                  : 'text-finance-muted hover:text-white'
                }`}
              >
                <LayoutDashboard size={20} />
                <span className="font-medium">Finance Home</span>
              </li>
              <li 
                onClick={() => onTabChange?.('dashboard')}
                className={`flex items-center gap-3 p-3 rounded-r-xl cursor-pointer transition-all ${
                  activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-finance-orange/20 to-transparent border-l-2 border-finance-orange text-finance-orange' 
                  : 'text-finance-muted hover:text-white'
                }`}
              >
                <Wallet size={20} />
                <span>Survey Analytics</span>
              </li>
              <li 
                onClick={() => onTabChange?.('questions')}
                className={`flex items-center gap-3 p-3 rounded-r-xl cursor-pointer transition-all ${
                  activeTab === 'questions' 
                  ? 'bg-gradient-to-r from-finance-orange/20 to-transparent border-l-2 border-finance-orange text-finance-orange' 
                  : 'text-finance-muted hover:text-white'
                }`}
              >
                <ArrowRightLeft size={20} />
                <span>Questions</span>
              </li>
              <li 
                onClick={() => onTabChange?.('editor')}
                className={`flex items-center gap-3 p-3 rounded-r-xl cursor-pointer transition-all ${
                  activeTab === 'editor' 
                  ? 'bg-gradient-to-r from-finance-orange/20 to-transparent border-l-2 border-finance-orange text-finance-orange' 
                  : 'text-finance-muted hover:text-white'
                }`}
              >
                <Clock size={20} />
                <span>Data Editor</span>
              </li>
              <li className="flex items-center gap-3 text-finance-muted hover:text-white p-3 cursor-pointer transition-colors">
                <Wallet size={20} />
                <span>Payment</span>
              </li>
              <li className="flex items-center gap-3 text-finance-muted hover:text-white p-3 cursor-pointer transition-colors">
                <RefreshCw size={20} />
                <span>Exchange</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between text-finance-muted text-xs font-semibold mb-4 uppercase tracking-wider">
              <span>Features</span>
              <ChevronDown size={14} />
            </div>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-3 text-finance-muted hover:text-white p-3 cursor-pointer transition-colors">
                <Puzzle size={20} />
                <span>Integration</span>
              </li>
              <li className="flex items-center gap-3 text-finance-muted hover:text-white p-3 cursor-pointer transition-colors">
                <Zap size={20} />
                <span>Automation</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between text-finance-muted text-xs font-semibold mb-4 uppercase tracking-wider">
              <span>Tools</span>
              <ChevronDown size={14} />
            </div>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-3 text-finance-muted hover:text-white p-3 cursor-pointer transition-colors">
                <Settings size={20} />
                <span>Settings</span>
              </li>
              <li className="flex items-center gap-3 text-finance-muted hover:text-white p-3 cursor-pointer transition-colors">
                <HelpCircle size={20} />
                <span>Help center</span>
              </li>
            </ul>
          </div>
        </nav>

        <div className="mt-auto bg-gradient-to-br from-finance-orange/20 to-finance-orange/5 p-4 rounded-3xl border border-finance-orange/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 text-finance-muted hover:text-white cursor-pointer z-10">
                <Plus size={16} className="rotate-45" />
            </div>
            <div className="w-10 h-10 bg-finance-orange rounded-xl flex items-center justify-center mb-3">
                <Zap size={20} className="text-white fill-current" />
            </div>
            <h4 className="font-bold text-lg mb-1">Upgrade Pro!</h4>
            <p className="text-finance-muted text-xs mb-4">Upgrade to Pro and elevate your experience today</p>
            <div className="flex items-center justify-between">
                <button className="bg-finance-orange text-white text-xs font-bold px-4 py-2 rounded-xl">Upgrade</button>
                <span className="text-finance-muted text-xs font-medium underline cursor-pointer">Learn More</span>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto no-scrollbar">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="p-2 border border-finance-border rounded-full text-finance-muted hover:text-white cursor-pointer">
              <Clock size={20} />
            </div>
            <div className="p-2 border border-finance-border rounded-full text-finance-muted hover:text-white cursor-pointer relative">
              <Bell size={20} />
              <div className="absolute top-1 right-1 w-4 h-4 bg-finance-orange rounded-full text-[10px] flex items-center justify-center border-2 border-finance-black">4</div>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-finance-orange">
              <img src="https://i.pravatar.cc/150?u=admin" alt="avatar" />
            </div>
          </div>
        </header>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-8">
          <button className="flex items-center gap-2 bg-finance-card border border-finance-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-finance-orange/50 transition-colors">
            <Settings size={18} className="text-finance-muted" />
            <span>Manage Balance</span>
          </button>
          <button className="flex items-center gap-2 bg-finance-card border border-finance-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-finance-orange/50 transition-colors">
            <Download size={18} className="text-finance-muted" />
            <span>Export</span>
          </button>
          <button className="flex items-center gap-2 bg-finance-orange px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-finance-orange/25">
            <Plus size={18} />
            <span>New Payment</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {['Total Revenue', 'Total Saving', 'Monthly Expense'].map((title, i) => (
            <div key={title} className="bg-finance-card border border-finance-border p-6 rounded-3xl">
              <p className="text-finance-muted text-sm font-medium mb-4">{title}</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">$19,270.56</p>
                <div className="bg-finance-orange/10 border border-finance-orange/30 px-3 py-1 rounded-full text-finance-orange text-xs font-bold">
                  +8%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cash Flow Chart */}
        <div className="bg-finance-card border border-finance-border p-8 rounded-[40px] mb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-finance-muted text-sm font-medium mb-1">Cash Flow</p>
              <p className="text-3xl font-bold">$19,270.56</p>
            </div>
            <div className="bg-finance-black border border-finance-border px-4 py-2 rounded-xl flex items-center gap-2 text-sm cursor-pointer">
              <span className="text-finance-muted">Weekly</span>
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex bg-finance-black p-1 rounded-xl">
              <button className="px-5 py-2 rounded-lg bg-finance-card text-white text-sm font-medium">Income</button>
              <button className="px-5 py-2 rounded-lg text-finance-muted text-sm font-medium hover:text-white transition-colors">Expense</button>
              <button className="px-5 py-2 rounded-lg text-finance-muted text-sm font-medium hover:text-white transition-colors">Saving</button>
            </div>
            <div className="flex gap-4">
              <div className="p-2 text-finance-muted hover:text-white cursor-pointer bg-finance-black rounded-lg border border-finance-border">
                <MoreHorizontal size={20} />
              </div>
              <div className="p-2 text-finance-muted hover:text-white cursor-pointer bg-finance-black rounded-lg border border-finance-border">
                <LayoutDashboard size={20} />
              </div>
            </div>
          </div>

          <div className="h-64 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" />
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#808080', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-finance-orange text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg ring-4 ring-finance-orange/20">
                          $16,251
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 8, 8]} 
                  barSize={40}
                >
                  {cashFlowData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.highlighted ? "url(#barGradient)" : "#2A2A2A"}
                      className="transition-all duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Grid Lines - Simple Mock */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between py-2 pr-4">
                {[15, 10, 5, 0].map((val) => (
                    <div key={val} className="flex items-center gap-4 w-full">
                        <span className="text-finance-muted text-[10px] w-6">${val}</span>
                        <div className="flex-1 h-[1px] bg-finance-border/50"></div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <section className="bg-finance-card border border-finance-border p-8 rounded-[40px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-finance-muted" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Anything..." 
                  className="bg-finance-black border border-finance-border rounded-2xl py-3 pl-12 pr-4 w-full text-sm focus:outline-none focus:border-finance-orange/50 transition-colors"
                />
              </div>
              <button className="p-3 bg-finance-black border border-finance-border rounded-2xl text-finance-muted hover:text-white cursor-pointer transition-colors">
                <Filter size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-finance-black border border-finance-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-finance-orange/50 transition-colors">
                <Download size={18} className="text-finance-muted" />
                <span>Export</span>
              </button>
              <button className="flex items-center gap-2 bg-finance-black border border-finance-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-finance-orange/50 transition-colors">
                <Download size={18} className="text-finance-muted" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-finance-muted text-xs uppercase tracking-wider text-left border-b border-finance-border">
                  <th className="pb-4 font-semibold"><input type="checkbox" className="rounded bg-finance-black border-finance-border" /></th>
                  <th className="pb-4 px-4 font-semibold">Payment ID</th>
                  <th className="pb-4 px-4 font-semibold">User</th>
                  <th className="pb-4 px-4 font-semibold">Total Amount</th>
                  <th className="pb-4 px-4 font-semibold">Payment Period</th>
                  <th className="pb-4 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-finance-border">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-finance-black/30 transition-colors">
                    <td className="py-4"><input type="checkbox" className="rounded bg-finance-black border-finance-border" /></td>
                    <td className="py-4 px-4 text-sm">{txn.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={txn.avatar} alt={txn.user} className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium">{txn.user}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold">{txn.amount}</td>
                    <td className="py-4 px-4 text-sm text-finance-muted">{txn.period}</td>
                    <td className="py-4 px-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ring-1 ring-inset ${
                        txn.status === 'Received' ? 'bg-green-500/10 text-green-500 ring-green-500/30' : 
                        txn.status === 'Failed' ? 'bg-red-500/10 text-red-500 ring-red-500/30' : 
                        'bg-yellow-500/10 text-yellow-500 ring-yellow-500/30'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="w-[400px] bg-finance-sidebar border-l border-finance-border p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-finance-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search Anything..." 
            className="bg-finance-black border border-finance-border rounded-2xl py-3 pl-12 pr-4 w-full text-sm focus:outline-none focus:border-finance-orange/50 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
            <div className="flex bg-finance-black p-1 rounded-full border border-finance-border">
                <button className="px-6 py-2 rounded-full bg-finance-card text-white text-sm font-bold flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Credit
                </button>
                <button className="px-6 py-2 rounded-full text-finance-muted text-sm font-medium hover:text-white transition-colors">
                    Debit
                </button>
            </div>
            <button className="bg-finance-orange text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-finance-orange/20 flex items-center gap-2">
                <Plus size={18} />
                Add Card
            </button>
        </div>

        {/* Credit Card Card */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-12">
                   <div className="w-10 h-10">
                       <svg viewBox="0 0 24 24" fill="none" className="text-white/30">
                           <path d="M4 10C4 10 7 10 7 7C7 4 4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 10C12 10 15 10 15 7C15 4 12 4 12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M20 10C20 10 23 10 23 7C23 4 20 4 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                   </div>
                   <div className="text-right">
                       <p className="text-white font-mono tracking-widest text-lg">**** **** 6541</p>
                       <p className="text-white/30 text-xs font-mono mt-1">12/27</p>
                   </div>
                </div>

                <div className="w-12 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-lg border border-white/20 mb-12"></div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Card Holder Name</p>
                        <p className="text-white text-lg font-medium">Anjuman Sharear</p>
                    </div>
                    <div className="text-white italic font-black text-2xl">VISA</div>
                </div>
            </div>
            
            {/* Abstract Background Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-to-br from-finance-orange/20 to-transparent rounded-full blur-3xl"></div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold mb-6">Quick Action</h3>
            <div className="flex items-center justify-between">
                {[
                    { icon: Plus, label: 'Top up' },
                    { icon: ArrowUpRight, label: 'Transfers' },
                    { icon: ArrowDownLeft, label: 'Request' },
                    { icon: Clock, label: '' },
                ].map((action, i) => (
                    <button key={i} className="flex items-center gap-2 bg-finance-black border border-finance-border p-4 rounded-2xl hover:border-finance-orange transition-all group">
                        <action.icon size={20} className="text-finance-muted group-hover:text-finance-orange transition-colors" />
                        {action.label && <span className="text-xs font-bold">{action.label}</span>}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Daily Limit</h3>
                <p className="text-xs text-finance-muted tracking-tight">
                  <span className="text-white font-bold">$1200 used</span> from $2,000 limit
                </p>
            </div>
            <div className="flex gap-2.5 mb-6">
                <div className="flex-1 h-2 bg-finance-orange rounded-full shadow-[0_0_15px_rgba(255,107,0,0.3)]"></div>
                <div className="flex-1 h-2 bg-finance-orange rounded-full shadow-[0_0_15px_rgba(255,107,0,0.3)]"></div>
                <div className="flex-1 h-2 bg-white/10 rounded-full relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full w-[40%] bg-finance-orange"></div>
                </div>
                <div className="flex-1 h-2 bg-white/10 rounded-full"></div>
            </div>
            <p className="text-[10px] text-finance-muted font-bold uppercase tracking-widest mb-4">Smart Spending Limits</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                    { label: 'Shopping', percent: 27, color: 'bg-finance-orange' },
                    { label: 'Subscriptions', percent: 35, color: 'bg-white' },
                    { label: 'Dinning Out', percent: 18, color: 'bg-white/40' },
                    { label: 'Other', percent: 20, color: 'bg-white/10' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-sm ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}></div>
                        <span className="text-[11px] text-finance-muted font-medium whitespace-nowrap">{item.label} ({item.percent}%)</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Bill & Payment</h3>
                <button className="w-8 h-8 rounded-full border border-finance-border flex items-center justify-center text-finance-muted hover:text-white transition-colors">
                    <Plus size={18} />
                </button>
            </div>
            
            <div className="flex flex-col gap-4 mb-8">
                {[
                    { name: 'Netflix Subscription', date: 'Jul 24, 2025', amount: '$25.30', status: 'Scheduled', icon: 'N', color: 'bg-red-600' },
                ].map((bill) => (
                    <div key={bill.name} className="bg-finance-black border border-finance-border p-4 rounded-3xl flex items-center justify-between group hover:border-finance-orange/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${bill.color} rounded-2xl flex items-center justify-center text-xl font-bold`}>{bill.icon}</div>
                            <div>
                                <h4 className="text-sm font-bold mb-1">{bill.name}</h4>
                                <p className="text-xs text-finance-muted">{bill.date}</p>
                            </div>
                        </div>
                        <ChevronDown size={20} className="text-finance-muted -rotate-90 group-hover:text-white transition-colors" />
                    </div>
                ))}
                
                <div className="mt-2 flex items-center justify-between">
                    <p className="font-bold text-lg">$25.30</p>
                    <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-finance-muted">Scheduled</div>
                </div>
            </div>

            <button className="w-full py-4 border border-finance-border rounded-2xl text-sm font-bold text-finance-muted hover:text-white hover:border-white/20 transition-all">
                View All
            </button>
        </div>
      </aside>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default FinanceDashboard;