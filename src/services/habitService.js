import * as store from './localStore';

// Local (on-device) habit service.
//   habits:   [{ id, name, emoji, createdAt, createdDateKey, archived }]
//   habitLog: { [habitId]: { 'YYYY-MM-DD': true } }   // a tick per completed day
// Same reactive pattern as the rest of the store so the heatmap updates live.

function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function subscribeHabits(cb) {
  const push = () => cb(store.getHabits());
  push();
  return store.subscribe(push);
}

export function subscribeHabitLog(cb) {
  const push = () => cb(store.getHabitLog());
  push();
  return store.subscribe(push);
}

export function addHabit(name, emoji = '') {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const habit = {
    id: store.genId(),
    name: trimmed,
    emoji: emoji || '',
    createdAt: Date.now(),
    createdDateKey: localDateKey(),
    archived: false,
  };
  store.setHabits([...store.getHabits(), habit]);
  return habit;
}

export function renameHabit(id, name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return;
  store.setHabits(
    store.getHabits().map((h) => (h.id === id ? { ...h, name: trimmed } : h))
  );
}

export function deleteHabit(id) {
  store.setHabits(store.getHabits().filter((h) => h.id !== id));
  const log = store.getHabitLog();
  if (log[id]) {
    const { [id]: _removed, ...rest } = log;
    store.setHabitLog(rest);
  }
}

// Toggle a habit's completion for a day (defaults to today).
export function toggleHabit(id, key = localDateKey()) {
  const log = store.getHabitLog();
  const days = { ...(log[id] || {}) };
  if (days[key]) delete days[key];
  else days[key] = true;
  store.setHabitLog({ ...log, [id]: days });
}
