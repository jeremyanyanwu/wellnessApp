// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlgELTCM--iUHimHnFbZ1WO-rs2UDdQPA",
  authDomain: "wellness-app-86008.firebaseapp.com",
  projectId: "wellness-app-86008",
  storageBucket: "wellness-app-86008.firebasestorage.app",
  messagingSenderId: "846389430165",
  appId: "1:846389430165:web:6989cbb222d360cde5989c",
  measurementId: "G-MXJYN5DJ4W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
