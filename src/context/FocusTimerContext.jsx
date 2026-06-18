import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { addSession } from '../services/focusService';
import { addTimeToTask } from '../services/taskService';
import useToast from '../hooks/useToast';
import { formatDuration } from '../utils/time';

// The focus stopwatch, lifted into context so any part of the app can drive it
// — e.g. Anti-Procrastination's "Attack Now" starts a session on a chosen task.
// Survives reloads by persisting only the *intent* (when it started, time banked
// before the last pause, the active task) and deriving live elapsed from the clock.

const STATE_KEY = 'srya:focus-timer';
const IDLE = { status: 'idle', banked: 0, runningSince: null, startedAt: null, activeTask: null };

function load() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
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

const FocusTimerContext = createContext(null);

export function useFocusTimer() {
  return useContext(FocusTimerContext);
}

export function FocusTimerProvider({ children }) {
  const toast = useToast();
  const persisted = useRef(load());
  const [state, setState] = useState(() => persisted.current || IDLE);
  const [elapsed, setElapsed] = useState(() => elapsedFrom(persisted.current));

  // Mirror latest state so finish() can read it synchronously.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state.status === 'idle' && !state.banked) save(null);
    else save(state);
  }, [state]);

  // Tick each second while running; derive from the clock so it stays accurate
  // even if the tab was throttled or backgrounded.
  useEffect(() => {
    setElapsed(elapsedFrom(state));
    if (state.status !== 'running') return undefined;
    const id = setInterval(() => setElapsed(elapsedFrom(state)), 1000);
    return () => clearInterval(id);
  }, [state]);

  // start() with a task begins a fresh focus on it; start() with no arg resumes.
  const start = useCallback((task = null) => {
    setState((s) =>
      s.status === 'running'
        ? s
        : {
            status: 'running',
            banked: s.banked || 0,
            runningSince: Date.now(),
            startedAt: s.startedAt || Date.now(),
            activeTask: task || s.activeTask || null,
          }
    );
  }, []);

  const pause = useCallback(() => {
    setState((s) =>
      s.status !== 'running'
        ? s
        : { ...s, status: 'paused', banked: elapsedFrom(s), runningSince: null }
    );
  }, []);

  const reset = useCallback(() => {
    setState(IDLE);
    setElapsed(0);
  }, []);

  // Banks the session (and rolls its time onto the task it targeted), then idles.
  const finish = useCallback(() => {
    const s = stateRef.current;
    const secs = elapsedFrom(s);
    if (secs > 0) {
      const taskId = s.activeTask ? s.activeTask.id : null;
      addSession({ duration: secs, startedAt: s.startedAt, endedAt: Date.now(), taskId });
      if (taskId) addTimeToTask(taskId, secs);
      toast.success(`✓ Focus session saved · ${formatDuration(secs)}`);
    }
    setState(IDLE);
    setElapsed(0);
  }, [toast]);

  return (
    <FocusTimerContext.Provider
      value={{ status: state.status, elapsed, activeTask: state.activeTask, start, pause, reset, finish }}
    >
      {children}
    </FocusTimerContext.Provider>
  );
}

export default FocusTimerProvider;
