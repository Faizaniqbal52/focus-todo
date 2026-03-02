import React, { useState, useEffect } from 'react';
import useTasks from '../../hooks/useTasks';
import useVoice from '../../hooks/useVoice';

export default function TaskInput() {
  const { addTask } = useTasks();
  const [value, setValue] = useState('');
  const { listening, startListening } = useVoice((text) => setValue(text));

  useEffect(() => {
    // clear on successful add is handled by addTask returning true/false
  }, []);

  const onAdd = async () => {
    const ok = await addTask(value);
    if (ok) setValue('');
  };

  return (
    <div className="input-row">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        placeholder="What needs to be done?"
      />

      <button onClick={() => startListening()} className={`mic-btn ${listening ? 'active' : ''}`}>
        {listening ? '🛑 Stop' : '🎙 Speak'}
      </button>

      <button className="primary" onClick={onAdd}>Add</button>
    </div>
  );
}
