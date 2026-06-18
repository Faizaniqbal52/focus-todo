import React, { createContext, useEffect, useState } from 'react';
import { subscribeTasks } from '../services/taskService';
import { subscribeLogs } from '../services/logService';
import { subscribeSessions } from '../services/focusService';

// Holds the app's live data in one place, now backed by on-device storage.
// No authentication required.

export const AppDataContext = createContext({
  tasks: [],
  logs: {},
  sessions: [],
  loading: true,
});

export function AppDataProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState({});
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTasks = subscribeTasks(setTasks);
    const unsubLogs = subscribeLogs(setLogs);
    const unsubSessions = subscribeSessions(setSessions);
    setLoading(false);
    return () => {
      unsubTasks && unsubTasks();
      unsubLogs && unsubLogs();
      unsubSessions && unsubSessions();
    };
  }, []);

  return (
    <AppDataContext.Provider value={{ tasks, logs, sessions, loading }}>
      {children}
    </AppDataContext.Provider>
  );
}

export default AppDataProvider;
