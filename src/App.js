import { useState, useEffect } from "react";
import "./App.css";
import { auth, signInWithGoogle, logOut, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  arrayUnion
} from "firebase/firestore";


useEffect(() => {
  if (!user) return;

  // 🔹 TASK LISTENER
  const tasksQuery = query(
    collection(db, "users", user.uid, "tasks"),
    orderBy("createdAt", "desc")
  );

  const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
    const fetchedTasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTasks(fetchedTasks);
  });

  // 🔹 LOG LISTENER
  const logsQuery = collection(db, "users", user.uid, "logs");

  const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
    const fetchedLogs = {};
    snapshot.docs.forEach(doc => {
      fetchedLogs[doc.id] = doc.data().entries || [];
    });
    setLog(fetchedLogs);
  });

  return () => {
    unsubscribeTasks();
    unsubscribeLogs();
  };
}, [user]);
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

  /* ================= FETCH TASKS ================= */

  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, "users", user.uid, "tasks");

    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [user]);

  /* ================= FETCH LOGS ================= */

  useEffect(() => {
    if (!user) return;

    const logsRef = collection(db, "users", user.uid, "logs");

    const unsubscribe = onSnapshot(logsRef, (snapshot) => {
      const rebuiltLogs = {};
      snapshot.forEach((doc) => {
        rebuiltLogs[doc.id] = doc.data().entries || [];
      });
      setLog(rebuiltLogs);
    });

    return () => unsubscribe();
  }, [user]);

  /* ================= ADD TASK ================= */

  const addTask = async () => {
    if (!task.trim() || !user) return;

    const tasksRef = collection(db, "users", user.uid, "tasks");

    await addDoc(tasksRef, {
      text: task.trim(),
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
      const logRef = doc(db, "users", user.uid, "logs", today());

      await setDoc(
        logRef,
        {
          entries: arrayUnion(taskItem.text)
        },
        { merge: true }
      );
    }
  };

  /* ================= DELETE TASK ================= */

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
  };

  /* ================= EDIT TASK ================= */

  const startEdit = (taskItem) => {
    setEditingId(taskItem.id);
    setEditingText(taskItem.text);
  };

  const saveEdit = async () => {
    if (!editingText.trim()) return;

    const taskRef = doc(db, "users", user.uid, "tasks", editingId);

    await updateDoc(taskRef, {
      text: editingText.trim()
    });

    setEditingId(null);
    setEditingText("");
  };

  /* ================= DELETE LOG ITEM ================= */

  const deleteLogItem = async (date, index) => {
    if (!window.confirm("Delete this log entry?")) return;

    const updatedEntries = log[date].filter((_, i) => i !== index);

    const logRef = doc(db, "users", user.uid, "logs", date);

    await setDoc(logRef, { entries: updatedEntries });

    if (updatedEntries.length === 0) {
      await deleteDoc(logRef);
    }
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

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

  /* ================= MAIN APP ================= */

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
                  <span>{t.text}</span>
                )}
              </div>

              {editMode && (
                <>
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(t);
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
        <h3 className="section-title">Completed</h3>
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

      {/* LOGS */}
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
                  <strong>{d}</strong>
                  <ul>
                    {log[d].map((item, i) => (
                      <li key={i} className="log-item">
                        {item}
                        <button
                          className="danger"
                          onClick={() => deleteLogItem(d, i)}
                        >
                          ×
                        </button>
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