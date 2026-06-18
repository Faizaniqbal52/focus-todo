import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

// Completion Velocity — tasks completed per day over the window.
// Lazy-loaded alongside TrendChart so charts never block first paint.
export default function VelocityChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis hide domain={[0, max]} />
        <Tooltip
          cursor={{ fill: 'rgba(167,139,250,0.08)' }}
          contentStyle={{
            background: '#14161f',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 10,
            color: '#e5e7eb',
            fontSize: 12,
          }}
          labelStyle={{ color: '#a1a1aa' }}
          formatter={(value) => [`${value}`, 'Completed']}
        />
        <Bar dataKey="value" radius={[5, 5, 0, 0]} isAnimationActive={false}>
          {data.map((d) => (
            <Cell
              key={d.key}
              fill={d.value > 0 ? '#7c3aed' : 'rgba(255,255,255,0.06)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
