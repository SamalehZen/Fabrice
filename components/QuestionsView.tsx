
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
  const q9Total = data.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0);

  // Helper to render the 3D-style Pie Chart
  // isWide determines if we place legend on the right (for Bento span-2 or span-4)
  const render3DPie = (
    chartData: {name: string, value: number}[], 
    colors: string[] = COLORS, 
    isWide: boolean = false,
    innerRadius: number = 0,
    showLegend: boolean = true
  ) => (
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
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
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

  return (
    <div className="p-6">
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
          <div className="flex flex-col h-full">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Niveau actuel</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {data.nameChangeAwareness.map((slice) => {
                  const percent = q9Total ? Math.round((slice.value / q9Total) * 100) : 0;
                  return (
                    <div key={slice.name} className="flex flex-col">
                      <span className="text-sm text-white/70">{slice.name}</span>
                      <span className="text-3xl font-bold leading-tight">{percent}%</span>
                      <span className="text-xs text-white/50">{slice.value} réponses</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between mt-5">
              <div className="flex-1 min-h-[200px]">
                {render3DPie(data.nameChangeAwareness, NAME_CHANGE_COLORS, false, 45, false)}
              </div>
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                {data.nameChangeAwareness.map((slice, index) => {
                  const percent = q9Total ? Math.round((slice.value / q9Total) * 100) : 0;
                  return (
                    <div key={`legend-${slice.name}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length] }} />
                        <span className="font-semibold text-slate-700">{slice.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard 
          title="Q10: Perception" 
          subtitle="Impact des changements" 
          className="col-span-1 md:col-span-2 lg:col-span-3 lg:row-span-2"
        >
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {perceptionHighlights.map((highlight) => (
                <div key={highlight.label} className="rounded-3xl p-5 text-white shadow-[0_25px_60px_-20px_rgba(15,23,42,0.7)] relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-80"
                    style={{ background: `linear-gradient(135deg, ${highlight.accent}, #0f172a)` }}
                  />
                  <div className="relative z-10">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">{highlight.label}</p>
                    <p className="text-4xl font-bold mt-2">{highlight.percent}%</p>
                    <p className="text-sm text-white/80 mt-1">{highlight.value} réponses</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {q10DetailCharts.map((chart) => {
                const total = chart.data.reduce((sum, slice) => sum + slice.value, 0);
                return (
                  <div key={chart.title} className="relative rounded-3xl border border-slate-100 bg-white/90 backdrop-blur-md p-5 flex flex-col shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top, rgba(56,189,248,0.15), transparent 60%)' }} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Focus</p>
                          <p className="text-lg font-semibold text-slate-900">{chart.title}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{total} réponses</span>
                      </div>
                      <div className="mt-4 flex flex-1 items-center gap-5">
                        <div className="flex-1 min-h-[220px]">
                          {render3DPie(chart.data, POS_NEG_COLORS, false, 45, false)}
                        </div>
                        <div className="w-32 space-y-4 text-sm text-slate-700">
                          {chart.data.map((slice, index) => {
                            const percent = total ? Math.round((slice.value / total) * 100) : 0;
                            return (
                              <div key={slice.name}>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 font-semibold">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: POS_NEG_COLORS[index % POS_NEG_COLORS.length] }} />
                                    {slice.name}
                                  </span>
                                  <span className="font-semibold text-slate-900">{percent}%</span>
                                </div>
                                <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
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
