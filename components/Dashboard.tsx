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
  Briefcase, Star, Activity
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
  // Glassmorphism subtle - inspired by luxury cues
  glass: 'backdrop-blur-xl bg-white/80 dark:bg-[#0f111a]/80 border border-white/20 dark:border-white/5',
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
      rounded-[1.5rem] 
      border border-slate-100 dark:border-slate-800 
      p-5 flex flex-col 
      shadow-lg shadow-slate-200/50 dark:shadow-black/40 
      transition-all duration-500 
      hover:shadow-2xl hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-700
      relative overflow-hidden group
      ${className}
    `}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Background Gradient Blob */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors duration-700" />
    
    <div className="flex justify-between items-start mb-4 relative z-10 flex-shrink-0">
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          {Icon && <Icon size={16} className={accentColor} />}
          {title}
        </h3>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
      </div>
    </div>
    
    <div className="flex-1 min-h-0 w-full relative z-10">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl p-3 rounded-lg shadow-2xl border border-white/10 text-xs text-white z-50">
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
    <div className="space-y-8 font-sans text-slate-900 dark:text-slate-100 max-w-[1800px] mx-auto p-4 sm:p-6">
      
      {/* --- Filter & Action Toolbar --- */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-2 rounded-2xl border border-white/20 dark:border-white/5 sticky top-2 z-40 shadow-sm">
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
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden py-1 z-50">
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

      {/* --- DASHBOARD GRID (HORIZONTAL FLOW) --- */}
      {/* 4 Colonnes de base pour la grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">

          {/* ==================== LIGNE 1 ==================== */}
          {/* Q0 (1col), Q1 (1col), Q2 (2cols - Large) */}
          
          <BentoItem title="Q0 • Démographie" subtitle="Ages" icon={Users} accentColor="text-pink-500" className="col-span-1 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={filteredData.ageGroups}>
                    <PolarGrid strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar name="Ages" dataKey="value" stroke="#ec4899" strokeWidth={3} fill="#ec4899" fillOpacity={0.5} />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
          </BentoItem>

          <BentoItem title="Q1 • Zones" subtitle="Provenance" icon={MapPin} accentColor="text-emerald-500" className="col-span-1 h-[260px]">
                <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-2.5">
                    {[...filteredData.zones].sort((a,b) => b.value - a.value).map((zone, idx) => {
                        const total = filteredData.zones.reduce((s, z) => s + z.value, 0) || 1;
                        const pct = Math.round((zone.value / total) * 100);
                        return (
                            <div key={zone.name} className="relative group">
                                <div className="flex justify-between text-[10px] font-bold mb-1 opacity-80 z-10 relative">
                                    <span className="truncate">{zone.name}</span>
                                    <span>{pct}%</span>
                                </div>
                                <div className="pl-0 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full hover:bg-emerald-400 transition-colors" 
                                        style={{ width: `${pct}%` }} 
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
          </BentoItem>

          <BentoItem title="Q2 • Transport" subtitle="Moyens d'accès" icon={Car} accentColor="text-blue-500" className="col-span-1 md:col-span-2 h-[260px]">
                <div className="grid grid-cols-2 gap-4 h-full content-center">
                    {filteredData.transport.map((t, i) => {
                        const iconMap: any = { 'Vehicule Personnel': Car, 'Taxi/Bus': Bus, 'A Pied': Footprints };
                        const Icon = iconMap[t.name] || CircleDot;
                        const isTop = i === 0;
                        return (
                            <div key={t.name} className={`px-4 py-3 rounded-2xl flex items-center justify-between gap-4 transition-all ${isTop ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-2 rounded-xl ${isTop ? 'bg-white/20' : 'bg-white dark:bg-white/5'} flex-shrink-0`}>
                                        <Icon size={18} className={isTop ? 'text-white' : 'text-blue-500'} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wide truncate ${isTop ? 'text-white' : 'opacity-80'}`}>{t.name}</span>
                                </div>
                                <span className="text-xl font-black">{t.value}</span>
                            </div>
                        )
                    })}
                </div>
          </BentoItem>


          {/* ==================== LIGNE 2 ==================== */}
          {/* Q3 (2cols), Q4 (2cols) */}

          <BentoItem 
              title="Q3 • Fréquence" 
              subtitle="Habitudes" 
              icon={Calendar} 
              accentColor="text-amber-500" 
              className="col-span-1 md:col-span-2 h-[420px]"
          >
             <div className="flex flex-col h-full justify-between">
                <div className="flex-1 min-h-[180px] relative -mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="30%" 
                            outerRadius="100%" 
                            barSize={20} 
                            data={filteredData.frequency} 
                            startAngle={180} 
                            endAngle={-180}
                        >
                            <PolarAngleAxis type="number" domain={[0, 'auto']} tick={false} />
                            <RadialBar 
                                background={{ fill: '#f1f5f9', className: 'dark:fill-white/5' }}
                                dataKey="value" 
                                cornerRadius={100} 
                            >
                                {filteredData.frequency.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#f59e0b', '#6366f1', '#ec4899', '#10b981'][index % 4]} />
                                ))}
                            </RadialBar>
                            <Tooltip content={<CustomTooltip />} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                    {filteredData.frequency.map((entry, index) => {
                        const total = filteredData.frequency.reduce((acc, curr) => acc + curr.value, 0) || 1;
                        const percent = Math.round((entry.value / total) * 100);
                        const textColors = ['text-amber-600 dark:text-amber-400', 'text-indigo-600 dark:text-indigo-400', 'text-pink-600 dark:text-pink-400', 'text-emerald-500 dark:text-emerald-400'];
                        const bgColors = ['bg-amber-500', 'bg-indigo-500', 'bg-pink-500', 'bg-emerald-500'];
                        
                        return (
                            <div key={index} className="flex flex-col p-3 rounded-2xl bg-slate-50/60 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group/item">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${bgColors[index%4]}`} />
                                    <span className="text-[10px] font-bold uppercase truncate text-slate-500 dark:text-slate-400">{entry.name}</span>
                                </div>
                                <span className={`text-3xl font-black ${textColors[index % 4]} transition-transform group-hover/item:scale-105 origin-left`}>{percent}%</span>
                            </div>
                        );
                    })}
                </div>
             </div>
          </BentoItem>

          <BentoItem title="Q4 • Motifs" subtitle="Raisons de visite" icon={ShoppingBag} accentColor="text-violet-500" className="col-span-1 md:col-span-2 h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData.visitReason} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                          {filteredData.visitReason.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS.secondary} fillOpacity={0.7 + (index * 0.05)} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </BentoItem>


          {/* ==================== LIGNE 3 ==================== */}
          {/* Q5 HORIZONTAL FULL WIDTH (4 cols, 400px - pour afficher beaucoup en largeur) */}

           <BentoItem title="Q5 • Concurrence" subtitle="Parts de marché" icon={Briefcase} accentColor="text-indigo-600" className="col-span-1 md:col-span-2 lg:col-span-4 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredData.competitors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} interval={0} height={60} tickMargin={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                            {filteredData.competitors.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name.includes("Bawadi") ? COLORS.primary : '#cbd5e1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
          </BentoItem>


          {/* ==================== LIGNE 4 ==================== */}
          {/* Q6 (2 cols), Q7 (2 cols) */}

          <BentoItem title="Q6 • Critères" subtitle="Facteurs" icon={Tag} accentColor="text-cyan-500" className="col-span-1 md:col-span-2 h-[340px]">
             <div className="flex flex-wrap gap-2 content-start h-full overflow-hidden p-1">
                {[...filteredData.choiceReason].sort((a,b) => b.value - a.value).map((reason, i) => {
                    const sizes = ['text-sm px-3 py-1.5', 'text-xs px-2.5 py-1', 'text-xs px-2 py-1', 'text-[10px] px-2 py-0.5'];
                     const styles = [
                        'bg-cyan-500 text-white shadow-cyan-500/40 w-full justify-between',
                        'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
                        'border border-cyan-200 text-cyan-600 dark:border-cyan-800 dark:text-cyan-400',
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    ];
                    return (
                        <div key={reason.name} className={`rounded-lg font-bold shadow-sm flex items-center gap-2 ${sizes[Math.min(i, 3)]} ${styles[Math.min(i, 3)]}`}>
                            {reason.name}
                            <span className="opacity-70 font-mono text-[0.8em]">{reason.value}</span>
                        </div>
                    );
                })}
             </div>
          </BentoItem>

          <BentoItem title="Q7 • Satisfaction" subtitle="Bonheur" icon={Smile} accentColor="text-green-500" className="col-span-1 md:col-span-2 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={filteredData.satisfaction}
                    cx="50%" cy="70%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="65%"
                    outerRadius="100%"
                    paddingAngle={5}
                    dataKey="value"
                 >
                    {filteredData.satisfaction.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#84cc16', '#22c55e'][index]} />
                    ))}
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
                 <text x="50%" y="60%" textAnchor="middle" className="text-4xl font-black fill-slate-800 dark:fill-white">
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


          {/* ==================== LIGNE 5 ==================== */}
          {/* Q8 HORIZONTAL FULL WIDTH (4 cols, 400px - Aire Chart étalée) */}

          <BentoItem title="Q8 • Attractivité" subtitle="Rayons" icon={ShoppingCart} accentColor="text-rose-500" className="col-span-1 md:col-span-2 lg:col-span-4 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData.preferredDepartment} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRayon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} interval={0} height={50} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRayon)" />
                </AreaChart>
            </ResponsiveContainer>
          </BentoItem>


          {/* ==================== LIGNE 6 ==================== */}
          {/* Q9 (2 cols), Q10 (2 cols) */}

           <BentoItem title="Q9 • Notoriété" subtitle="Nom" icon={Megaphone} accentColor="text-orange-500" className="col-span-1 md:col-span-2 h-[340px]">
             <div className="h-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                        <Pie data={filteredData.nameChangeAwareness} innerRadius={55} outerRadius={75} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                            <Cell fill="#f97316" />
                            <Cell fill="#e2e8f0" />
                        </Pie>
                         <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-black fill-slate-800 dark:fill-white">
                             {Math.round((filteredData.nameChangeAwareness.find(i => i.name === 'Oui')?.value || 0) / (filteredData.nameChangeAwareness.reduce((a,b)=>a+b.value,0)||1) * 100)}%
                         </text>
                    </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-xs font-bold text-slate-500 uppercase mt-2">Ont remarqué le changement</p>
             </div>
          </BentoItem>

          <BentoItem title="Q10 • Perception" subtitle="Expérience" icon={Star} accentColor="text-yellow-500" className="col-span-1 md:col-span-2 h-[340px]">
              <div className="flex flex-col h-full justify-center gap-4 overflow-y-auto custom-scrollbar pr-2">
                 {filteredData.experienceChanges.map((item, idx) => {
                    const total = item.positive + item.negative;
                    const posPct = Math.round((item.positive / total) * 100);
                    const negPct = 100 - posPct;
                    return (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <span>{item.category}</span>
                                <div className="flex gap-2">
                                    <span className="text-red-400">{negPct}%</span>
                                    <span className="text-emerald-500">{posPct}%</span>
                                </div>
                            </div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
                                 <div className="h-full bg-red-400/80" style={{ width: `${negPct}%` }} />
                                 <div className="h-full bg-emerald-500" style={{ width: `${posPct}%` }} />
                            </div>
                            <div className="flex justify-between text-[9px] font-medium text-slate-400 opacity-70">
                                <span>{item.labelNegative}</span>
                                <span>{item.labelPositive}</span>
                            </div>
                        </div>
                    )
                 })}
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
