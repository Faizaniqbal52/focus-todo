import React, { useState } from 'react';
import useTasks from '../../hooks/useTasks';
import Icon from '../common/Icon';
import TaskInput from './TaskInput';
import TaskItem from './TaskItem';

// The left-rail task board for the command center: input + the pending list,
// with an inline edit toggle. Completed tasks live in the full-width section
// below the grid.
export default function TaskPanel() {
  const { tasks, toggleTask, deleteTask, updateTaskText } = useTasks();
  const [editMode, setEditMode] = useState(false);
  const pending = tasks.filter((t) => !t.completed);

  return (
    <section className="dash-card task-panel">
      <div className="dash-card__head">
        <span className="dash-card__label">
          <Icon name="bolt" size={14} /> Execution Board
        </span>
        {pending.length > 0 && (
          <button className="habit-edit-toggle" onClick={() => setEditMode((p) => !p)}>
            {editMode ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      <TaskInput />

      {pending.length === 0 ? (
        <p className="habit-empty">Nothing queued. Add your next priority above.</p>
      ) : (
        <ul className="task-list task-list--panel">
          {pending.map((t) => (
            <TaskItem
              key={t.id}
              t={t}
              onToggle={toggleTask}
              editMode={editMode}
              onDelete={deleteTask}
              onSaveEdit={updateTaskText}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
