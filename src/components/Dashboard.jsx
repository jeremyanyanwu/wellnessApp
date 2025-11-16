import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
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
import { calculateStreak, getStreakMessage } from "../utils/streakCalculator";
import { getWeeklyWellnessData, formatWeeklyDataForChart } from "../utils/weeklyTrends";
import "../App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState({});
  const [wellnessScore, setWellnessScore] = useState(66); // Calculated from moods
  const [dayStreak, setDayStreak] = useState(1); // Mock
  const [checkinsCount, setCheckinsCount] = useState(0); // 0/3
  const [weeklyData, setWeeklyData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Wellness Score",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#ff9f55",
      },
    ],
  });

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
      // Get today's check-ins
      const todayDocRef = doc(db, "dailyCheckins", uid);
      const todayDocSnap = await getDoc(todayDocRef);
      
      let todayData = {};
      if (todayDocSnap.exists()) {
        todayData = todayDocSnap.data();
        setCheckins(todayData);
        const count = Object.values(todayData).filter((c) => typeof c === 'object' && c.submitted).length;
        setCheckinsCount(count);
        // Calculate wellness score from moods
        const moods = Object.values(todayData)
          .filter(c => typeof c === 'object' && c.mood)
          .map(c => c.mood)
          .filter(m => m > 0);
        setWellnessScore(moods.length > 0 ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) : 66);
      } else {
        // If no today's data exists, initialize with empty check-ins
        const today = new Date().toISOString().split('T')[0];
        const defaultCheckins = {
          morning: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, submitted: false, advice: "" },
          afternoon: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, submitted: false, advice: "" },
          evening: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, submitted: false, advice: "" },
          date: today
        };
        setCheckins(defaultCheckins);
        setCheckinsCount(0);
        setWellnessScore(66);
        todayData = defaultCheckins;
      }

      // Calculate streak from check-in history
      try {
        const historyQuery = query(
          collection(db, "checkinHistory"),
          where("userId", "==", uid),
          orderBy("timestamp", "desc"),
          limit(30) // Get last 30 days for streak calculation
        );
        const historySnapshot = await getDocs(historyQuery);
        const historyData = historySnapshot.docs.map(doc => doc.data());
        
        // Add today's data if it has check-ins
        const today = new Date().toISOString().split('T')[0];
        const hasCheckInToday = todayData.morning?.submitted || 
                                todayData.afternoon?.submitted || 
                                todayData.evening?.submitted;
        
        // Always include today's data for weekly trends (even if no check-ins, shows as 0)
        const todayInHistory = historyData.find(d => d.date === today);
        if (!todayInHistory) {
          // Add today's data to history for weekly calculation
          historyData.unshift({
            date: today,
            checkins: todayData,
            userId: uid,
            timestamp: new Date().toISOString()
          });
        } else {
          // Update today's data if it exists but might be outdated
          const todayIndex = historyData.findIndex(d => d.date === today);
          if (todayIndex !== -1) {
            historyData[todayIndex] = {
              date: today,
              checkins: todayData,
              userId: uid,
              timestamp: new Date().toISOString()
            };
          }
        }
        
        const streakData = calculateStreak(historyData);
        setDayStreak(streakData.currentStreak);
        
        // Calculate weekly wellness data (includes today)
        const weeklyWellnessData = getWeeklyWellnessData(historyData);
        const chartData = formatWeeklyDataForChart(weeklyWellnessData);
        setWeeklyData(chartData);
      } catch (streakErr) {
        // If query fails (e.g., missing index), calculate from available data
        console.warn("Could not fetch full history for streak calculation:", streakErr);
        // Try without orderBy as fallback
        try {
          const historyQuery = query(
            collection(db, "checkinHistory"),
            where("userId", "==", uid),
            limit(30)
          );
          const historySnapshot = await getDocs(historyQuery);
          const historyData = historySnapshot.docs
            .map(doc => doc.data())
            .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
          
          // Always include today's data for weekly trends
          const today = new Date().toISOString().split('T')[0];
          const todayInHistory = historyData.find(d => d.date === today);
          if (!todayInHistory) {
            historyData.unshift({
              date: today,
              checkins: todayData,
              userId: uid,
              timestamp: new Date().toISOString()
            });
          } else {
            const todayIndex = historyData.findIndex(d => d.date === today);
            if (todayIndex !== -1) {
              historyData[todayIndex] = {
                date: today,
                checkins: todayData,
                userId: uid,
                timestamp: new Date().toISOString()
              };
            }
          }
          
          const streakData = calculateStreak(historyData);
          setDayStreak(streakData.currentStreak);
          
          // Calculate weekly wellness data (includes today)
          const weeklyWellnessData = getWeeklyWellnessData(historyData);
          const chartData = formatWeeklyDataForChart(weeklyWellnessData);
          setWeeklyData(chartData);
        } catch (err) {
          console.error("Error calculating streak:", err);
          setDayStreak(0);
          // Set empty weekly data on error
          setWeeklyData({
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                label: "Wellness Score",
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: "#ff9f55",
              },
            ],
          });
        }
      }
    } catch (err) {
      console.error("Error fetching check-ins:", err);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const score = context.parsed.y;
            if (score === 0) {
              return "No check-in data";
            }
            return `Wellness Score: ${score}/100`;
          }
        }
      }
    },
    scales: { 
      y: { 
        beginAtZero: true, 
        max: 100,
        ticks: {
          stepSize: 10
        }
      } 
    },
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
      <div className="nav-wrapper">
        <div className="top-nav">
          <h1 className="nav-title">Wellness Assistant</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
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
          {weeklyData.datasets[0].data.every(score => score === 0) ? (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#2d2d2d',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <p style={{ 
                fontSize: '1.1rem', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: '#1a1a1a'
              }}>
                📊 No data yet
              </p>
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#4a4a4a',
                lineHeight: '1.5'
              }}>
                Complete check-ins to see your weekly wellness trends!
              </p>
            </div>
          ) : (
            <Bar data={weeklyData} options={options} />
          )}
        </div>
      </div>

      <div className="nav-wrapper">
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
    </div>
  );
}