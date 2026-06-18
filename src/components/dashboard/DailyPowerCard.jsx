import React, { Suspense, lazy } from 'react';
import useCountUp from '../../hooks/useCountUp';
import Icon from '../common/Icon';

const TrendChart = lazy(() => import('./charts/TrendChart'));

// The headline metric. Big animated number = today's Daily Power; the chart =
// the 7-day trend. Green throughout, per the reference.
export default function DailyPowerCard({ today, series, delta }) {
  const animated = Math.round(useCountUp(today));

  return (
    <section className="dash-card dash-card--power">
      <div className="dash-card__head">
        <span className="dash-card__label">Daily Power</span>
        <span className="dash-card__flame" aria-hidden="true">
          <Icon name="flame" size={18} />
        </span>
      </div>

      <div className="dash-power__row">
        <div className="dash-power__value">
          {animated}
          <span className="dash-power__pct">%</span>
        </div>
        {typeof delta === 'number' && delta !== 0 && (
          <span className={`dash-power__delta ${delta > 0 ? 'up' : 'down'}`}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
          </span>
        )}
      </div>
      <div className="dash-card__sub">Today&rsquo;s execution score</div>

      <div className="dash-chart dash-chart--tall" aria-hidden="true">
        <Suspense fallback={<div className="dash-chart__skeleton" />}>
          <TrendChart data={series} />
        </Suspense>
      </div>
    </section>
  );
}
