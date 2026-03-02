import { useEffect, useState, useCallback } from 'react';
import * as taskService from '../services/taskService';
import useToast from './useToast';

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const toast = useToast();

  useEffect(() => {
    let unsub;
    const user = taskService.getCurrentUser();
    if (!user) return;
    unsub = taskService.subscribeTasks(user.uid, (data) => setTasks(data));
    return () => unsub && unsub();
  }, []);

  const addTask = useCallback(async (text) => {
    const user = taskService.getCurrentUser();
    if (!user) return false;
    if (!text || !text.trim()) return false;
    try {
      await taskService.addTask(user.uid, text.trim());
      toast.success('✓ Task added');
      return true;
    } catch (error) {
      console.error('Add task error:', error);
      toast.error('Failed to add task. Please try again.');
      return false;
    }
  }, [toast]);

  const toggleTask = useCallback(async (task) => {
    const user = taskService.getCurrentUser();
    if (!user) return;
    try {
      await taskService.toggleTask(user.uid, task);
      if (!task.completed) {
        toast.success('✓ Task completed');
      }
    } catch (error) {
      console.error('Toggle task error:', error);
      toast.error('Failed to update task. Please try again.');
    }
  }, [toast]);

  const deleteTask = useCallback(async (id) => {
    const user = taskService.getCurrentUser();
    if (!user) return;
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(user.uid, id);
      toast.success('✓ Task deleted');
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  }, [toast]);

  const updateTaskText = useCallback(async (id, text) => {
    const user = taskService.getCurrentUser();
    if (!user) return;
    if (!text || !text.trim()) return;
    try {
      await taskService.updateTaskText(user.uid, id, text.trim());
      toast.success('✓ Task updated');
    } catch (error) {
      console.error('Update task error:', error);
      toast.error('Failed to update task. Please try again.');
    }
  }, [toast]);

  return { tasks, addTask, toggleTask, deleteTask, updateTaskText };
}
