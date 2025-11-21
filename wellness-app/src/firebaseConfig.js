import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyBlgELTCM--iUHimHnFbZ1WO-rs2UDdQPA",
  authDomain: "wellness-app-86008.firebaseapp.com",
  projectId: "wellness-app-86008",
  storageBucket: "wellness-app-86008.appspot.com", 
  messagingSenderId: "846389430165",
  appId: "1:846389430165:web:6989cbb222d360cde5989c",
  measurementId: "G-MXJYN5DJ4W"
};

// Initialize Firebase only if no app exists (prevents multiple initializations)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
