import { useEffect, useState } from 'react';
import * as logService from '../services/logService';
import useToast from './useToast';

export default function useLogs() {
  const [logs, setLogs] = useState({});
  const toast = useToast();

  useEffect(() => {
    const user = logService.getCurrentUser();
    if (!user) return;
    const unsub = logService.subscribeLogs(user.uid, (data) => setLogs(data));
    return () => unsub && unsub();
  }, []);

  const deleteEntry = async (date, index) => {
    const user = logService.getCurrentUser();
    if (!user) return;
    if (!window.confirm('Delete this log entry?')) return;
    try {
      await logService.deleteEntry(user.uid, date, index);
      toast.success('✓ Log entry deleted');
    } catch (error) {
      console.error('Delete log entry error:', error);
      toast.error('Failed to delete log entry. Please try again.');
    }
  };

  return { logs, deleteEntry };
}
