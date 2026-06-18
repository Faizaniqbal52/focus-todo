import React, { createContext, useEffect, useState } from 'react';
import { subscribeTasks } from '../services/taskService';
import { subscribeLogs } from '../services/logService';

// Holds the app's live data in one place, now backed by on-device storage.
// No authentication required.

export const AppDataContext = createContext({
  tasks: [],
  logs: {},
  loading: true,
});

export function AppDataProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTasks = subscribeTasks(setTasks);
    const unsubLogs = subscribeLogs(setLogs);
    setLoading(false);
    return () => {
      unsubTasks && unsubTasks();
      unsubLogs && unsubLogs();
    };
  }, []);

  return (
    <AppDataContext.Provider value={{ tasks, logs, loading }}>
      {children}
    </AppDataContext.Provider>
  );
}

export default AppDataProvider;
