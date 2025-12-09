import React, { useState, useMemo, useCallback } from 'react';
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
  PolarRadiusAxis,
  ReferenceLine
} from 'recharts';
import { 
  Users, MapPin, Smile, Car, Download, Calendar, Filter, 
  TrendingUp, ArrowUpRight, Check, ChevronDown, Bus, Footprints, 
  CircleDot, ShoppingBag, ShoppingCart, Award, Clock
} from 'lucide-react';
import { SurveyDataset, SimpleDataPoint } from '../types';
import { SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';
import FrequencyTrendChart from './FrequencyTrendChart';
import * as XLSX from 'xlsx';

interface DashboardProps {
  data: SurveyDataset;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string; payload?: any }>;
  label?: string;
}

// Complete metadata for all questions Q0-Q10
const QUESTION_META = {
  q0: { title: 'Q0 • Répartition des âges', subtitle: "Démographie des visiteurs" },
  q1: { title: 'Q1 • Zone de résidence', subtitle: "Origine géographique" },
  q2: { title: 'Q2 • Moyen de transport', subtitle: 'Mode d\'accès au centre' },
  q3: { title: 'Q3 • Fréquence de visite', subtitle: "Fidélité de la clientèle" },
  q4: { title: 'Q4 • Motif principal', subtitle: "Raison de la venue aujourd'hui" },
  q5: { title: 'Q5 • Magasin fréquenté', subtitle: 'Leader du marché actuel' },
  q6: { title: 'Q6 • Raison du choix', subtitle: 'Critères de décision' },
  q7: { title: 'Q7 • Satisfaction', subtitle: 'Expérience client globale' },
  q8: { title: 'Q8 • Rayon préféré', subtitle: 'Catégories attractives' },
  q9: { title: 'Q9 • Notoriété nom', subtitle: 'Impact du rebranding' },
  q10: { title: 'Q10 • Evolution', subtitle: 'Perception des changements' },
} as const;

// Custom Tooltip with Glassmorphism
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  // Handle difference in payload structure for different charts
  const title = label || payload[0].payload.name || payload[0].name;

  return (
    <div
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/20 dark:border-slate-700 text-sm z-50"
      role="tooltip"
    >
      <p className="font-bold text-slate-800 dark:text-white mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
        {title}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 min-w-[120px] py-1">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/20" 
              style={{ backgroundColor: entry.color || entry.fill }} 
            />
            <span className="text-slate-600 dark:text-slate-300 capitalize text-xs font-medium">
              {entry.name === 'positive' ? 'Positif' : entry.name === 'negative' ? 'Négatif' : entry.name || 'Valeur'}
            </span>
          </div>
          <span className="font-mono font-bold text-slate-800 dark:text-white">
            {Math.abs(Number(entry.value))}
          </span>
        </div>
      ))}
    </div>
  );
};

