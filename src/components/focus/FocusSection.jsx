import React, { useContext, useMemo } from 'react';
import { AppDataContext } from '../../context/AppDataContext';
import { dateKey, focusForDay, focusSeries } from '../../utils/score';
import FocusTimer from './FocusTimer';
import FocusTimeCard from './FocusTimeCard';
import './focus.css';

// Phase 2 block: the live focus timer beside today's Focus Time + 7-day chart.
// Reads sessions from the shared store — no new data listeners.
export default function FocusSection() {
  const { sessions } = useContext(AppDataContext);

  const { today, series } = useMemo(
    () => ({
      today: focusForDay(dateKey(), sessions),
      series: focusSeries(sessions, 7),
    }),
    [sessions]
  );

  return (
    <div className="focus-section">
      <FocusTimer />
      <FocusTimeCard today={today} series={series} />
    </div>
  );
}
