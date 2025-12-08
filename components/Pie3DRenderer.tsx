import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
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
  isDark?: boolean; // Deprecated but kept for type compatibility
  labelPosition?: 'inside' | 'outside';
  labelOffset?: number;
}

const RADIAN = Math.PI / 180;

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
    labelPosition = 'outside',
    labelOffset = 16,
  }: Render3DPieOptions = {}
) => {
  if (!chartData || chartData.length === 0) return null;

  const resolvedOuterRadius = typeof outerRadius === 'number' ? outerRadius : isWide ? 100 : 80;
  
  // Force Light Mode Styling
  const tooltipBackground = 'rgba(255,255,255,0.9)';
  const tooltipColor = '#1e293b';
  const tooltipShadow = '0 10px 30px -5px rgba(0,0,0,0.1)';
  const legendColor = '#64748b';
  const labelColor = '#475569';

  const renderLabel = (props: PieLabelRenderProps) => {
    const { percent, cx, cy, midAngle, innerRadius: labelInnerRadius, outerRadius: labelOuterRadius } = props;
    if (typeof percent !== 'number' || percent <= minLabelPercent) return null;

    const centerX = typeof cx === 'number' ? cx : Number(cx);
    const centerY = typeof cy === 'number' ? cy : Number(cy);
    const effectiveOuter = typeof labelOuterRadius === 'number' ? labelOuterRadius : resolvedOuterRadius;

    if (labelPosition === 'inside') {
      const effectiveInner = typeof labelInnerRadius === 'number' ? labelInnerRadius : innerRadius;
      const radius = effectiveInner + (effectiveOuter - effectiveInner) * 0.55;
      const x = centerX + radius * Math.cos(-midAngle * RADIAN);
      const y = centerY + radius * Math.sin(-midAngle * RADIAN);
      return (
        <text
          x={x}
          y={y}
          fill="#1e293b"
          fontSize={11}
          fontWeight={600}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    }

    const offset = typeof labelOffset === 'number' ? labelOffset : 16;
    const radius = effectiveOuter + offset;
    const x = centerX + radius * Math.cos(-midAngle * RADIAN);
    const y = centerY + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={labelColor}
        fontSize={11}
        fontWeight={500}
        textAnchor={x > centerX ? 'start' : 'end'}
        dominantBaseline="middle"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
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
          // Using CSS filter for soft drop shadow instead of heavy SVG filter
          style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.05))' }}
          stroke="none"
          label={renderLabel}
          labelLine={labelPosition === 'outside' ? { stroke: '#cbd5e1', strokeWidth: 1 } : false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
              fill={colors[index % colors.length]}
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: tooltipShadow,
            backgroundColor: tooltipBackground,
            color: tooltipColor,
            backdropFilter: 'blur(8px)',
            padding: '12px'
          }}
          itemStyle={{ color: tooltipColor, fontSize: '12px', fontWeight: 500 }}
          labelStyle={{ color: tooltipColor, fontWeight: 700, marginBottom: '4px' }}
        />
        {showLegend && (
          <Legend
            layout={isWide ? 'vertical' : 'horizontal'}
            verticalAlign={isWide ? 'middle' : 'bottom'}
            align={isWide ? 'right' : 'center'}
            wrapperStyle={isWide ? { paddingLeft: '20px' } : { paddingTop: '10px' }}
            formatter={(value) => <span style={{ color: legendColor, fontSize: '11px', fontWeight: 500 }}>{value}</span>}
            iconType="circle" 
            iconSize={8}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};