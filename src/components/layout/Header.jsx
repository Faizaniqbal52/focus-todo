import React from 'react';
import useAuth from '../../hooks/useAuth';
import useTasks from '../../hooks/useTasks';
import useToast from '../../hooks/useToast';
import logo from "../../assets/srya-logo.png";

export default function Header() {
  const { logOut } = useAuth();
  const { tasks } = useTasks();
  const toast = useToast();

  const completed = tasks.filter((t) => t.completed).length;

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Srya Logo" className="brand-logo" />
      </div>

      <div className="header-right">
        <span className="progress">
          {completed} / {tasks.length}
        </span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
