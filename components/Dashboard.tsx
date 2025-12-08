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
  Car,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  ArrowUpRight,
  Check,
  ChevronDown
} from 'lucide-react';
import { SurveyDataset, SimpleDataPoint } from '../types';
import { SATISFACTION_COLORS, COLORS } from '../constants';
import ChartCard from './ChartCard';
import * as XLSX from 'xlsx';

interface DashboardProps {
  data: SurveyDataset;
}

const QUESTION_META = {
  q0: { title: 'Q0 • Répartition des âges', subtitle: 'Tranches d'âge des répondants' },
  q2: { title: 'Q2 • Moyen de transport', subtitle: 'Comment les visiteurs se rendent au mall' },
  q3: { title: 'Q3 • Fréquence de visite', subtitle: 'Rythme des achats à l'hypermarché' },
  q5: { title: 'Q5 • Magasin alimentaire le plus fréquenté', subtitle: 'Part de visite par enseigne' },
  q7: { title: 'Q7 • Satisfaction globale', subtitle: 'Évaluation de la visite du jour' },
  q8: { title: 'Q8 • Rayons préférés', subtitle: 'Départements les plus attractifs' }
};

const MONTHLY_PROFITS_COLORS = ['#C4B5E6', '#A8D4F0', '#D4E4D2'];

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (selectedZone === 'All') return data;
    const totalRespondents = data.zones.reduce((acc, curr) => acc + curr.value, 0);
    const zoneData = data.zones.find(z => z.name === selectedZone);
    const zoneValue = zoneData ? zoneData.value : 0;
    if (totalRespondents === 0 || zoneValue === 0) return data;
    const ratio = zoneValue / totalRespondents;
    const scaleDataset = (dataset: SimpleDataPoint[]) => {
      return dataset.map(item => ({ ...item, value: Math.round(item.value * ratio) }));
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
    .filter(s => s.name === 'Satisfait' || s.name === 'Très satisfait')
    .reduce((acc, curr) => acc + curr.value, 0);
  const satisfactionRate = totalSatisfaction > 0 ? Math.round((positiveSatisfaction / totalSatisfaction) * 100) : 0;
  const topZone = [...filteredData.zones].sort((a, b) => b.value - a.value)[0] || { name: 'N/A', value: 0 };
  const totalZones = data.zones.reduce((acc, curr) => acc + curr.value, 0);
  const topZonePercent = selectedZone === 'All' ? (totalZones > 0 ? Math.round((topZone.value / totalZones) * 100) : 0) : 100;
  const topTransport = [...filteredData.transport].sort((a, b) => b.value - a.value)[0];

  const monthlyProfitsData = [
    { name: 'Giveaway', value: 60, color: '#C4B5E6' },
    { name: 'Affiliate', value: 24, color: '#A8D4F0' },
    { name: 'Offline Sales', value: 16, color: '#D4E4D2' }
  ];

  const weeklyData = [
    { name: 'Lun', value: 8000 },
    { name: 'Mar', value: 12000 },
    { name: 'Mer', value: 33567 },
    { name: 'Jeu', value: 28000 },
    { name: 'Ven', value: 22000 },
    { name: 'Sam', value: 18000 },
    { name: 'Dim', value: 25000 }
  ];

  const handleExportXLSX = () => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];
    const addSheet = (rows: any[], name: string) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-charcoal-800 p-5 rounded-2xl border border-cream-300 dark:border-charcoal-700 shadow-sm relative z-20">
        <div>
          <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">Tableau de bord</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-charcoal-900/50 dark:text-cream-400">Mises à jour des paiements</p>
            {selectedZone !== 'All' && (
              <span className="bg-sage-200 text-sage-500 text-xs font-bold px-2 py-0.5 rounded-full">
                Filtre : {selectedZone}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100 rounded-xl text-sm font-medium hover:bg-cream-200 dark:hover:bg-charcoal-600 border border-cream-300 dark:border-charcoal-600 transition-colors">
            <Calendar size={16} />
            <span>30 derniers jours</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                selectedZone !== 'All'
                  ? 'bg-sage-100 text-sage-500 border-sage-300 dark:bg-sage-500/20 dark:text-sage-300 dark:border-sage-400/40'
                  : 'bg-cream-100 text-charcoal-900 border-cream-300 hover:bg-cream-200 dark:bg-charcoal-700 dark:text-cream-100 dark:border-charcoal-600 dark:hover:bg-charcoal-600'
              }`}
            >
              <Filter size={16} />
              <span>{selectedZone === 'All' ? 'Filtrer' : selectedZone}</span>
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border border-cream-300 dark:border-charcoal-700 overflow-hidden z-20 py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-charcoal-900/40 dark:text-cream-400 uppercase tracking-wider">
                    Choisir une zone
                  </div>
                  <button
                    onClick={() => { setSelectedZone('All'); setIsFilterOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-charcoal-900 dark:text-cream-100 hover:bg-sage-100 dark:hover:bg-charcoal-700 flex items-center justify-between transition-colors"
                  >
                    <span>Toutes les zones</span>
                    {selectedZone === 'All' && <Check size={14} className="text-sage-500" />}
                  </button>
                  {data.zones.map(zone => (
                    <button
                      key={zone.name}
                      onClick={() => { setSelectedZone(zone.name); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-charcoal-900 dark:text-cream-100 hover:bg-sage-100 dark:hover:bg-charcoal-700 flex items-center justify-between transition-colors"
                    >
                      <span>{zone.name}</span>
                      {selectedZone === zone.name && <Check size={14} className="text-sage-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-xl text-sm font-medium hover:bg-sage-500 shadow-sm transition-all hover:shadow-md"
          >
            <Download size={16} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-sage-200 dark:bg-sage-900/30 rounded-2xl p-6 border border-sage-300 dark:border-sage-800 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sage-300/50 dark:bg-sage-700/30 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sage-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <span className="text-sm font-medium text-sage-600 dark:text-sage-300">Balance</span>
              </div>
              <span className="text-xs font-bold text-sage-500 bg-sage-300/50 dark:bg-sage-700/50 px-2 py-0.5 rounded-full">+17%</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-900 dark:text-white mt-3">$ {totalRespondents.toLocaleString()}</p>
            <div className="mt-3 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 h-8 bg-sage-300/60 dark:bg-sage-700/40 rounded-sm" style={{ height: `${20 + Math.random() * 20}px` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-sand-200 dark:bg-sand-900/30 rounded-2xl p-6 border border-sand-300 dark:border-sand-800 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sand-300/50 dark:bg-sand-700/30 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sand-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-sand-600 dark:text-sand-300">Ventes</span>
              </div>
              <span className="text-xs font-bold text-sand-500 bg-sand-300/50 dark:bg-sand-700/50 px-2 py-0.5 rounded-full">+23%</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-900 dark:text-white mt-3">$ {(positiveSatisfaction * 100).toLocaleString()}</p>
            <div className="mt-3 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 bg-sand-300/60 dark:bg-sand-700/40 rounded-sm" style={{ height: `${15 + Math.random() * 25}px` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-sand-100 dark:bg-sand-900/20 rounded-2xl p-6 border border-sand-200 dark:border-sand-800">
          <div className="text-center">
            <p className="text-lg font-bold text-charcoal-900 dark:text-white">Upgrade</p>
            <p className="text-sm text-charcoal-900/50 dark:text-cream-400 mt-1">Obtenez plus d'informations et d'opportunités</p>
            <button className="mt-4 px-6 py-2 bg-sage-400 text-white rounded-lg text-sm font-medium hover:bg-sage-500 transition-colors">
              Go Pro
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-cream-300 dark:border-charcoal-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-bold text-charcoal-900 dark:text-white">Profits Mensuels</p>
              <p className="text-xs text-charcoal-900/50 dark:text-cream-400">Croissance totale de {satisfactionRate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monthlyProfitsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {monthlyProfitsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-charcoal-900/50 dark:text-cream-400">Total</p>
                <p className="text-sm font-bold text-charcoal-900 dark:text-white">${(totalRespondents * 163).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {monthlyProfitsData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-6 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-charcoal-900/70 dark:text-cream-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-charcoal-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-cream-300 dark:border-charcoal-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-base font-bold text-charcoal-900 dark:text-white">Utilisateurs cette semaine</p>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white mt-1">+ 3,2%</p>
            </div>
            <button className="text-sm text-sage-500 hover:text-sage-600 font-medium">
              Voir toutes les stats
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4DA" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F6F1' }} />
                <Bar dataKey="value" fill="#2C2C2C" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-cream-300 dark:border-charcoal-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-bold text-charcoal-900 dark:text-white">Ventes récentes</p>
            </div>
            <button className="text-sm text-sage-500 hover:text-sage-600 font-medium">Voir tout</button>
          </div>
          <div className="space-y-4">
            {filteredData.competitors.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cream-200 to-cream-300 flex items-center justify-center">
                  <span className="text-sm font-bold text-charcoal-900">{item.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-charcoal-900/50 dark:text-cream-400">0{index + 2} Minutes Ago</p>
                </div>
                <span className="text-sm font-bold text-sage-500">+ ${(item.value * 2).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title={QUESTION_META.q5.title} subtitle={QUESTION_META.q5.subtitle} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData.competitors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBarNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2C2C2C" stopOpacity={1} />
                  <stop offset="95%" stopColor="#2C2C2C" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="colorBarHighlightNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9CC496" stopOpacity={1} />
                  <stop offset="95%" stopColor="#9CC496" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4DA" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F6F1' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                {filteredData.competitors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Bawadi Mall' ? 'url(#colorBarHighlightNew)' : '#2C2C2C'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q7.title} subtitle={QUESTION_META.q7.subtitle}>
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredData.satisfaction}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {filteredData.satisfaction.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-charcoal-900 dark:text-white">{satisfactionRate}%</p>
                  <p className="text-xs text-charcoal-900/50 dark:text-cream-400 uppercase tracking-wide">Positif</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {filteredData.satisfaction.map((item, index) => {
                const percent = totalSatisfaction > 0 ? Math.round((item.value / totalSatisfaction) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SATISFACTION_COLORS[index] }}></div>
                      <span className="text-sm text-charcoal-900/70 dark:text-cream-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-charcoal-900 dark:text-white">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

        <ChartCard title={QUESTION_META.q2.title} subtitle={QUESTION_META.q2.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={filteredData.transport} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8E4DA" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" fill="#9CC496" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q3.title} subtitle={QUESTION_META.q3.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData.frequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFreqNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4B5E6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#C4B5E6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#E8E4DA" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#C4B5E6" strokeWidth={3} fillOpacity={1} fill="url(#colorFreqNew)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q0.title} subtitle={QUESTION_META.q0.subtitle}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={filteredData.ageGroups}>
              <PolarGrid stroke="#E8E4DA" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Répondants" dataKey="value" stroke="#C4B5E6" strokeWidth={3} fill="#C4B5E6" fillOpacity={0.4} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={QUESTION_META.q8.title} subtitle={QUESTION_META.q8.subtitle} className="lg:col-span-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData.preferredDepartment} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDeptNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A8D4F0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#A8D4F0" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4DA" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#A8D4F0" strokeWidth={3} fill="url(#colorDeptNew)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-charcoal-800 backdrop-blur-md p-4 rounded-xl shadow-xl border border-cream-300 dark:border-charcoal-700 text-sm text-charcoal-900 dark:text-cream-100">
        <p className="font-bold text-charcoal-900 dark:text-white mb-1">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
            <span className="text-charcoal-900/60 dark:text-cream-400 capitalize">{entry.name} :</span>
            <span className="font-mono font-semibold text-charcoal-900 dark:text-cream-100">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default Dashboard;
