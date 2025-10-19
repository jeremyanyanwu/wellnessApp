import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add storage import

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBlgELTCM--iUHimHnFbZ1WO-rs2UDdQPA",
  authDomain: "wellness-app-86008.firebaseapp.com",
  projectId: "wellness-app-86008",
  storageBucket: "wellness-app-86008.firebasestorage.app",
  messagingSenderId: "846389430165",
  appId: "1:846389430165:web:6989cbb222d360cde5989c",
  measurementId: "G-MXJYN5DJ4W",
};

// Initialize Firebase only if no app exists
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Services we need
export const auth = getAuth(app); // For login/register/logout
export const db = getFirestore(app); // For storing check-ins
export const storage = getStorage(app); // Add storage export