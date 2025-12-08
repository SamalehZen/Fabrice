import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  Users,
  MapPin,
  Smile,
  Zap,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Activity,
  Droplets,
  Clock,
  ChevronDown
} from 'lucide-react';
import { SurveyDataset, SimpleDataPoint } from '../types';
import { SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';
import * as XLSX from 'xlsx';

interface DashboardProps {
  data: SurveyDataset;
}

const QUESTION_META = {
  q0: { title: 'Démographie', subtitle: 'Répartition des âges' },
  q2: { title: 'Transport', subtitle: 'Accès au centre' },
  q3: { title: 'Fréquence', subtitle: 'Visites mensuelles' },
  q5: { title: 'Concurrence', subtitle: 'Parts de marché' },
  q7: { title: 'Satisfaction', subtitle: 'Expérience client' },
  q8: { title: 'Rayons', subtitle: 'Zones chaudes' }
};

// Custom minimal tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 text-sm">
        <p className="font-bold text-slate-800 mb-1">{label || payload[0].name}</p>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 capitalize">{payload[0].name}:</span>
          <span className="font-bold text-slate-900">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  
  // Filtering logic
  const filteredData = useMemo(() => {
    if (selectedZone === 'All') return data;
    const totalRespondents = data.zones.reduce((acc, curr) => acc + curr.value, 0);
    const zoneData = data.zones.find(z => z.name === selectedZone);
    const zoneValue = zoneData ? zoneData.value : 0;
    if (totalRespondents === 0 || zoneValue === 0) return data;
    const ratio = zoneValue / totalRespondents;
    const scaleDataset = (dataset: SimpleDataPoint[]) => {
      return dataset.map(item => ({
        ...item,
        value: Math.round(item.value * ratio)
      }));
    };
    return {
      ...data,
      ageGroups: scaleDataset(data.ageGroups),
      zones: data.zones.map(z => ({ ...z, value: z.name === selectedZone ? z.value : 0 })),
      transport: scaleDataset(data.transport),
      frequency: scaleDataset(data.frequency),
      visitReason: scaleDataset(data.visitReason),
      competitors: scaleDataset(data.competitors),
      choiceReason: scaleDataset(data.choiceReason),
      satisfaction: scaleDataset(data.satisfaction),
      preferredDepartment: scaleDataset(data.preferredDepartment),
      nameChangeAwareness: scaleDataset(data.nameChangeAwareness),
      experienceChanges: data.experienceChanges.map(item => ({
        ...item,
        positive: Math.round(item.positive * ratio),
        negative: Math.round(item.negative * ratio)
      }))
    };
  }, [data, selectedZone]);

  const totalRespondents = filteredData.zones.reduce((acc, curr) => acc + curr.value, 0);
  const totalSatisfaction = filteredData.satisfaction.reduce((acc, curr) => acc + curr.value, 0);
  const positiveSatisfaction = filteredData.satisfaction
    .filter(s => s.name.includes('Satisfait'))
    .reduce((acc, curr) => acc + curr.value, 0);
  const satisfactionRate = totalSatisfaction > 0 ? Math.round((positiveSatisfaction / totalSatisfaction) * 100) : 0;

  const handleExportXLSX = () => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];
    const addSheet = (rows: any[], name: string) => {
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name);
    };
    addSheet(filteredData.ageGroups, 'Ages');
    addSheet(filteredData.satisfaction, 'Satisfaction');
    XLSX.writeFile(wb, `Hyper_Analyse_${selectedZone}_${dateStr}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header / Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md p-2 rounded-[2rem] pl-6 pr-2 sticky top-0 z-20 shadow-sm border border-white/50">
         <div>
            <h1 className="text-xl font-bold text-slate-900">Aperçu Global</h1>
            <p className="text-xs text-slate-400 font-medium">Analyse des performances</p>
         </div>
         
         <div className="flex gap-2">
            <div className="relative group">
              <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-3xl text-sm font-semibold text-slate-600 shadow-sm hover:shadow-md transition-all border border-slate-100">
                <Filter size={16} />
                {selectedZone === 'All' ? 'Toutes les zones' : selectedZone}
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {/* Dropdown would go here - simplified for jam */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-30">
                 <button onClick={() => setSelectedZone('All')} className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600">Tout voir</button>
                 {data.zones.map(z => (
                   <button key={z.name} onClick={() => setSelectedZone(z.name)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600">{z.name}</button>
                 ))}
              </div>
            </div>

            <button onClick={handleExportXLSX} className="flex items-center gap-2 px-5 py-3 bg-[#D4E157] text-slate-900 rounded-3xl text-sm font-bold shadow-lg shadow-[#D4E157]/20 hover:shadow-[#D4E157]/40 transition-all">
               <Download size={18} />
               <span>Exporter</span>
            </button>
         </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Col: Main Chart (2/3) */}
         <div className="col-span-1 lg:col-span-2 space-y-6">
            
            {/* Main Activity Chart - The "Month Activity" Look */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Activité Magasin</h2>
                    <div className="flex gap-4 mt-2">
                       <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                         <div className="w-2 h-2 rounded-full bg-[#D4E157]"></div> Visites
                       </span>
                       <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                         <div className="w-2 h-2 rounded-full bg-slate-200"></div> Prévisions
                       </span>
                    </div>
                  </div>
                  <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                     <ArrowUpRight size={20} />
                  </button>
               </div>
               
               {/* Calendar-like header decoration */}
               <div className="flex justify-between mb-6 text-sm text-slate-400 font-medium px-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <span key={d}>{d}</span>)}
               </div>

               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredData.frequency}>
                      <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={20}>
                        {filteredData.frequency.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#D4E157' : '#F1F5F9'} />
                        ))}
                      </Bar>
                      <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Satisfaction & Departments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ChartCard title={QUESTION_META.q7.title} subtitle={QUESTION_META.q7.subtitle}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredData.satisfaction}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80}
                        paddingAngle={5}
                        dataKey="value" stroke="none"
                      >
                        {filteredData.satisfaction.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-slate-800">
                        {satisfactionRate}%
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
               </ChartCard>

               <ChartCard title={QUESTION_META.q8.title} subtitle={QUESTION_META.q8.subtitle}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData.preferredDepartment}>
                      <defs>
                        <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A7C7E7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#A7C7E7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#A7C7E7" strokeWidth={4} fill="url(#colorDept)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </ChartCard>
            </div>
         </div>

         {/* Right Col: Widgets & KPI (1/3) */}
         <div className="col-span-1 space-y-6">
            
            {/* Widget Row - Like the 'Running' / 'Hydration' in reference */}
            <div className="grid grid-cols-2 gap-4">
               {/* 1. Total KPI Widget */}
               <div className="bg-white p-6 rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-4">
                     <Users size={20} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{totalRespondents}</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase mt-1">Participants</p>
                  <p className="text-xs text-green-500 font-bold mt-3">+12% vs N-1</p>
               </div>

               {/* 2. Water / Satisfaction Style Widget */}
               <div className="bg-[#E3F2FD] p-6 rounded-[2.2rem] shadow-none hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-20 h-20 bg-blue-300/20 rounded-full blur-xl"></div>
                   <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center text-blue-500 mb-4 backdrop-blur-sm">
                     <Droplets size={20} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{satisfactionRate}%</h3>
                  <p className="text-xs text-slate-500 font-medium uppercase mt-1">Satisfaction</p>
                   <div className="w-full bg-white/50 h-1.5 rounded-full mt-4 overflow-hidden">
                     <div className="bg-blue-400 h-full rounded-full" style={{width: `${satisfactionRate}%`}}></div>
                  </div>
               </div>
            </div>

            {/* "Your Power" Hero Card Replacement */}
            <div className="relative h-[300px] rounded-[2.5rem] overflow-hidden group shadow-lg shadow-green-900/10">
               {/* Background Image / Gradient */}
               <div className="absolute inset-0 bg-gradient-to-br from-[#81C784] to-[#4CAF50]"></div>
               <img 
                 src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" 
                 alt="Store"
                 className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700"
               />
               
               <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="flex gap-2 mb-2">
                     <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">AI Powered</span>
                  </div>
                  <h3 className="text-3xl font-bold leading-tight mb-2">Comprendre<br/>Votre Client.</h3>
                  <p className="text-green-50 text-sm font-medium max-w-[80%]">L'analyse prédictive montre une hausse fréquentation le week-end prochain.</p>
                  
                  {/* Indicators at bottom */}
                  <div className="flex gap-2 mt-6">
                     <div className="w-8 h-1 bg-white rounded-full"></div>
                     <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                     <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                  </div>
               </div>
            </div>

            {/* Secondary Chart Card - Competitors */}
            <ChartCard title={QUESTION_META.q5.title} subtitle={QUESTION_META.q5.subtitle}>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={filteredData.competitors} layout="vertical" margin={{left: 10, right: 10}}>
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                   <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={16} fill="#CBD5E1">
                      {filteredData.competitors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Bawadi Mall' ? '#3B82F6' : '#E2E8F0'} />
                      ))}
                   </Bar>
                   <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                 </BarChart>
               </ResponsiveContainer>
            </ChartCard>

         </div>
      </div>
    </div>
  );
};

// Icon helper
const ArrowUpRight = ({size}: {size:number}) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
);

export default Dashboard;