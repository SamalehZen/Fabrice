
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

  const renderCustomLabel = (props: any, isCompact: boolean = false) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * (isCompact ? 0.5 : 0.6);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <g>
        <rect
          x={x - 20}
          y={y - 12}
          width="40"
          height="24"
          fill="rgba(255, 255, 255, 0.95)"
          rx="6"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="1"
          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
        />
        <text
          x={x}
          y={y}
          fill="#1e293b"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ 
            fontSize: '13px', 
            fontWeight: '700',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  const renderCustomLegend = (props: any, isWide: boolean = false) => {
    const { payload } = props;
    
    return (
      <div 
        className={`flex ${isWide ? 'flex-col justify-center' : 'flex-wrap justify-center'} gap-2 ${isWide ? 'pl-4' : 'pt-4'}`}
        style={{ maxWidth: isWide ? '180px' : '100%' }}
      >
        {payload.map((entry: any, index: number) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 border border-slate-100"
            style={{ minWidth: isWide ? '150px' : 'auto' }}
          >
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ 
                backgroundColor: entry.color,
                boxShadow: `0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px ${entry.color}40`
              }}
            />
            <span className="text-xs font-medium text-slate-700 truncate" title={entry.value}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const render3DPie = (
    chartData: {name: string, value: number}[], 
    colors: string[] = COLORS, 
    isWide: boolean = false,
    innerRadius: number = 0,
    isCompact: boolean = false
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
          paddingAngle={isCompact ? 8 : 5}
          dataKey="value"
          style={{ filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.3))' }} 
          stroke="none"
          label={(props) => renderCustomLabel(props, isCompact)}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]} 
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={2}
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
          content={(props) => renderCustomLegend(props, isWide)}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[380px]">
        
        {/* ROW 1: Q0 - Q3 (Demographics - 4 columns) */}
        <ChartCard title="Q0: Âge" subtitle="Tranche d'âge" className="col-span-1">
          {render3DPie(data.ageGroups, COLORS, false, 0, true)}
        </ChartCard>

        <ChartCard title="Q1: Zone" subtitle="Résidence" className="col-span-1">
          {render3DPie(data.zones, COLORS, false, 0, true)}
        </ChartCard>

        <ChartCard title="Q2: Transport" subtitle="Moyen de transport" className="col-span-1">
          {render3DPie(data.transport, COLORS, false, 0, true)}
        </ChartCard>

        <ChartCard title="Q3: Fréquence" subtitle="Visites par mois" className="col-span-1">
          {render3DPie(data.frequency, COLORS, false, 0, true)}
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
