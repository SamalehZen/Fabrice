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
    paddingAngle = 5,
    minLabelPercent = 0.05,
    isDark,
    labelPosition = 'outside',
    labelOffset = 16,
  }: Render3DPieOptions = {}
) => {
  if (!chartData || chartData.length === 0) return null;

  const resolvedOuterRadius = typeof outerRadius === 'number' ? outerRadius : isWide ? 100 : 80;
  const isDarkMode = typeof isDark === 'boolean' ? isDark : detectDarkMode();
  const tooltipBackground = isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)';
  const tooltipColor = isDarkMode ? '#e2e8f0' : '#0f172a';
  const tooltipShadow = isDarkMode
    ? '0 10px 25px -5px rgba(2,6,23,0.9)'
    : '0 10px 30px -5px rgba(15,23,42,0.15)';
  const legendColor = isDarkMode ? '#cbd5f5' : '#0f172a';
  const labelColor = isDarkMode ? '#f1f5f9' : '#0f172a';

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
          fill={labelColor}
          fontSize={12}
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
        fontSize={12}
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
          label={renderLabel}
          labelLine={labelPosition === 'outside' ? { stroke: isDarkMode ? 'rgba(148,163,184,0.6)' : 'rgba(15,23,42,0.3)' } : false}
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
            formatter={(value) => <span style={{ color: legendColor }}>{value}</span>}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};
