import * as store from './localStore';

// Local (on-device) focus-session service. A session is one stretch of focused
// work: { id, startedAt, endedAt, duration (seconds), taskId, dateKey }.
// Same reactive pattern as tasks/logs so the dashboard updates live.

function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function subscribeSessions(cb) {
  const push = () => cb(store.getSessions());
  push(); // emit current state immediately
  return store.subscribe(push);
}

// Records a finished focus session. Ignores empty/zero-length sessions.
export function addSession({ duration, startedAt, endedAt, taskId = null }) {
  const secs = Math.round(duration || 0);
  if (secs <= 0) return null;
  const end = endedAt || Date.now();
  const session = {
    id: store.genId(),
    startedAt: startedAt || end - secs * 1000,
    endedAt: end,
    duration: secs,
    taskId,
    dateKey: localDateKey(new Date(end)),
  };
  store.setSessions([...store.getSessions(), session]);
  return session;
}

export function deleteSession(id) {
  store.setSessions(store.getSessions().filter((s) => s.id !== id));
}
