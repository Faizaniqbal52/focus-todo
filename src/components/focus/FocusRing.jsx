import React from 'react';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { formatClock } from '../../utils/time';
import Icon from '../common/Icon';

const R = 76;
const CIRC = 2 * Math.PI * R;
const CYCLE = 25 * 60; // a 25-minute focus cycle fills the ring, then loops

// Circular focus timer — the "command center" centerpiece on the left rail.
// Driven by the shared FocusTimer context so "Attack Now" can light it up.
export default function FocusRing() {
  const { status, elapsed, activeTask, start, pause, reset, finish } = useFocusTimer();
  const progress = status === 'idle' ? 0 : (elapsed % CYCLE) / CYCLE;
  const offset = CIRC * (1 - progress);
  const running = status === 'running';

  return (
    <section className="dash-card focus-ring-card" id="focus-timer">
      <div className="dash-card__head">
        <span className="dash-card__label">
          <Icon name="clock" size={14} /> Focus Timer
        </span>
        <span className={`focus-timer__dot focus-timer__dot--${status}`} aria-hidden="true" />
      </div>

      <div className={`focus-ring ${running ? 'is-running' : ''}`}>
        <svg viewBox="0 0 180 180" className="focus-ring__svg" aria-hidden="true">
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <circle className="focus-ring__track" cx="90" cy="90" r={R} />
          <circle
            className="focus-ring__bar"
            cx="90"
            cy="90"
            r={R}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="focus-ring__center">
          <div className={`focus-ring__clock ${running ? 'is-running' : ''}`} role="timer" aria-live="off">
            {formatClock(elapsed)}
          </div>
          <div className="focus-ring__state">
            {status === 'idle' && 'Ready'}
            {status === 'running' && 'In focus'}
            {status === 'paused' && 'Paused'}
          </div>
        </div>
      </div>

      {activeTask && status !== 'idle' && (
        <div className="focus-timer__task" title={activeTask.text}>
          Focusing on <strong>{activeTask.text}</strong>
        </div>
      )}

      <div className="focus-ring__actions">
        {status === 'idle' && (
          <button className="primary focus-btn" onClick={() => start()}>
            Start Focus
          </button>
        )}
        {running && (
          <>
            <button className="focus-btn focus-btn--ghost" onClick={pause}>
              Pause
            </button>
            <button className="focus-btn focus-btn--finish" onClick={finish}>
              Finish
            </button>
          </>
        )}
        {status === 'paused' && (
          <>
            <button className="primary focus-btn" onClick={() => start()}>
              Resume
            </button>
            <button className="focus-btn focus-btn--finish" onClick={finish}>
              Finish
            </button>
            <button className="focus-btn focus-btn--ghost" onClick={reset}>
              Reset
            </button>
          </>
        )}
      </div>
    </section>
  );
}
