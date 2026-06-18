import React, { Suspense, lazy } from 'react';
import Icon from '../common/Icon';

const VelocityChart = lazy(() => import('./charts/VelocityChart'));

// Throughput: how many tasks were completed each day over the window.
export default function VelocityCard({ velocity }) {
  const total = velocity.reduce((sum, d) => sum + d.value, 0);

  return (
    <section className="dash-card dash-card--velocity">
      <div className="dash-card__head">
        <span className="dash-card__label">
          <Icon name="trend" size={14} /> Completion Velocity
        </span>
      </div>

      <div className="dash-velocity__value">
        {total}
        <span className="dash-velocity__unit">done &middot; 7 days</span>
      </div>

      <div className="dash-chart" aria-hidden="true">
        <Suspense fallback={<div className="dash-chart__skeleton" />}>
          <VelocityChart data={velocity} />
        </Suspense>
      </div>
    </section>
  );
}
