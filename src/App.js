import { useState, useEffect } from "react";
import "./App.css";
import { auth, signInWithGoogle, logOut, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  setDoc
} from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);

  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState({});
  const [showLog, setShowLog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const today = () => new Date().toISOString().split("T")[0];

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  /* ================= REALTIME TASK LISTENER ================= */

  useEffect(() => {
    if (!user) return;

    const q = collection(db, "users", user.uid, "tasks");

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskData);
    });

    return () => unsubscribe();
  }, [user]);

  /* ================= REALTIME LOG LISTENER ================= */

  useEffect(() => {
  if (!user) return;

  const logsRef = collection(db, "users", user.uid, "logs");

  const unsubscribe = onSnapshot(logsRef, (snapshot) => {
    const rebuiltLogs = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      rebuiltLogs[doc.id] = data.entries || [];
    });

    setLog(rebuiltLogs);
  });

  return () => unsubscribe();
}, [user]);

  /* ================= ADD TASK ================= */

  const addTask = async () => {
    const trimmed = task.trim();
    if (!trimmed || !user) return;

    const q = query(
      collection(db, "users", user.uid, "tasks"),
      where("text", "==", trimmed)
    );

    const existing = await getDocs(q);
    if (!existing.empty) {
      alert("Task already exists.");
      return;
    }

    await addDoc(collection(db, "users", user.uid, "tasks"), {
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    });

    setTask("");
  };

  /* ================= TOGGLE TASK ================= */

  const toggleTask = async (taskItem) => {
  if (!user) return;

  const taskRef = doc(db, "users", user.uid, "tasks", taskItem.id);

  const updatedCompleted = !taskItem.completed;

  await updateDoc(taskRef, {
    completed: updatedCompleted,
    completedAt: updatedCompleted ? new Date().toISOString() : null
  });

  if (updatedCompleted) {
    const date = today();
    const logRef = doc(db, "users", user.uid, "logs", date);

    const existing = log[date] || [];

    if (!existing.includes(taskItem.text)) {
      await setDoc(
        logRef,
        { entries: [...existing, taskItem.text] },
        { merge: true }
      );
    }
  }
};

  /* ================= DELETE TASK ================= */

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?") || !user) return;

    await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
  };

  /* ================= EDIT TASK ================= */

  const saveEdit = async () => {
    if (!editingText.trim() || !user) return;

    await updateDoc(
      doc(db, "users", user.uid, "tasks", editingId),
      { text: editingText.trim() }
    );

    setEditingId(null);
    setEditingText("");
  };

  /* ================= LOG FUNCTIONS ================= */

  const clearLogByDate = async (date) => {
    if (!window.confirm("Clear entire day log?") || !user) return;
    await deleteDoc(doc(db, "users", user.uid, "logs", date));
  };

  const deleteLogItem = async (date, index) => {
    if (!window.confirm("Delete this log entry?") || !user) return;

    const updated = [...log[date]];
    updated.splice(index, 1);

    const logRef = doc(db, "users", user.uid, "logs", date);

    if (updated.length === 0) {
      await deleteDoc(logRef);
    } else {
      await updateDoc(logRef, { entries: updated });
    }
  };

  /* ================= LOGIN SCREEN ================= */

  if (!user) {
    return (
      <div className="app" style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: "40px" }}>Srya</h1>
        <button className="primary" onClick={signInWithGoogle}>
          Continue with Google
        </button>
      </div>
    );
  }

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  /* ================= MAIN UI ================= */

  return (
    <div className="app">
      <header className="header">
        <h1 className="brand">
          <span className="brand-icon">S</span>
          Srya
        </h1>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <span className="progress">
            {completed.length} / {tasks.length}
          </span>
          <button onClick={logOut}>Logout</button>
        </div>
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

      {/* PENDING */}
      <section className="panel">
        <h3 className="section-title">Pending</h3>
        <ul className="task-list">
          {pending.map((t) => (
            <li
              key={t.id}
              className="task-card"
              onClick={() => toggleTask(t)}
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="task-text">
                {editingId === t.id ? (
                  <>
                    <input
                      className="edit-input"
                      autoFocus
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <button className="edit-save" onClick={saveEdit}>
                      save
                    </button>
                  </>
                ) : (
                  t.text
                )}
              </div>

              {editMode && (
                <>
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(t.id);
                      setEditingText(t.text);
                    }}
                  >
                    edit
                  </button>

                  <button
                    className="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(t.id);
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* COMPLETED */}
      <section className="panel">
        <h3 className="section-title muted">Completed</h3>
        <ul className="task-list">
          {completed.map((t) => (
            <li
              key={t.id}
              className="task-card completed"
              onClick={() => toggleTask(t)}
            >
              <input
                type="checkbox"
                checked
                onChange={() => toggleTask(t)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="task-text">{t.text}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* LOG */}
      <div className="log-toggle">
        <button onClick={() => setShowLog(!showLog)}>
          {showLog ? "Hide Log" : "View Log"}
        </button>
      </div>

      {showLog && (
        <section className="panel log-section">
          <h3 className="section-title">Daily Log</h3>
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