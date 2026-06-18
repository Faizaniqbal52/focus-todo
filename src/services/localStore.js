// Srya local store — on-device persistence using localStorage.
// Reactive: components subscribe and get notified on any change, both in this
// tab and across other open tabs. This replaces Firestore for now while keeping
// the same data shapes, so the rest of the app is unchanged.

const TASKS_KEY = 'srya:tasks';
const LOGS_KEY = 'srya:logs';

const listeners = new Set();

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Local save failed (storage full or blocked):', e);
  }
  emit();
}

function emit() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error(e);
    }
  });
}

// Notify when another tab changes the same data.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === TASKS_KEY || e.key === LOGS_KEY) emit();
  });
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getTasks = () => read(TASKS_KEY, []);
export const setTasks = (tasks) => write(TASKS_KEY, tasks);
export const getLogs = () => read(LOGS_KEY, {});
export const setLogs = (logs) => write(LOGS_KEY, logs);

export function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