// Premium Colors
const GOLD_GRADIENT = "url(#goldGradient)";
const BLUE_GRADIENT = "url(#blueGradient)";
const PURPLE_GRADIENT = "url(#purpleGradient)";

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Scaling logic (same as original)
  const scaleDataset = useCallback((dataset: SimpleDataPoint[], ratio: number): SimpleDataPoint[] => {
    return dataset.map((item) => ({
      ...item,
      value: Math.round(item.value * ratio),
    }));
  }, []);

  const filteredData = useMemo(() => {
    if (selectedZone === 'All') return data;
    const totalRespondents = data.zones.reduce((acc, curr) => acc + curr.value, 0);
    const zoneData = data.zones.find((z) => z.name === selectedZone);
    const zoneValue = zoneData?.value || 0;
    if (totalRespondents === 0 || zoneValue === 0) return data;
    const ratio = zoneValue / totalRespondents;

    return {
      ...data,
      ageGroups: scaleDataset(data.ageGroups, ratio),
      zones: data.zones.map((z) => ({ ...z, value: z.name === selectedZone ? z.value : 0 })),
      transport: scaleDataset(data.transport, ratio),
      frequency: scaleDataset(data.frequency, ratio),
      visitReason: scaleDataset(data.visitReason, ratio),
      competitors: scaleDataset(data.competitors, ratio),
      choiceReason: scaleDataset(data.choiceReason, ratio),
      satisfaction: scaleDataset(data.satisfaction, ratio),
      preferredDepartment: scaleDataset(data.preferredDepartment, ratio),
      nameChangeAwareness: scaleDataset(data.nameChangeAwareness, ratio),
      experienceChanges: data.experienceChanges.map((item) => ({
        ...item,
        positive: Math.round(item.positive * ratio),
        negative: Math.round(item.negative * ratio),
      })),
    };
  }, [data, selectedZone, scaleDataset]);

  // KPIs
  const stats = useMemo(() => {
    const totalRespondents = filteredData.zones.reduce((acc, curr) => acc + curr.value, 0);
    const totalSatisfaction = filteredData.satisfaction.reduce((acc, curr) => acc + curr.value, 0);
    const positiveSatisfaction = filteredData.satisfaction
      .filter((s) => s.name === 'Satisfait' || s.name === 'Très satisfait')
      .reduce((acc, curr) => acc + curr.value, 0);
    const satisfactionRate = totalSatisfaction > 0 ? Math.round((positiveSatisfaction / totalSatisfaction) * 100) : 0;
    const topZone = [...filteredData.zones].sort((a, b) => b.value - a.value)[0] || { name: 'N/A', value: 0 };
    const topTransport = [...filteredData.transport].sort((a, b) => b.value - a.value)[0] || { name: 'N/A', value: 0 };
    return { totalRespondents, satisfactionRate, topZone, topTransport };
  }, [filteredData]);

  // Export
  const handleExportXLSX = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];
    const addSheet = (rows: any[], name: string) => {
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name);
    };
    Object.keys(filteredData).forEach(key => {
      if (Array.isArray(filteredData[key as keyof SurveyDataset])) {
         addSheet(filteredData[key as keyof SurveyDataset], key);
      }
    });
    XLSX.writeFile(wb, `Hyper_Analyse_${selectedZone}_${dateStr}.xlsx`);
  }, [filteredData, selectedZone]);

  // Data processing for butterfly chart (Q10)
  const experienceData = useMemo(() => {
    return filteredData.experienceChanges.map(item => ({
      ...item,
      negativeVal: -Math.abs(item.negative) // Use negative values for left side
    }));
  }, [filteredData.experienceChanges]);

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1920px] mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
      
      {/* Header & Filters */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 sticky top-4 z-40">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 shadow-lg shadow-purple-500/30 animate-gradient-xy">
            <TrendingUp size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white tracking-tight">
              Tableau de Bord
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Analyse 360° du centre commercial</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-700/50">
                Premium
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm">
             <Calendar size={16} className="text-amber-500" />
             <span className="text-slate-600 dark:text-slate-300">Cette semaine</span>
          </div>

          <div className="relative z-50">
             <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg hover:scale-105 transition-transform"
             >
                <Filter size={16} />
                <span>{selectedZone === 'All' ? 'Toutes zones' : selectedZone}</span>
                <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
             </button>
             {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Filtrer par résidence</div>
                    {['All', ...data.zones.map(z => z.name)].map((zone) => (
                      <button
                        key={zone}
                        onClick={() => { setSelectedZone(zone); setIsFilterOpen(false); }}
                        className="w-full text-left px-5 py-3 text-sm font-medium flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className={selectedZone === zone ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}>
                          {zone === 'All' ? 'Global' : zone}
                        </span>
                        {selectedZone === zone && <Check size={16} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </>
             )}
          </div>

          <button onClick={handleExportXLSX} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors">
            <Download size={20} />
          </button>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* HERO KPIs Block (Top Left 2x2) */}
        <div className="col-span-1 md:col-span-2 row-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Visiteurs', val: stats.totalRespondents, icon: Users, color: 'from-blue-500 to-indigo-600', sub: 'Total panel' },
            { label: 'Satisfaction', val: `${stats.satisfactionRate}%`, icon: Smile, color: 'from-emerald-400 to-green-600', sub: 'Score global' },
            { label: 'Top Zone', val: stats.topZone.name, icon: MapPin, color: 'from-violet-500 to-purple-600', sub: `${stats.topZone.value} pers.` },
            { label: 'Accès Principal', val: stats.topTransport.name, icon: Car, color: 'from-amber-400 to-orange-600', sub: 'Majoritaire' }
          ].map((kpi, i) => (
            <div key={i} className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${kpi.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg mb-3`}>
                <kpi.icon size={20} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white truncate">{kpi.val}</p>
                <p className="text-[10px] items-center gap-1 text-slate-400 font-medium mt-1 flex">
                   <TrendingUp size={10} className="text-green-500" /> {kpi.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Q0 Age (Top Row) */}
        <ChartCard title={QUESTION_META.q0.title} subtitle={QUESTION_META.q0.subtitle} className="col-span-1 min-h-[200px]">
           <ResponsiveContainer width="100%" height="100%">
             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={filteredData.ageGroups}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <Radar name="Visiteurs" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.3} />
                <Tooltip content={<CustomTooltip />} />
             </RadarChart>
           </ResponsiveContainer>
        </ChartCard>

        {/* Q1 Zones (Top Row) */}
        <ChartCard title={QUESTION_META.q1.title} subtitle={QUESTION_META.q1.subtitle} className="col-span-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
             <PieChart>
                <Pie data={filteredData.zones} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                   {filteredData.zones.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'][index % 5]} />
                   ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} fontSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize:'10px'}} />
             </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Q2 Transport */}
        <ChartCard title={QUESTION_META.q2.title} subtitle={QUESTION_META.q2.subtitle} className="col-span-1">
           <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2">
              {filteredData.transport.sort((a,b)=>b.value-a.value).map((t, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white hover:shadow-md transition-all">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                       {t.name.includes('Taxi') ? <Bus size={18}/> : t.name.includes('Pied') ? <Footprints size={18}/> : <Car size={18}/>}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between mb-1">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.name}</span>
                          <span className="text-sm font-mono text-slate-500">{t.value}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(t.value / stats.totalRespondents) * 100}%` }} />
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </ChartCard>

        {/* Q3 Frequency */}
        <ChartCard title={QUESTION_META.q3.title} subtitle={QUESTION_META.q3.subtitle} className="col-span-1">
           <FrequencyTrendChart data={filteredData.frequency} />
        </ChartCard>

        {/* Q4 Visit Reason */}
        <ChartCard title={QUESTION_META.q4.title} subtitle={QUESTION_META.q4.subtitle} className="col-span-1 md:col-span-2">
            <ResponsiveContainer width="100%" height={250}>
               <BarChart layout="vertical" data={filteredData.visitReason} margin={{left: 40}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                     {filteredData.visitReason.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#06b6d4', '#14b8a6', '#10b981'][index % 4]} />
                     ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
        </ChartCard>

        {/* Q5 Competitors - FULL WIDTH */}
        <ChartCard title={QUESTION_META.q5.title} subtitle={QUESTION_META.q5.subtitle} className="col-span-1 md:col-span-2 lg:col-span-4 min-h-[400px]">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData.competitors} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                 <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                       <stop offset="100%" stopColor="#d97706" stopOpacity={0.4}/>
                    </linearGradient>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                       <stop offset="100%" stopColor="#2563eb" stopOpacity={0.4}/>
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                 <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                 <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50} animationDuration={1500}>
                    {filteredData.competitors.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.name === 'Bawadi Mall' ? "url(#goldGradient)" : "url(#blueGradient)"} />
                    ))}
                 </Bar>
              </BarChart>
           </ResponsiveContainer>
        </ChartCard>

        {/* Q6 Choice Reason */}
        <ChartCard title={QUESTION_META.q6.title} subtitle={QUESTION_META.q6.subtitle} className="col-span-1 md:col-span-2 lg:col-span-1">
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                 <Pie data={filteredData.choiceReason} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {filteredData.choiceReason.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'][index % 5]} />
                    ))}
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
                 <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-slate-700 dark:fill-white">
                    Choix
                 </text>
              </PieChart>
           </ResponsiveContainer>
        </ChartCard>

        {/* Q7 Satisfaction */}
        <ChartCard title={QUESTION_META.q7.title} subtitle={QUESTION_META.q7.subtitle} className="col-span-1 md:col-span-2 lg:col-span-2">
           <div className="flex flex-row items-center justify-between h-full">
              <div className="w-1/2 h-full flex items-center justify-center relative">
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                       <Pie data={filteredData.satisfaction} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={100} paddingAngle={2} dataKey="value">
                          {filteredData.satisfaction.map((_, index) => (
                             <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index]} stroke="none" />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                    <span className="text-5xl font-black text-slate-800 dark:text-white">{stats.satisfactionRate}%</span>
                    <span className="text-sm font-bold text-green-500 uppercase tracking-widest mt-2">Positif</span>
                 </div>
              </div>
              <div className="w-1/2 space-y-3">
                 {filteredData.satisfaction.slice().reverse().map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SATISFACTION_COLORS[3-i] }} />
                       <div className="flex-1">
                          <div className="flex justify-between text-xs font-medium mb-1">
                             <span className="text-slate-600 dark:text-slate-300">{s.name}</span>
                             <span className="text-slate-900 dark:text-white">{Math.round((s.value / stats.totalRespondents) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full rounded-full" style={{ width: `${(s.value / stats.totalRespondents) * 100}%`, backgroundColor: SATISFACTION_COLORS[3-i] }} />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </ChartCard>

        {/* Q8 Departments */}
        <ChartCard title={QUESTION_META.q8.title} subtitle={QUESTION_META.q8.subtitle} className="col-span-1 md:col-span-2 lg:col-span-1">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={filteredData.preferredDepartment} margin={{top:10, right:0, left:0, bottom:0}}>
               <defs>
                 <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                   <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05}/>
                 </linearGradient>
               </defs>
               <Tooltip content={<CustomTooltip />} />
               <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} fill="url(#colorDept)" />
             </AreaChart>
           </ResponsiveContainer>
        </ChartCard>

        {/* Q9 Name Change */}
        <ChartCard title={QUESTION_META.q9.title} subtitle={QUESTION_META.q9.subtitle} className="col-span-1 md:col-span-2">
           <div className="flex items-center justify-center h-full gap-8">
              {filteredData.nameChangeAwareness.map((item, i) => (
                 <div key={i} className={`flex flex-col items-center p-6 rounded-2xl border-2 ${item.name === 'Oui' ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10' : 'border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700'}`}>
                    <span className={`text-5xl font-black mb-2 ${item.name === 'Oui' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                       {Math.round((item.value / stats.totalRespondents) * 100)}%
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{item.name} a remarqué</span>
                    <span className="text-xs text-slate-400 mt-1">{item.value} personnes</span>
                 </div>
              ))}
           </div>
        </ChartCard>

        {/* Q10 Experience Changes (Butterfly Chart) */}
        <ChartCard title={QUESTION_META.q10.title} subtitle={QUESTION_META.q10.subtitle} className="col-span-1 md:col-span-2">
           <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={experienceData} stackOffset="sign" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="category" type="category" width={80} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} interval={0} />
                 <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                 <ReferenceLine x={0} stroke="#94a3b8" />
                 <Bar dataKey="negativeVal" name="negative" fill="#ef4444" radius={[4, 0, 0, 4]} barSize={30}>
                    {experienceData.map((entry, index) => (
                       <Cell key={`cell-neg-${index}`} fill="#ef4444" fillOpacity={0.7} />
                    ))}
                 </Bar>
                 <Bar dataKey="positive" name="positive" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={30}>
                    {experienceData.map((entry, index) => (
                       <Cell key={`cell-pos-${index}`} fill="#22c55e" fillOpacity={0.7} />
                    ))}
                 </Bar>
              </BarChart>
           </ResponsiveContainer>
           <div className="flex justify-center gap-8 mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full" /> Négatif / Moins</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> Positif / Plus</span>
           </div>
        </ChartCard>

      </div>
    </div>
  );
};

export default Dashboard;