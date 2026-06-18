import React, { useContext, useMemo } from 'react';
import { AppDataContext } from '../../context/AppDataContext';
import {
  dateKey,
  signalsForDay,
  computeDailyPower,
  dailyPowerSeries,
  weeklyGrade,
  completionVelocity,
} from '../../utils/score';
import DailyPowerCard from './DailyPowerCard';
import WeeklyGradeCard from './WeeklyGradeCard';
import VelocityCard from './VelocityCard';
import './dashboard.css';

// The Phase 1 command center. Reads the shared on-device data once and turns it
// into the numbers via the pure scoring engine — no new data listeners.
export default function Dashboard() {
  const { tasks, logs, sessions, habits, habitLog } = useContext(AppDataContext);

  const { today, series, grade, velocity } = useMemo(() => {
    // Every signal flows in here: tasks, logs, focus sessions and habits.
    const data = { tasks, logs, sessions, habits, habitLog };
    const todayKey = dateKey();
    const powerSeries = dailyPowerSeries(data, 7);
    return {
      today: computeDailyPower(signalsForDay(todayKey, data)),
      series: powerSeries,
      grade: weeklyGrade(powerSeries.map((s) => s.value)),
      velocity: completionVelocity(logs, 7),
    };
  }, [tasks, logs, sessions, habits, habitLog]);

  return (
    <div className="dashboard">
      <DailyPowerCard today={today} series={series} />
      <WeeklyGradeCard grade={grade.grade} avg={grade.avg} />
      <VelocityCard velocity={velocity} />
    </div>
  );
}
