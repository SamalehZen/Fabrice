import React, { useState, useMemo, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
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
  RadialBarChart,
  RadialBar,
  ReferenceLine,
} from 'recharts';
import { 
  Users, MapPin, Smile, Car, Download, Calendar, Filter, 
  TrendingUp, ArrowUpRight, Check, ChevronDown, Bus, Footprints, 
  CircleDot, ShoppingBag, ShoppingCart, Tag, Megaphone,
  Briefcase, Heart, Activity, Star
} from 'lucide-react';
import { SurveyDataset, SimpleDataPoint } from '../types';
import * as XLSX from 'xlsx';

// --- Constants & Config ---
const COLORS = {
  primary: '#6366f1',   // Indigo 500
  secondary: '#8b5cf6', // Violet 500
  accent: '#ec4899',    // Pink 500
  success: '#10b981',   // Emerald 500
  warning: '#f59e0b',   // Amber 500
  danger: '#ef4444',    // Red 500
  slate: '#64748b',     // Slate 500
  dark: '#0f172a',      // Slate 900
};

const GRADIENTS = {
  primary: ['#0f172a', '#1e293b'],
  card: 'bg-white dark:bg-[#0f111a]',
  glass: 'backdrop-blur-xl bg-white/70 dark:bg-[#0f111a]/80',
};

// --- Interfaces ---
interface DashboardProps {
  data: SurveyDataset;
}

// --- Helper Components ---

