import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzHfI8y8iNP9EsdlAWKET7UrdsaQ9e3Qw",
  authDomain: "srya-app.firebaseapp.com",
  projectId: "srya-app",
  storageBucket: "srya-app.firebasestorage.app",
  messagingSenderId: "619658878473",
  appId: "1:619658878473:web:785575b1fb1e0c37be62d8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logOut = () => signOut(auth);