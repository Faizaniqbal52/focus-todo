import React from 'react';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { formatClock } from '../../utils/time';

// The focus stopwatch UI. Driven by the shared FocusTimer context, so it shows
// the task launched via Anti-Procrastination's "Attack Now" and banks the
// session (onto that task) on Finish.
export default function FocusTimer() {
  const { status, elapsed, activeTask, start, pause, reset, finish } = useFocusTimer();

  return (
    <section className="dash-card focus-timer" id="focus-timer">
      <div className="dash-card__head">
        <span className="dash-card__label">Focus Timer</span>
        <span className={`focus-timer__dot focus-timer__dot--${status}`} aria-hidden="true" />
      </div>

      {activeTask && status !== 'idle' && (
        <div className="focus-timer__task" title={activeTask.text}>
          Focusing on <strong>{activeTask.text}</strong>
        </div>
      )}

      <div
        className={`focus-timer__clock ${status === 'running' ? 'is-running' : ''}`}
        role="timer"
        aria-live="off"
      >
        {formatClock(elapsed)}
      </div>

      <div className="focus-timer__hint">
        {status === 'idle' && 'Ready when you are.'}
        {status === 'running' && 'Locked in. Stay with it.'}
        {status === 'paused' && 'Paused — resume or finish.'}
      </div>

      <div className="focus-timer__actions">
        {status === 'idle' && (
          <button className="primary focus-btn" onClick={() => start()}>
            Start Focus
          </button>
        )}

        {status === 'running' && (
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
