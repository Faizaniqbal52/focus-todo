import * as store from './localStore';

// Local (on-device) log service. Logs keep the same shape as before:
// { 'YYYY-MM-DD': ['task text', ...] }

export function subscribeLogs(cb) {
  const push = () => cb(store.getLogs());
  push();
  return store.subscribe(push);
}

export function addEntry(date, text) {
  if (!text) return;
  const logs = store.getLogs();
  const entries = logs[date] || [];
  logs[date] = [...entries, text];
  store.setLogs(logs);
}

export function deleteEntry(date, index) {
  const logs = store.getLogs();
  const entries = logs[date] || [];
  const updated = entries.filter((_, i) => i !== index);
  if (updated.length === 0) delete logs[date];
  else logs[date] = updated;
  store.setLogs(logs);
}
