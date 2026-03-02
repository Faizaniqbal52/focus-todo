import React from 'react';
import useLogs from '../../hooks/useLogs';

export default function LogPanel({ editMode }) {
  const { logs, deleteEntry } = useLogs();

  return (
    <section className="panel log-section">
      <h3 className="section-title">Daily Log</h3>
      <ul>
        {Object.keys(logs).sort().reverse().map((d) => (
          <li key={d} className="log-day">
            <strong>{d}</strong>
            <ul>
              {logs[d].map((item, i) => (
                <li key={i} className="log-item">
                  {item}
                  {editMode && <button className="danger" onClick={() => deleteEntry(d, i)}>×</button>}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
