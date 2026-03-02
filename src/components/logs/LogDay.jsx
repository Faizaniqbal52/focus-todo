import React from 'react';

export default function LogDay({ date, entries = [], editMode, onDelete }) {
  return (
    <li className="log-day">
      <strong>{date}</strong>
      <ul>
        {entries.map((e, i) => (
          <li key={i} className="log-item">
            {e}
            {editMode && <button className="danger" onClick={() => onDelete(date, i)}>×</button>}
          </li>
        ))}
      </ul>
    </li>
  );
}
