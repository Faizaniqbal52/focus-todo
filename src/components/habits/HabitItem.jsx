import React from 'react';

// One habit: a tick button for today, its name, current streak, and (in edit
// mode) a delete control. The whole row toggles today's completion.
export default function HabitItem({ habit, doneToday, streak, onToggle, onDelete, editMode }) {
  return (
    <li className={`habit-row ${doneToday ? 'is-done' : ''}`}>
      <button
        className="habit-check"
        onClick={() => onToggle(habit.id)}
        aria-pressed={doneToday}
        aria-label={`${doneToday ? 'Unmark' : 'Mark'} ${habit.name} for today`}
        title={doneToday ? 'Completed today' : 'Mark done for today'}
      >
        {doneToday ? '✓' : ''}
      </button>

      <span className="habit-name">
        {habit.emoji ? `${habit.emoji} ` : ''}
        {habit.name}
      </span>

      <span className={`habit-streak ${streak.current > 0 ? 'is-hot' : ''}`}>
        {streak.current > 0 ? `🔥 ${streak.current}` : '—'}
      </span>

      {editMode && (
        <button
          className="habit-delete"
          onClick={() => onDelete(habit)}
          aria-label={`Delete ${habit.name}`}
          title="Delete habit"
        >
          ×
        </button>
      )}
    </li>
  );
}
