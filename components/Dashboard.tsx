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
  LabelList,
} from 'recharts';
import { Users, MapPin, Smile, Car, Download, Calendar, TrendingUp, ArrowUpRight, Check, ChevronDown, Bus, Footprints, CircleDot } from 'lucide-react';
import { SurveyDataset, SimpleDataPoint } from '../types';
import { SATISFACTION_COLORS, COLORS } from '../constants';
import ChartCard from './ChartCard';
import FrequencyTrendChart from './FrequencyTrendChart';
import { render3DPie } from './Pie3DRenderer';
import * as XLSX from 'xlsx';

interface DashboardProps {
  data: SurveyDataset;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string; payload?: Record<string, unknown> }>;
  label?: string;
}

const QUESTION_META = {
  q0: { title: 'Q0 • Répartition des âges', subtitle: "Tranches d'âge des répondants" },
  q1: { title: 'Q1 • Zone de résidence', subtitle: 'Origine géographique des visiteurs' },
  q2: { title: 'Q2 • Moyen de transport', subtitle: 'Comment les visiteurs se rendent au mall' },
  q3: { title: 'Q3 • Fréquence de visite', subtitle: "Rythme des achats à l'hypermarché" },
  q4: { title: 'Q4 • Motivation principale', subtitle: 'Pourquoi ils choisissent le mall aujourd’hui' },
  q5: { title: 'Q5 • Magasin alimentaire le plus fréquenté', subtitle: 'Part de visite par enseigne' },
  q6: { title: 'Q6 • Raison du choix', subtitle: "Critères d'arbitrage des visiteurs" },
  q7: { title: 'Q7 • Satisfaction globale', subtitle: 'Évaluation de la visite du jour' },
  q8: { title: 'Q8 • Rayons préférés', subtitle: 'Départements les plus attractifs' },
  q9: { title: 'Q9 • Changement de nom remarqué', subtitle: 'Sensibilité à la nouvelle identité' },
  q10: { title: 'Q10 • Évolution expérience', subtitle: 'Comparaison avec Géant' },
} as const;

const TRANSPORT_CONFIG: Record<string, { icon: typeof Car; color: string; gradient: string }> = {
  'Vehicule Personnel': { icon: Car, color: '#0ea5e9', gradient: 'from-blue-500 to-blue-600' },
  'Taxi/Bus': { icon: Bus, color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
  'A Pied': { icon: Footprints, color: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
  Autre: { icon: CircleDot, color: '#6b7280', gradient: 'from-slate-500 to-slate-600' },
  default: { icon: Car, color: '#0ea5e9', gradient: 'from-blue-500 to-blue-600' },
};

const CHOICE_REASON_STYLES = [
  { gradient: 'from-emerald-400 to-emerald-600', text: '#059669' },
  { gradient: 'from-sky-400 to-blue-600', text: '#0284c7' },
  { gradient: 'from-amber-400 to-orange-500', text: '#d97706' },
  { gradient: 'from-rose-400 to-pink-500', text: '#e11d48' },
  { gradient: 'from-purple-400 to-indigo-500', text: '#7c3aed' },
  { gradient: 'from-slate-400 to-slate-500', text: '#475569' },
];

const NAME_CHANGE_COLORS = ['#0ea5e9', '#94a3b8'];
const EXPERIENCE_POS_COLOR = '#22c55e';
const EXPERIENCE_NEG_COLOR = '#ef4444';

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

const ExperienceTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const dataPoint = payload[0].payload as { category: string; positive: number; negative: number; labelPositive?: string; labelNegative?: string };
  const total = (dataPoint?.positive || 0) + (dataPoint?.negative || 0) || 1;
  const positivePercent = Math.round(((dataPoint?.positive || 0) / total) * 100);
  const negativePercent = 100 - positivePercent;

  return (
    <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md p-4 rounded-xl shadow-xl dark:shadow-black/50 border border-slate-100 dark:border-dark-border text-sm text-slate-800 dark:text-gray-100">
      <p className="font-bold text-slate-800 dark:text-white mb-2">{dataPoint?.category}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EXPERIENCE_POS_COLOR }} aria-hidden="true" />
            {dataPoint?.labelPositive || 'Progression positive'}
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{dataPoint?.positive} ({positivePercent}%)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EXPERIENCE_NEG_COLOR }} aria-hidden="true" />
            {dataPoint?.labelNegative || 'Signal négatif'}
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{dataPoint?.negative} ({negativePercent}%)</span>
        </div>
      </div>
    </div>
  );
};

