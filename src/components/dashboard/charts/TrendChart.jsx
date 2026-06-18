import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// Daily Power trend (last 7 days). Lazy-loaded so Recharts stays out of the
// first paint — see DailyPowerCard.
export default function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
        <defs>
          <linearGradient id="srya-power-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis hide domain={[0, 100]} />
        <Tooltip
          cursor={{ stroke: 'rgba(167,139,250,0.25)' }}
          contentStyle={{
            background: '#14161f',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 10,
            color: '#e5e7eb',
            fontSize: 12,
          }}
          labelStyle={{ color: '#a1a1aa' }}
          formatter={(value) => [`${value}%`, 'Power']}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#a78bfa"
          strokeWidth={2}
          fill="url(#srya-power-fill)"
          dot={{ r: 2.5, fill: '#a78bfa', strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#c4b5fd', strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
