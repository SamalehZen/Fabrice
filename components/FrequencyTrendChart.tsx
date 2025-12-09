import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface FrequencyTrendChartProps {
  data: { name: string; value: number }[];
}

const detectDarkMode = (): boolean => {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const FrequencyTrendChart: React.FC<FrequencyTrendChartProps> = ({ data }) => {
  const isDark = detectDarkMode();

  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipText = isDark ? '#f1f5f9' : '#1e293b';

  return (
    <div className="w-full h-full min-h-[300px] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorFrequency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.5} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }}
            dy={10}
            interval={0}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 11 }}
            dx={0}
          />
          <Tooltip 
            cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              backgroundColor: tooltipBg,
            }}
            itemStyle={{ color: '#f97316', fontWeight: 600 }}
            labelStyle={{ color: tooltipText, marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#f97316" 
            strokeWidth={4} 
            fill="url(#colorFrequency)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316' }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FrequencyTrendChart;
