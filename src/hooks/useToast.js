import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export default function useToast() {
  const { addToast } = useContext(ToastContext);

  return {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    info: (message) => addToast(message, 'info'),
  };
}
