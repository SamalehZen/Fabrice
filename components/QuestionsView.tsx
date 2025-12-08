
import React from 'react';
import { SurveyDataset } from '../types';
import { COLORS, SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';
import { render3DPie } from './Pie3DRenderer';

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
  const NAME_CHANGE_COLORS = ['#6366f1', '#94a3b8']; // Indigo-500, Slate-400
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
  const q9Total = data.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* ROW 1: Q0 - Q3 (Demographics - 2 columns per row) */}
        <ChartCard title="Q0: Âge" subtitle="Tranche d'âge des répondants" className="col-span-1 lg:col-span-2">
           <div className="h-64 md:h-80">
            {render3DPie(data.ageGroups, { colors: COLORS, isWide: true })}
           </div>
        </ChartCard>

        <ChartCard title="Q1: Zone Résidentielle" subtitle="Provenance des visiteurs" className="col-span-1 lg:col-span-2">
          <div className="h-64 md:h-80">
            {render3DPie(data.zones, { colors: COLORS, isWide: true })}
          </div>
        </ChartCard>

        <ChartCard title="Q2: Transport" subtitle="Moyens d'accès utilisés" className="col-span-1 lg:col-span-2">
          <div className="h-64 md:h-80">
            {render3DPie(data.transport, { colors: COLORS, isWide: true })}
          </div>
        </ChartCard>

        <ChartCard title="Q3: Fréquence" subtitle="Habitudes de visite" className="col-span-1 lg:col-span-2">
           <div className="h-64 md:h-80">
            {render3DPie(data.frequency, { colors: COLORS, isWide: true })}
           </div>
        </ChartCard>

        {/* ROW 2: Q4 & Q5 (Medium) */}
        <ChartCard title="Q4: Motifs de Venue" subtitle="Pourquoi venez-vous ?" className="col-span-1 lg:col-span-2">
           <div className="h-64 md:h-80">
            {render3DPie(data.visitReason, { colors: COLORS, isWide: true })}
           </div>
        </ChartCard>

        <ChartCard title="Q5: Concurrents" subtitle="Autres lieux fréquentés" className="col-span-1 lg:col-span-2">
           <div className="h-64 md:h-80">
            {render3DPie(data.competitors, { colors: COLORS, isWide: true })}
           </div>
        </ChartCard>

        {/* ROW 3: Q6 & Q7 (Medium) */}
        <ChartCard title="Q6: Raisons du Choix" subtitle="Critères de sélection" className="col-span-1 lg:col-span-2">
           <div className="h-64 md:h-80">
            {render3DPie(data.choiceReason, { colors: COLORS, isWide: true })}
           </div>
        </ChartCard>

        <ChartCard title="Q7: Satisfaction Globale" subtitle="Expérience générale" className="col-span-1 lg:col-span-2">
           <div className="h-64 md:h-80">
             {render3DPie(data.satisfaction, { colors: SATISFACTION_COLORS, isWide: true, innerRadius: 50 })}
           </div>
        </ChartCard>

        {/* ROW 4: Q8 (Large - Full Width) */}
        <ChartCard title="Q8: Rayons Préférés" subtitle="Départements les plus populaires" className="col-span-1 md:col-span-2 lg:col-span-4">
           <div className="h-96 w-full">
               {render3DPie(data.preferredDepartment, { colors: COLORS, isWide: true, innerRadius: 70 })}
           </div>
        </ChartCard>

        {/* ROW 5: Q9 & Q10 (Medium) */}
        <ChartCard title="Q9: Notoriété" subtitle="Changement de nom" className="col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col h-full gap-6">
            <div className="flex-1 flex items-center justify-center min-h-[220px]">
              <div className="w-full h-48">
                {render3DPie(data.nameChangeAwareness, { colors: NAME_CHANGE_COLORS, innerRadius: 50, showLegend: false })}
              </div>
            </div>
            <div className="space-y-3 pb-4">
              {data.nameChangeAwareness.map((slice, index) => {
                const percent = q9Total ? Math.round((slice.value / q9Total) * 100) : 0;
                return (
                  <div key={`q9-${slice.name}`} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length] }} />
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-100">{slice.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-800 dark:text-white leading-tight">{percent}%</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{slice.value} avis</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Q10: Perception des Changements" subtitle="Analyse détaillée" className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex flex-col gap-6 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Summary Block */}
               <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 p-6 flex items-center gap-6 border border-indigo-100 dark:border-indigo-900/30">
                 <div className="w-32 h-32 shrink-0">
                    {render3DPie(q10SummaryPie, { colors: POS_NEG_COLORS, innerRadius: 40, showLegend: false })}
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1">Sentiment Global</p>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{dominantPercent}%</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      de satisfaction globale concernant les changements récents.
                    </p>
                 </div>
               </div>

               {/* Key Stats */}
               <div className="flex flex-col gap-3 justify-center">
                 {perceptionHighlights.map((highlight) => (
                    <div key={`highlight-${highlight.label}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                       <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{highlight.label}</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{highlight.value} réponses</p>
                       </div>
                       <div className="text-2xl font-black" style={{ color: highlight.accent }}>{highlight.percent}%</div>
                    </div>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
              {q10DetailCharts.map((chart) => {
                const total = chart.data.reduce((sum, slice) => sum + slice.value, 0);
                return (
                  <div key={chart.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                       <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate pr-2">{chart.title.replace('Répartition – ', '')}</p>
                       <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{total}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 shrink-0">
                        {render3DPie(chart.data, { colors: POS_NEG_COLORS, innerRadius: 0, showLegend: false, minLabelPercent: 1 })}
                      </div>
                      <div className="flex-1 space-y-2">
                         {chart.data.map((slice, idx) => (
                            <div key={slice.name} className="flex justify-between items-center text-xs">
                               <span className="text-slate-500 dark:text-slate-400 capitalize">{slice.name}</span>
                               <span className="font-bold text-slate-700 dark:text-slate-200">{Math.round((slice.value/total)*100)}%</span>
                            </div>
                         ))}
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
