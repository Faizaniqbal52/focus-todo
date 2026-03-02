import { db } from './firebase';
import { getCurrentUser as getAuthUser } from './firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

export const getCurrentUser = () => getAuthUser();

export function subscribeLogs(userId, cb) {
  const ref = collection(db, 'users', userId, 'logs');
  const unsub = onSnapshot(ref, (snap) => {
    const rebuilt = {};
    snap.forEach((d) => {
      rebuilt[d.id] = d.data().entries || [];
    });
    cb(rebuilt);
  });
  return unsub;
}

export async function addEntry(userId, date, text) {
  const ref = doc(db, 'users', userId, 'logs', date);
  await setDoc(ref, { entries: text ? [text] : [] }, { merge: true });
}

export async function deleteEntry(userId, date, index) {
  const ref = doc(db, 'users', userId, 'logs', date);
  // Fetch and update log entry by removing at specified index
  try {
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) return;
    const entries = docSnap.data().entries || [];
    const updated = entries.filter((_, i) => i !== index);
    if (updated.length === 0) await deleteDoc(ref);
    else await setDoc(ref, { entries: updated });
  } catch (e) {
    console.error(e);
  }
}
