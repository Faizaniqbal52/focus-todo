import React, { createContext, useEffect, useState } from 'react';
import { subscribeTasks } from '../services/taskService';
import { subscribeLogs } from '../services/logService';
import { subscribeSessions } from '../services/focusService';
import { subscribeHabits, subscribeHabitLog } from '../services/habitService';

// Holds the app's live data in one place, now backed by on-device storage.
// No authentication required.

export const AppDataContext = createContext({
  tasks: [],
  logs: {},
  sessions: [],
  habits: [],
  habitLog: {},
  loading: true,
});

export function AppDataProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState({});
  const [sessions, setSessions] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLog, setHabitLog] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTasks = subscribeTasks(setTasks);
    const unsubLogs = subscribeLogs(setLogs);
    const unsubSessions = subscribeSessions(setSessions);
    const unsubHabits = subscribeHabits(setHabits);
    const unsubHabitLog = subscribeHabitLog(setHabitLog);
    setLoading(false);
    return () => {
      unsubTasks && unsubTasks();
      unsubLogs && unsubLogs();
      unsubSessions && unsubSessions();
      unsubHabits && unsubHabits();
      unsubHabitLog && unsubHabitLog();
    };
  }, []);

  return (
    <AppDataContext.Provider
      value={{ tasks, logs, sessions, habits, habitLog, loading }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export default AppDataProvider;
