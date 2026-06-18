// Srya scoring engine — pure functions, no React, no Firebase.
// Turns raw tasks + logs into the numbers the dashboard shows.
// Designed so Focus and Habit signals plug in later: any signal with no data
// is simply dropped and the remaining weights re-normalize, so the score stays
// fair whether the user has 1 data source or all of them.

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function lastNDays(n, from = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

// --- Daily Power -----------------------------------------------------------
// signals: each is { value: 0..1, weight } OR null when unavailable.
// Returns an integer 0..100.
export function computeDailyPower(signals) {
  const active = Object.values(signals).filter(
    (s) => s && typeof s.value === 'number' && !Number.isNaN(s.value)
  );
  if (active.length === 0) return 0;
  const totalWeight = active.reduce((sum, s) => sum + (s.weight || 1), 0);
  const weighted = active.reduce(
    (sum, s) => sum + clamp01(s.value) * (s.weight || 1),
    0
  );
  return Math.round((weighted / totalWeight) * 100);
}

// A "full" focus day, in minutes — the bar that earns full marks on the focus
// signal. Phase 2 default; tune as we learn what a strong day looks like.
export const FOCUS_DAILY_TARGET_MIN = 120;
// How many focus sessions a day we nudge toward (the "sessions vs target" ring).
export const FOCUS_SESSION_TARGET = 4;

// Builds today's signals from everything we collect: tasks, logs, focus, habits.
// Any signal with no data for the day is null and drops out of the weighting.
export function signalsForDay(
  key,
  { tasks = [], logs = {}, sessions = [], habits = [], habitLog = {} } = {}
) {
  // Completion: tasks created that day that got completed.
  const dayTasks = tasks.filter((t) => t.createdDateKey === key);
  const completedToday = dayTasks.filter((t) => t.completed).length;
  const completion =
    dayTasks.length > 0 ? completedToday / dayTasks.length : null;

  // Output: how many things were logged done that day (momentum signal).
  const logged = (logs[key] || []).length;
  // Treat 5+ completed items in a day as a strong day (cap at 1).
  const output = logged > 0 ? Math.min(logged / 5, 1) : null;

  // Focus: minutes of focused work that day vs the daily target.
  const focusStat = focusForDay(key, sessions);
  const focus =
    focusStat.totalSeconds > 0
      ? Math.min(focusStat.totalMinutes / FOCUS_DAILY_TARGET_MIN, 1)
      : null;

  // Habits: share of that day's active habits that were completed.
  const habitStat = habitsForDay(key, habits, habitLog);
  const habits_ = habitStat.active > 0 ? habitStat.ratio : null;

  return {
    completion: completion === null ? null : { value: completion, weight: 3 },
    output: output === null ? null : { value: output, weight: 2 },
    focus: focus === null ? null : { value: focus, weight: 2 },
    habits: habits_ === null ? null : { value: habits_, weight: 2 },
  };
}

// --- Focus -----------------------------------------------------------------
// Aggregates one day's focus sessions into the numbers the cards show.
export function focusForDay(key, sessions = []) {
  const day = sessions.filter((s) => s.dateKey === key);
  const totalSeconds = day.reduce((sum, s) => sum + (s.duration || 0), 0);
  const count = day.length;
  return {
    count,
    totalSeconds,
    totalMinutes: Math.round(totalSeconds / 60),
    avgSeconds: count ? Math.round(totalSeconds / count) : 0,
  };
}

// Daily focus minutes across the window, for the Focus Time bar chart.
export function focusSeries(sessions, days = 7) {
  return lastNDays(days).map((key) => ({
    key,
    label: shortLabel(key),
    value: focusForDay(key, sessions).totalMinutes,
  }));
}

// --- Habits ----------------------------------------------------------------
export function activeHabits(habits = []) {
  return habits.filter((h) => h && !h.archived);
}

// A habit counts toward a day only once it exists (createdDateKey <= key).
function habitWasActive(habit, key) {
  return !habit.createdDateKey || habit.createdDateKey <= key;
}

export function isHabitDone(habitLog, habitId, key) {
  return !!(habitLog[habitId] && habitLog[habitId][key]);
}

// One day's habit consistency: how many active habits were completed.
export function habitsForDay(key, habits = [], habitLog = {}) {
  const active = activeHabits(habits).filter((h) => habitWasActive(h, key));
  const done = active.filter((h) => isHabitDone(habitLog, h.id, key)).length;
  return {
    done,
    active: active.length,
    ratio: active.length ? done / active.length : 0,
  };
}

// Current + longest streak for one habit, in days.
export function habitStreak(habitId, habitLog = {}) {
  const done = habitLog[habitId] || {};

  // Current: walk back from today. Today may still be incomplete (grace day),
  // so if it isn't ticked yet we start counting from yesterday.
  let current = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!done[dateKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (done[dateKey(cursor)]) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest: scan all ticked days for the longest consecutive run.
  const keys = Object.keys(done)
    .filter((k) => done[k])
    .sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const k of keys) {
    run = prev && dayIndex(k) - dayIndex(prev) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = k;
  }

  return { current, longest };
}

// --- Anti-Procrastination --------------------------------------------------
// Finds tasks that keep getting carried over and names the single one to attack
// next. A pending task's "age" is how many days have passed since it was created
// (deferCount is honoured too, if something ever bumps it). The stalest task wins.
export function procrastinationReport(
  tasks = [],
  { staleAfterDays = 1, today = dateKey() } = {}
) {
  const todayIdx = dayIndex(today);
  const pending = tasks.filter((t) => t && !t.completed);

  const withAge = pending.map((t) => {
    const created = t.createdDateKey || today;
    const ageDays = Math.max(0, todayIdx - dayIndex(created));
    return { ...t, ageDays, carried: Math.max(ageDays, t.deferCount || 0) };
  });

  const stale = withAge
    .filter((t) => t.carried >= staleAfterDays)
    .sort(
      (a, b) => b.carried - a.carried || (a.createdAt || 0) - (b.createdAt || 0)
    );

  return {
    target: stale[0] || null,
    stale,
    count: stale.length,
    pendingCount: pending.length,
  };
}

// --- Weekly Grade ----------------------------------------------------------
export function weeklyGrade(dailyPowers) {
  const vals = dailyPowers.filter((v) => typeof v === 'number' && v > 0);
  if (vals.length === 0) return { grade: '—', avg: 0 };
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return { grade: letterFor(avg), avg };
}

function letterFor(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
}

// --- Completion Velocity ---------------------------------------------------
// Number of tasks completed per day across the window. Returns
// [{ key, label, value }] ready for the chart.
export function completionVelocity(logs, days = 7) {
  return lastNDays(days).map((key) => ({
    key,
    label: shortLabel(key),
    value: (logs[key] || []).length,
  }));
}

// Daily Power across a window, for the trend line.
export function dailyPowerSeries(data, days = 7) {
  return lastNDays(days).map((key) => ({
    key,
    label: shortLabel(key),
    value: computeDailyPower(signalsForDay(key, data)),
  }));
}

// --- helpers ---------------------------------------------------------------
function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function shortLabel(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

// Whole-day number for a date key, via UTC so DST never adds or drops a day.
function dayIndex(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}
