// Display helpers for focus time. Kept separate from the scoring engine so the
// numbers (score.js) stay pure and the formatting lives in one place.

// Stopwatch face: 25:00, or 1:05:09 once it crosses an hour.
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

// Human total: "6h 40m", "40m", or "0m". Matches the reference's "6hrs 40min".
export function formatDuration(totalSeconds) {
  const mins = Math.round(Math.max(0, totalSeconds) / 60);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs > 0) return `${hrs}h ${rem}m`;
  return `${rem}m`;
}
