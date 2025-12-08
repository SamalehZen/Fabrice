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
} from 'recharts';
import { Users, MapPin, Smile, Car, Download, Calendar, Filter, TrendingUp, ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { SurveyDataset, SimpleDataPoint } from '../types';
import { SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';
import * as XLSX from 'xlsx';

interface DashboardProps {
  data: SurveyDataset;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string }>;
  label?: string;
}

const QUESTION_META = {
  q0: { title: 'Q0 • Répartition des âges', subtitle: "Tranches d'âge des répondants" },
  q2: { title: 'Q2 • Moyen de transport', subtitle: 'Comment les visiteurs se rendent au mall' },
  q3: { title: 'Q3 • Fréquence de visite', subtitle: "Rythme des achats à l'hypermarché" },
  q5: { title: 'Q5 • Magasin alimentaire le plus fréquenté', subtitle: 'Part de visite par enseigne' },
  q7: { title: 'Q7 • Satisfaction globale', subtitle: 'Évaluation de la visite du jour' },
  q8: { title: 'Q8 • Rayons préférés', subtitle: 'Départements les plus attractifs' },
} as const;

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100"
      role="tooltip"
    >
      <p className="font-bold text-slate-800 dark:text-white mb-1">{label || payload[0].name}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} aria-hidden="true" />
          <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name} :</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-100">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const stats = useMemo(() => {
    const totalRespondents = filteredData.zones.reduce((acc, curr) => acc + curr.value, 0);
    const totalSatisfaction = filteredData.satisfaction.reduce((acc, curr) => acc + curr.value, 0);
    const positiveSatisfaction = filteredData.satisfaction
      .filter((s) => s.name === 'Satisfait' || s.name === 'Très satisfait')
      .reduce((acc, curr) => acc + curr.value, 0);
    const satisfactionRate = totalSatisfaction > 0 ? Math.round((positiveSatisfaction / totalSatisfaction) * 100) : 0;

    const topZone = [...filteredData.zones].sort((a, b) => b.value - a.value)[0] || { name: 'N/A', value: 0 };
    const totalZones = data.zones.reduce((acc, curr) => acc + curr.value, 0);
    const topZonePercent = selectedZone === 'All' ? (totalZones > 0 ? Math.round((topZone.value / totalZones) * 100) : 0) : 100;

    const topTransport = [...filteredData.transport].sort((a, b) => b.value - a.value)[0];

    return { totalRespondents, satisfactionRate, topZone, topZonePercent, topTransport };
  }, [filteredData, data.zones, selectedZone]);

  const handleExportXLSX = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];

    const addSheet = (rows: SimpleDataPoint[] | typeof filteredData.experienceChanges, name: string) => {
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name);
    };

    addSheet(filteredData.ageGroups, 'Q0_Ages');
    addSheet(filteredData.zones, 'Q1_Zones');
    addSheet(filteredData.transport, 'Q2_Transport');
    addSheet(filteredData.frequency, 'Q3_Frequence');
    addSheet(filteredData.visitReason, 'Q4_Motifs');
    addSheet(filteredData.competitors, 'Q5_Magasins');
    addSheet(filteredData.choiceReason, 'Q6_Raisons');
    addSheet(filteredData.satisfaction, 'Q7_Satisfaction');
    addSheet(filteredData.preferredDepartment, 'Q8_Rayons');
    addSheet(filteredData.nameChangeAwareness, 'Q9_Nom');
    addSheet(filteredData.experienceChanges, 'Q10_Experience');

    XLSX.writeFile(wb, `Hyper_Analyse_${selectedZone}_${dateStr}.xlsx`);
  }, [filteredData, selectedZone]);

  const handleZoneSelect = useCallback((zone: string) => {
    setSelectedZone(zone);
    setIsFilterOpen(false);
  }, []);

  const closeFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/90 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-200/60 dark:shadow-black/40 relative z-20 backdrop-blur">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Tableau de bord des questions</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Analyse dynamique des réponses</p>
            {selectedZone !== 'All' && (
              <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                Filtre : {selectedZone}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-slate-50/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Période : 30 derniers jours"
          >
            <Calendar size={16} aria-hidden="true" />
            <span className="hidden sm:inline">30 derniers jours</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              aria-expanded={isFilterOpen}
              aria-haspopup="listbox"
              aria-label="Filtrer par zone"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selectedZone !== 'All'
                  ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/20 dark:text-brand-100 dark:border-brand-300/40'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800/80'
              }`}
            >
              <Filter size={16} aria-hidden="true" />
              <span className="hidden sm:inline">{selectedZone === 'All' ? 'Filtrer par zone' : selectedZone}</span>
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={closeFilter} aria-hidden="true" />
                <ul
                  role="listbox"
                  aria-label="Sélectionner une zone"
                  className="absolute top-full right-0 mt-2 w-48 bg-white/95 dark:bg-slate-950 rounded-xl shadow-xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden z-20 py-1"
                >
                  <li className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Choisir une zone
                  </li>
                  <li>
                    <button
                      role="option"
                      aria-selected={selectedZone === 'All'}
                      onClick={() => handleZoneSelect('All')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-900/60 dark:hover:text-brand-200 flex items-center justify-between transition-colors"
                    >
                      <span>Toutes les zones</span>
                      {selectedZone === 'All' && <Check size={14} className="text-brand-600" aria-hidden="true" />}
                    </button>
                  </li>
                  {data.zones.map((zone) => (
                    <li key={zone.name}>
                      <button
                        role="option"
                        aria-selected={selectedZone === zone.name}
                        onClick={() => handleZoneSelect(zone.name)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-900/60 dark:hover:text-brand-200 flex items-center justify-between transition-colors"
                      >
                        <span>{zone.name}</span>
                        {selectedZone === zone.name && <Check size={14} className="text-brand-600" aria-hidden="true" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 shadow-sm shadow-brand-200/80 dark:shadow-brand-900/40 transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Exporter les données au format Excel"
          >
            <Download size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Exporter XLSX</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <article className="relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-6 text-white shadow-lg shadow-brand-200 dark:shadow-brand-900/50 group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all" aria-hidden="true" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users size={20} className="text-white" aria-hidden="true" />
              </div>
              <span className="flex items-center text-xs font-medium bg-green-400/20 text-green-100 px-2 py-1 rounded-full border border-green-400/30">
                <TrendingUp size={12} className="mr-1" aria-hidden="true" /> Actif
              </span>
            </div>
            <p className="text-brand-100 text-xs font-medium uppercase tracking-wider mb-1">
              {selectedZone === 'All' ? 'Répondants totaux' : `Répondants – ${selectedZone}`}
            </p>
            <p className="text-4xl font-bold tracking-tight">{stats.totalRespondents}</p>
          </div>
        </article>

        <article className="relative overflow-hidden bg-white/90 dark:bg-slate-900/70 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/60 dark:shadow-black/40 group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-green-50 to-transparent dark:from-green-500/20 rounded-bl-full opacity-50" aria-hidden="true" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-500/20 rounded-xl">
              <Smile size={20} className="text-green-600 dark:text-green-300" aria-hidden="true" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-500/20 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} className="mr-1" aria-hidden="true" /> Haut
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Taux de satisfaction (Q7)</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.satisfactionRate}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden" role="progressbar" aria-valuenow={stats.satisfactionRate} aria-valuemin={0} aria-valuemax={100}>
            <div className="bg-green-500 dark:bg-green-300 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.satisfactionRate}%` }} />
          </div>
        </article>

        <article className="relative overflow-hidden bg-white/90 dark:bg-slate-900/70 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/60 dark:shadow-black/40 group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-500/20 rounded-bl-full opacity-50" aria-hidden="true" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/20 rounded-xl">
              <MapPin size={20} className="text-purple-600 dark:text-purple-300" aria-hidden="true" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-800 dark:text-white block leading-none">{stats.topZonePercent}%</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">des répondants</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Zone la plus représentée (Q1)</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white truncate" title={stats.topZone.name}>
            {stats.topZone.name}
          </p>
        </article>

        <article className="relative overflow-hidden bg-white/90 dark:bg-slate-900/70 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/60 dark:shadow-black/40 group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-500/20 rounded-bl-full opacity-50" aria-hidden="true" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-500/20 rounded-xl">
              <Car size={20} className="text-orange-600 dark:text-orange-300" aria-hidden="true" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Mode d'accès dominant (Q2)</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white truncate">{stats.topTransport?.name || 'N/A'}</p>
          <p className="text-xs text-orange-600 dark:text-orange-300 mt-1 font-medium">Préférence de transport</p>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title={QUESTION_META.q5.title} subtitle={QUESTION_META.q5.subtitle} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData.competitors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="colorBarHighlight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={1} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {filteredData.competitors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Bawadi Mall' ? 'url(#colorBarHighlight)' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q0.title} subtitle={QUESTION_META.q0.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={filteredData.ageGroups}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Répondants" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q3.title} subtitle={QUESTION_META.q3.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData.frequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorFreq)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q7.title} subtitle={QUESTION_META.q7.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={filteredData.satisfaction} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {filteredData.satisfaction.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-slate-800 dark:fill-white">
                {stats.satisfactionRate}%
              </text>
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-slate-400 dark:fill-slate-500 font-medium uppercase tracking-wide">
                Positif
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q2.title} subtitle={QUESTION_META.q2.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={filteredData.transport} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q8.title} subtitle={QUESTION_META.q8.subtitle} className="lg:col-span-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData.preferredDepartment} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
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

export default Dashboard;
