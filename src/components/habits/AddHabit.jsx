import React, { useState } from 'react';

// Compact add-habit input. Keeps to one primary action, like the task input.
export default function AddHabit({ onAdd }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const ok = onAdd(value);
    if (ok) setValue('');
  };

  return (
    <div className="habit-add">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="New habit — e.g. Read 20 min"
        maxLength={60}
      />
      <button className="primary habit-add-btn" onClick={submit}>
        Add
      </button>
    </div>
  );
}
