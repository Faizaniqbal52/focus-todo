import React, { useContext, useMemo, useState } from 'react';
import { AppDataContext } from '../../context/AppDataContext';
import { dateKey, activeHabits, habitsForDay, habitStreak } from '../../utils/score';
import * as habitService from '../../services/habitService';
import useToast from '../../hooks/useToast';
import AddHabit from './AddHabit';
import HabitItem from './HabitItem';
import HabitHeatmap from './HabitHeatmap';
import './habits.css';

// Phase 3 block: build daily habits and see consistency on the heatmap.
// Reads habits + habitLog from the shared store — no new data listeners.
export default function HabitSection() {
  const { habits, habitLog } = useContext(AppDataContext);
  const toast = useToast();
  const [editMode, setEditMode] = useState(false);

  const todayKey = dateKey();
  const list = useMemo(() => activeHabits(habits), [habits]);

  const today = habitsForDay(todayKey, habits, habitLog);
  const bestStreak = useMemo(
    () => list.reduce((max, h) => Math.max(max, habitStreak(h.id, habitLog).current), 0),
    [list, habitLog]
  );

  const onAdd = (name) => {
    const habit = habitService.addHabit(name);
    if (habit) {
      toast.success('✓ Habit added');
      return true;
    }
    return false;
  };

  const onToggle = (id) => habitService.toggleHabit(id);

  const onDelete = (habit) => {
    if (!window.confirm(`Delete habit "${habit.name}"? Its history will be removed.`))
      return;
    habitService.deleteHabit(habit.id);
    toast.success('✓ Habit deleted');
  };

  return (
    <div className="habit-section">
      <section className="dash-card habit-list-card">
        <div className="dash-card__head">
          <span className="dash-card__label">Habits</span>
          <div className="habit-head-right">
            {list.length > 0 && (
              <span className="habit-today-count">
                {today.done}/{today.active} today
              </span>
            )}
            {list.length > 0 && (
              <button
                className="habit-edit-toggle"
                onClick={() => setEditMode((p) => !p)}
              >
                {editMode ? 'Done' : 'Edit'}
              </button>
            )}
          </div>
        </div>

        <AddHabit onAdd={onAdd} />

        {list.length === 0 ? (
          <p className="habit-empty">
            No habits yet. Add one above — the heatmap fills in as you keep showing up.
          </p>
        ) : (
          <ul className="habit-rows">
            {list.map((h) => (
              <HabitItem
                key={h.id}
                habit={h}
                doneToday={!!(habitLog[h.id] && habitLog[h.id][todayKey])}
                streak={habitStreak(h.id, habitLog)}
                onToggle={onToggle}
                onDelete={onDelete}
                editMode={editMode}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="dash-card habit-heatmap-card">
        <div className="dash-card__head">
          <span className="dash-card__label">Habit Consistency</span>
          {bestStreak > 0 && (
            <span className="habit-best-streak">🔥 {bestStreak}-day best</span>
          )}
        </div>
        <HabitHeatmap habits={habits} habitLog={habitLog} />
      </section>
    </div>
  );
}
