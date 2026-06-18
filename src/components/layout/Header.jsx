import React from 'react';
import useTasks from '../../hooks/useTasks';
import logo from '../../assets/srya-logo.png';

export default function Header() {
  const { tasks } = useTasks();
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Srya Logo" className="brand-logo" />
        <span className="header-tab">Execution Board</span>
      </div>

      <div className="header-right">
        <span className="progress">
          {completed} / {tasks.length} done
        </span>
      </div>
    </header>
  );
}
