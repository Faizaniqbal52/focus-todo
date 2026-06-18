import React, { useState } from 'react';
import './App.css';
import { AppDataProvider } from './context/AppDataContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/common/Toast';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import TaskInput from './components/tasks/TaskInput';
import TaskList from './components/tasks/TaskList';
import CompletedList from './components/tasks/CompletedList';
import LogPanel from './components/logs/LogPanel';

function InnerApp() {
  const [showLog, setShowLog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="app">
      <Header />

      <Dashboard />

      <TaskInput />

      <div className="log-toggle">
        <button onClick={() => setEditMode((p) => !p)}>
          {editMode ? 'Done Editing' : 'Edit Tasks'}
        </button>
      </div>

      <TaskList editMode={editMode} />
      <CompletedList />

      <div className="log-toggle">
        <button onClick={() => setShowLog((s) => !s)}>
          {showLog ? 'Hide Log' : 'View Log'}
        </button>
      </div>

      {showLog && <LogPanel editMode={editMode} />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Toast />
      <AppDataProvider>
        <InnerApp />
      </AppDataProvider>
    </ToastProvider>
  );
}
