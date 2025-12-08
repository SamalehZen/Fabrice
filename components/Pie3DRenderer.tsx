import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { COLORS } from '../constants';

export interface PieDatum {
  name: string;
  value: number;
}

interface Render3DPieOptions {
  colors?: string[];
  isWide?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  paddingAngle?: number;
  minLabelPercent?: number;
}

export const render3DPie = (
  chartData: PieDatum[],
  {
    colors = COLORS,
    isWide = false,
    innerRadius = 0,
    outerRadius,
    showLegend = true,
    paddingAngle = 5,
    minLabelPercent = 0.05,
  }: Render3DPieOptions = {}
) => {
  if (!chartData || chartData.length === 0) return null;

  const resolvedOuterRadius = typeof outerRadius === 'number' ? outerRadius : isWide ? 100 : 80;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="3" dy="3" result="offsetBlur" />
            <feSpecularLighting
              in="blur"
              surfaceScale={5}
              specularConstant={0.75}
              specularExponent={20}
              lightingColor="#ffffff"
              result="specOut"
            >
              <fePointLight x={-5000} y={-10000} z={20000} />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litPaint" />
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
          outerRadius={resolvedOuterRadius}
          paddingAngle={paddingAngle}
          dataKey="value"
          style={{ filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.3))' }}
          stroke="none"
          label={({ percent }) => (percent > minLabelPercent ? `${(percent * 100).toFixed(0)}%` : '')}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
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
