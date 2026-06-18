/* Integration smoke test: mounts the real App against seeded on-device data and
   exercises the live UI — guarding that the dashboard, focus timer and habit
   heatmap stay wired together and that Daily Power keeps aggregating every
   signal (tasks, logs, focus, habits). */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';
import { dateKey } from '../utils/score';

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return dateKey(d);
}

function seed() {
  const today = dayKey(0);
  localStorage.setItem(
    'srya:tasks',
    JSON.stringify([
      { id: 't1', text: 'Ship Phase 3', completed: true, createdDateKey: today, createdAt: Date.now() },
      { id: 't2', text: 'Write tests', completed: false, createdDateKey: today, createdAt: Date.now() },
    ])
  );
  localStorage.setItem('srya:logs', JSON.stringify({ [today]: ['Ship Phase 3'], [dayKey(1)]: ['A', 'B'] }));
  localStorage.setItem(
    'srya:sessions',
    JSON.stringify([{ id: 's1', duration: 1800, dateKey: today }]) // 30 min today
  );
  localStorage.setItem(
    'srya:habits',
    JSON.stringify([
      { id: 'h1', name: 'Read', createdDateKey: dayKey(10), archived: false },
      { id: 'h2', name: 'Gym', createdDateKey: dayKey(10), archived: false },
    ])
  );
  localStorage.setItem(
    'srya:habitLog',
    JSON.stringify({ h1: { [today]: true, [dayKey(1)]: true, [dayKey(2)]: true } })
  );
}

beforeEach(() => {
  localStorage.clear();
  seed();
});

test('dashboard renders and Daily Power aggregates all signals (> 0)', () => {
  render(<App />);
  expect(screen.getByText('Daily Power')).toBeInTheDocument();
  expect(screen.getByText('Weekly Grade')).toBeInTheDocument();
  expect(screen.getByText('Completion Velocity')).toBeInTheDocument();

  // The big Daily Power number lives in .dash-power__value
  const power = document.querySelector('.dash-power__value');
  const score = parseInt(power.textContent, 10);
  expect(score).toBeGreaterThan(0);
  expect(score).toBeLessThanOrEqual(100);
});

test('Focus Time shows seeded 30m and the timer starts', () => {
  render(<App />);
  expect(screen.getByText('Focus Time')).toBeInTheDocument();
  // 30 minutes seeded today
  expect(document.querySelector('.focus-time__value').textContent).toBe('30m');

  // Timer starts
  fireEvent.click(screen.getByText('Start Focus'));
  expect(screen.getByText('Pause')).toBeInTheDocument();
  expect(screen.getByText('Finish')).toBeInTheDocument();
});

test('habits render with streak and toggle for today', () => {
  render(<App />);
  expect(screen.getByText('Habit Consistency')).toBeInTheDocument();
  expect(screen.getByText('Read')).toBeInTheDocument();
  expect(screen.getByText('Gym')).toBeInTheDocument();

  // Read has a 3-day streak seeded
  expect(screen.getByText('🔥 3')).toBeInTheDocument();
  // best streak badge
  expect(screen.getByText(/3-day best/)).toBeInTheDocument();

  // Gym not done today -> its check is not pressed; toggle it on
  const gymRow = screen.getByText('Gym').closest('li');
  const gymCheck = within(gymRow).getByRole('button', { name: /Mark Gym for today/i });
  expect(gymCheck).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(gymCheck);
  expect(
    within(screen.getByText('Gym').closest('li')).getByRole('button', { name: /Unmark Gym/i })
  ).toHaveAttribute('aria-pressed', 'true');
});

test('adding a habit appends it to the list', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/New habit/i);
  fireEvent.change(input, { target: { value: 'Meditate' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(screen.getByText('Meditate')).toBeInTheDocument();
});

test('heatmap renders a full 26-week grid of cells', () => {
  render(<App />);
  const cols = document.querySelectorAll('.heatmap-col');
  // ~26 week columns
  expect(cols.length).toBeGreaterThanOrEqual(26);
  // at least one fully-completed (lvl-4) day from seeded habit history? Read-only
  // days are 1/2 so lvl-2; ensure some green cells exist
  expect(document.querySelectorAll('.heatmap-cell.lvl-2').length).toBeGreaterThan(0);
});
