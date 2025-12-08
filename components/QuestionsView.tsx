
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { SurveyDataset } from '../types';
import { COLORS, SATISFACTION_COLORS } from '../constants';
import ChartCard from './ChartCard';

interface QuestionsViewProps {
  data: SurveyDataset;
}

const QuestionsView: React.FC<QuestionsViewProps> = ({ data }) => {
  
  // Transform Q10 (Experience Changes) for Pie format
  const q10Data = [
      { name: 'Positif', value: data.experienceChanges.reduce((acc, curr) => acc + curr.positive, 0) },
      { name: 'Négatif', value: data.experienceChanges.reduce((acc, curr) => acc + curr.negative, 0) }
  ];

  // Helper to render the 3D-style Pie Chart
  // isWide determines if we place legend on the right (for Bento span-2 or span-4)
  const render3DPie = (
    chartData: {name: string, value: number}[], 
    colors: string[] = COLORS, 
    isWide: boolean = false,
    innerRadius: number = 0
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
        <Legend 
          layout={isWide ? "vertical" : "horizontal"} 
          verticalAlign={isWide ? "middle" : "bottom"} 
          align={isWide ? "right" : "center"}
          wrapperStyle={isWide ? { paddingLeft: '20px' } : { paddingTop: '10px' }}
        />
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
          className="col-span-1 md:col-span-2 lg:col-span-2"
        >
          {render3DPie(data.nameChangeAwareness, ['#22c55e', '#ef4444'], true)}
        </ChartCard>

        <ChartCard 
          title="Q10: Perception" 
          subtitle="Impact des changements" 
          className="col-span-1 md:col-span-2 lg:col-span-2"
        >
          {render3DPie(q10Data, ['#22c55e', '#ef4444'], true, 40)}
        </ChartCard>

      </div>
    </div>
  );
};

export default QuestionsView;
