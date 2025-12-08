import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Users, TrendingUp, Download, Calendar, Filter, ChevronDown, Check,
  Target, Award, Zap, Activity
} from 'lucide-react';
import { SurveyDataset, SimpleDataPoint } from '../types';
import { SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';
import * as XLSX from 'xlsx';

interface DashboardProps {
  data: SurveyDataset;
}

const QUESTION_META = {
  q0: { title: 'Q0 • Démographie', subtitle: 'Répartition par âges' },
  q2: { title: 'Q2 • Accessibilité', subtitle: 'Moyens de transport' },
  q3: { title: 'Q3 • Fidélité', subtitle: 'Fréquence de visite' },
  q5: { title: 'Q5 • Compétition', subtitle: 'Parts de marché' },
  q7: { title: 'Q7 • Satisfaction', subtitle: 'Note globale' },
  q8: { title: 'Q8 • Attractivité', subtitle: 'Rayons performants' }
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Memoized calculations
  const filteredData = useMemo(() => {
    if (selectedZone === 'All') return data;
    
    const zoneData = data.zones.find(z => z.name === selectedZone);
    const totalRespondents = data.zones.reduce((acc, curr) => acc + curr.value, 0);
    const zoneValue = zoneData ? zoneData.value : 0;
    
    if (totalRespondents === 0 || zoneValue === 0) return data;
    
    const ratio = zoneValue / totalRespondents;
    const scale = (d: SimpleDataPoint[]) => d.map(item => ({ ...item, value: Math.round(item.value * ratio) }));
    
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
        negative: Math.round(item.negative * ratio)
      }))
    };
  }, [data, selectedZone]);

  const stats = useMemo(() => {
    const total = filteredData.zones.reduce((acc, curr) => acc + curr.value, 0);
    const totalSat = filteredData.satisfaction.reduce((acc, curr) => acc + curr.value, 0);
    const positiveSat = filteredData.satisfaction
      .filter(s => ['Satisfait', 'Très satisfait'].includes(s.name))
      .reduce((acc, curr) => acc + curr.value, 0);
    
    const satRate = totalSat > 0 ? Math.round((positiveSat / totalSat) * 100) : 0;
    
    const topZone = [...filteredData.zones].sort((a, b) => b.value - a.value)[0]?.name || 'N/A';
    const topTransport = [...filteredData.transport].sort((a, b) => b.value - a.value)[0]?.name || 'N/A';
    
    return { total, satRate, topZone, topTransport };
  }, [filteredData]);

  const handleExportXLSX = () => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];
    const addToSheet = (d: any[], n: string) => {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d), n);
    };
    
    addToSheet(filteredData.ageGroups, 'Ages');
    addToSheet(filteredData.satisfaction, 'Satisfaction');
    // ... add others as needed
    XLSX.writeFile(wb, `HyperAnalyse_${selectedZone}_${dateStr}.xlsx`);
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 px-3">
          <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600 dark:text-brand-400">
             <Activity size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Performances</h3>
            <p className="text-xs text-slate-500">
              {selectedZone === 'All' ? 'Toutes les zones' : selectedZone} • 30 derniers jours
            </p>
          </div>
        </div>

        <div className="flex w-full sm:w-auto gap-2 p-1">
          <div className="relative flex-1 sm:flex-none z-20">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full sm:w-48 flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all text-slate-600 dark:text-slate-300"
            >
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>{selectedZone === 'All' ? 'Filtrer par zone' : selectedZone}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-64 overflow-y-auto p-1">
                    <button
                      onClick={() => { setSelectedZone('All'); setIsFilterOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                    >
                      <span className="font-medium">Global</span>
                      {selectedZone === 'All' && <Check size={14} className="text-brand-500" />}
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    {data.zones.map(zone => (
                      <button
                        key={zone.name}
                        onClick={() => { setSelectedZone(zone.name); setIsFilterOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                      >
                       <span>{zone.name}</span>
                       {selectedZone === zone.name && <Check size={14} className="text-brand-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-lg hover:shadow-brand-500/20 transition-all active:scale-95"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Répondants" 
          value={stats.total} 
          icon={<Users size={20} className="text-white" />} 
          gradient="from-blue-500 to-blue-600"
          trend="+12%"
          label="Total"
        />
        <KPICard 
          title="Satisfaction" 
          value={`${stats.satRate}%`} 
          icon={<Award size={20} className="text-emerald-500" />} 
          bg="bg-white dark:bg-slate-900"
          trend="+5%"
          trendColor="text-emerald-500"
          label="Score Global"
        />
        <KPICard 
          title="Top Zone" 
          value={stats.topZone} 
          icon={<Target size={20} className="text-purple-500" />} 
          bg="bg-white dark:bg-slate-900"
          label="Zone active"
        />
        <KPICard 
          title="Accès Principal" 
          value={stats.topTransport} 
          icon={<Zap size={20} className="text-amber-500" />} 
          bg="bg-white dark:bg-slate-900"
          label="Transport"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <ChartCard title={QUESTION_META.q5.title} subtitle={QUESTION_META.q5.subtitle} className="lg:col-span-2 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData.competitors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                  </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', opacity: 0.5 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50} fill="url(#barGradient)">
                 {filteredData.competitors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name.includes('Bawadi') ? '#3b82f6' : '#cbd5e1'} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar Chart */}
        <ChartCard title={QUESTION_META.q0.title} subtitle={QUESTION_META.q0.subtitle} className="shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={filteredData.ageGroups}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Répondants" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Area Chart */}
        <ChartCard title={QUESTION_META.q3.title} subtitle={QUESTION_META.q3.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData.frequency}>
              <defs>
                <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorFreq)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut Chart */}
        <ChartCard title={QUESTION_META.q7.title} subtitle={QUESTION_META.q7.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData.satisfaction}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {filteredData.satisfaction.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index % SATISFACTION_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-slate-800 dark:fill-white">
                {stats.satRate}%
              </text>
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-slate-400 font-medium uppercase tracking-wide">
                Positif
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Vertical Bar */}
        <ChartCard title={QUESTION_META.q2.title} subtitle={QUESTION_META.q2.subtitle}>
           <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={filteredData.transport} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Large Area Chart */}
        <ChartCard title={QUESTION_META.q8.title} subtitle={QUESTION_META.q8.subtitle} className="lg:col-span-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData.preferredDepartment} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} fill="url(#colorDept)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, trend, trendColor = 'text-green-500', label, gradient, bg }: any) => (
  <div className={`relative p-6 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md border border-slate-100 dark:border-slate-800 ${gradient ? `bg-gradient-to-br ${gradient} text-white` : bg} group`}>
    
    {!gradient && <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">{icon}</div>}
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-2.5 rounded-xl ${gradient ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${gradient ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'}`}>
          {trend}
        </span>
      )}
    </div>
    
    <div className="relative z-10">
       <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${gradient ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{label}</p>
       <h3 className={`text-3xl font-bold ${gradient ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{value}</h3>
    </div>

    {gradient && <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-sm">
        <p className="font-bold text-slate-800 dark:text-white mb-2">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
            <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-white ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default Dashboard;
