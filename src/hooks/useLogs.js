import { useContext } from 'react';
import { AppDataContext } from '../context/AppDataContext';
import * as logService from '../services/logService';
import useToast from './useToast';

export default function useLogs() {
  const { logs } = useContext(AppDataContext);
  const toast = useToast();

  const deleteEntry = async (date, index) => {
    if (!window.confirm('Delete this log entry?')) return;
    try {
      logService.deleteEntry(date, index);
      toast.success('\u2713 Log entry deleted');
    } catch (error) {
      console.error('Delete log entry error:', error);
      toast.error('Failed to delete log entry. Please try again.');
    }
  };

  return { logs, deleteEntry };
}
