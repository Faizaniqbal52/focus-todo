import { useCallback, useContext } from 'react';
import { AppDataContext } from '../context/AppDataContext';
import * as taskService from '../services/taskService';
import useToast from './useToast';

// Reads from the shared on-device data; exposes the same mutation API.
export default function useTasks() {
  const { tasks } = useContext(AppDataContext);
  const toast = useToast();

  const addTask = useCallback(async (text) => {
    if (!text || !text.trim()) return false;
    try {
      taskService.addTask(text.trim());
      toast.success('\u2713 Task added');
      return true;
    } catch (error) {
      console.error('Add task error:', error);
      toast.error('Failed to add task. Please try again.');
      return false;
    }
  }, [toast]);

  const toggleTask = useCallback(async (task) => {
    try {
      taskService.toggleTask(task);
      if (!task.completed) toast.success('\u2713 Task completed');
    } catch (error) {
      console.error('Toggle task error:', error);
      toast.error('Failed to update task. Please try again.');
    }
  }, [toast]);

  const deleteTask = useCallback(async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      taskService.deleteTask(id);
      toast.success('\u2713 Task deleted');
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  }, [toast]);

  const updateTaskText = useCallback(async (id, text) => {
    if (!text || !text.trim()) return;
    try {
      taskService.updateTaskText(id, text.trim());
      toast.success('\u2713 Task updated');
    } catch (error) {
      console.error('Update task error:', error);
      toast.error('Failed to update task. Please try again.');
    }
  }, [toast]);

  return { tasks, addTask, toggleTask, deleteTask, updateTaskText };
}
