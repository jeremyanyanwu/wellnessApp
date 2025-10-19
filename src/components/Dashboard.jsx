import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Home, ClipboardList, Brain, Activity, User } from "lucide-react";
import "../App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState({});
  const [wellnessScore, setWellnessScore] = useState(66); // Calculated from moods
  const [dayStreak, setDayStreak] = useState(1); // Mock
  const [checkinsCount, setCheckinsCount] = useState(0); // 0/3

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchCheckins(user.uid);
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const fetchCheckins = async (uid) => {
    try {
      const docRef = doc(db, "checkins", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCheckins(data);
        const count = Object.values(data).filter((c) => c.submitted).length;
        setCheckinsCount(count);
        // Calculate wellness score from moods
        const moods = Object.values(data).map((c) => c.mood || 5).filter((m) => m > 0);
        setWellnessScore(moods.length > 0 ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : 66);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Wellness Score",
        data: [70, 65, 80, 75, 66, 72, 68],
        backgroundColor: "#ff9f55",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "checkin", icon: ClipboardList, label: "Check-in", path: "/checkin" },
    { id: "mental", icon: Brain, label: "Mental", path: "/mental" },
    { id: "insights", icon: Activity, label: "Insights", path: "/insights" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="container">
      <div className="top-nav">
        <h1 className="nav-title">Wellness Assistant</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="auth-card">
        <h2 className="card-title">Today's Overview</h2>
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{wellnessScore}</div>
            <div className="stat-label">Wellness Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{dayStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{checkinsCount}/3</div>
            <div className="stat-label">Check-ins</div>
          </div>
        </div>
      </div>

      {/* Today's Check-ins */}
      <h2 className="auth-title">Today's Check-ins</h2>
      
      {/* Morning Check-in */}
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            fontSize: '1.2rem'
          }}>
            🌅
          </div>
          <h3 className="card-title" style={{ margin: 0 }}>Morning</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.morning?.mood || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Mood</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.morning?.stress || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Stress</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.morning?.sleep || 0}h
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Sleep</div>
          </div>
        </div>
      </div>

      {/* Afternoon Check-in */}
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            fontSize: '1.2rem'
          }}>
            ☀️
          </div>
          <h3 className="card-title" style={{ margin: 0 }}>Afternoon</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.afternoon?.mood || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Mood</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.afternoon?.stress || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Stress</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.afternoon?.sleep || 0}h
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Sleep</div>
          </div>
        </div>
      </div>

      {/* Evening Check-in */}
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            fontSize: '1.2rem'
          }}>
            🌙
          </div>
          <h3 className="card-title" style={{ margin: 0 }}>Evening</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.evening?.mood || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Mood</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.evening?.stress || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Stress</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
              {checkins.evening?.sleep || 0}h
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Sleep</div>
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      <h2 className="auth-title">Weekly Trends</h2>
      <div className="auth-card">
        <div style={{ height: '250px', marginTop: '1rem' }}>
          <Bar data={data} options={options} />
        </div>
      </div>

      <div className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`nav-item ${item.id === 'home' ? 'active' : ''}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}