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
} from 'recharts';
import { 
  Users, MapPin, Smile, Car, Download, Calendar, Filter, 
  ChevronDown, Bus, Footprints, 
  CircleDot, ShoppingBag, ShoppingCart, Tag, Megaphone,
  Briefcase, Star
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
  card: 'bg-white dark:bg-[#1e1e2d]', // Slightly lighter dark theme for cards
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
      border border-slate-100 dark:border-white/5
      p-8 flex flex-col 
      shadow-xl shadow-slate-200/50 dark:shadow-black/20
      transition-all duration-500 
      hover:shadow-2xl hover:scale-[1.01] hover:border-slate-300 dark:hover:border-white/10
      relative overflow-hidden group
      ${className}
    `}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Background Gradient Blob */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors duration-700" />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          {Icon && <div className={`p-2 rounded-xl bg-slate-100 dark:bg-white/5 ${accentColor}`}><Icon size={20} /></div>}
          {title}
        </h3>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1 ml-11">{subtitle}</p>
      </div>
    </div>
    
    <div className="flex-1 min-h-[280px] w-full relative z-10">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/10 text-sm text-white">
      <p className="font-bold mb-2 opacity-80 border-b border-white/10 pb-1">{label || payload[0].name}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-3 py-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="opacity-70">{entry.name}:</span>
          <span className="font-mono font-bold bg-white/10 px-2 rounded">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- Filtering Logic ---
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1e1e2d] p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-white/5">
        <div className="pl-2">
            <h2 className="text-lg font-bold">Filtres Rapides</h2>
            <p className="text-sm text-slate-500">Affinez les données par zone géographique</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none z-30">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center justify-between gap-2 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                >
                    <span className="flex items-center gap-2">
                        <Filter size={16} className="text-indigo-500" />
                        {selectedZone === 'All' ? 'Toutes les zones' : selectedZone}
                    </span>
                    <ChevronDown size={14} className={`transition-transform text-slate-400 ${isFilterOpen ? 'rotate-180': ''}`} />
                </button>
                {isFilterOpen && (
                    <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden py-1">
                        <button onClick={() => { setSelectedZone('All'); setIsFilterOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700">Toutes les zones</button>
                        {data.zones.map(z => (
                            <button key={z.name} onClick={() => { setSelectedZone(z.name); setIsFilterOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">{z.name}</button>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={handleExportXLSX} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                <Download size={18} />
                <span className="hidden sm:inline">Export Excel</span>
            </button>
        </div>
      </div>


      {/* --- BENTO GRID LAYOUT --- */}
      {/* Changed to grid-cols-3 for larger desktop view as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Q0: Ages - Radar Chart */}
        <BentoItem title="Démographie" subtitle="Répartition des âges" icon={Users} accentColor="text-pink-500" className="col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={filteredData.ageGroups}>
              <PolarGrid strokeOpacity={0.2} stroke={COLORS.slate} />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Ages" dataKey="value" stroke="#ec4899" strokeWidth={4} fill="#ec4899" fillOpacity={0.4} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </BentoItem>


        {/* Q1: Zone - Improved List UI */}
        <BentoItem title="Zones Géographiques" subtitle="Provenance des visiteurs" icon={MapPin} accentColor="text-emerald-500" className="col-span-1">
           <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {[...filteredData.zones].sort((a,b) => b.value - a.value).map((zone, idx) => {
                 const total = filteredData.zones.reduce((s, z) => s + z.value, 0) || 1;
                 const pct = Math.round((zone.value / total) * 100);
                 return (
                    <div key={zone.name} className="relative group p-3 rounded-2xl bg-white/5 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all">
                        <div className="flex justify-between items-center mb-2 z-10 relative">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{zone.name}</span>
                            <span className="font-mono text-sm font-bold text-emerald-500">{pct}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                             <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 group-hover:scale-x-105 origin-left" 
                                style={{ width: `${pct}%` }} 
                             />
                        </div>
                    </div>
                 )
              })}
           </div>
        </BentoItem>


        {/* Q2: Transport - Improved Grid */}
        <BentoItem title="Transport" subtitle="Moyens d'accès" icon={Car} accentColor="text-blue-500" className="col-span-1">
            <div className="grid grid-cols-2 gap-4 h-full content-center">
                {filteredData.transport.map((t, i) => {
                    const iconMap: any = { 'Vehicule Personnel': Car, 'Taxi/Bus': Bus, 'A Pied': Footprints };
                    const Icon = iconMap[t.name] || CircleDot;
                    const isTop = t.value > 100; // Highlight main modes
                    return (
                        <div key={t.name} className={`p-4 rounded-3xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-300 hover:scale-105 ${isTop ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5'}`}>
                            <Icon size={28} className="mb-2" />
                            <span className="text-[11px] uppercase font-bold tracking-wide opacity-80 leading-tight">{t.name}</span>
                            <span className="text-2xl font-black tracking-tight">{t.value}</span>
                        </div>
                    )
                })}
            </div>
        </BentoItem>


        {/* Q4: Motifs - 2/3 width */}
        <BentoItem title="Motifs de Visite" subtitle="Pourquoi viennent-ils ?" icon={ShoppingBag} accentColor="text-violet-500" className="col-span-1 md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.visitReason} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                        {filteredData.visitReason.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS.secondary} fillOpacity={0.7 + (index * 0.05)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </BentoItem>


        {/* Q3: Frequency - 1/3 width, keeping it vertical */}
        <BentoItem 
            title="Fréquence" 
            subtitle="Habitudes de visite" 
            icon={Calendar} 
            accentColor="text-amber-500" 
            className="col-span-1 md:row-span-1"
        >
             <div className="flex flex-col h-full justify-between">
                <div className="flex-1 min-h-[180px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="40%" 
                            outerRadius="100%" 
                            barSize={24} 
                            data={filteredData.frequency} 
                            startAngle={180} 
                            endAngle={-180}
                        >
                            <PolarAngleAxis type="number" domain={[0, 'auto']} tick={false} />
                            <RadialBar 
                                background={{ fill: 'rgba(0,0,0,0.05)' }}
                                dataKey="value" 
                                cornerRadius={20}
                            >
                                {filteredData.frequency.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={[
                                            '#f59e0b', // Amber
                                            '#6366f1', // Indigo
                                            '#ec4899', // Pink
                                            '#10b981'  // Emerald
                                        ][index % 4]} 
                                    />
                                ))}
                            </RadialBar>
                            <Tooltip content={<CustomTooltip />} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    {filteredData.frequency.map((entry, index) => {
                        const total = filteredData.frequency.reduce((acc, curr) => acc + curr.value, 0) || 1;
                        const percent = Math.round((entry.value / total) * 100);
                        const colors = ['bg-amber-500', 'bg-indigo-500', 'bg-pink-500', 'bg-emerald-500'];
                        
                        return (
                            <div key={index} className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-slate-100 dark:border-white/5 items-center">
                                <div className={`w-1.5 h-full rounded-full ${colors[index % 4]}`} />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        {entry.name}
                                    </span>
                                    <span className="text-xl font-bold dark:text-white">
                                        {percent}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
             </div>
        </BentoItem>


        {/* Q5: Competitors - Full Width Bar Chart */}
        <BentoItem title="Concurrence" subtitle="Parts de marché" icon={Briefcase} accentColor="text-indigo-600" className="col-span-1 md:col-span-2 lg:col-span-3">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.competitors} margin={{ top: 20, right: 20, left: 20, bottom: 0 }} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} interval={0} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                         {filteredData.competitors.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.name.includes("Bawadi") ? COLORS.primary : '#cbd5e1'} />
                         ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </BentoItem>


        {/* Q6: Choix - Bubble Cloud */}
        <BentoItem title="Critères de Choix" subtitle="Facteurs de décision" icon={Tag} accentColor="text-cyan-500" className="col-span-1 lg:col-span-2">
             <div className="flex flex-wrap gap-3 content-start h-full p-2">
                {[...filteredData.choiceReason].sort((a,b) => b.value - a.value).map((reason, i) => {
                    // Larger default sizes
                    const sizes = ['text-xl px-6 py-3', 'text-lg px-5 py-2.5', 'text-base px-4 py-2', 'text-sm px-4 py-2', 'text-xs px-3 py-1.5'];
                    const styles = [
                        'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30',
                        'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',
                        'border-2 border-cyan-200 text-cyan-700 dark:border-cyan-800 dark:text-cyan-400',
                        'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
                        'bg-slate-50 text-slate-400 dark:bg-white/5 dark:text-slate-500'
                    ];
                    return (
                        <div key={reason.name} className={`rounded-xl font-bold transition-all hover:-translate-y-1 hover:shadow-lg cursor-default flex items-center gap-2 ${sizes[Math.min(i, 4)]} ${styles[Math.min(i, 4)]}`}>
                            {reason.name}
                            <span className="opacity-60 font-mono text-[0.8em]">{reason.value}</span>
                        </div>
                    );
                })}
             </div>
        </BentoItem>


        {/* Q7: Satisfaction - Gauge */}
        <BentoItem title="Satisfaction" subtitle="Indice de bonheur" icon={Smile} accentColor="text-green-500" className="col-span-1">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={filteredData.satisfaction}
                    cx="50%" cy="75%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="65%"
                    outerRadius="100%"
                    paddingAngle={3}
                    dataKey="value"
                 >
                    {filteredData.satisfaction.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#84cc16', '#22c55e'][index]} stroke="none" />
                    ))}
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
                 <text x="50%" y="70%" textAnchor="middle" className="text-4xl font-black fill-slate-800 dark:fill-white">
                     {(() => {
                        const total = filteredData.satisfaction.reduce((a,c) => a+c.value, 0) || 1;
                        const pos = filteredData.satisfaction.filter(s => s.name.includes('atisfait') && !s.name.includes('Pas')).reduce((a,c) => a+c.value, 0);
                        return Math.round(pos/total * 100) + '%';
                     })()}
                 </text>
                 <text x="50%" y="85%" textAnchor="middle" className="text-xs uppercase font-bold fill-slate-400">Taux positif global</text>
               </PieChart>
            </ResponsiveContainer>
        </BentoItem>


        {/* Q8: Rayons - Area Chart */}
        <BentoItem title="Attractivité Rayons" subtitle="Zones les plus visitées" icon={ShoppingCart} accentColor="text-rose-500" className="col-span-1 md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData.preferredDepartment} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRayon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#94a3b8'}} interval={0} angle={-15} textAnchor="end" height={60} />
                    <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorRayon)" />
                </AreaChart>
            </ResponsiveContainer>
        </BentoItem>


        {/* Q9: Nom - Donut Chart */}
        <BentoItem title="Notoriété Nom" subtitle="Changement de marque" icon={Megaphone} accentColor="text-orange-500" className="col-span-1">
             <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-48 h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={filteredData.nameChangeAwareness} innerRadius={60} outerRadius={80} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                                <Cell fill="#f97316" />
                                <Cell fill="#e2e8f0" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-black text-slate-800 dark:text-white">{filteredData.nameChangeAwareness[0].value}</span>
                         <span className="text-xs text-slate-400 uppercase">Oui</span>
                    </div>
                </div>
                <div className="flex gap-4 w-full">
                    {filteredData.nameChangeAwareness.map(item => (
                        <div key={item.name} className="flex-1 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-center border border-slate-100 dark:border-white/5">
                             <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">{item.name}</div>
                             <div className="text-lg font-bold">{item.value}</div>
                        </div>
                    ))}
                </div>
             </div>
        </BentoItem>


        {/* Q10: Experience - Diverging Bar - Full Width for Footer */}
        <BentoItem title="Perception Client" subtitle="Évolution de l'expérience" icon={Star} accentColor="text-yellow-500" className="col-span-1 md:col-span-2 lg:col-span-3">
             <div className="flex flex-col h-full justify-center gap-6">
                 {filteredData.experienceChanges.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 text-sm font-bold">
                        <div className="w-32 text-right opacity-60 dark:text-slate-300">{item.labelNegative}</div>
                        <div className="flex-1 flex items-center h-8 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden relative shadow-inner">
                             {/* Center Line */}
                             <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-600 z-10 opacity-30" />
                             
                             {/* Negative Bar */}
                             <div className="w-1/2 flex justify-end">
                                 <div 
                                    className="h-full bg-gradient-to-l from-red-400 to-red-500 rounded-l-full shadow-[0_0_10px_rgba(239,68,68,0.4)]" 
                                    style={{ width: `${(item.negative / (item.positive + item.negative)) * 100}%`, minWidth: '4px' }}
                                 />
                             </div>

                             {/* Positive Bar */}
                             <div className="w-1/2 flex justify-start">
                                 <div 
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                                    style={{ width: `${(item.positive / (item.positive + item.negative)) * 100}%`, minWidth: '4px' }}
                                 />
                             </div>
                        </div>
                        <div className="w-32 text-left opacity-60 dark:text-slate-300">{item.labelPositive}</div>
                    </div>
                 ))}
             </div>
        </BentoItem>

      </div>    
      
      <footer className="text-center text-slate-400 dark:text-slate-600 text-xs mt-12 pb-8">
        Propulsé par Hyper Analyse AI • Données temps réel
      </footer>
    </div>
  );
};

export default Dashboard;
