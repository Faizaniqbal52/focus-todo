import React from 'react';
import TaskItem from './TaskItem';
import useTasks from '../../hooks/useTasks';

export default function CompletedList() {
  const { tasks, toggleTask } = useTasks();
  const completed = tasks.filter((t) => t.completed);

  return (
    <section className="panel">
      <h3 className="section-title">Completed</h3>
      <ul className="task-list">
        {completed.map((t) => (
          <TaskItem key={t.id} t={t} onToggle={toggleTask} editMode={false} />
        ))}
      </ul>
    </section>
  );
}
