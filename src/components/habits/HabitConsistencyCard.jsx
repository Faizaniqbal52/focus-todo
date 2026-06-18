import React, { useContext, useMemo } from 'react';
import { AppDataContext } from '../../context/AppDataContext';
import { activeHabits, habitStreak } from '../../utils/score';
import Icon from '../common/Icon';
import HabitHeatmap from './HabitHeatmap';

// The GitHub-style consistency heatmap as a standalone card for the grid.
export default function HabitConsistencyCard() {
  const { habits, habitLog } = useContext(AppDataContext);

  const bestStreak = useMemo(
    () =>
      activeHabits(habits).reduce(
        (max, h) => Math.max(max, habitStreak(h.id, habitLog).current),
        0
      ),
    [habits, habitLog]
  );

  return (
    <section className="dash-card habit-heatmap-card">
      <div className="dash-card__head">
        <span className="dash-card__label">
          <Icon name="grid" size={14} /> Habit Consistency
        </span>
        {bestStreak > 0 && (
          <span className="habit-best-streak">
            <Icon name="flame" size={13} /> {bestStreak}-day best
          </span>
        )}
      </div>
      <HabitHeatmap habits={habits} habitLog={habitLog} />
    </section>
  );
}
