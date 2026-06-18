import { useCallback, useEffect, useRef, useState } from 'react';

// A focus stopwatch that survives reloads. It persists only the *intent*
// (when it started running and how much time was banked before the last pause),
// then derives the live elapsed seconds from the clock — so a refresh mid-session
// resumes at the right number instead of resetting to zero.

const STATE_KEY = 'srya:focus-timer';

function load() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function save(state) {
  try {
    if (state) localStorage.setItem(STATE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STATE_KEY);
  } catch {
    /* storage full or blocked — timer still works in-memory */
  }
}

function elapsedFrom(state) {
  if (!state) return 0;
  const banked = state.banked || 0;
  if (state.status === 'running' && state.runningSince) {
    return banked + Math.floor((Date.now() - state.runningSince) / 1000);
  }
  return banked;
}

export default function useFocusTimer() {
  const persisted = useRef(load());
  const [state, setState] = useState(
    () => persisted.current || { status: 'idle', banked: 0, runningSince: null, startedAt: null }
  );
  const [elapsed, setElapsed] = useState(() => elapsedFrom(persisted.current));

  // Mirror the latest state so finish() can read it synchronously.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist whenever the intent changes.
  useEffect(() => {
    if (state.status === 'idle' && !state.banked) save(null);
    else save(state);
  }, [state]);

  // Tick once a second while running; derive elapsed from the clock so it stays
  // accurate even if the tab was throttled or backgrounded.
  useEffect(() => {
    setElapsed(elapsedFrom(state));
    if (state.status !== 'running') return undefined;
    const id = setInterval(() => setElapsed(elapsedFrom(state)), 1000);
    return () => clearInterval(id);
  }, [state]);

  const start = useCallback(() => {
    setState((s) =>
      s.status === 'running'
        ? s
        : { status: 'running', banked: s.banked || 0, runningSince: Date.now(), startedAt: s.startedAt || Date.now() }
    );
  }, []);

  const pause = useCallback(() => {
    setState((s) =>
      s.status !== 'running'
        ? s
        : {
            ...s,
            status: 'paused',
            banked: elapsedFrom(s),
            runningSince: null,
          }
    );
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', banked: 0, runningSince: null, startedAt: null });
    setElapsed(0);
  }, []);

  // Returns the finished session's facts so the caller can persist it, then
  // clears the timer back to idle.
  const finish = useCallback(() => {
    const s = stateRef.current;
    const secs = elapsedFrom(s);
    const result =
      secs > 0 ? { duration: secs, startedAt: s.startedAt, endedAt: Date.now() } : null;
    setState({ status: 'idle', banked: 0, runningSince: null, startedAt: null });
    setElapsed(0);
    return result;
  }, []);

  return { status: state.status, elapsed, start, pause, reset, finish };
}
