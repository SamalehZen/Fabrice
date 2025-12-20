import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Settings, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';

const MOCK_DATA = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
  { name: 'Jul', income: 3490, expense: 4300 },
];

const MOCK_CASHFLOW = [
  { day: 'Mon', value: 15 },
  { day: 'Tue', value: 25 },
  { day: 'Wed', value: 10 },
  { day: 'Thu', value: 30 },
  { day: 'Fri', value: 20 },
  { day: 'Sat', value: 35 },
  { day: 'Sun', value: 45 }, // Highlighted in screenshot
  { day: 'Mon2', value: 20 },
  { day: 'Tue2', value: 55 }, // High point
  { day: 'Wed2', value: 40 },
  { day: 'Thu2', value: 25 },
];

const FinancialDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Income' | 'Expense' | 'Saving'>('Income');

  return (
    <div className="flex-1 w-full min-h-screen bg-[#0D0D0D] text-white p-6 lg:p-10 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-gray-500 text-xs">Payment updates</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl border border-[#2A2A2A] text-gray-300 text-xs font-medium hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center gap-2">
                <Settings size={14} /> Manage Balance
            </button>
            <button className="px-4 py-2.5 rounded-xl border border-[#2A2A2A] text-gray-300 text-xs font-medium hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center gap-2">
                <Download size={14} /> Export
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeLight text-white text-xs font-bold transition-colors shadow-lg shadow-brand-orange/20 flex items-center gap-2">
                <Plus size={16} /> New Payment
            </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
            title="Total Revenue" 
            value="$19,270.56" 
            percent="+8%" 
            isPositive={true} 
            color="bg-[#1A1A1A]"
        />
        <StatCard 
            title="Total Saving" 
            value="$19,270.56" 
            percent="+8%" 
            isPositive={true} 
            color="bg-[#1A1A1A]"
        />
        <StatCard 
            title="Monthly Expense" 
            value="$19,270.56" 
            percent="+8%" 
            isPositive={true} 
            color="bg-[#1A1A1A]"
        />
      </div>

      {/* Cash Flow Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                     <h2 className="text-sm text-gray-400 font-medium">Cash Flow</h2>
                     <button className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2 py-1 text-[10px] text-gray-400">
                        Weekly <span className="opacity-50">▼</span>
                     </button>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">$19,270.56</div>
            </div>
            <div className="flex gap-4 items-end">
                <div className="flex bg-[#1A1A1A] rounded-xl p-1 border border-[#2A2A2A]">
                    {['Income', 'Expense', 'Saving'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                activeTab === tab 
                                ? 'bg-[#2A2A2A] text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-gray-400">
                        <BarChart2Icon size={16} />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-gray-400">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
        </div>

        {/* Chart */}
        <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CASHFLOW} barSize={40}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2A2A2A" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#1A1A1A" stopOpacity={0.4}/>
                        </linearGradient>
                        <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF5F00" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#FF5F00" stopOpacity={0.2}/>
                        </linearGradient>
                    </defs>
                    {/* Dashed Lines Background */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
                    
                    {/* Y Axis Customization */}
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#4B5563', fontSize: 10}} 
                        domain={[0, 60]}
                        tickCount={5}
                        hide={false}
                        width={30}
                    />
                    
                    <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                        {MOCK_CASHFLOW.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={index === 8 ? "url(#activeBarGradient)" : "url(#barGradient)"} 
                                stroke={index === 8 ? "none" : "#333"}
                                strokeWidth={index === 8 ? 0 : 1}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            
            {/* Popover on active bar (hardcoded for demo/pixel-perfect look) */}
            <div className="absolute top-[30px] left-[72%] -translate-x-1/2 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="px-3 py-1 bg-[#1A1A1A] border border-[#333] rounded-lg text-white text-xs font-bold shadow-xl mb-2 relative">
                    $16,251
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#1A1A1A] border-r border-b border-[#333] rotate-45"></div>
                </div>
                <div className="w-3 h-3 bg-white rounded-full border-2 border-brand-orange shadow-[0_0_10px_rgba(255,95,0,0.8)] z-10"></div>
            </div>
        </div>
      </div>

      {/* Bottom Table Section */}
      <div className="bg-[#101010] rounded-3xl p-6 border border-[#1A1A1A]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search Anything..." 
                    className="w-full bg-[#1A1A1A] text-gray-200 text-xs py-3 pl-10 pr-10 rounded-xl border border-[#2A2A2A] focus:outline-none focus:border-gray-700 transition-all placeholder:text-gray-600"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    <Filter size={14} />
                </button>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#2A2A2A] text-gray-300 text-xs font-medium hover:bg-[#1A1A1A] transition-colors flex items-center justify-center gap-2">
                    <Upload size={14} /> Export
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#2A2A2A] text-gray-300 text-xs font-medium hover:bg-[#1A1A1A] transition-colors flex items-center justify-center gap-2">
                    <Download size={14} /> Export
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-[#2A2A2A]">
                        <th className="p-4 pl-0 w-8">
                            <div className="w-5 h-5 rounded-md border border-[#333] cursor-pointer"></div>
                        </th>
                        <th className="p-4 text-xs font-medium text-gray-500">Payment ID</th>
                        <th className="p-4 text-xs font-medium text-gray-500">User</th>
                        <th className="p-4 text-xs font-medium text-gray-500">Total Amount</th>
                        <th className="p-4 text-xs font-medium text-gray-500">Payment Period</th>
                        <th className="p-4 text-xs font-medium text-gray-500">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                     <TableRow 
                        id="PAY-12345XYZ" 
                        user="Savannah Nguyen" 
                        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"
                        amount="$1,164.99 USD" 
                        period="Jun 10 - Jun 15" 
                        status="Received"
                        statusColor="bg-[#142A1E] text-[#22C55E] border-[#143220]"
                     />
                     <TableRow 
                        id="TXN-98765A9" 
                        user="Jordan Lee" 
                        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64"
                        amount="$1,072.98 USD" 
                        period="Jun 16 - Jun 17" 
                        status="Failed"
                        statusColor="bg-[#2A1414] text-[#EF4444] border-[#321414]"
                     />
                     <TableRow 
                        id="INV-56789LMN" 
                        user="Alexis Kim" 
                        avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=64&h=64"
                        amount="$977.98 USD" 
                        period="Jun 20 - Jun 29" 
                        status="Processed"
                        statusColor="bg-[#2A2414] text-[#EAB308] border-[#322814]"
                     />
                     <TableRow 
                        id="PAY-88461QWE" 
                        user="Thanh Tra" 
                        avatar="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64"
                        amount="$542.00 USD" 
                        period="Jul 02 - Jul 05" 
                        status="Processed"
                        statusColor="bg-[#2A2414] text-[#EAB308] border-[#322814]"
                     />
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

// Sub-components
const StatCard = ({ title, value, percent, isPositive, color }: any) => (
    <div className={`rounded-2xl p-6 ${color} border border-[#2A2A2A] relative overflow-hidden group hover:border-[#333] transition-colors`}>
        <div className="relative z-10">
            <p className="text-gray-400 text-xs font-medium mb-4">{title}</p>
            <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white tracking-wide">{value}</span>
                <span className="px-3 py-1 bg-[#111] border border-[#333] rounded-full text-xs font-medium text-gray-300">
                    {percent}
                </span>
            </div>
        </div>
    </div>
);

const TableRow = ({ id, user, avatar, amount, period, status, statusColor }: any) => (
    <tr className="group hover:bg-[#1A1A1A] transition-colors">
        <td className="p-4 pl-0">
            <div className="w-5 h-5 rounded-md border border-[#333] group-hover:border-gray-500 cursor-pointer"></div>
        </td>
        <td className="p-4 text-xs text-gray-300 font-mono tracking-wide">{id}</td>
        <td className="p-4">
            <div className="flex items-center gap-3">
                <img src={avatar} alt={user} className="w-8 h-8 rounded-full border border-[#333]" />
                <span className="text-xs font-medium text-gray-200">{user}</span>
            </div>
        </td>
        <td className="p-4 text-xs font-medium text-gray-200">{amount}</td>
        <td className="p-4 text-xs text-gray-400">{period}</td>
        <td className="p-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-medium border ${statusColor}`}>
                {status}
            </span>
        </td>
    </tr>
);

const BarChart2Icon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
);

export default FinancialDashboard;
