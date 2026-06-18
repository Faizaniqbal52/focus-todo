import React, { useContext, useMemo, useState } from 'react';
import { AppDataContext } from '../../context/AppDataContext';
import {
  dateKey,
  lastNDays,
  signalsForDay,
  computeDailyPower,
  dailyPowerSeries,
  weeklyGrade,
  completionVelocity,
  focusForDay,
  focusSeries,
} from '../../utils/score';

import DailyCode from '../dailycode/DailyCode';
import TaskPanel from '../tasks/TaskPanel';
import FocusRing from '../focus/FocusRing';
import DailyPowerCard from '../dashboard/DailyPowerCard';
import VelocityCard from '../dashboard/VelocityCard';
import WeeklyGradeCard from '../dashboard/WeeklyGradeCard';
import FocusTimeCard from '../focus/FocusTimeCard';
import AntiProcrastination from '../antiprocrastination/AntiProcrastination';
import HabitListCard from '../habits/HabitListCard';
import HabitConsistencyCard from '../habits/HabitConsistencyCard';
import CompletedList from '../tasks/CompletedList';
import LogPanel from '../logs/LogPanel';

import '../dashboard/dashboard.css';
import '../focus/focus.css';
import '../habits/habits.css';
import './command.css';

// The Quiet Command Center, dense edition: a 3-column grid on desktop that
// collapses to a clean stack on phones. Computes every metric once from the
// shared data and feeds the cards — no per-card data listeners.
export default function CommandCenter() {
  const { tasks, logs, sessions, habits, habitLog } = useContext(AppDataContext);
  const [showLog, setShowLog] = useState(false);

  const metrics = useMemo(() => {
    const data = { tasks, logs, sessions, habits, habitLog };
    const todayKey = dateKey();
    const series = dailyPowerSeries(data, 7);
    const today = computeDailyPower(signalsForDay(todayKey, data));
    const yKey = lastNDays(2)[0];
    const yesterday = computeDailyPower(signalsForDay(yKey, data));
    return {
      power: today,
      powerSeries: series,
      delta: today - yesterday,
      grade: weeklyGrade(series.map((s) => s.value)),
      velocity: completionVelocity(logs, 7),
      focusToday: focusForDay(todayKey, sessions),
      focusSeries: focusSeries(sessions, 7),
    };
  }, [tasks, logs, sessions, habits, habitLog]);

  return (
    <div className="command">
      <DailyCode />

      <div className="cc-grid">
        <div className="cc-col cc-col--left">
          <TaskPanel />
          <FocusRing />
        </div>

        <div className="cc-col cc-col--center">
          <DailyPowerCard
            today={metrics.power}
            series={metrics.powerSeries}
            delta={metrics.delta}
          />
          <VelocityCard velocity={metrics.velocity} />
          <HabitConsistencyCard />
        </div>

        <div className="cc-col cc-col--right">
          <WeeklyGradeCard grade={metrics.grade.grade} avg={metrics.grade.avg} />
          <FocusTimeCard today={metrics.focusToday} series={metrics.focusSeries} />
          <AntiProcrastination />
          <HabitListCard />
        </div>
      </div>

      <div className="cc-footer">
        <CompletedList />
        <div className="log-toggle">
          <button onClick={() => setShowLog((s) => !s)}>
            {showLog ? 'Hide Log' : 'View Log'}
          </button>
        </div>
        {showLog && <LogPanel />}
      </div>
    </div>
  );
}
