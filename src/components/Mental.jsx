import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Home, ClipboardList, Brain, Activity, User } from "lucide-react";
import "../App.css";

export default function Mental() {
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState({});
  const [query, setQuery] = useState("");
  const [advice, setAdvice] = useState("");
  const [error, setError] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const fetchCheckins = async () => {
        try {
          const docRef = doc(db, "checkins", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCheckins(docSnap.data());
          }
        } catch (err) {
          setError("Failed to load data.");
          console.error(err);
        }
      };
      fetchCheckins();
    }
  }, [user]);

  const generateAdvice = () => {
    if (!query.trim()) {
      setAdvice("Ask me something! E.g., 'How to handle stress?'");
      return;
    }

    // Simple AI-like logic based on query and check-ins
    let baseAdvice = "Based on your recent check-ins (mood: " + (Object.values(checkins).reduce((sum, c) => sum + (c.mood || 5), 0) / Object.keys(checkins).length).toFixed(1) + "/10), here's some student-friendly advice: ";
    if (query.toLowerCase().includes("stress") || query.toLowerCase().includes("anxiety")) {
      baseAdvice += "Take 5 deep breaths: Inhale for 4, hold for 4, exhale for 4. It's like a reset button for your brain. Try it now? 😌";
    } else if (query.toLowerCase().includes("mood") || query.toLowerCase().includes("sad")) {
      baseAdvice += "Your mood is low—start with a 5-min walk outside or text a friend. Small steps, big wins. What's one thing that always makes you smile?";
    } else if (query.toLowerCase().includes("sleep")) {
      baseAdvice += "Aim for 7-8 hours tonight. Pro tip: No screens 30 mins before bed. What's your bedtime ritual?";
    } else {
      baseAdvice += "Great question! General tip: Journal 3 things you're grateful for—it boosts mood by 25%. What's one from today?";
    }
    setAdvice(baseAdvice);
  };

  const breathingExercise = () => {
    setAdvice("Breathing Exercise: Inhale for 4 seconds... Hold for 4... Exhale for 4... Repeat 5 times. Feel calmer already? 🌬️");
  };

  return (
    <div className="container">
      <h1 className="auth-title">Mental Wellness</h1>
      {error && <p className="error">{error}</p>}
      <div className="auth-card">
        <h2 className="card-title">Ask for Advice</h2>
        <p>Based on your check-ins, get personalized tips!</p>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., 'How to handle stress?'"
        />
        <button className="button" onClick={generateAdvice}>
          Get Advice
        </button>
        <button className="button" onClick={breathingExercise}>
          Quick Breathing Exercise
        </button>
        {advice && <p className="success-message">{advice}</p>}
      </div>
      
      <div className="bottom-nav">
        {[
          { id: "home", icon: Home, label: "Home", path: "/" },
          { id: "checkin", icon: ClipboardList, label: "Check-in", path: "/checkin" },
          { id: "mental", icon: Brain, label: "Mental", path: "/mental" },
          { id: "insights", icon: Activity, label: "Insights", path: "/insights" },
          { id: "profile", icon: User, label: "Profile", path: "/profile" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`nav-item ${item.id === 'mental' ? 'active' : ''}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}