import React, { useState } from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/common/Toast';
import Header from './components/layout/Header';
import TaskInput from './components/tasks/TaskInput';
import TaskList from './components/tasks/TaskList';
import CompletedList from './components/tasks/CompletedList';
import LogPanel from './components/logs/LogPanel';
import useAuth from './hooks/useAuth';
import useToast from './hooks/useToast';
import logo from "../../assets/srya-logo.png";

function InnerApp() {
  const { user, signInWithGoogle } = useAuth();
  const toast = useToast();
  const [showLog, setShowLog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Ignore popup-closed-by-user error
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('Sign-in error:', error);
      toast.error('Sign-in failed. Please try again.');
    }
  };

  if (!user) {
  return (
    <div className="app login-screen">
      <div className="login-card">
        <img src={logo} alt="Srya Logo" className="brand-logo" />

        <button
          className="primary login-btn"
          onClick={handleSignIn}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="app">
      <Header />

      <TaskInput />

      <div className="log-toggle">
        <button onClick={() => setEditMode((p) => !p)}>{editMode ? 'Done Editing' : 'Edit Tasks'}</button>
      </div>

      <TaskList editMode={editMode} />
      <CompletedList />

      <div className="log-toggle">
        <button onClick={() => setShowLog((s) => !s)}>{showLog ? 'Hide Log' : 'View Log'}</button>
      </div>

      {showLog && <LogPanel editMode={editMode} />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Toast />
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </ToastProvider>
  );
}
