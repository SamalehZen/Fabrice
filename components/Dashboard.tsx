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
import { Users, MapPin, Smile, Car, Download, Calendar, Filter, TrendingUp, ArrowUpRight, Check, ChevronDown, Bus, Footprints, CircleDot } from 'lucide-react';
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
      className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md p-4 rounded-xl shadow-xl dark:shadow-black/50 border border-slate-100 dark:border-dark-border text-sm text-slate-800 dark:text-gray-100"
      role="tooltip"
    >
      <p className="font-bold text-slate-800 dark:text-white mb-1">{label || payload[0].name}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} aria-hidden="true" />
          <span className="text-slate-500 dark:text-gray-400 capitalize">{entry.name} :</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-gray-100">{entry.value}</span>
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-white via-white to-slate-50/80 dark:from-dark-card/95 dark:via-dark-card/90 dark:to-dark-surface/80 p-5 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-sm relative z-20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex p-3 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tableau de bord</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-slate-500 dark:text-gray-400">Analyse dynamique des réponses</p>
              {selectedZone !== 'All' && (
                <span className="bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {selectedZone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium border border-emerald-200/60 dark:border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <Calendar size={14} />
            <span>15 derniers jours</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              aria-expanded={isFilterOpen}
              aria-haspopup="listbox"
              aria-label="Filtrer par zone"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selectedZone !== 'All'
                  ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-400/30 shadow-sm'
                  : 'bg-white dark:bg-dark-card/80 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover'
              }`}
            >
              <MapPin size={15} />
              <span>{selectedZone === 'All' ? 'Toutes zones' : selectedZone}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={closeFilter} aria-hidden="true" />
                <ul
                  role="listbox"
                  aria-label="Sélectionner une zone"
                  className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-dark-surface rounded-xl shadow-xl dark:shadow-black/50 border border-slate-100 dark:border-dark-border overflow-hidden z-20 py-1"
                >
                  <li className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                    Filtrer par zone
                  </li>
                  <li>
                    <button
                      role="option"
                      aria-selected={selectedZone === 'All'}
                      onClick={() => handleZoneSelect('All')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-gray-200 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-dark-hover/60 dark:hover:text-brand-300 flex items-center justify-between transition-colors"
                    >
                      <span>Toutes les zones</span>
                      {selectedZone === 'All' && <Check size={14} className="text-brand-600" />}
                    </button>
                  </li>
                  {data.zones.map((zone) => (
                    <li key={zone.name}>
                      <button
                        role="option"
                        aria-selected={selectedZone === zone.name}
                        onClick={() => handleZoneSelect(zone.name)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-gray-200 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-dark-hover/60 dark:hover:text-brand-300 flex items-center justify-between transition-colors"
                      >
                        <span>{zone.name}</span>
                        {selectedZone === zone.name && <Check size={14} className="text-brand-600" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl text-sm font-medium hover:from-brand-700 hover:to-brand-800 shadow-md shadow-brand-500/25 dark:shadow-brand-900/30 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Exporter les données au format Excel"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exporter</span>
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

        <article className="relative overflow-hidden bg-white/90 dark:bg-dark-card/80 rounded-xl p-6 border border-slate-100 dark:border-dark-border shadow-sm shadow-slate-200/60 dark:shadow-black/40 group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-green-50 to-transparent dark:from-green-500/20 rounded-bl-full opacity-50" aria-hidden="true" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-500/20 rounded-xl">
              <Smile size={20} className="text-green-600 dark:text-green-300" aria-hidden="true" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-500/20 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} className="mr-1" aria-hidden="true" /> Haut
            </span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Taux de satisfaction (Q7)</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.satisfactionRate}%</p>
          <div className="w-full bg-slate-100 dark:bg-dark-muted h-1.5 rounded-full mt-3 overflow-hidden" role="progressbar" aria-valuenow={stats.satisfactionRate} aria-valuemin={0} aria-valuemax={100}>
            <div className="bg-green-500 dark:bg-green-300 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.satisfactionRate}%` }} />
          </div>
        </article>

        <article className="relative overflow-hidden bg-white/90 dark:bg-dark-card/80 rounded-xl p-6 border border-slate-100 dark:border-dark-border shadow-sm shadow-slate-200/60 dark:shadow-black/40 group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-500/20 rounded-bl-full opacity-50" aria-hidden="true" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/20 rounded-xl">
              <MapPin size={20} className="text-purple-600 dark:text-purple-300" aria-hidden="true" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-800 dark:text-white block leading-none">{stats.topZonePercent}%</span>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">des répondants</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Zone la plus représentée (Q1)</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white truncate" title={stats.topZone.name}>
            {stats.topZone.name}
          </p>
        </article>

        <article className="relative overflow-hidden bg-white/90 dark:bg-dark-card/80 rounded-xl p-6 border border-slate-100 dark:border-dark-border shadow-sm shadow-slate-200/60 dark:shadow-black/40 group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-500/20 rounded-bl-full opacity-50" aria-hidden="true" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-500/20 rounded-xl">
              <Car size={20} className="text-orange-600 dark:text-orange-300" aria-hidden="true" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Mode d'accès dominant (Q2)</p>
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
          {(() => {
            const freqTotal = filteredData.frequency.reduce((sum, f) => sum + f.value, 0) || 1;
            const freqColors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];
            const topFreq = [...filteredData.frequency].sort((a, b) => b.value - a.value)[0];
            return (
              <div className="h-full flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200/50 dark:border-orange-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Fréquence dominante</p>
                      <p className="font-bold text-slate-800 dark:text-white">{topFreq?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{Math.round((topFreq?.value / freqTotal) * 100)}%</p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  {filteredData.frequency.map((freq, index) => {
                    const percent = (freq.value / freqTotal) * 100;
                    return (
                      <div key={freq.name} className="relative p-4 rounded-xl bg-white/60 dark:bg-dark-card/50 border border-slate-200/60 dark:border-dark-border hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-slate-500 dark:text-gray-400 truncate pr-2">{freq.name}</span>
                          <span className="text-lg font-bold" style={{ color: freqColors[index] }}>{percent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: freqColors[index] }} />
                        </div>
                        <p className="mt-2 text-xs text-slate-400 dark:text-gray-500">{freq.value} visiteurs</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
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
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-slate-400 dark:fill-gray-500 font-medium uppercase tracking-wide">
                Positif
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q2.title} subtitle={QUESTION_META.q2.subtitle}>
          {(() => {
            const transportTotal = filteredData.transport.reduce((sum, t) => sum + t.value, 0) || 1;
            const transportConfig: Record<string, { icon: typeof Car; color: string; gradient: string }> = {
              'Vehicule Personnel': { icon: Car, color: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
              'Taxi/Bus': { icon: Bus, color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
              'A Pied': { icon: Footprints, color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
              'Autre': { icon: CircleDot, color: '#6b7280', gradient: 'from-gray-500 to-gray-600' },
            };
            const sortedTransport = [...filteredData.transport].sort((a, b) => b.value - a.value);
            const topTransport = sortedTransport[0];
            return (
              <div className="h-full flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 dark:from-blue-500/5 dark:to-violet-500/5 border border-blue-200/50 dark:border-blue-500/20">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${transportConfig[topTransport?.name]?.gradient || 'from-blue-500 to-blue-600'} shadow-lg`}>
                    {(() => { const IconComp = transportConfig[topTransport?.name]?.icon || Car; return <IconComp className="w-6 h-6 text-white" />; })()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Mode dominant</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{topTransport?.name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round((topTransport?.value / transportTotal) * 100)}%</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{topTransport?.value} visiteurs</p>
                  </div>
                </div>
                <div className="flex-1 space-y-3 overflow-auto">
                  {sortedTransport.map((transport, index) => {
                    const config = transportConfig[transport.name] || { icon: CircleDot, color: '#6b7280', gradient: 'from-gray-500 to-gray-600' };
                    const IconComp = config.icon;
                    const percent = (transport.value / transportTotal) * 100;
                    const isTop = index === 0;
                    return (
                      <div key={transport.name} className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${isTop ? 'bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-dark-card/80 dark:to-blue-500/5 border-blue-200/60 dark:border-blue-500/30' : 'bg-white/60 dark:bg-dark-card/50 border-slate-200/60 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <IconComp className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-slate-700 dark:text-gray-200 truncate">{transport.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold" style={{ color: config.color }}>{percent.toFixed(1)}%</span>
                                <span className="text-xs text-slate-400 dark:text-gray-500">({transport.value})</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-700 ease-out`} style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                        {isTop && <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-md">TOP</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
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
