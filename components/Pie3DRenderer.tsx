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
  isDark?: boolean;
  labelPosition?: 'inside' | 'outside';
  labelOffset?: number;
}

const RADIAN = Math.PI / 180;

const detectDarkMode = () => {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

export const render3DPie = (
  chartData: PieDatum[],
  {
    colors = COLORS,
    isWide = false,
    innerRadius = 0,
    outerRadius,
    showLegend = true,
    paddingAngle = 4,
    minLabelPercent = 0.05,
    isDark,
    labelPosition = 'outside',
    labelOffset = 16,
  }: Render3DPieOptions = {}
) => {
  if (!chartData || chartData.length === 0) return null;

  const resolvedOuterRadius = typeof outerRadius === 'number' ? outerRadius : isWide ? 100 : 80;
  const isDarkMode = typeof isDark === 'boolean' ? isDark : detectDarkMode();
  const tooltipBackground = isDarkMode ? '#2C2C2C' : '#FFFFFF';
  const tooltipColor = isDarkMode ? '#F8F6F1' : '#1C1C1C';
  const tooltipShadow = isDarkMode
    ? '0 10px 25px -5px rgba(0,0,0,0.6)'
    : '0 10px 30px -5px rgba(0,0,0,0.1)';
  const legendColor = isDarkMode ? '#E8E4DA' : '#1C1C1C';
  const labelColor = isDarkMode ? '#F8F6F1' : '#1C1C1C';

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
        <text x={x} y={y} fill={labelColor} fontSize={12} fontWeight={600} textAnchor="middle" dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    }

    const offset = typeof labelOffset === 'number' ? labelOffset : 16;
    const radius = effectiveOuter + offset;
    const x = centerX + radius * Math.cos(-midAngle * RADIAN);
    const y = centerY + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill={labelColor} fontSize={12} fontWeight={500} textAnchor={x > centerX ? 'start' : 'end'} dominantBaseline="middle">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.15" />
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
          style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.12))' }}
          stroke="none"
          label={renderLabel}
          labelLine={labelPosition === 'outside' ? { stroke: isDarkMode ? 'rgba(232,228,218,0.4)' : 'rgba(28,28,28,0.2)' } : false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${entry.name}-${index}`} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: tooltipShadow,
            backgroundColor: tooltipBackground,
            color: tooltipColor,
            backdropFilter: 'blur(6px)'
          }}
          itemStyle={{ color: tooltipColor }}
          labelStyle={{ color: tooltipColor, fontWeight: 600 }}
        />
        {showLegend && (
          <Legend
            layout={isWide ? 'vertical' : 'horizontal'}
            verticalAlign={isWide ? 'middle' : 'bottom'}
            align={isWide ? 'right' : 'center'}
            wrapperStyle={isWide ? { paddingLeft: '20px' } : { paddingTop: '10px' }}
            formatter={(value) => <span style={{ color: legendColor, fontSize: '12px' }}>{value}</span>}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};
