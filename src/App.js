import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState({});
  const [showLog, setShowLog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("Kyro_tasks");
      const savedLog = localStorage.getItem("Kyro_log");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedLog) setLog(JSON.parse(savedLog));
    } catch {
      setTasks([]);
      setLog({});
    }
  }, []);

  const saveTasks = (updated) => {
    setTasks(updated);
    localStorage.setItem("Kyro_tasks", JSON.stringify(updated));
  };

  const saveLog = (updated) => {
    setLog(updated);
    localStorage.setItem("Kyro_log", JSON.stringify(updated));
  };

  const today = () => new Date().toISOString().split("T")[0];

  const addTask = () => {
    const trimmed = task.trim();
    if (!trimmed) return;

    const exists = tasks.some(
      (t) => t.text.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert("Task already exists.");
      return;
    }

    saveTasks([
      ...tasks,
      {
        text: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      }
    ]);

    setTask("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    const t = updated[index];

    t.completed = !t.completed;
    t.completedAt = t.completed ? new Date().toISOString() : null;

    if (t.completed) {
      const d = today();
      const existingEntries = log[d] || [];
      if (!existingEntries.includes(t.text)) {
        saveLog({
          ...log,
          [d]: [...existingEntries, t.text]
        });
      }
    }

    saveTasks(updated);
  };

  const deleteTask = (index) => {
    if (!window.confirm("Delete this task?")) return;
    saveTasks(tasks.filter((_, i) => i !== index));
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditingText(tasks[index].text);
  };

  const saveEdit = () => {
    if (!editingText.trim()) return;

    const updated = [...tasks];
    updated[editingIndex].text = editingText.trim();
    saveTasks(updated);

    setEditingIndex(null);
    setEditingText("");
  };

  const clearLogByDate = (date) => {
    if (!window.confirm("Clear entire day log?")) return;
    const updated = { ...log };
    delete updated[date];
    saveLog(updated);
  };

  const deleteLogItem = (date, itemIndex) => {
    if (!window.confirm("Delete this log entry?")) return;

    const updated = { ...log };
    updated[date] = updated[date].filter((_, i) => i !== itemIndex);

    if (updated[date].length === 0) {
      delete updated[date];
    }

    saveLog(updated);
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const renderTaskText = (t, i) => {
    if (editingIndex === i) {
      return (
        <>
          <input
            className="edit-input"
            autoFocus
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") {
                setEditingIndex(null);
                setEditingText("");
              }
            }}
          />
          <button
            className="edit-save"
            onClick={(e) => {
              e.stopPropagation();
              saveEdit();
            }}
          >
            save
          </button>
        </>
      );
    }

    return <span>{t.text}</span>;
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="brand">
          <span className="brand-icon">S</span>
          Srya
        </h1>
        <span className="progress">
          {completed.length} / {tasks.length}
        </span>
      </header>

      <div className="input-row">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="What needs to be done?"
        />
        <button className="primary" onClick={addTask}>
          Add
        </button>
      </div>

      <div className="log-toggle">
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Done Editing" : "Edit Tasks"}
        </button>
      </div>

      {/* ================= PENDING ================= */}
      <section className="panel">
        <h3 className="section-title">Pending</h3>

        {pending.length === 0 && (
          <p className="empty-state">No pending tasks.</p>
        )}

        <ul className="task-list">
          {pending.map((t) => {
            const i = tasks.indexOf(t);
            return (
              <li
                key={i}
                className="task-card"
                onClick={() => toggleTask(i)}
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTask(i)}
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="task-text">
                  {renderTaskText(t, i)}
                </div>

                {editMode && (
                  <>
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(i);
                      }}
                    >
                      edit
                    </button>

                    <button
                      className="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(i);
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ================= COMPLETED ================= */}
      <section className="panel">
        <h3 className="section-title muted">Completed</h3>

        {completed.length === 0 && (
          <p className="empty-state">Nothing completed yet.</p>
        )}

        <ul className="task-list">
          {completed.map((t) => {
            const i = tasks.indexOf(t);
            return (
              <li
                key={i}
                className="task-card completed"
                onClick={() => toggleTask(i)}
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleTask(i)}
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="task-text">
                  {renderTaskText(t, i)}
                </div>

                {editMode && (
                  <>
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(i);
                      }}
                    >
                      edit
                    </button>

                    <button
                      className="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(i);
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ================= LOG ================= */}
      <div className="log-toggle">
        <button onClick={() => setShowLog(!showLog)}>
          {showLog ? "Hide Log" : "View Log"}
        </button>
      </div>

      {showLog && (
        <section className="panel log-section">
          <h3 className="section-title">Daily Log</h3>

          {Object.keys(log).length === 0 && (
            <p className="empty-state">No activity yet.</p>
          )}

          <ul>
            {Object.keys(log)
              .sort()
              .reverse()
              .map((d) => (
                <li key={d} className="log-day">
                  <div className="log-day-header">
                    <strong>{d}</strong>

                    {editMode && (
                      <button
                        className="danger"
                        onClick={() => clearLogByDate(d)}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <ul>
                    {log[d].map((item, i) => (
                      <li key={i} className="log-item">
                        {item}

                        {editMode && (
                          <button
                            className="danger"
                            onClick={() => deleteLogItem(d, i)}
                          >
                            ×
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default App;