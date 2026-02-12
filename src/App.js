import { useState, useEffect } from "react";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState({});
  const [showLog, setShowLog] = useState(false);

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
    if (task.trim() === "") return;
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

  const newDay = () => {
    saveTasks(tasks.filter(t => !t.completed));
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div style={{ padding: 20 }}>
      <h2>Focus Todo</h2>
      <p>{completed.length} / {tasks.length} done</p>

      <input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTask()}
        placeholder="Add task"
      />
      <button onClick={addTask}>Add</button>
      <button onClick={newDay}>New Day</button>
      <button onClick={() => setShowLog(!showLog)}>
        {showLog ? "Hide Log" : "View Log"}
      </button>

      <h3>Pending</h3>
      <ul>
        {pending.map((t) => {
          const i = tasks.indexOf(t);
          return (
            <li key={i}>
              <input type="checkbox" onChange={() => toggleTask(i)} />
              {t.text}
            </li>
          );
        })}
      </ul>

      <h3>Completed</h3>
      <ul>
        {completed.map((t) => {
          const i = tasks.indexOf(t);
          return (
            <li key={i} style={{ textDecoration: "line-through", color: "gray" }}>
              <input
                type="checkbox"
                checked
                onChange={() => toggleTask(i)}
              />
              {t.text}
            </li>
          );
        })}
      </ul>

      {showLog && (
        <>
          <h3>Daily Log</h3>
          <ul>
            {Object.keys(log).sort().reverse().map(d => (
              <li key={d}>
                <strong>{d}</strong>
                <ul>
                  {log[d].map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
