import { useState, useEffect } from "react";
import "./App.css";
import { auth, signInWithGoogle, logOut, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadTasks(currentUser.uid);
      } else {
        setUser(null);
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= LOAD TASKS ================= */

  const loadTasks = async (uid) => {
    const snapshot = await getDocs(collection(db, "users", uid, "tasks"));
    const loaded = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    setTasks(loaded);
  };

  /* ================= ADD TASK ================= */

  const addTask = async () => {
    const trimmed = task.trim();
    if (!trimmed || !user) return;

    const exists = tasks.some(
      (t) => t.text.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      alert("Task already exists.");
      return;
    }

    await addDoc(collection(db, "users", user.uid, "tasks"), {
      text: trimmed,
      completed: false,
      createdAt: new Date()
    });

    setTask("");
    loadTasks(user.uid);
  };

  /* ================= TOGGLE TASK ================= */

  const toggleTask = async (taskObj) => {
    if (!user) return;

    const ref = doc(db, "users", user.uid, "tasks", taskObj.id);

    await updateDoc(ref, {
      completed: !taskObj.completed
    });

    loadTasks(user.uid);
  };

  /* ================= DELETE TASK ================= */

  const deleteTask = async (taskObj) => {
    if (!user) return;
    if (!window.confirm("Delete this task?")) return;

    await deleteDoc(doc(db, "users", user.uid, "tasks", taskObj.id));
    loadTasks(user.uid);
  };

  /* ================= EDIT TASK ================= */

  const startEdit = (taskObj) => {
    setEditingId(taskObj.id);
    setEditingText(taskObj.text);
  };

  const saveEdit = async () => {
    if (!editingText.trim() || !user) return;

    const ref = doc(db, "users", user.uid, "tasks", editingId);

    await updateDoc(ref, {
      text: editingText.trim()
    });

    setEditingId(null);
    setEditingText("");
    loadTasks(user.uid);
  };

  /* ================= FILTER ================= */

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  /* ================= LOGIN SCREEN ================= */

  if (!user) {
    return (
      <div className="app">
        <h1 className="brand">
          <span className="brand-icon">S</span>
          Srya
        </h1>

        <button className="primary" onClick={signInWithGoogle}>
          Continue with Google
        </button>
      </div>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <div className="app">
      <header className="header">
        <h1 className="brand">
          <span className="brand-icon">S</span>
          Srya
        </h1>

        <div>
          <span className="progress">
            {completed.length} / {tasks.length}
          </span>

          <button
            style={{ marginLeft: "15px" }}
            className="danger"
            onClick={logOut}
          >
            Logout
          </button>
        </div>
      </header>

      {/* INPUT */}
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

      {/* EDIT MODE TOGGLE */}
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

              {editingId === t.id ? (
                <>
                  <input
                    className="edit-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
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
              ) : (
                <div className="task-text">{t.text}</div>
              )}

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
                      deleteTask(t);
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

      {/* ================= COMPLETED ================= */}
      <section className="panel">
        <h3 className="section-title muted">Completed</h3>

        {completed.length === 0 && (
          <p className="empty-state">Nothing completed yet.</p>
        )}

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

              {editMode && (
                <button
                  className="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(t);
                  }}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;