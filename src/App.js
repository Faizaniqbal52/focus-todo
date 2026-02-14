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
      const savedTasks = localStorage.getItem("focus_tasks");
      const savedLog = localStorage.getItem("focus_log");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedLog) setLog(JSON.parse(savedLog));
    } catch {
      setTasks([]);
      setLog({});
    }
  }, []);

  const saveTasks = (updated) => {
    setTasks(updated);
    localStorage.setItem("focus_tasks", JSON.stringify(updated));
  };

  const saveLog = (updated) => {
    setLog(updated);
    localStorage.setItem("focus_log", JSON.stringify(updated));
  };

  const today = () => new Date().toISOString().split("T")[0];

  const addTask = () => {
    if (!task.trim()) return;
    saveTasks([
      ...tasks,
      {
        text: task.trim(),
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
      saveLog({
        ...log,
        [d]: [...(log[d] || []), t.text]
      });
    }

    saveTasks(updated);
  };

  const deleteTask = (index) => {
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

  /* 🔥 FIXED: Clear only specific date */
  const clearLogByDate = (date) => {
    const updated = { ...log };
    delete updated[date];
    saveLog(updated);
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  const renderTaskText = (t, i) => {
    if (editingIndex === i) {
      return (
        <>
          <input
            className="edit-input"
            autoFocus
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") {
                setEditingIndex(null);
                setEditingText("");
              }
            }}
          />
          <button className="edit-save" onClick={saveEdit}>
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
        <h1>Kyro</h1>
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

      <section>
        <h3 className="section-title">Pending</h3>
        <ul className="task-list">
          {pending.map((t) => {
            const i = tasks.indexOf(t);
            return (
              <li key={i} className="task-card">
                <input type="checkbox" onChange={() => toggleTask(i)} />
                <div className="task-text">{renderTaskText(t, i)}</div>

                {editMode && (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => startEdit(i)}
                    >
                      edit
                    </button>
                    <button
                      className="danger"
                      onClick={() => deleteTask(i)}
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

      <section>
        <h3 className="section-title muted">Completed</h3>
        <ul className="task-list">
          {completed.map((t) => {
            const i = tasks.indexOf(t);
            return (
              <li key={i} className="task-card completed">
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleTask(i)}
                />
                <div className="task-text">{renderTaskText(t, i)}</div>

                {editMode && (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => startEdit(i)}
                    >
                      edit
                    </button>
                    <button
                      className="danger"
                      onClick={() => deleteTask(i)}
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

      <div className="log-toggle">
        <button onClick={() => setShowLog(!showLog)}>
          {showLog ? "Hide Log" : "View Log"}
        </button>
      </div>

      {showLog && (
        <section className="log-section">
          <h3 className="section-title">Daily Log</h3>

          <ul>
            {Object.keys(log)
              .sort()
              .reverse()
              .map((d) => (
                <li key={d} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                      <li key={i}>{item}</li>
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
