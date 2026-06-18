import React, { useContext, useMemo } from 'react';
import { AppDataContext } from '../../context/AppDataContext';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { procrastinationReport } from '../../utils/score';
import useToast from '../../hooks/useToast';
import './antiproc.css';

function agePhrase(days) {
  if (days <= 0) return 'queued today';
  if (days === 1) return 'carried over 1 day';
  return `carried over ${days} days`;
}

// The intelligence layer: surfaces the task you keep avoiding and launches a
// focus session straight onto it.
export default function AntiProcrastination() {
  const { tasks } = useContext(AppDataContext);
  const { start } = useFocusTimer();
  const toast = useToast();

  const report = useMemo(() => procrastinationReport(tasks), [tasks]);
  const { target, count, pendingCount } = report;

  const attack = () => {
    if (!target) return;
    start({ id: target.id, text: target.text });
    toast.success(`⚔ Attacking: ${target.text}`);
    const el = document.getElementById('focus-timer');
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Calm states when there's nothing to fight.
  if (pendingCount === 0) {
    return (
      <section className="dash-card antiproc antiproc--clear">
        <div className="dash-card__head">
          <span className="dash-card__label">Anti-Procrastination</span>
        </div>
        <div className="antiproc__clear-msg">
          <span className="antiproc__check">✓</span>
          Nothing queued. Add a task and get moving.
        </div>
      </section>
    );
  }

  if (!target) {
    return (
      <section className="dash-card antiproc antiproc--clear">
        <div className="dash-card__head">
          <span className="dash-card__label">Anti-Procrastination</span>
        </div>
        <div className="antiproc__clear-msg">
          <span className="antiproc__check">✓</span>
          All caught up — nothing&rsquo;s slipping. Keep the momentum.
        </div>
      </section>
    );
  }

  return (
    <section className="dash-card antiproc antiproc--alert">
      <div className="dash-card__head">
        <span className="dash-card__label">Anti-Procrastination</span>
        <span className="antiproc__count">
          {count} task{count === 1 ? '' : 's'} slipping
        </span>
      </div>

      <div className="antiproc__lead">Attack this next</div>
      <div className="antiproc__target" title={target.text}>
        {target.text}
      </div>
      <div className="antiproc__meta">{agePhrase(target.ageDays)}</div>

      <button className="antiproc__attack" onClick={attack}>
        ⚔ Attack Now
      </button>
    </section>
  );
}
