import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-621648379-9893c",
  appId: "1:432575327587:web:c3f2ce32d93ff319ca3756",
  apiKey: "AIzaSyDLCfcCFS2uunqhbeSvfnV6ns0loyDgk8g",
  authDomain: "studio-621648379-9893c.firebaseapp.com",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
