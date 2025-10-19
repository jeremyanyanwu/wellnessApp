import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ClipboardList, Brain, Activity, User } from "lucide-react";
import "../App.css";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="auth-title">Coming Soon</h1>
      <div className="auth-card">
        <h2 className="card-title">AI Insights</h2>
        <p>Picture this: An AI that analyzes your moods like a therapist on caffeine— "Your stress is high because you studied for 3 hours on an empty stomach. Solution: Eat a snack and call it 'self-care.'"</p>
        <p>Or: "Your sleep score is 4/10. That's not a nap; that's a cry for coffee. We'll fix that with trends that actually work (no, 'just sleep more' doesn't count)."</p>
        <p>Stay tuned for wellness wisdom that'll make you laugh... or cry. Either way, it's progress! 😄🧠</p>
        <button className="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
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
            className={`nav-item ${item.id === 'insights' ? 'active' : ''}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}