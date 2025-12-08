import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { SurveyDataset } from '../types';
import { COLORS, SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';

interface QuestionsViewProps {
  data: SurveyDataset;
}

type ChartDatum = { name: string; value: number };
type SegmentInsight = ChartDatum & { percent: number };

interface PieRenderOptions {
  colors?: string[];
  isWide?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  emphasizeLabels?: boolean;
  segmentSpacing?: boolean;
  showLegend?: boolean;
}

const RADIAN = Math.PI / 180;

const renderDefaultLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (!percent || percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#0f172a" fontSize={12} fontWeight={600} textAnchor="middle" dominantBaseline="central">
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const renderEmphasizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  if (!percent || percent < 0.05) return null;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';
  return (
    <g>
      <text x={x} y={y} fill="#0f172a" fontSize={13} fontWeight={700} textAnchor={textAnchor} dominantBaseline="central">
        {(percent * 100).toFixed(0)}%
      </text>
      <text x={x} y={y + 14} fill="#64748b" fontSize={11} fontWeight={500} textAnchor={textAnchor} dominantBaseline="central">
        {name}
      </text>
    </g>
  );
};

const renderPieChart = (
  chartData: ChartDatum[],
  {
    colors = COLORS,
    isWide = false,
    innerRadius = 0,
    outerRadius,
    emphasizeLabels = false,
    segmentSpacing = false,
    showLegend = true
  }: PieRenderOptions = {}
) => {
  const chartOuterRadius = outerRadius ?? (isWide ? 100 : 80);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="3" dy="3" result="offsetBlur" />
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#ffffff" result="specOut">
              <fePointLight x="-5000" y="-10000" z="20000" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="litPaint" />
            </feMerge>
          </filter>
        </defs>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={chartOuterRadius}
          fill="#8884d8"
          paddingAngle={segmentSpacing ? 8 : 5}
          dataKey="value"
          style={{ filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.3))' }}
          stroke={segmentSpacing ? '#f8fafc' : 'none'}
          strokeWidth={segmentSpacing ? 3 : 0}
          cornerRadius={segmentSpacing ? 8 : 0}
          label={emphasizeLabels ? renderEmphasizedLabel : renderDefaultLabel}
          labelLine={emphasizeLabels}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={segmentSpacing ? 0 : 1}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)'
          }}
        />
        {showLegend && (
          <Legend
            layout={isWide ? 'vertical' : 'horizontal'}
            verticalAlign={isWide ? 'middle' : 'bottom'}
            align={isWide ? 'right' : 'center'}
            wrapperStyle={isWide ? { paddingLeft: '20px' } : { paddingTop: '10px' }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

const getTopSegments = (chartData: ChartDatum[]): SegmentInsight[] => {
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
  if (!total) return [];
  const sorted = [...chartData].sort((a, b) => b.value - a.value);
  const insights = sorted.slice(0, 2).map(item => ({
    ...item,
    percent: Math.round((item.value / total) * 100)
  }));
  const remainingValue = sorted.slice(2).reduce((acc, curr) => acc + curr.value, 0);
  if (remainingValue > 0) {
    insights.push({
      name: 'Autres',
      value: remainingValue,
      percent: Math.round((remainingValue / total) * 100)
    });
  }
  return insights;
};

const QuestionsView: React.FC<QuestionsViewProps> = ({ data }) => {
  const q10Data = [
    { name: 'Positif', value: data.experienceChanges.reduce((acc, curr) => acc + curr.positive, 0) },
    { name: 'Négatif', value: data.experienceChanges.reduce((acc, curr) => acc + curr.negative, 0) }
  ];

  const totalRespondents = data.ageGroups.reduce((acc, curr) => acc + curr.value, 0);
  const topAgeGroup = [...data.ageGroups].sort((a, b) => b.value - a.value)[0];
  const topZone = [...data.zones].sort((a, b) => b.value - a.value)[0];
  const topFrequency = [...data.frequency].sort((a, b) => b.value - a.value)[0];

  const demographicCharts = [
    { title: 'Q0: Âge', subtitle: "Tranche d'âge", dataset: data.ageGroups },
    { title: 'Q1: Zone', subtitle: 'Résidence', dataset: data.zones },
    { title: 'Q2: Transport', subtitle: 'Moyen de transport', dataset: data.transport },
    { title: 'Q3: Fréquence', subtitle: 'Visites par mois', dataset: data.frequency }
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-[0.3em]">Panorama des questions</p>
          <h2 className="text-2xl font-bold text-slate-900">Profil et comportements des répondants</h2>
          <p className="text-sm text-slate-500 max-w-3xl">
            Visualisation hiérarchisée des questions clés afin de comparer rapidement la structure démographique et les usages terrain.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Échantillon analysé</p>
            <p className="text-2xl font-bold text-slate-900">{totalRespondents}</p>
            <p className="text-xs text-slate-500">répondants</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tranche dominante</p>
            <p className="text-2xl font-bold text-slate-900">{topAgeGroup ? topAgeGroup.name : '—'}</p>
            <p className="text-xs text-slate-500">par âge</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Zone la plus active</p>
            <p className="text-2xl font-bold text-slate-900">{topZone ? topZone.name : '—'}</p>
            <p className="text-xs text-slate-500">fréquence {topFrequency ? topFrequency.name : '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[420px]">
        {demographicCharts.map(chart => {
          const insights = getTopSegments(chart.dataset);
          return (
            <ChartCard key={chart.title} title={chart.title} subtitle={chart.subtitle} contentClassName="flex flex-col gap-4 h-full">
              <div className="flex-1">
                <div className="h-48">
                  {renderPieChart(chart.dataset, {
                    emphasizeLabels: true,
                    segmentSpacing: true,
                    innerRadius: 35,
                    outerRadius: 90,
                    showLegend: false
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                {insights.length === 0 ? (
                  <div className="col-span-2 text-center text-slate-400 font-semibold">Données indisponibles</div>
                ) : (
                  insights.map(segment => (
                    <div key={`${chart.title}-${segment.name}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{segment.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{segment.percent}%</span>
                        <span className="text-[11px] text-slate-400 font-medium">{segment.value}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">réponses</p>
                    </div>
                  ))
                )}
              </div>
            </ChartCard>
          );
        })}

        <ChartCard title="Q4: Motifs de Venue" subtitle="Pourquoi venez-vous ?" className="col-span-1 lg:col-span-2">
          {renderPieChart(data.visitReason, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q5: Concurrents" subtitle="Magasins fréquentés" className="col-span-1 lg:col-span-2">
          {renderPieChart(data.competitors, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q6: Raisons du Choix" subtitle="Critère principal" className="col-span-1 lg:col-span-2">
          {renderPieChart(data.choiceReason, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q7: Satisfaction Globale" subtitle="Expérience client" className="col-span-1 lg:col-span-2">
          {renderPieChart(data.satisfaction, { colors: SATISFACTION_COLORS, isWide: true, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q8: Rayons Préférés" subtitle="Top départements visités" className="col-span-1 md:col-span-2 lg:col-span-4">
          <div className="flex flex-col md:flex-row h-full items-center justify-center">
            <div className="w-full h-full">
              {renderPieChart(data.preferredDepartment, { colors: COLORS, isWide: true, innerRadius: 60 })}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Q9: Changement de Nom" subtitle="Notoriété du changement" className="col-span-1 md:col-span-2 lg:col-span-2">
          {renderPieChart(data.nameChangeAwareness, { colors: ['#22c55e', '#ef4444'], isWide: true })}
        </ChartCard>

        <ChartCard title="Q10: Perception" subtitle="Impact des changements" className="col-span-1 md:col-span-2 lg:col-span-2">
          {renderPieChart(q10Data, { colors: ['#22c55e', '#ef4444'], isWide: true, innerRadius: 40 })}
        </ChartCard>
      </div>
    </div>
  );
};

export default QuestionsView;
