
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { SurveyDataset } from '../types';
import { COLORS, SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';

interface QuestionsViewProps {
  data: SurveyDataset;
}

const QuestionsView: React.FC<QuestionsViewProps> = ({ data }) => {
  
  // Transform Q10 (Experience Changes) to individual pies per category
  const q10DetailCharts = data.experienceChanges.map((item) => ({
      title: `Répartition – ${item.category}`,
      data: [
        { name: item.labelPositive || 'Positif', value: item.positive },
        { name: item.labelNegative || 'Négatif', value: item.negative }
      ]
  }));

  const POS_NEG_COLORS = ['#22c55e', '#ef4444'];
  const NAME_CHANGE_COLORS = ['#0ea5e9', '#94a3b8'];
  const totalPositive = data.experienceChanges.reduce((acc, item) => acc + item.positive, 0);
  const totalNegative = data.experienceChanges.reduce((acc, item) => acc + item.negative, 0);
  const perceptionTotal = totalPositive + totalNegative || 1;
  const q10SummaryPie = [
      { name: 'Perception positive', value: totalPositive },
      { name: 'Perception négative', value: totalNegative },
  ];
  const perceptionHighlights = [
      {
        label: 'Perception positive',
        value: totalPositive,
        percent: perceptionTotal ? Math.round((totalPositive / perceptionTotal) * 100) : 0,
        accent: POS_NEG_COLORS[0]
      },
      {
        label: 'Perception négative',
        value: totalNegative,
        percent: perceptionTotal ? Math.round((totalNegative / perceptionTotal) * 100) : 0,
        accent: POS_NEG_COLORS[1]
      }
  ];
  const dominantPerception = totalPositive >= totalNegative ? 'positive' : 'négative';
  const dominantPercent = totalPositive >= totalNegative ? perceptionHighlights[0].percent : perceptionHighlights[1].percent;
  const q9Total = data.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0);

  // Helper to render the 3D-style Pie Chart
  // isWide determines if we place legend on the right (for Bento span-2 or span-4)
  const render3DPie = (
    chartData: {name: string, value: number}[], 
    colors: string[] = COLORS, 
    isWide: boolean = false,
    innerRadius: number = 0,
    showLegend: boolean = true
  ) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipColor = isDark ? '#cbd5f5' : '#0f172a';

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
          outerRadius={isWide ? 100 : 80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          // Apply the 3D filter to the pie group
          style={{ filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.3))' }} 
          stroke="none"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
             const RADIAN = Math.PI / 180;
             const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Push label slightly out
             const x = cx + radius * Math.cos(-midAngle * RADIAN);
             const y = cy + radius * Math.sin(-midAngle * RADIAN);
             return percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '';
          }}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]} 
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: isDark ? '0 10px 15px -3px rgba(15,23,42,0.8)' : '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            backgroundColor: tooltipBg,
            color: tooltipColor,
            backdropFilter: 'blur(4px)'
          }} 
        />
        {showLegend && (
          <Legend 
            layout={isWide ? "vertical" : "horizontal"} 
            verticalAlign={isWide ? "middle" : "bottom"} 
            align={isWide ? "right" : "center"}
            wrapperStyle={isWide ? { paddingLeft: '20px' } : { paddingTop: '10px' }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6 text-slate-800 dark:text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[380px]">
        
        {/* ROW 1: Q0 - Q3 (Demographics - 2 columns per row) */}
        <ChartCard title="Q0: Âge" subtitle="Tranche d'âge" className="col-span-1 lg:col-span-2">
          {render3DPie(data.ageGroups, COLORS, true)}
        </ChartCard>

        <ChartCard title="Q1: Zone" subtitle="Résidence" className="col-span-1 lg:col-span-2">
          {render3DPie(data.zones, COLORS, true)}
        </ChartCard>

        <ChartCard title="Q2: Transport" subtitle="Moyen de transport" className="col-span-1 lg:col-span-2">
          {render3DPie(data.transport, COLORS, true)}
        </ChartCard>

        <ChartCard title="Q3: Fréquence" subtitle="Visites par mois" className="col-span-1 lg:col-span-2">
          {render3DPie(data.frequency, COLORS, true)}
        </ChartCard>

        {/* ROW 2: Q4 & Q5 (Medium) */}
        <ChartCard 
          title="Q4: Motifs de Venue" 
          subtitle="Pourquoi venez-vous ?" 
          className="col-span-1 lg:col-span-2"
        >
          {render3DPie(data.visitReason, COLORS, true)}
        </ChartCard>

        <ChartCard 
          title="Q5: Concurrents" 
          subtitle="Magasins fréquentés" 
          className="col-span-1 lg:col-span-2"
        >
          {render3DPie(data.competitors, COLORS, true)}
        </ChartCard>

        {/* ROW 3: Q6 & Q7 (Medium) */}
        <ChartCard 
          title="Q6: Raisons du Choix" 
          subtitle="Critère principal" 
          className="col-span-1 lg:col-span-2"
        >
          {render3DPie(data.choiceReason, COLORS, true)}
        </ChartCard>

        <ChartCard 
          title="Q7: Satisfaction Globale" 
          subtitle="Expérience client" 
          className="col-span-1 lg:col-span-2"
        >
           {render3DPie(data.satisfaction, SATISFACTION_COLORS, true, 40)}
        </ChartCard>

        {/* ROW 4: Q8 (Large - Full Width) */}
        <ChartCard 
          title="Q8: Rayons Préférés" 
          subtitle="Top départements visités" 
          className="col-span-1 md:col-span-2 lg:col-span-4"
        >
          {/* Custom rendering for the large card to split into 2 pies or a very wide pie */}
          <div className="flex flex-col md:flex-row h-full items-center justify-center">
             <div className="w-full h-full">
               {render3DPie(data.preferredDepartment, COLORS, true, 60)}
             </div>
          </div>
        </ChartCard>

        {/* ROW 5: Q9 & Q10 (Medium) */}
        <ChartCard 
          title="Q9: Changement de Nom" 
          subtitle="Notoriété du changement" 
          className="col-span-1 md:col-span-2 lg:col-span-1"
        >
          <div className="flex flex-col h-full gap-6">
            <div className="flex-1 flex items-center justify-center min-h-[220px]">
              <div className="w-40 h-40">
                {render3DPie(data.nameChangeAwareness, NAME_CHANGE_COLORS, false, 55, false)}
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {data.nameChangeAwareness.map((slice, index) => {
                const percent = q9Total ? Math.round((slice.value / q9Total) * 100) : 0;
                return (
                  <div key={`q9-${slice.name}`} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length] }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-100">{slice.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{percent}%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{slice.value} réponses</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

        <ChartCard 
          title="Q10: Perception" 
          subtitle="Impact des changements" 
          className="col-span-1 md:col-span-2 lg:col-span-3 lg:row-span-2"
        >
          <div className="flex flex-col gap-6 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 lg:col-span-2 flex flex-col sm:flex-row items-center gap-6 shadow-slate-200/30 dark:shadow-black/40">
                <div className="w-40 h-40 shrink-0">
                  {render3DPie(q10SummaryPie, POS_NEG_COLORS, false, 55, false)}
                </div>
                <div className="space-y-3 text-slate-600 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Vue globale</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{dominantPercent}%</p>
                  <p className="text-sm leading-relaxed">
                    des répondants perçoivent les changements de façon {dominantPerception}.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total: {perceptionTotal} réponses</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {perceptionHighlights.map((highlight) => (
                  <div key={`badge-${highlight.label}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 bg-white/90 dark:bg-slate-900/60">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{highlight.label}</p>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{highlight.percent}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{highlight.value} réponses</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {q10DetailCharts.map((chart) => {
                const total = chart.data.reduce((sum, slice) => sum + slice.value, 0);
                return (
                  <div key={chart.title} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{chart.title}</p>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{total} réponses</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-32 h-32">
                        {render3DPie(chart.data, POS_NEG_COLORS, false, 42, false)}
                      </div>
                      <div className="flex-1 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                        {chart.data.map((slice, index) => {
                          const percent = total ? Math.round((slice.value / total) * 100) : 0;
                          return (
                            <div key={slice.name}>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-100">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: POS_NEG_COLORS[index % POS_NEG_COLORS.length] }} />
                                  {slice.name}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">{percent}%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <span
                                  className="block h-full rounded-full"
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor: POS_NEG_COLORS[index % POS_NEG_COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

      </div>
    </div>
  );
};

export default QuestionsView;
