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
    <ResponsiveContainer width="100%" height="100%" minHeight={110}>
      <AreaChart data={data} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
        <defs>
          <linearGradient id="srya-power-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
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
          cursor={{ stroke: 'rgba(52,211,153,0.25)' }}
          contentStyle={{
            background: '#14161f',
            border: '1px solid rgba(52,211,153,0.3)',
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
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#srya-power-fill)"
          dot={{ r: 2.5, fill: '#34d399', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#6ee7b7', strokeWidth: 0 }}
          isAnimationActive
          animationDuration={1100}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
