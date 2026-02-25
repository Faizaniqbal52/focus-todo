import { useState, useEffect } from "react";
import "./App.css";
import { auth, signInWithGoogle, logOut, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  serverTimestamp,
  getDoc
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

  // ✅ ADDED: voice listening state
  const [listening, setListening] = useState(false);

  const today = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "tasks"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTasks(data);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "logs");

    const unsub = onSnapshot(ref, (snap) => {
      const rebuilt = {};
      snap.forEach((d) => {
        rebuilt[d.id] = d.data().entries || [];
      });
      setLog(rebuilt);
    });

    return () => unsub();
  }, [user]);

  // ✅ ADDED: voice recognition function
    const startListening = () => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

  // If already listening → stop it
    if (listening && window._recognitionInstance) {
      window._recognitionInstance.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    // Store globally so we can stop it manually
    window._recognitionInstance = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = true;     
    recognition.continuous = true;         

    let finalTranscript = "";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTask((finalTranscript + interimTranscript).trim());
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      window._recognitionInstance = null;
    };

    recognition.start();
  };

  const addTask = async () => {
    if (!task.trim() || !user) return;

    const trimmed = task.trim();
    const docId = trimmed.toLowerCase();

    const taskRef = doc(db, "users", user.uid, "tasks", docId);

    await setDoc(taskRef, {
      text: trimmed,
      completed: false,
      createdAt: serverTimestamp(),
      completedAt: null
    });

    setTask("");
  };

  const toggleTask = async (taskItem) => {
    if (!user) return;

    const taskRef = doc(db, "users", user.uid, "tasks", taskItem.id);
    const newState = !taskItem.completed;

    await updateDoc(taskRef, {
      completed: newState,
      completedAt: newState ? serverTimestamp() : null
    });

    if (newState) {
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

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditingText(t.text);
  };

  const saveEdit = async () => {
    if (!editingText.trim() || !user || !editingId) return;

    const ref = doc(db, "users", user.uid, "tasks", editingId);

    await updateDoc(ref, {
      text: editingText.trim()
    });

    setEditingId(null);
    setEditingText("");
  };

  const deleteLogItem = async (date, index) => {
    if (!window.confirm("Delete this log entry?")) return;

    const updated = log[date].filter((_, i) => i !== index);
    const ref = doc(db, "users", user.uid, "logs", date);

    if (updated.length === 0) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { entries: updated });
    }
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

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

        {/* ✅ ADDED: mic button */}
        <button
          onClick={startListening}
          className={`mic-btn ${listening ? "active" : ""}`}
        >
          {listening ? "🛑 Stop" : "🎙 Speak"}
        </button>

        <button className="primary" onClick={addTask}>
          Add
        </button>
      </div>

      <div className="log-toggle">
        <button onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? "Done Editing" : "Edit Tasks"}
        </button>
      </div>

      <section className="panel">
        <h3 className="section-title">Pending</h3>
        <ul className="task-list">
          {pending.map((t) => (
            <li key={t.id} className="task-card" onClick={() => toggleTask(t)}>
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