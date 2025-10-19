import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { Home, ClipboardList, User, Activity, Brain } from "lucide-react";

import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import Dashboard from "./components/Dashboard";
import CheckInForm from "./components/CheckInForm";
import Profile from "./components/Profile";
import Mental from "./components/Mental"; // AI Advice Page
import ComingSoon from "./components/ComingSoon"; // Placeholder for Insights

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCurrentScreen(currentUser ? "dashboard" : "login");
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCurrentScreen("login");
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Home", path: "/" },
    { id: "checkin", icon: ClipboardList, label: "Check-In", path: "/checkin" },
    { id: "mental", icon: Brain, label: "Mental", path: "/mental" }, // Fixed Path for Mental (AI Advice)
    { id: "insights", icon: Activity, label: "Insights", path: "/insights" }, // Fixed Path for Insights (Coming Soon)
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  // Dynamic component mapping (Fixed for v0 - Mental to AI Advice, Insights to Coming Soon)
  const screenComponents = {
    dashboard: Dashboard,
    checkin: CheckInForm,
    mental: Mental, // v0: AI Advice Page (query input, personalized tips)
    insights: ComingSoon, // v0: "Coming Soon" for AI Insights
    profile: Profile,
  };

  return (
    <div className="mobile-card bg-wellness">
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login setCurrentScreen={setCurrentScreen} /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register setCurrentScreen={setCurrentScreen} /> : <Navigate to="/" />}
        />
        <Route
          path="/forgot-password"
          element={!user ? <ForgotPassword setCurrentScreen={setCurrentScreen} /> : <Navigate to="/" />}
        />
        {Object.entries(screenComponents).map(([id, Component]) => (
          <Route
            key={id}
            path={navItems.find((item) => item.id === id)?.path || "/"}
            element={
              user ? (
                <Component setCurrentScreen={setCurrentScreen} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        ))}
        <Route path="/" element={<Navigate to={user ? "/" : "/login"} />} />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </div>
  );
}