import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Home, ClipboardList, Brain, Activity, User } from "lucide-react";
import "../App.css";

export default function CheckInForm() {
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState({
    morning: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, hydration: 0, submitted: false, advice: "" },
    afternoon: { eaten: null, activity: "", mood: 5, stress: 5, hydration: 0, submitted: false, advice: "" },
    evening: { eaten: null, activity: "", mood: 5, stress: 5, hydration: 0, submitted: false, advice: "" },
  });

  const [error, setError] = useState(null);
  const [lastResetDate, setLastResetDate] = useState(null);
  const user = auth.currentUser;
  const steps = 7500; // Mock steps
  const stepGoal = 10000;

  // Get today's date string (YYYY-MM-DD format)
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Check if we need to reset for a new day
  const checkDailyReset = async () => {
    const today = getTodayString();
    const todayDocRef = doc(db, "dailyCheckins", user.uid);
    const todayDocSnap = await getDoc(todayDocRef);
    
    if (!todayDocSnap.exists() || todayDocSnap.data().date !== today) {
      // It's a new day, reset check-ins
      const defaultCheckins = {
        morning: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, hydration: 0, submitted: false, advice: "" },
        afternoon: { eaten: null, activity: "", mood: 5, stress: 5, hydration: 0, submitted: false, advice: "" },
        evening: { eaten: null, activity: "", mood: 5, stress: 5, hydration: 0, submitted: false, advice: "" },
        date: today,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(todayDocRef, defaultCheckins);
      setCheckins(defaultCheckins);
      setLastResetDate(today);
    } else {
      // Load today's existing check-ins
      setCheckins(todayDocSnap.data());
      setLastResetDate(today);
    }
  };

  useEffect(() => {
    if (user) {
      const initializeCheckins = async () => {
        try {
          await checkDailyReset();
        } catch (err) {
          setError("Failed to load check-ins.");
          console.error(err);
        }
      };
      initializeCheckins();
    }
  }, [user]);

  const saveCheckins = async (updatedCheckins) => {
    if (user) {
      try {
        const today = getTodayString();
        const todayDocRef = doc(db, "dailyCheckins", user.uid);
        
        // Save to today's document
        await setDoc(todayDocRef, {
          ...updatedCheckins,
          date: today,
          lastUpdated: new Date().toISOString()
        });
        
        // Also save to historical collection for analytics
        const historicalData = {
          userId: user.uid,
          date: today,
          checkins: updatedCheckins,
          timestamp: new Date().toISOString()
        };
        
        // Store in historical collection (this will create multiple documents over time)
        await addDoc(collection(db, "checkinHistory"), historicalData);
        
      } catch (err) {
        setError("Failed to save check-ins.");
        console.error(err);
      }
    }
  };

  const handleCheckInChange = (time, field, value) => {
    setCheckins((prev) => ({
      ...prev,
      [time]: { ...prev[time], [field]: value },
    }));
  };

  const submitCheckIn = async (time) => {
    const { eaten, activity, mood, stress, hydration } = checkins[time];
    const sleep = time === 'morning' ? checkins[time].sleep : undefined;
    
    // Import wellness analysis
    const { analyzeWellnessFactors } = await import("../utils/wellnessCorrelations");
    // For afternoon/evening, create a modified check-in data without sleep for analysis
    const checkInDataForAnalysis = time === 'morning' 
      ? checkins[time] 
      : { ...checkins[time], sleep: undefined };
    const wellnessAnalysis = analyzeWellnessFactors(checkInDataForAnalysis, time);
    
    // Generate personalized advice based on research correlations
    let advice = "Great job checking in! ";
    
    // Priority-based advice from analysis
    const highImpact = Object.entries(wellnessAnalysis.analyses)
      .filter(([_, analysis]) => analysis.impact === "high")
      .sort((a, b) => b[1].affectedFactors.length - a[1].affectedFactors.length);
    
    if (highImpact.length > 0) {
      const [factor, analysis] = highImpact[0];
      advice += analysis.recommendations[0] + " ";
      
      // Add correlation insights if available
      if (wellnessAnalysis.correlations.length > 0) {
        advice += wellnessAnalysis.correlations[0].recommendation + " ";
      }
    } else {
      // Default advice if everything is good
      advice += "Your wellness factors look balanced. Keep up the good work! ";
      if (hydration < 4) {
        advice += "Remember to stay hydrated - aim for 8 cups of water daily! 💧";
      }
    }
    
    advice += `Mood: ${mood}/10, Stress: ${stress}/10`;
    if (time === 'morning' && sleep !== undefined) {
      advice += `, Sleep: ${sleep}h`;
    }
    if (hydration > 0) {
      advice += `, Hydration: ${hydration} cups`;
    }

    const updated = {
      ...checkins,
      [time]: { ...checkins[time], submitted: true, advice },
    };
    setCheckins(updated);
    await saveCheckins(updated);
  };

  const getTimeIcon = (time) => {
    switch (time) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      default: return '⏰';
    }
  };

  const getTimeGradient = (time) => {
    switch (time) {
      case 'morning': return 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)';
      case 'afternoon': return 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
      case 'evening': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const renderCheckIn = (time) => {
    const { eaten, activity, mood, stress, submitted, advice } = checkins[time];
    const sleep = time === 'morning' ? checkins[time].sleep : undefined;
    if (submitted) {
      return (
        <div className="auth-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              background: getTimeGradient(time),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              fontSize: '1.5rem'
            }}>
              {getTimeIcon(time)}
            </div>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>
                {time.charAt(0).toUpperCase() + time.slice(1)} Check-in
              </h2>
              <p style={{ color: '#34c759', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
                ✅ Completed
              </p>
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(52, 199, 89, 0.1)', 
            borderRadius: '12px', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{advice}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${time === 'morning' ? '100px' : '120px'}, 1fr))`, gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a1a1a' }}>
                {eaten ? '✅' : '❌'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Eaten</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a1a1a' }}>
                {mood}/10
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Mood</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a1a1a' }}>
                {stress}/10
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Stress</div>
            </div>
            {time === 'morning' && sleep !== undefined && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a1a1a' }}>
                  {sleep}h
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Sleep</div>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a1a1a' }}>
                {checkins[time].hydration || 0}💧
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500' }}>Water</div>
            </div>
          </div>
          
          {activity && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#2d2d2d' }}>
                <strong>Activity:</strong> {activity}
              </p>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%', 
            background: getTimeGradient(time),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            fontSize: '1.5rem'
          }}>
            {getTimeIcon(time)}
          </div>
          <h2 className="card-title" style={{ margin: 0 }}>
            {time.charAt(0).toUpperCase() + time.slice(1)} Check-in
          </h2>
        </div>

        <div className="auth-form">
          <div>
            <label className="form-label">🍽️ Have you eaten?</label>
            <select
              value={eaten === null ? "" : eaten ? "yes" : "no"}
              onChange={(e) => handleCheckInChange(time, "eaten", e.target.value === "yes")}
              className="input"
            >
              <option value="">Select an option</option>
              <option value="yes">✅ Yes</option>
              <option value="no">❌ No</option>
            </select>
          </div>

          <div>
            <label className="form-label">🏃‍♂️ What did you do today?</label>
            <input
              className="input"
              placeholder="e.g., studied, exercised, socialized..."
              value={activity}
              onChange={(e) => handleCheckInChange(time, "activity", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">😊 Mood: {mood}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => handleCheckInChange(time, "mood", parseInt(e.target.value))}
              className="input"
              style={{ 
                background: `linear-gradient(to right, #ff6b6b 0%, #ffd93d 50%, #4ecdc4 100%)`,
                height: '8px',
                borderRadius: '4px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500', marginTop: '0.25rem' }}>
              <span>😢</span>
              <span>😐</span>
              <span>😊</span>
            </div>
          </div>

          <div>
            <label className="form-label">😰 Stress: {stress}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={stress}
              onChange={(e) => handleCheckInChange(time, "stress", parseInt(e.target.value))}
              className="input"
              style={{ 
                background: `linear-gradient(to right, #4ecdc4 0%, #ffd93d 50%, #ff6b6b 100%)`,
                height: '8px',
                borderRadius: '4px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500', marginTop: '0.25rem' }}>
              <span>😌</span>
              <span>😐</span>
              <span>😰</span>
            </div>
          </div>

          {time === 'morning' && (
            <div>
              <label className="form-label">😴 Sleep: {sleep} hours</label>
              <input
                type="range"
                min="0"
                max="12"
                value={sleep}
                onChange={(e) => handleCheckInChange(time, "sleep", parseInt(e.target.value))}
                className="input"
                style={{ 
                  background: `linear-gradient(to right, #667eea 0%, #764ba2 100%)`,
                  height: '8px',
                  borderRadius: '4px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500', marginTop: '0.25rem' }}>
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
              </div>
            </div>
          )}

          <div>
            <label className="form-label">💧 Water Intake: {checkins[time].hydration || 0} cups (today)</label>
            <input
              type="range"
              min="0"
              max="16"
              value={checkins[time].hydration || 0}
              onChange={(e) => handleCheckInChange(time, "hydration", parseInt(e.target.value))}
              className="input"
              style={{ 
                background: `linear-gradient(to right, #4ecdc4 0%, #44a08d 100%)`,
                height: '8px',
                borderRadius: '4px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#1a1a1a', fontWeight: '500', marginTop: '0.25rem' }}>
              <span>0</span>
              <span>8 cups (goal)</span>
              <span>16+</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem', marginBottom: '0' }}>
              Recommended: 8 cups (64 oz) daily
            </p>
          </div>

          <button className="button" onClick={() => submitCheckIn(time)}>
            📝 Submit {time.charAt(0).toUpperCase() + time.slice(1)} Check-in
          </button>
        </div>
      </div>
    );
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
      <h1 className="auth-title">Daily Check-in</h1>
      
      {/* Daily Reset Indicator */}
      {lastResetDate && (
        <div className="auth-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#2d2d2d', fontWeight: '500' }}>
                📅 Today's Check-ins
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#8e8e93' }}>
                Reset daily at midnight
              </p>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              {new Date(lastResetDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      {renderCheckIn("morning")}
      {renderCheckIn("afternoon")}
      {renderCheckIn("evening")}
      
      <div className="nav-wrapper">
        <div className="bottom-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`nav-item ${item.id === 'checkin' ? 'active' : ''}`}
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