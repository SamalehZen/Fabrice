import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { Users, MapPin, Smile, Car, Download, Calendar, Filter, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SurveyDataset } from '../types';
import { COLORS, SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';

interface DashboardProps {
  data: SurveyDataset;
}

// Custom Tooltip Component for a premium look
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-100 text-sm">
        <p className="font-bold text-slate-800 mb-1">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
            <span className="text-slate-500 capitalize">{entry.name}:</span>
            <span className="font-mono font-semibold text-slate-700">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  
  // Calculations
  const totalRespondents = data.ageGroups.reduce((acc, curr) => acc + curr.value, 0);
  
  const totalSatisfaction = data.satisfaction.reduce((acc, curr) => acc + curr.value, 0);
  const positiveSatisfaction = data.satisfaction
    .filter(s => s.name === 'Satisfait' || s.name === 'Très satisfait')
    .reduce((acc, curr) => acc + curr.value, 0);
  const satisfactionRate = totalSatisfaction > 0 ? Math.round((positiveSatisfaction / totalSatisfaction) * 100) : 0;

  const topZone = [...data.zones].sort((a, b) => b.value - a.value)[0];
  const topZonePercent = totalRespondents > 0 ? Math.round((topZone.value / totalRespondents) * 100) : 0;

  const topTransport = [...data.transport].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="space-y-6 p-6">
      
      {/* Dashboard Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Analytics Overview</h2>
          <p className="text-xs text-slate-500">Real-time survey insights</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 border border-slate-200 transition-colors">
            <Calendar size={16} />
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 border border-slate-200 transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 shadow-sm shadow-brand-200 transition-all hover:scale-105">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Card 1: Total Respondents */}
         <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-200 group transition-all hover:shadow-xl hover:-translate-y-1">
           <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                 <Users size={20} className="text-white" />
               </div>
               <span className="flex items-center text-xs font-medium bg-green-400/20 text-green-100 px-2 py-1 rounded-full border border-green-400/30">
                 <TrendingUp size={12} className="mr-1" /> +12%
               </span>
             </div>
             <p className="text-brand-100 text-xs font-medium uppercase tracking-wider mb-1">Total Respondents</p>
             <h3 className="text-4xl font-bold tracking-tight">{totalRespondents}</h3>
           </div>
         </div>

         {/* Card 2: Satisfaction */}
         <div className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-100 shadow-sm group transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-green-50 rounded-lg">
                 <Smile size={20} className="text-green-600" />
               </div>
               <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                 <ArrowUpRight size={12} className="mr-1" /> High
               </span>
             </div>
             <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Satisfaction Rate</p>
             <h3 className="text-3xl font-bold text-slate-800">{satisfactionRate}%</h3>
             <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${satisfactionRate}%` }}></div>
             </div>
         </div>

         {/* Card 3: Top Zone */}
         <div className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-100 shadow-sm group transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-purple-50 rounded-lg">
                 <MapPin size={20} className="text-purple-600" />
               </div>
               <div className="text-right">
                  <span className="text-2xl font-bold text-slate-800 block leading-none">{topZonePercent}%</span>
                  <span className="text-[10px] text-slate-400 font-medium">OF TOTAL</span>
               </div>
             </div>
             <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Top Zone</p>
             <h3 className="text-xl font-bold text-slate-800 truncate" title={topZone.name}>{topZone.name}</h3>
         </div>

         {/* Card 4: Top Transport */}
         <div className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-100 shadow-sm group transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-orange-50 rounded-lg">
                 <Car size={20} className="text-orange-600" />
               </div>
             </div>
             <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Main Transport</p>
             <h3 className="text-xl font-bold text-slate-800 truncate">{topTransport.name}</h3>
             <p className="text-xs text-orange-600 mt-1 font-medium flex items-center">
                Most popular choice
             </p>
         </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Market Share / Competitors - Hero Chart */}
        <ChartCard title="Market Share Analysis" subtitle="Bawadi Mall vs Competitors (Visits)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.competitors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorBarHighlight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {data.competitors.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Bawadi Mall' ? 'url(#colorBarHighlight)' : '#cbd5e1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Demographics Radar - Cool Visualization */}
        <ChartCard title="Demographic Profile" subtitle="Age Distribution Overview">
          <ResponsiveContainer width="100%" height="100%">
             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.ageGroups}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar
                name="Respondents"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="#8b5cf6"
                fillOpacity={0.4}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Visit Frequency Trend */}
        <ChartCard title="Visit Frequency" subtitle="Customer retention pattern">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.frequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorFreq)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Satisfaction Detail */}
        <ChartCard title="Satisfaction Breakdown" subtitle="Detailed customer sentiment">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.satisfaction}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.satisfaction.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
               <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-slate-800">
                {satisfactionRate}%
              </text>
               <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-slate-400 font-medium uppercase tracking-wide">
                Approval
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Transport Split */}
        <ChartCard title="Arrival Methods" subtitle="Transportation distribution">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart 
                layout="vertical" 
                data={data.transport} 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
           </ResponsiveContainer>
        </ChartCard>

         {/* Preferred Departments - Full Width Bottom */}
         <ChartCard title="Department Popularity" subtitle="Footfall by section" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.preferredDepartment} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} fill="url(#colorDept)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
};

export default Dashboard;