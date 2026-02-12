import { useState, useEffect } from "react";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const save = (updated) => {
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  const addTask = () => {
    if (task.trim() === "") return;
    save([...tasks, { text: task, completed: false }]);
    setTask("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    save(updated);
  };

  const newDay = () => {
    const pending = tasks.filter(t => !t.completed);
    save(pending);
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
        placeholder="Add task"
      />
      <button onClick={addTask}>Add</button>
      <button onClick={newDay}>New Day</button>

      <h3>Pending</h3>
      <ul>
        {pending.map((t, i) => (
          <li key={i}>
            <input type="checkbox" onChange={() => toggleTask(tasks.indexOf(t))} />
            {t.text}
          </li>
        ))}
      </ul>

      <h3>Completed</h3>
      <ul>
        {completed.map((t, i) => (
          <li key={i}>
            <input
              type="checkbox"
              checked
              onChange={() => toggleTask(tasks.indexOf(t))}
            />
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
