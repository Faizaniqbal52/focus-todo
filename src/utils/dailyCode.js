// Daily Code — a rotating mantra that resets mindset each morning. Module 0.
// One line is chosen deterministically per calendar day, so it's stable all day
// and changes at midnight. Pure: same date in → same line out.

import { dateKey } from './score';

const CODES = [
  'Discipline is choosing what you want most over what you want now.',
  'Start before you feel ready. Momentum is built, not found.',
  'You don’t rise to your goals. You fall to your systems.',
  'The work you avoid is usually the work that matters.',
  'Focus is a muscle. Train it one session at a time.',
  'Done beats perfect. Ship, then sharpen.',
  'Small reps, every day, become an unstoppable streak.',
  'Attack the hardest task first; the rest gets easy.',
  'Energy follows action. Move, and motivation catches up.',
  'Protect your deep work like it pays your rent — it does.',
  'A day planned is a day won.',
  'Consistency outperforms intensity over time.',
  'Your future self is watching what you do right now.',
  'Distraction is a decision. Choose the work.',
  'One honest hour beats a distracted day.',
  'Win the morning, command the day.',
  'Slow is smooth, smooth is fast. Begin.',
  'You can’t improve what you don’t track.',
  'Show up on the days you don’t feel like it — those count double.',
  'Cut the noise. Keep the signal. Execute.',
  'Comfort is the enemy of progress.',
  'Make the next right move. Then the next.',
  'The streak is sacred. Don’t break the chain.',
  'Effort today is leverage tomorrow.',
  'Be the person who finishes.',
  'Pressure is a privilege. Use it.',
  'Clarity comes from action, not thought.',
  'Tame the urgent so you can serve the important.',
  'Become an execution weapon — optimize behavior, not just tasks.',
  'Quiet mind, sharp focus, relentless follow-through.',
];

function dayIndex(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function getDailyCode(date = new Date()) {
  const idx = ((dayIndex(dateKey(date)) % CODES.length) + CODES.length) % CODES.length;
  return CODES[idx];
}

export const dailyCodeCount = CODES.length;
