import React from 'react';
import useFocusTimer from '../../hooks/useFocusTimer';
import { addSession } from '../../services/focusService';
import useToast from '../../hooks/useToast';
import { formatClock, formatDuration } from '../../utils/time';

// The focus stopwatch. Start it when you sit down to focus; Finish banks the
// session into the day's Focus Time, which in turn feeds Daily Power.
export default function FocusTimer() {
  const { status, elapsed, start, pause, reset, finish } = useFocusTimer();
  const toast = useToast();

  const onFinish = () => {
    const session = finish();
    if (session) {
      addSession(session);
      toast.success(`✓ Focus session saved · ${formatDuration(session.duration)}`);
    }
  };

  return (
    <section className="dash-card focus-timer">
      <div className="dash-card__head">
        <span className="dash-card__label">Focus Timer</span>
        <span className={`focus-timer__dot focus-timer__dot--${status}`} aria-hidden="true" />
      </div>

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
          <button className="primary focus-btn" onClick={start}>
            Start Focus
          </button>
        )}

        {status === 'running' && (
          <>
            <button className="focus-btn focus-btn--ghost" onClick={pause}>
              Pause
            </button>
            <button className="focus-btn focus-btn--finish" onClick={onFinish}>
              Finish
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button className="primary focus-btn" onClick={start}>
              Resume
            </button>
            <button className="focus-btn focus-btn--finish" onClick={onFinish}>
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
