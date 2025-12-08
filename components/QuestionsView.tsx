import React, { useMemo } from 'react';
import { SurveyDataset } from '../types';
import { COLORS, SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';
import { render3DPie } from './Pie3DRenderer';

interface QuestionsViewProps {
  data: SurveyDataset;
}

const POS_NEG_COLORS = ['#22c55e', '#ef4444'];
const NAME_CHANGE_COLORS = ['#0ea5e9', '#94a3b8'];

const QuestionsView: React.FC<QuestionsViewProps> = ({ data }) => {
  const q10DetailCharts = useMemo(
    () =>
      data.experienceChanges.map((item) => ({
        title: `Répartition – ${item.category}`,
        data: [
          { name: item.labelPositive || 'Positif', value: item.positive },
          { name: item.labelNegative || 'Négatif', value: item.negative },
        ],
      })),
    [data.experienceChanges]
  );

  const perceptionStats = useMemo(() => {
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
        accent: POS_NEG_COLORS[0],
      },
      {
        label: 'Perception négative',
        value: totalNegative,
        percent: perceptionTotal ? Math.round((totalNegative / perceptionTotal) * 100) : 0,
        accent: POS_NEG_COLORS[1],
      },
    ];
    const dominantPerception = totalPositive >= totalNegative ? 'positive' : 'négative';
    const dominantPercent = totalPositive >= totalNegative ? perceptionHighlights[0].percent : perceptionHighlights[1].percent;

    return { totalPositive, totalNegative, perceptionTotal, q10SummaryPie, perceptionHighlights, dominantPerception, dominantPercent };
  }, [data.experienceChanges]);

  const q9Total = useMemo(() => data.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0), [data.nameChangeAwareness]);

  return (
    <div className="p-6 text-slate-800 dark:text-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[380px]">
        <ChartCard title="Q0: Âge" subtitle="Tranche d'âge" className="col-span-1 lg:col-span-2">
          {render3DPie(data.ageGroups, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q1: Zone" subtitle="Résidence" className="col-span-1 lg:col-span-2">
          {render3DPie(data.zones, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q2: Transport" subtitle="Moyen de transport" className="col-span-1 lg:col-span-2">
          {render3DPie(data.transport, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q3: Fréquence" subtitle="Visites par mois" className="col-span-1 lg:col-span-2">
          {render3DPie(data.frequency, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q4: Motifs de Venue" subtitle="Pourquoi venez-vous ?" className="col-span-1 lg:col-span-2">
          {render3DPie(data.visitReason, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q5: Concurrents" subtitle="Magasins fréquentés" className="col-span-1 lg:col-span-2">
          {render3DPie(data.competitors, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q6: Raisons du Choix" subtitle="Critère principal" className="col-span-1 lg:col-span-2">
          {render3DPie(data.choiceReason, { colors: COLORS, isWide: true })}
        </ChartCard>

        <ChartCard title="Q7: Satisfaction Globale" subtitle="Expérience client" className="col-span-1 lg:col-span-2">
          {render3DPie(data.satisfaction, { colors: SATISFACTION_COLORS, isWide: true, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q8: Rayons Préférés" subtitle="Top départements visités" className="col-span-1 md:col-span-2 lg:col-span-4">
          <div className="flex flex-col md:flex-row h-full items-center justify-center">
            <div className="w-full h-full">{render3DPie(data.preferredDepartment, { colors: COLORS, isWide: true, innerRadius: 60 })}</div>
          </div>
        </ChartCard>

        <ChartCard title="Q9: Changement de Nom" subtitle="Notoriété du changement" className="col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col h-full gap-6">
            <div className="flex-1 flex items-center justify-center min-h-[220px]">
              <div className="w-40 h-40">{render3DPie(data.nameChangeAwareness, { colors: NAME_CHANGE_COLORS, innerRadius: 55, showLegend: false })}</div>
            </div>
            <div className="space-y-3 text-sm">
              {data.nameChangeAwareness.map((slice, index) => {
                const percent = q9Total ? Math.round((slice.value / q9Total) * 100) : 0;
                return (
                  <div key={`q9-${slice.name}`} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/70 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length] }} aria-hidden="true" />
                      <span className="font-semibold text-slate-700 dark:text-gray-100">{slice.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{percent}%</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{slice.value} réponses</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Q10: Perception" subtitle="Impact des changements" className="col-span-1 md:col-span-2 lg:col-span-3 lg:row-span-2">
          <div className="flex flex-col gap-6 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <article className="rounded-xl border border-slate-200 dark:border-dark-border bg-gradient-to-b from-white to-slate-50 dark:from-dark-surface dark:to-dark-bg p-6 lg:col-span-2 flex flex-col sm:flex-row items-center gap-6 shadow-slate-200/30 dark:shadow-black/40">
                <div className="w-40 h-40 shrink-0">{render3DPie(perceptionStats.q10SummaryPie, { colors: POS_NEG_COLORS, innerRadius: 55, showLegend: false })}</div>
                <div className="space-y-3 text-slate-600 dark:text-gray-300">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-gray-500">Vue globale</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{perceptionStats.dominantPercent}%</p>
                  <p className="text-sm leading-relaxed">des répondants perçoivent les changements de façon {perceptionStats.dominantPerception}.</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Total: {perceptionStats.perceptionTotal} réponses</p>
                </div>
              </article>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {perceptionStats.perceptionHighlights.map((highlight) => (
                  <article key={`badge-${highlight.label}`} className="rounded-xl border border-slate-200 dark:border-dark-border px-4 py-3 bg-white/90 dark:bg-dark-card/70">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">{highlight.label}</p>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{highlight.percent}%</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{highlight.value} réponses</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {q10DetailCharts.map((chart) => {
                const total = chart.data.reduce((sum, slice) => sum + slice.value, 0);
                return (
                  <article key={chart.title} className="rounded-xl border border-slate-200 dark:border-dark-border bg-white/90 dark:bg-dark-card/70 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{chart.title}</h4>
                      <span className="text-xs font-medium text-slate-500 dark:text-gray-400">{total} réponses</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-32 h-32">{render3DPie(chart.data, { colors: POS_NEG_COLORS, innerRadius: 42, showLegend: false, minLabelPercent: 0.12, paddingAngle: 4, labelPosition: 'inside' })}</div>
                      <div className="flex-1 space-y-3 text-sm text-slate-700 dark:text-gray-200">
                        {chart.data.map((slice, index) => {
                          const percent = total ? Math.round((slice.value / total) * 100) : 0;
                          return (
                            <div key={slice.name}>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-gray-100">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: POS_NEG_COLORS[index % POS_NEG_COLORS.length] }} aria-hidden="true" />
                                  {slice.name}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">{percent}%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-dark-muted overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                                <span className="block h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: POS_NEG_COLORS[index % POS_NEG_COLORS.length] }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </article>
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