const BentoItem = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  icon: Icon,
  accentColor = 'text-indigo-500', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  title: string; 
  subtitle: string; 
  className?: string;
  icon?: any;
  accentColor?: string;
  delay?: number;
}) => (
  <div 
    className={`
      ${GRADIENTS.card} 
      rounded-[2rem] 
      border border-slate-100 dark:border-slate-800 
      p-6 flex flex-col 
      shadow-xl shadow-slate-200/50 dark:shadow-black/40 
      transition-all duration-500 
      hover:shadow-2xl hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-700
      relative overflow-hidden group
      ${className}
    `}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Background Gradient Blob */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors duration-700" />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          {Icon && <Icon size={18} className={accentColor} />}
          {title}
        </h3>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
    </div>
    
    <div className="flex-1 min-h-[200px] w-full relative z-10">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl p-3 rounded-lg shadow-2xl border border-white/10 text-xs text-white">
      <p className="font-bold mb-1 opacity-80">{label || payload[0].name}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="opacity-70">{entry.name}:</span>
          <span className="font-mono font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- Filtering Logic (Reused & Optimized) ---
  const filteredData = useMemo(() => {
    if (selectedZone === 'All') return data;
    const totalRespondents = data.zones.reduce((acc, curr) => acc + curr.value, 0);
    const zoneData = data.zones.find((z) => z.name === selectedZone);
    const zoneValue = zoneData?.value || 0;
    if (totalRespondents === 0 || zoneValue === 0) return data;
    const ratio = zoneValue / totalRespondents;
    
    const scale = (d: SimpleDataPoint[]) => d.map(i => ({ ...i, value: Math.round(i.value * ratio) }));

    return {
      ...data,
      ageGroups: scale(data.ageGroups),
      zones: data.zones.map(z => ({ ...z, value: z.name === selectedZone ? z.value : 0 })),
      transport: scale(data.transport),
      frequency: scale(data.frequency),
      visitReason: scale(data.visitReason),
      competitors: scale(data.competitors),
      choiceReason: scale(data.choiceReason),
      satisfaction: scale(data.satisfaction),
      preferredDepartment: scale(data.preferredDepartment),
      nameChangeAwareness: scale(data.nameChangeAwareness),
      experienceChanges: data.experienceChanges.map(item => ({
        ...item,
        positive: Math.round(item.positive * ratio),
        negative: Math.round(item.negative * ratio),
      })),
    };
  }, [data, selectedZone]);

  // --- Export Logic ---
  const handleExportXLSX = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];
    const addSheet = (rows: any[], name: string) => {
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name);
    };
    Object.keys(filteredData).forEach((key, idx) => {
        if (Array.isArray((filteredData as any)[key])) {
            addSheet((filteredData as any)[key], `Q${idx}`);
        }
    });
    XLSX.writeFile(wb, `Fabrice_Report_${selectedZone}_${dateStr}.xlsx`);
  }, [filteredData, selectedZone]);

  // --- Render ---
  return (
    <div className="space-y-8 font-sans text-slate-900 dark:text-slate-100">
      
      {/* --- Filter & Action Toolbar --- */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-2 rounded-2xl border border-white/20 dark:border-white/5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                >
                    <span className="flex items-center gap-2">
                        <Filter size={16} className="text-indigo-500" />
                        {selectedZone === 'All' ? 'Toutes les zones' : selectedZone}
                    </span>
                    <ChevronDown size={14} className={`transition-transform text-slate-400 ${isFilterOpen ? 'rotate-180': ''}`} />
                </button>
                {isFilterOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden py-1">
                        <button onClick={() => { setSelectedZone('All'); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Toutes les zones</button>
                        {data.zones.map(z => (
                            <button key={z.name} onClick={() => { setSelectedZone(z.name); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">{z.name}</button>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={handleExportXLSX} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
            </button>
        </div>
      </div>


      {/* --- BENTO GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Q0: Ages - Radar Chart */}
        <BentoItem title="Q0 • Démographie" subtitle="Répartition des âges" icon={Users} accentColor="text-pink-500" className="col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={filteredData.ageGroups}>
              <PolarGrid strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Ages" dataKey="value" stroke="#ec4899" strokeWidth={3} fill="#ec4899" fillOpacity={0.5} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </BentoItem>


        {/* Q1: Zone - Horizontal list styled as bars */}
        <BentoItem title="Q1 • Zones" subtitle="Provenance des visiteurs" icon={MapPin} accentColor="text-emerald-500" className="col-span-1">
           <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {[...filteredData.zones].sort((a,b) => b.value - a.value).map((zone, idx) => {
                 const total = filteredData.zones.reduce((s, z) => s + z.value, 0) || 1;
                 const pct = Math.round((zone.value / total) * 100);
                 return (
                    <div key={zone.name} className="relative group">
                        <div className="flex justify-between text-xs font-bold mb-1 opacity-80 z-10 relative">
                            <span>{zone.name}</span>
                            <span>{pct}%</span>
                        </div>
                        <div className="pl-0 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                             <div 
                                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-1000 group-hover:bg-emerald-400" 
                                style={{ width: `${pct}%` }} 
                             />
                        </div>
                    </div>
                 )
              })}
           </div>
        </BentoItem>


        {/* Q2: Transport - Styled Icons */}
        <BentoItem title="Q2 • Transport" subtitle="Moyens d'accès" icon={Car} accentColor="text-blue-500" className="col-span-1">
            <div className="grid grid-cols-2 gap-3 h-full content-center">
                {filteredData.transport.map((t, i) => {
                    const iconMap: any = { 'Vehicule Personnel': Car, 'Taxi/Bus': Bus, 'A Pied': Footprints };
                    const Icon = iconMap[t.name] || CircleDot;
                    const isTop = i === selectedZone.length % filteredData.transport.length; // Just a visual variance
                    return (
                        <div key={t.name} className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-center transition-all ${t.value > 100 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                            <Icon size={20} className="mb-1" />
                            <span className="text-[10px] uppercase font-bold tracking-wide opacity-80">{t.name}</span>
                            <span className="text-xl font-bold">{t.value}</span>
                        </div>
                    )
                })}
            </div>
        </BentoItem>


        {/* Q3: Frequency - Radial Bar */}
        <BentoItem title="Q3 • Fréquence" subtitle="Habitudes de visite" icon={Calendar} accentColor="text-amber-500" className="col-span-1">
             <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="20%" outerRadius="100%" barSize={15} data={filteredData.frequency}>
                  <RadialBar label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 700 }} background dataKey="value" cornerRadius={10} />
                  <Tooltip content={<CustomTooltip />} />
                  {filteredData.frequency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[COLORS.warning, COLORS.primary, COLORS.secondary, COLORS.success][index % 4]} />
                  ))}
                </RadialBarChart>
             </ResponsiveContainer>
        </BentoItem>


        {/* Q4: Motifs (Visit Reason) - Treemap/Bar Hybrid - Spanning 2 cols */}
        <BentoItem title="Q4 • Motifs" subtitle="Pourquoi viennent-ils ?" icon={ShoppingBag} accentColor="text-violet-500" className="col-span-1 md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.visitReason} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                        {filteredData.visitReason.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS.secondary} fillOpacity={0.8 + (index * 0.05)} /> // Gradient effect
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </BentoItem>


        {/* Q5: Competitors - Vertical Bar - Spanning 2 cols */}
        <BentoItem title="Q5 • Concurrence" subtitle="Parts de marché" icon={Briefcase} accentColor="text-indigo-600" className="col-span-1 md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.competitors} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} interval={0} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                         {filteredData.competitors.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.name.includes("Bawadi") ? COLORS.primary : '#cbd5e1'} />
                         ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </BentoItem>


        {/* Q6: Choix - Bubble Cloud Style */}
        <BentoItem title="Q6 • Critères" subtitle="Facteurs de choix" icon={Tag} accentColor="text-cyan-500" className="col-span-1">
             <div className="flex flex-wrap gap-2 content-start h-full overflow-hidden p-2">
                {[...filteredData.choiceReason].sort((a,b) => b.value - a.value).map((reason, i) => {
                    const sizes = ['text-lg px-4 py-2', 'text-sm px-3 py-1.5', 'text-xs px-2 py-1', 'text-xs px-2 py-1', 'text-[10px] px-2 py-0.5'];
                    const styles = [
                        'bg-cyan-500 text-white shadow-cyan-500/40',
                        'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',
                        'border border-cyan-200 text-cyan-600 dark:border-cyan-800 dark:text-cyan-400',
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                        'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-500'
                    ];
                    return (
                        <div key={reason.name} className={`rounded-xl font-bold shadow-sm flex items-center gap-2 ${sizes[Math.min(i, 4)]} ${styles[Math.min(i, 4)]} hover:scale-105 transition-transform`}>
                            {reason.name}
                            <span className="opacity-60 font-mono text-[0.8em]">{reason.value}</span>
                        </div>
                    );
                })}
             </div>
        </BentoItem>


        {/* Q7: Satisfaction - Gauge */}
        <BentoItem title="Q7 • Satisfaction" subtitle="Indice de bonheur" icon={Smile} accentColor="text-green-500" className="col-span-1">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={filteredData.satisfaction}
                    cx="50%" cy="70%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="60%"
                    outerRadius="100%"
                    paddingAngle={5}
                    dataKey="value"
                 >
                    {filteredData.satisfaction.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#84cc16', '#22c55e'][index]} />
                    ))}
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
                 <text x="50%" y="65%" textAnchor="middle" className="text-3xl font-black fill-slate-800 dark:fill-white">
                     {(() => {
                        const total = filteredData.satisfaction.reduce((a,c) => a+c.value, 0) || 1;
                        const pos = filteredData.satisfaction.filter(s => s.name.includes('atisfait') && !s.name.includes('Pas')).reduce((a,c) => a+c.value, 0);
                        return Math.round(pos/total * 100) + '%';
                     })()}
                 </text>
                 <text x="50%" y="80%" textAnchor="middle" className="text-[10px] uppercase font-bold fill-slate-400">Taux positif</text>
               </PieChart>
            </ResponsiveContainer>
        </BentoItem>


        {/* Q8: Rayons - Area Chart - Large */}
        <BentoItem title="Q8 • Attractivité" subtitle="Rayons les plus visités" icon={ShoppingCart} accentColor="text-rose-500" className="col-span-1 md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData.preferredDepartment} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRayon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} interval={1} />
                    <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRayon)" />
                </AreaChart>
            </ResponsiveContainer>
        </BentoItem>


        {/* Q9: Nom - Donut Chart - Simple */}
        <BentoItem title="Q9 • Notoriété" subtitle="Changement de nom" icon={Megaphone} accentColor="text-orange-500" className="col-span-1">
             <div className="flex flex-row items-center h-full">
                <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={filteredData.nameChangeAwareness} innerRadius={30} outerRadius={50} dataKey="value" stroke="none">
                                <Cell fill="#f97316" />
                                <Cell fill="#e2e8f0" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                    {filteredData.nameChangeAwareness.map(item => (
                        <div key={item.name} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border-l-4" style={{ borderColor: item.name === 'Oui' ? '#f97316' : '#94a3b8' }}>
                             <div className="text-[10px] uppercase text-slate-400 w-full">{item.name}</div>
                             <div className="text-lg font-bold">{item.value}</div>
                        </div>
                    ))}
                </div>
             </div>
        </BentoItem>


        {/* Q10: Experience - Diverging Bar Chart - Wide */}
        <BentoItem title="Q10 • Perception" subtitle="Évolution de l'expérience" icon={Star} accentColor="text-yellow-500" className="col-span-1 md:col-span-3">
             <div className="flex flex-col h-full justify-center gap-4">
                 {filteredData.experienceChanges.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-xs font-bold">
                        <div className="w-20 text-right opacity-70">{item.labelNegative}</div>
                        <div className="flex-1 flex items-center h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                             {/* Center Line */}
                             <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600 z-10" />
                             
                             {/* Negative Bar (Right aligned in left half) */}
                             <div className="w-1/2 flex justify-end">
                                 <div 
                                    className="h-full bg-red-400/80 rounded-l-full" 
                                    style={{ width: `${(item.negative / (item.positive + item.negative)) * 100}%`, minWidth: '4px' }}
                                 />
                             </div>

                             {/* Positive Bar (Left aligned in right half) */}
                             <div className="w-1/2 flex justify-start">
                                 <div 
                                    className="h-full bg-emerald-400/80 rounded-r-full" 
                                    style={{ width: `${(item.positive / (item.positive + item.negative)) * 100}%`, minWidth: '4px' }}
                                 />
                             </div>
                        </div>
                        <div className="w-20 text-left opacity-70">{item.labelPositive}</div>
                    </div>
                 ))}
                 <div className="flex justify-center gap-8 mt-2 text-[10px] uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Négatif</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Positif</div>
                 </div>
             </div>
        </BentoItem>


      </div>    
      
      <footer className="text-center text-slate-400 dark:text-slate-600 text-xs mt-8">
        Propulsé par Hyper Analyse AI • Données temps réel
      </footer>
    </div>
  );
};

export default Dashboard;
