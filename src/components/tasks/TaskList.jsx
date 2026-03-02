import React from 'react';
import TaskItem from './TaskItem';
import useTasks from '../../hooks/useTasks';

export default function TaskList({ editMode }) {
  const { tasks, toggleTask, deleteTask, updateTaskText } = useTasks();

  const pending = tasks.filter((t) => !t.completed);

  return (
    <section className="panel">
      <h3 className="section-title">Pending</h3>
      <ul className="task-list">
        {pending.map((t) => (
          <TaskItem key={t.id} t={t} onToggle={toggleTask} editMode={editMode} onDelete={deleteTask} onSaveEdit={updateTaskText} />
        ))}
      </ul>
    </section>
  );
}
