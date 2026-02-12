import { useState, useEffect } from "react";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tasks");
      if (saved) setTasks(JSON.parse(saved));
    } catch {
      setTasks([]);
    }
  }, []);

  const save = (updated) => {
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  const addTask = () => {
    if (task.trim() === "") return;

    const newTask = {
      text: task.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    save([...tasks, newTask]);
    setTask("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    updated[index].completedAt = updated[index].completed
      ? new Date().toISOString()
      : null;
    save(updated);
  };

  const deleteTask = (index) => {
    save(tasks.filter((_, i) => i !== index));
  };

  const newDay = () => {
    save(tasks.filter(t => !t.completed));
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  const format = (iso) =>
    new Date(iso).toLocaleString();

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

      <h3>Pending</h3>
      <ul>
        {pending.map((t) => {
          const idx = tasks.indexOf(t);
          return (
            <li key={idx}>
              <input type="checkbox" onChange={() => toggleTask(idx)} />
              {t.text}
              <br />
              <small>Created: {format(t.createdAt)}</small>
              <button onClick={() => deleteTask(idx)}>x</button>
            </li>
          );
        })}
      </ul>

      <h3>Completed</h3>
      <ul>
        {completed.map((t) => {
          const idx = tasks.indexOf(t);
          return (
            <li key={idx} style={{ textDecoration: "line-through", color: "gray" }}>
              <input
                type="checkbox"
                checked
                onChange={() => toggleTask(idx)}
              />
              {t.text}
              <br />
              <small>
                Created: {format(t.createdAt)} <br />
                Completed: {format(t.completedAt)}
              </small>
              <button onClick={() => deleteTask(idx)}>x</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
