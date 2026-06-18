import React, { Suspense, lazy } from 'react';
import { formatDuration } from '../../utils/time';
import { FOCUS_SESSION_TARGET } from '../../utils/score';
import Icon from '../common/Icon';

const FocusChart = lazy(() => import('./charts/FocusChart'));

// Today's focus at a glance — total time (the big number from the reference),
// average session, sessions-vs-target — plus the 7-day bar chart.
export default function FocusTimeCard({ today, series }) {
  const sessionsHit = Math.min(today.count, FOCUS_SESSION_TARGET);

  return (
    <section className="dash-card focus-time">
      <div className="dash-card__head">
        <span className="dash-card__label">
          <Icon name="clock" size={14} /> Focus Time
        </span>
        <span className="focus-time__sessions">
          {today.count}
          <span className="focus-time__target">/{FOCUS_SESSION_TARGET}</span>
        </span>
      </div>

      <div className="focus-time__value">{formatDuration(today.totalSeconds)}</div>
      <div className="dash-card__sub">
        {today.count > 0
          ? `${today.count} session${today.count === 1 ? '' : 's'} · avg ${formatDuration(
              today.avgSeconds
            )}`
          : 'Start a session to log focus'}
      </div>

      <div className="focus-time__pips" aria-hidden="true">
        {Array.from({ length: FOCUS_SESSION_TARGET }).map((_, i) => (
          <span
            key={i}
            className={`focus-time__pip ${i < sessionsHit ? 'is-on' : ''}`}
          />
        ))}
      </div>

      <div className="dash-chart" aria-hidden="true">
        <Suspense fallback={<div className="dash-chart__skeleton" />}>
          <FocusChart data={series} />
        </Suspense>
      </div>
    </section>
  );
}
