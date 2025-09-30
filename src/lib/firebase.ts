import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDg4Yn0aIaSNu0qS96SOVrEm8onEDDe9lk",
  authDomain: "thebulletintracker.firebaseapp.com",
  projectId: "thebulletintracker",
  storageBucket: "thebulletintracker.firebasestorage.app",
  messagingSenderId: "114223508239",
  appId: "1:114223508239:web:35dbd723f89e68afa96c7a",
  measurementId: "G-9BMTGY1D2Q"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
