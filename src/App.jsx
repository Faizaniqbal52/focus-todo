import React from 'react';
import './App.css';
import { AppDataProvider } from './context/AppDataContext';
import { ToastProvider } from './context/ToastContext';
import { FocusTimerProvider } from './context/FocusTimerContext';
import Toast from './components/common/Toast';
import Header from './components/layout/Header';
import CommandCenter from './components/layout/CommandCenter';

function InnerApp() {
  return (
    <div className="app app--command">
      <Header />
      <CommandCenter />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Toast />
      <AppDataProvider>
        <FocusTimerProvider>
          <InnerApp />
        </FocusTimerProvider>
      </AppDataProvider>
    </ToastProvider>
  );
}
