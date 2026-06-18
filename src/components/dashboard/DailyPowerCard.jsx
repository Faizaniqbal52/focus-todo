import React, { Suspense, lazy } from 'react';

const TrendChart = lazy(() => import('./charts/TrendChart'));

// Big number = today's Daily Power; the chart = the 7-day trend.
export default function DailyPowerCard({ today, series }) {
  return (
    <section className="dash-card dash-card--power">
      <div className="dash-card__head">
        <span className="dash-card__label">Daily Power</span>
        <span className="dash-card__flame" aria-hidden="true">
          🔥
        </span>
      </div>

      <div className="dash-power__value">
        {today}
        <span className="dash-power__pct">%</span>
      </div>
      <div className="dash-card__sub">Today&rsquo;s execution score</div>

      <div className="dash-chart" aria-hidden="true">
        <Suspense fallback={<div className="dash-chart__skeleton" />}>
          <TrendChart data={series} />
        </Suspense>
      </div>
    </section>
  );
}
