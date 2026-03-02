import React, { useState } from 'react';

export default function TaskItem({ t, onToggle, editMode, onDelete, onStartEdit, onSaveEdit }) {
  const [editingText, setEditingText] = useState(t.text);
  const [isEditing, setIsEditing] = useState(false);

  const start = () => {
    setIsEditing(true);
    setEditingText(t.text);
    onStartEdit && onStartEdit(t);
  };

  const save = async (e) => {
    e.stopPropagation();
    await onSaveEdit && onSaveEdit(t.id, editingText);
    setIsEditing(false);
  };

  return (
    <li key={t.id} className={`task-card ${t.completed ? 'completed' : ''}`} onClick={() => onToggle(t)}>
      <input type="checkbox" checked={!!t.completed} onChange={() => onToggle(t)} onClick={(e) => e.stopPropagation()} />
      <div className="task-text">
        {isEditing ? (
          <>
            <input className="edit-input" autoFocus value={editingText} onChange={(e) => setEditingText(e.target.value)} />
            <button className="edit-save" onClick={save}>save</button>
          </>
        ) : (
          <span>{t.text}</span>
        )}
      </div>

      {editMode && !isEditing && (
        <>
          <button className="edit-btn" onClick={(e) => { e.stopPropagation(); start(); }}>edit</button>
          <button className="danger" onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}>×</button>
        </>
      )}
    </li>
  );
}
