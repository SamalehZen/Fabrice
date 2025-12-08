import React from 'react';
import { SurveyDataset } from '../types';
import { COLORS, SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';
import { render3DPie } from './Pie3DRenderer';

interface QuestionsViewProps {
  data: SurveyDataset;
}

const QuestionsView: React.FC<QuestionsViewProps> = ({ data }) => {
  const NAME_CHANGE_COLORS = ['#38BDF8', '#94A3B8'];
  const POS_NEG_COLORS = ['#4ADE80', '#F87171'];
  
  // Q10 Helpers
  const totalPositive = data.experienceChanges.reduce((acc, item) => acc + item.positive, 0);
  const totalNegative = data.experienceChanges.reduce((acc, item) => acc + item.negative, 0);
  const q10SummaryPie = [
      { name: 'Positif', value: totalPositive },
      { name: 'Négatif', value: totalNegative },
  ];

  return (
    <div className="pb-20 space-y-8">
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm">
         <h1 className="text-2xl font-bold text-slate-800">Questions & Réponses</h1>
         <p className="text-slate-500">Vue détaillée par question (Camemberts)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Standard Pie Charts */}
        <ChartCard title="Q0. Âge" subtitle="Démographie">
          {render3DPie(data.ageGroups, { colors: COLORS, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q1. Zone" subtitle="Provenance">
          {render3DPie(data.zones, { colors: COLORS, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q2. Transport" subtitle="Accès">
          {render3DPie(data.transport, { colors: COLORS, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q3. Fréquence" subtitle="Habitudes">
          {render3DPie(data.frequency, { colors: COLORS, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q4. Motifs" subtitle="Raison de visite">
          {render3DPie(data.visitReason, { colors: COLORS, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q5. Concurrents" subtitle="Parts de marché">
          {render3DPie(data.competitors, { colors: COLORS, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q6. Choix" subtitle="Critères">
          {render3DPie(data.choiceReason, { colors: COLORS, innerRadius: 40 })}
        </ChartCard>

        <ChartCard title="Q7. Satisfaction" subtitle="NPS">
           {render3DPie(data.satisfaction, { colors: SATISFACTION_COLORS, innerRadius: 50 })}
        </ChartCard>

        {/* Large Layout for Departments */}
        <ChartCard title="Q8. Rayons Fav." subtitle="Zones chaudes" className="md:col-span-2 lg:col-span-2">
           <div className="h-full w-full flex items-center justify-center">
             {render3DPie(data.preferredDepartment, { colors: COLORS, isWide: true, innerRadius: 60 })}
           </div>
        </ChartCard>

        <ChartCard title="Q9. Notoriété" subtitle="Changement de nom">
           {render3DPie(data.nameChangeAwareness, { colors: NAME_CHANGE_COLORS, innerRadius: 50 })}
        </ChartCard>

        {/* Q10 Special Card */}
        <ChartCard title="Q10. Perception" subtitle="Impact global" className="md:col-span-2 lg:col-span-1">
           <div className="flex flex-col h-full gap-4">
              <div className="h-48">
                {render3DPie(q10SummaryPie, { colors: POS_NEG_COLORS, innerRadius: 40, showLegend: true })}
              </div>
              <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl">
                 <span className="text-sm font-medium text-slate-500">Positif</span>
                 <span className="text-lg font-bold text-green-500">{totalPositive}</span>
              </div>
           </div>
        </ChartCard>

      </div>
    </div>
  );
};

export default QuestionsView;