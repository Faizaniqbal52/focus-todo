import { db } from './firebase';
import { getCurrentUser as getAuthUser } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

export const getCurrentUser = () => getAuthUser();

export function subscribeTasks(userId, cb) {
  const q = query(collection(db, 'users', userId, 'tasks'), orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(data);
  });
  return unsub;
}

export async function addTask(userId, text) {
  const trimmed = text.trim();
  const docId = trimmed.toLowerCase();
  const taskRef = doc(db, 'users', userId, 'tasks', docId);
  await setDoc(taskRef, { text: trimmed, completed: false, createdAt: serverTimestamp(), completedAt: null });
}

export async function toggleTask(userId, taskItem) {
  const taskRef = doc(db, 'users', userId, 'tasks', taskItem.id);
  const newState = !taskItem.completed;
  await updateDoc(taskRef, { completed: newState, completedAt: newState ? serverTimestamp() : null });
  if (newState) {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const logRef = doc(db, 'users', userId, 'logs', dateKey);
    await setDoc(logRef, { entries: arrayUnion(taskItem.text) }, { merge: true });
  }
}

export async function deleteTask(userId, id) {
  await deleteDoc(doc(db, 'users', userId, 'tasks', id));
}

export async function updateTaskText(userId, id, text) {
  await updateDoc(doc(db, 'users', userId, 'tasks', id), { text });
}