interface RankLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number | string;
}

const CompetitorRankLabel: React.FC<RankLabelProps> = ({ x, y, width, value }) => {
  const rank = Number(value);
  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || Number.isNaN(rank)) return null;
  const centerX = x + width / 2;
  const safeY = Math.max(y - 18, 28);

  if (rank === 1) {
    const badgeWidth = 120;
    const badgeHeight = 34;
    const badgeRadius = 14;
    const dropShadowOffset = 4;
    const top = -badgeHeight + 4;

    return (
      <g transform={`translate(${centerX}, ${safeY})`}>
        <rect
          x={-badgeWidth / 2}
          y={top + dropShadowOffset}
          width={badgeWidth}
          height={badgeHeight}
          rx={badgeRadius}
          fill="rgba(8,47,73,0.35)"
        />
        <rect
          x={-badgeWidth / 2}
          y={top}
          width={badgeWidth}
          height={badgeHeight}
          rx={badgeRadius}
          fill="#0ea5e9"
          stroke="#38bdf8"
          strokeWidth={1.5}
        />
        <rect
          x={-badgeWidth / 2 + 5}
          y={top + 5}
          width={badgeWidth - 10}
          height={badgeHeight - 16}
          rx={badgeRadius}
          fill="rgba(255,255,255,0.12)"
        />
        <text x={0} y={top + 16} fill="#e0f2fe" fontSize={12} fontWeight={800} textAnchor="middle">
          ★ N°1
        </text>
        <text x={0} y={top + 27} fill="#f0f9ff" fontSize={9} fontWeight={700} letterSpacing="0.18em" textAnchor="middle">
          MARKET LEADER
        </text>
      </g>
    );
  }

  return (
    <text x={centerX} y={safeY - 2} fill="#475569" fontSize={11} fontWeight={600} textAnchor="middle">
      #{rank}
    </text>
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
    const totalTransport = filteredData.transport.reduce((acc, curr) => acc + curr.value, 0);
    const topTransportPercent = totalTransport > 0 && topTransport ? Math.round((topTransport.value / totalTransport) * 100) : 0;

    return { totalRespondents, satisfactionRate, topZone, topZonePercent, topTransport, topTransportPercent };
  }, [filteredData, data.zones, selectedZone]);

  const zoneInsights = useMemo(() => {
    const sorted = [...filteredData.zones].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, zone) => sum + zone.value, 0);
    const leader = sorted[0];
    const runnerUp = sorted[1];
    const leaderShare = total ? Math.round(((leader?.value ?? 0) / total) * 100) : 0;
    const gap = runnerUp && leader ? leader.value - runnerUp.value : leader?.value ?? 0;
    return { sorted, total, leader, runnerUp, leaderShare, gap };
  }, [filteredData.zones]);

  const q0SegmentHighlights = useMemo(() => {
    const total = filteredData.ageGroups.reduce((sum, group) => sum + group.value, 0) || 1;
    const focusGroup = filteredData.ageGroups.find((group) => group.name === '20-30 ans');
    const supportGroup = filteredData.ageGroups.find((group) => group.name === '30-50 ans');
    const focusValue = focusGroup?.value ?? 0;
    const supportValue = supportGroup?.value ?? 0;
    const combinedValue = focusValue + supportValue;
    const toPercent = (value: number) => Math.round((value / total) * 100);

    return {
      combined: {
        label: '20–50 ans',
        value: combinedValue,
        percent: toPercent(combinedValue),
      },
      focus: {
        label: '20–30 ans',
        value: focusValue,
        percent: toPercent(focusValue),
      },
      support: {
        label: '30–50 ans',
        value: supportValue,
        percent: toPercent(supportValue),
      },
      total,
    };
  }, [filteredData.ageGroups]);

  const frequencyInsights = useMemo(() => {
    const sorted = [...filteredData.frequency].sort((a, b) => b.value - a.value);
    const leader = sorted[0];
    const tail = sorted[sorted.length - 1];
    const total = sorted.reduce((sum, item) => sum + item.value, 0);
    const leaderShare = total ? Math.round(((leader?.value ?? 0) / total) * 100) : 0;
    const tailShare = total ? Math.round(((tail?.value ?? 0) / total) * 100) : 0;
    return { leader, tail, leaderShare, tailShare };
  }, [filteredData.frequency]);

  const frequencyDisplayData = useMemo(() => {
    return filteredData.frequency.map((item) =>
      item.name === 'Plusieurs fois/semaine' ? { ...item, name: '+/semaine' } : item
    );
  }, [filteredData.frequency]);

  const transportInsights = useMemo(() => {
    const sorted = [...filteredData.transport].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, entry) => sum + entry.value, 0);
    const top = sorted[0];
    const topShare = total ? Math.round(((top?.value ?? 0) / total) * 100) : 0;
    return { sorted, total, top, topShare };
  }, [filteredData.transport]);

  const visitReasonInsights = useMemo(() => {
    const sorted = [...filteredData.visitReason].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);
    const leader = sorted[0];
    const leaderShare = total ? Math.round(((leader?.value ?? 0) / total) * 100) : 0;
    const top3Share = total ? Math.round((sorted.slice(0, 3).reduce((sum, item) => sum + item.value, 0) / total) * 100) : 0;
    return { sorted, total, leader, leaderShare, top3Share };
  }, [filteredData.visitReason]);

  const choiceReasonInsights = useMemo(() => {
    const sorted = [...filteredData.choiceReason].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);
    const leader = sorted[0];
    const leaderShare = total ? Math.round(((leader?.value ?? 0) / total) * 100) : 0;
    return { sorted, total, leader, leaderShare };
  }, [filteredData.choiceReason]);

  const competitorInsights = useMemo(() => {
    const sorted = [...filteredData.competitors].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);
    const leader = sorted[0];
    const runnerUp = sorted[1];
    const leaderShare = total ? Math.round(((leader?.value ?? 0) / total) * 100) : 0;
    const runnerUpShare = total && runnerUp ? Math.round((runnerUp.value / total) * 100) : 0;
    const gap = runnerUp && leader ? leader.value - runnerUp.value : leader?.value ?? 0;
    return { sorted, total, leader, runnerUp, leaderShare, runnerUpShare, gap };
  }, [filteredData.competitors]);

  const competitorChartData = useMemo(
    () => competitorInsights.sorted.map((entry, index) => ({ ...entry, rank: index + 1 })),
    [competitorInsights.sorted]
  );

  const departmentInsights = useMemo(() => {
    const sorted = [...filteredData.preferredDepartment].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);
    const topThree = sorted.slice(0, 3).map((item) => ({
      ...item,
      percent: total ? Math.round((item.value / total) * 100) : 0,
    }));
    return { sorted, total, topThree };
  }, [filteredData.preferredDepartment]);

  const nameChangeInsights = useMemo(() => {
    const total = filteredData.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0);
    const aware = filteredData.nameChangeAwareness.find((slice) => slice.name.toLowerCase().includes('oui')) ?? filteredData.nameChangeAwareness[0];
    const awarePercent = total ? Math.round(((aware?.value ?? 0) / total) * 100) : 0;
    const unawarePercent = total ? 100 - awarePercent : 0;
    return { total, awarePercent, unawarePercent };
  }, [filteredData.nameChangeAwareness]);

  const q9Highlights = useMemo(() => {
    const gap = Math.abs(nameChangeInsights.awarePercent - nameChangeInsights.unawarePercent);
    return [
      { label: 'Écart awareness', value: `${gap} pts`, caption: 'Différence Oui vs Non' },
      { label: 'Panel mesuré', value: nameChangeInsights.total.toString(), caption: 'Réponses exploitables' },
      { label: 'À convaincre', value: `${nameChangeInsights.unawarePercent}%`, caption: "N'ont pas remarqué" },
    ];
  }, [nameChangeInsights]);

  const q9HighlightStyles = [
    'border-emerald-100 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-500/20 dark:via-transparent dark:to-transparent',
    'border-sky-100 dark:border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-white to-white dark:from-sky-500/20 dark:via-transparent dark:to-transparent',
    'border-amber-100 dark:border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-500/20 dark:via-transparent dark:to-transparent',
  ];

  const satisfactionBreakdown = useMemo(() => {
    const total = filteredData.satisfaction.reduce((sum, slice) => sum + slice.value, 0) || 1;
    return filteredData.satisfaction.map((slice, index) => ({
      ...slice,
      percent: Math.round((slice.value / total) * 100),
      color: SATISFACTION_COLORS[index % SATISFACTION_COLORS.length],
    }));
  }, [filteredData.satisfaction]);

  const topSatisfactionSlice = useMemo(() => {
    if (!satisfactionBreakdown.length) return null;
    return satisfactionBreakdown.reduce((top, slice) => (slice.value > (top?.value ?? 0) ? slice : top), satisfactionBreakdown[0]);
  }, [satisfactionBreakdown]);

  const totalSatisfactionResponses = useMemo(
    () => filteredData.satisfaction.reduce((sum, slice) => sum + slice.value, 0),
    [filteredData.satisfaction]
  );

  const q10Insights = useMemo(() => {
    const totalPositive = filteredData.experienceChanges.reduce((acc, item) => acc + item.positive, 0);
    const totalNegative = filteredData.experienceChanges.reduce((acc, item) => acc + item.negative, 0);
    const total = totalPositive + totalNegative || 1;
    const positiveRate = Math.round((totalPositive / total) * 100);
    const negativeRate = 100 - positiveRate;
    const netIndex = positiveRate - negativeRate;
    const chartData = filteredData.experienceChanges.map((item) => {
      const categoryTotal = item.positive + item.negative || 1;
      return {
        category: item.category,
        positive: item.positive,
        negative: item.negative,
        positivePercent: Math.round((item.positive / categoryTotal) * 100),
        negativePercent: Math.round((item.negative / categoryTotal) * 100),
        labelPositive: item.labelPositive,
        labelNegative: item.labelNegative,
      };
    });
    const standout = [...chartData].sort((a, b) => b.positivePercent - a.positivePercent)[0];
    return { totalPositive, totalNegative, positiveRate, negativeRate, netIndex, chartData, standout };
  }, [filteredData.experienceChanges]);

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
                <Users size={20} className="text-white" />
              </div>
              <span className="flex items-center text-xs font-medium bg-green-400/20 text-green-100 px-2 py-1 rounded-full border border-green-400/30">
                <TrendingUp size={12} className="mr-1" /> Actif
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
              <Smile size={20} className="text-green-600 dark:text-green-300" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-500/20 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} className="mr-1" /> Haut
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
              <MapPin size={20} className="text-purple-600 dark:text-purple-300" />
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
              <Car size={20} className="text-orange-600 dark:text-orange-300" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 block leading-none">{stats.topTransportPercent}%</span>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">des visiteurs</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Mode d'accès dominant (Q2)</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white truncate">{stats.topTransport?.name || 'N/A'}</p>
          <div className="w-full bg-slate-100 dark:bg-dark-muted h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-orange-500 dark:bg-orange-400 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.topTransportPercent}%` }} />
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-12 gap-6 auto-rows-[minmax(320px,auto)]">
        <ChartCard title={QUESTION_META.q0.title} subtitle={QUESTION_META.q0.subtitle} className="lg:col-span-3 xl:col-span-4">
          <div className="flex flex-col h-full gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <article className="rounded-2xl border border-purple-100 dark:border-purple-500/30 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 text-white p-4 shadow-lg shadow-purple-900/20">
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/70">Segment principal élargi</p>
                <h4 className="text-lg font-semibold">{q0SegmentHighlights.combined.label}</h4>
                <p className="text-5xl font-black mt-3 leading-none">{q0SegmentHighlights.combined.percent}%</p>
                <p className="text-xs text-white/80 mt-1">{q0SegmentHighlights.combined.value} répondants</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white/15 p-3">
                    <p className="text-xs text-white/70 uppercase tracking-wide">{q0SegmentHighlights.focus.label}</p>
                    <p className="text-xl font-bold">{q0SegmentHighlights.focus.percent}%</p>
                    <p className="text-[11px] text-white/60">{q0SegmentHighlights.focus.value} pers.</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-xs text-white/70 uppercase tracking-wide">{q0SegmentHighlights.support.label}</p>
                    <p className="text-xl font-bold">{q0SegmentHighlights.support.percent}%</p>
                    <p className="text-[11px] text-white/60">{q0SegmentHighlights.support.value} pers.</p>
                  </div>
                </div>
              </article>
              <article className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/80 p-4 shadow-sm shadow-slate-200/50 dark:shadow-black/30 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-gray-500">Segment cœur</p>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{q0SegmentHighlights.focus.label}</h4>
                  <p className="text-4xl font-black text-slate-900 dark:text-white leading-none mt-3">{q0SegmentHighlights.focus.percent}%</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{q0SegmentHighlights.focus.value} répondants</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                    <span>Poids dans le panel</span>
                    <span>{q0SegmentHighlights.focus.percent}%</span>
                  </div>
                  <div
                    className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-dark-muted overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={q0SegmentHighlights.focus.percent}
                  >
                    <span className="block h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-700" style={{ width: `${q0SegmentHighlights.focus.percent}%` }} />
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500 dark:text-gray-400">
                    {q0SegmentHighlights.support.percent}% supplémentaires proviennent des {q0SegmentHighlights.support.label}.
                  </p>
                </div>
              </article>
            </div>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={filteredData.ageGroups}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="Répondants" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard title={QUESTION_META.q1.title} subtitle={QUESTION_META.q1.subtitle} className="lg:col-span-3 xl:col-span-4">
          <div className="flex flex-col h-full gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-blue-100 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 to-white dark:from-blue-500/10 dark:to-transparent p-4">
                <p className="text-xs font-semibold text-blue-500 dark:text-blue-200 uppercase tracking-wide">Zone leader</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{zoneInsights.leader?.name || 'N/A'}</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-300 mt-3">{zoneInsights.leaderShare}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border p-4 bg-white/70 dark:bg-dark-card/70">
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Écart vs n°2</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-2">{zoneInsights.gap}</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">répondants</p>
              </div>
            </div>
            <div className="flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneInsights.sorted} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="q1ZoneFill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={90} tick={{ fill: '#475569', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={18}>
                    {zoneInsights.sorted.map((zone) => (
                      <Cell key={zone.name} fill={zone.name === zoneInsights.leader?.name ? 'url(#q1ZoneFill)' : '#cbd5f5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard title={QUESTION_META.q2.title} subtitle={QUESTION_META.q2.subtitle} className="lg:col-span-6 xl:col-span-4" contentHeightClass="min-h-[360px]">
          <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 dark:from-blue-500/5 dark:to-violet-500/5 border border-blue-200/50 dark:border-blue-500/20">
              {(() => {
                const topStyle = TRANSPORT_CONFIG[transportInsights.top?.name || 'default'] || TRANSPORT_CONFIG.default;
                const IconComp = topStyle.icon;
                return (
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${topStyle.gradient} shadow-lg`}>
                    <IconComp className="w-6 h-6 text-white" />
                  </div>
                );
              })()}
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">Mode dominant</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{transportInsights.top?.name || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{transportInsights.topShare}%</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">{transportInsights.top?.value ?? 0} visiteurs</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-auto pr-1">
              {transportInsights.sorted.map((mode, index) => {
                const config = TRANSPORT_CONFIG[mode.name] || TRANSPORT_CONFIG.default;
                const percent = transportInsights.total ? Math.round((mode.value / transportInsights.total) * 100) : 0;
                const isTop = transportInsights.top?.name === mode.name;
                const IconComp = config.icon;
                return (
                  <div
                    key={mode.name}
                    className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                      isTop
                        ? 'bg-gradient-to-r from-blue-50 to-violet-50 dark:from-dark-card/70 dark:to-blue-500/10 border-blue-200/80 dark:border-blue-500/40 shadow-lg shadow-blue-500/10'
                        : 'bg-white/70 dark:bg-dark-card/70 border-slate-200/70 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-700 dark:text-gray-200 truncate">{mode.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: config.color }}>{percent}%</span>
                            <span className="text-xs text-slate-400 dark:text-gray-500">({mode.value})</span>
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
        </ChartCard>

        <ChartCard title={QUESTION_META.q3.title} subtitle={QUESTION_META.q3.subtitle} className="lg:col-span-3 xl:col-span-5">
          <div className="flex flex-col h-full gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-amber-100 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-white dark:from-amber-500/10 dark:to-transparent p-4">
                <p className="text-xs font-semibold text-amber-500 dark:text-amber-200 uppercase tracking-wide">Rythme dominant</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{frequencyInsights.leader?.name || 'N/A'}</p>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-300 mt-3">{frequencyInsights.leaderShare}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border p-4 bg-white/70 dark:bg-dark-card/70">
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Levier à renforcer</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{frequencyInsights.tail?.name || 'N/A'}</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-3">{frequencyInsights.tailShare}%</p>
              </div>
            </div>
            <div className="flex-1">
              <FrequencyTrendChart data={frequencyDisplayData} />
            </div>
          </div>
        </ChartCard>

        <ChartCard title={QUESTION_META.q4.title} subtitle={QUESTION_META.q4.subtitle} className="lg:col-span-3 xl:col-span-7">
          <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-rose-100 dark:border-rose-500/30 bg-gradient-to-br from-rose-50 to-white dark:from-rose-500/10 dark:to-transparent p-4">
                <p className="text-xs font-semibold text-rose-500 dark:text-rose-200 uppercase tracking-wide">Motif dominant</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{visitReasonInsights.leader?.name || 'N/A'}</p>
                <p className="text-3xl font-black text-rose-600 dark:text-rose-300 mt-3">{visitReasonInsights.leaderShare}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border p-4 bg-white/80 dark:bg-dark-card/70">
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Top 3 cumulés</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{visitReasonInsights.top3Share}%</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">des répondants</p>
              </div>
            </div>
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={visitReasonInsights.sorted} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
                    {visitReasonInsights.sorted.map((entry, index) => (
                      <Cell key={`reason-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-slate-800 dark:fill-white">
                    {visitReasonInsights.leaderShare}%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title={QUESTION_META.q5.title}
          subtitle={QUESTION_META.q5.subtitle}
          className="lg:col-span-6 xl:col-span-12"
          contentHeightClass="min-h-[420px]"
        >
          <div className="flex flex-col xl:flex-row gap-6 h-full">
            <div className="w-full xl:max-w-sm space-y-4">
              <div className="rounded-2xl border border-sky-200 dark:border-sky-500/40 bg-gradient-to-br from-sky-50 via-white to-white dark:from-sky-500/10 dark:to-transparent p-5">
                <p className="text-xs font-semibold text-sky-500 dark:text-sky-200 uppercase tracking-wide">Enseigne leader</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{competitorInsights.leader?.name || 'N/A'}</p>
                <div className="flex items-end justify-between mt-6">
                  <div>
                    <p className="text-[11px] uppercase text-slate-500 dark:text-gray-400">Part de visite</p>
                    <p className="text-4xl font-black text-sky-600 dark:text-sky-300">{competitorInsights.leaderShare}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase text-slate-500 dark:text-gray-400">Volume</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{competitorInsights.leader?.value ?? 0} clients</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border p-5 bg-white/90 dark:bg-dark-card/70">
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Écart vs n°2</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">+{competitorInsights.gap}</p>
                <p className="text-sm text-slate-500 dark:text-gray-400">{competitorInsights.runnerUp?.name || 'N/A'} à {competitorInsights.runnerUpShare}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border p-4 bg-white/80 dark:bg-dark-card/70">
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3">Top 3 enseignes</p>
                <ul className="space-y-3">
                  {competitorInsights.sorted.slice(0, 3).map((comp, index) => {
                    const percent = competitorInsights.total ? Math.round((comp.value / competitorInsights.total) * 100) : 0;
                    return (
                      <li key={comp.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-gray-200">
                          <span className="text-xs font-black text-slate-400 dark:text-gray-500">#{index + 1}</span>
                          <span className="font-semibold">{comp.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{percent}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competitorChartData} margin={{ top: 45, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="q5Bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="q5BarHighlight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={1} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {competitorChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === competitorInsights.leader?.name ? 'url(#q5BarHighlight)' : 'url(#q5Bar)'} />
                    ))}
                    <LabelList dataKey="rank" content={(props) => <CompetitorRankLabel {...props} />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard title={QUESTION_META.q6.title} subtitle={QUESTION_META.q6.subtitle} className="lg:col-span-3 xl:col-span-6">
          <div className="flex flex-col h-full gap-4">
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-transparent p-4">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase tracking-wide">Critère n°1</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{choiceReasonInsights.leader?.name || 'N/A'}</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-300 mt-3">{choiceReasonInsights.leaderShare}%</p>
            </div>
            <div className="flex-1 space-y-3 overflow-auto pr-1">
              {choiceReasonInsights.sorted.map((reason, index) => {
                const percent = choiceReasonInsights.total ? Math.round((reason.value / choiceReasonInsights.total) * 100) : 0;
                const palette = CHOICE_REASON_STYLES[index % CHOICE_REASON_STYLES.length];
                return (
                  <div key={reason.name} className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/70">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-gray-100">{reason.name}</span>
                      <span className="text-sm font-bold" style={{ color: palette.text }}>{percent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-dark-muted rounded-full mt-2 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${palette.gradient}`} style={{ width: `${percent}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">{reason.value} citations</p>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

        <ChartCard title={QUESTION_META.q7.title} subtitle={QUESTION_META.q7.subtitle} className="lg:col-span-3 xl:col-span-6">
          <div className="flex flex-col h-full gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-green-100 dark:border-green-500/30 p-4 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-transparent">
                <p className="text-[11px] font-semibold text-green-600 dark:text-green-300 uppercase tracking-wide">Satisfaction positive</p>
                <p className="text-4xl font-black text-green-600 dark:text-green-300 mt-2">{stats.satisfactionRate}%</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">Avis favorables</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border p-4 bg-white/80 dark:bg-dark-card/70">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Segment dominant</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{topSatisfactionSlice?.name || '—'}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{topSatisfactionSlice?.percent ?? 0}%</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">{topSatisfactionSlice?.value ?? 0} réponses</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 h-56 relative rounded-2xl border border-slate-100 dark:border-dark-border bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-dark-card/50 dark:via-dark-card/40 dark:to-dark-surface/60 overflow-hidden">
                <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-emerald-200/30 via-transparent to-slate-200/30 dark:from-emerald-500/10 dark:to-transparent" aria-hidden="true" />
                <div className="absolute inset-0">
                  {render3DPie(satisfactionBreakdown, {
                    colors: SATISFACTION_COLORS,
                    innerRadius: 55,
                    outerRadius: 105,
                    paddingAngle: 4,
                    showLegend: false,
                    labelPosition: 'outside',
                    labelOffset: 16,
                    showLabels: false,
                  })}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">Positif</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.satisfactionRate}%</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">{totalSatisfactionResponses} réponses</p>
                </div>
              </div>
              <div className="w-full sm:w-1/2 space-y-2">
                {satisfactionBreakdown.map((slice) => (
                  <div key={slice.name} className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white/85 dark:bg-dark-card/70 p-3 flex items-center justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden="true" />
                        {slice.name}
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{slice.percent}%</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">{slice.value} répondants</p>
                    </div>
                    <p className={`text-[11px] font-semibold ${slice.percent >= 50 ? 'text-emerald-500' : 'text-slate-400 dark:text-gray-500'}`}>
                      {slice.percent >= 50 ? 'Dominant' : 'Secondaire'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title={QUESTION_META.q8.title}
          subtitle={QUESTION_META.q8.subtitle}
          className="lg:col-span-6 xl:col-span-12"
          contentHeightClass="min-h-[460px]"
        >
          <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departmentInsights.topThree.map((dept, index) => (
                <div
                  key={dept.name}
                  className={`rounded-2xl border p-5 bg-gradient-to-br ${
                    index === 0
                      ? 'from-rose-500/10 to-rose-500/0 border-rose-200/70 dark:border-rose-500/40'
                      : index === 1
                        ? 'from-indigo-500/10 to-indigo-500/0 border-indigo-200/70 dark:border-indigo-500/40'
                        : 'from-emerald-500/10 to-emerald-500/0 border-emerald-200/70 dark:border-emerald-500/40'
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">Top #{index + 1}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{dept.name}</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white mt-4">{dept.percent}%</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{dept.value} visites</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col lg:flex-row gap-6 flex-1">
              <div className="flex-1 min-h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData.preferredDepartment} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="q8Dept" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} interval={0} angle={-25} textAnchor="end" height={70} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} fill="url(#q8Dept)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-72 space-y-3 overflow-auto pr-1">
                {departmentInsights.sorted.slice(3, 9).map((dept, index) => {
                  const percent = departmentInsights.total ? Math.round((dept.value / departmentInsights.total) * 100) : 0;
                  return (
                    <div key={dept.name} className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/70">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-gray-100">{dept.name}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{percent}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-dark-muted rounded-full mt-2 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title={QUESTION_META.q9.title}
          subtitle={QUESTION_META.q9.subtitle}
          className="lg:col-span-6 xl:col-span-12"
          contentHeightClass="min-h-[420px]"
        >
          <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {q9Highlights.map((item, index) => (
                <article
                  key={item.label}
                  className={`rounded-2xl border px-5 py-4 text-center ${q9HighlightStyles[index] || 'border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/70'}`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{item.value}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">{item.caption}</p>
                </article>
              ))}
            </div>
            <div className="flex flex-col lg:flex-row gap-6 flex-1">
              <div className="w-full lg:w-80 mx-auto flex flex-col items-center gap-4">
                <div className="w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={filteredData.nameChangeAwareness} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                        {filteredData.nameChangeAwareness.map((slice, index) => (
                          <Cell key={`name-change-${slice.name}`} fill={NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-slate-800 dark:fill-white">
                        {nameChangeInsights.awarePercent}%
                      </text>
                      <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-slate-500 dark:fill-gray-400 font-medium uppercase tracking-wide">
                        ont remarqué
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-slate-500 dark:text-gray-400 text-center max-w-xs">
                  {nameChangeInsights.awarePercent}% des répondants déclarent avoir remarqué le changement de nom,
                  contre {nameChangeInsights.unawarePercent}% qui ne l'ont pas encore perçu.
                </p>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredData.nameChangeAwareness.map((slice, index) => {
                  const percent = nameChangeInsights.total ? Math.round((slice.value / nameChangeInsights.total) * 100) : 0;
                  const accentColor = NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length];
                  const barGradient = index === 0 ? 'from-emerald-400 to-emerald-600' : 'from-slate-400 to-slate-500';
                  const labelTone = index === 0 ? 'text-emerald-500' : 'text-slate-600 dark:text-gray-300';
                  return (
                    <article key={slice.name} className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/70 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} aria-hidden="true" />
                          <span className="text-sm font-semibold text-slate-800 dark:text-white">{slice.name}</span>
                        </div>
                        <span className={`text-sm font-bold ${labelTone}`}>{percent}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${barGradient}`} style={{ width: `${percent}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                        <span>{slice.value} réponses</span>
                        <span>{percent >= 50 ? 'Majoritaire' : 'Minoritaire'}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title={QUESTION_META.q10.title}
          subtitle={QUESTION_META.q10.subtitle}
          className="lg:col-span-6 xl:col-span-12"
          contentHeightClass="min-h-[480px]"
        >
          <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <article className="rounded-2xl border border-emerald-100 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-500/20 dark:via-transparent dark:to-transparent p-5">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase tracking-wide">Perception positive</p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-300 mt-3">{q10Insights.positiveRate}%</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">{q10Insights.totalPositive} réponses</p>
              </article>
              <article className="rounded-2xl border border-rose-100 dark:border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-white to-white dark:from-rose-500/20 dark:via-transparent dark:to-transparent p-5">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-300 uppercase tracking-wide">Perception négative</p>
                <p className="text-4xl font-black text-rose-600 dark:text-rose-300 mt-3">{q10Insights.negativeRate}%</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">{q10Insights.totalNegative} réponses</p>
              </article>
              <article className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/70 p-5">
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Indice net</p>
                <p className={`text-4xl font-black mt-3 ${q10Insights.netIndex >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {q10Insights.netIndex > 0 ? '+' : ''}{q10Insights.netIndex} pts
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Segment phare : {q10Insights.standout?.category || '—'}</p>
              </article>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 flex-1">
              <div className="flex-1 min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={q10Insights.chartData} layout="vertical" stackOffset="expand" margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="q10Positive" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={EXPERIENCE_POS_COLOR} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={EXPERIENCE_POS_COLOR} stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="q10Negative" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={EXPERIENCE_NEG_COLOR} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={EXPERIENCE_NEG_COLOR} stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide domain={[0, 1]} />
                    <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} width={120} tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip content={<ExperienceTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="positive" stackId="experience" fill="url(#q10Positive)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="negative" stackId="experience" fill="url(#q10Negative)" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-80 space-y-4">
                {q10Insights.chartData.map((item) => (
                  <div key={item.category} className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/70 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-gray-400">{item.category}</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.labelPositive}</p>
                      </div>
                      <div className="text-right leading-tight">
                        <p className="text-sm font-bold text-emerald-500">+{item.positivePercent}%</p>
                        <p className="text-xs font-bold text-rose-500">-{item.negativePercent}%</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-slate-500 dark:text-gray-400">
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide">
                        <span className="text-emerald-500">{item.labelPositive}</span>
                        <span className="text-rose-500 text-right">{item.labelNegative}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden flex">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${item.positivePercent}%` }} />
                        <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500" style={{ width: `${item.negativePercent}%` }} />
                      </div>
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-emerald-500">{item.positivePercent}% • {item.positive} réponses</span>
                        <span className="text-rose-500 text-right">{item.negativePercent}% • {item.negative} réponses</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
