import * as store from './localStore';

// Local (on-device) task service. Same function names and data shape as the
// previous Firestore version, so hooks and components are unchanged.

function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function sortByCreatedDesc(tasks) {
  return [...tasks].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function subscribeTasks(cb) {
  const push = () => cb(sortByCreatedDesc(store.getTasks()));
  push(); // emit current state immediately
  return store.subscribe(push);
}

export function addTask(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return;
  const tasks = store.getTasks();
  tasks.push({
    id: store.genId(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
    completedAt: null,
    timeSpent: 0,
    deepWork: false,
    createdDateKey: localDateKey(),
    deferCount: 0,
  });
  store.setTasks(tasks);
}

export function toggleTask(taskItem) {
  const tasks = store.getTasks();
  const idx = tasks.findIndex((t) => t.id === taskItem.id);
  if (idx === -1) return;
  const newState = !tasks[idx].completed;
  tasks[idx] = {
    ...tasks[idx],
    completed: newState,
    completedAt: newState ? Date.now() : null,
  };
  store.setTasks(tasks);

  if (newState) {
    const key = localDateKey();
    const logs = store.getLogs();
    const entries = logs[key] || [];
    if (!entries.includes(tasks[idx].text)) {
      logs[key] = [...entries, tasks[idx].text];
      store.setLogs(logs);
    }
  }
}

export function deleteTask(id) {
  store.setTasks(store.getTasks().filter((t) => t.id !== id));
}

export function updateTaskText(id, text) {
  const tasks = store.getTasks().map((t) =>
    t.id === id ? { ...t, text } : t
  );
  store.setTasks(tasks);
}

export function addTimeToTask(id, seconds) {
  if (!seconds) return;
  const tasks = store.getTasks().map((t) =>
    t.id === id ? { ...t, timeSpent: (t.timeSpent || 0) + seconds } : t
  );
  store.setTasks(tasks);
}

export function setDeepWork(id, value) {
  const tasks = store.getTasks().map((t) =>
    t.id === id ? { ...t, deepWork: !!value } : t
  );
  store.setTasks(tasks);
}
