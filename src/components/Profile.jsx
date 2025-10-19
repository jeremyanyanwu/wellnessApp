import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc } from "firebase/firestore";
import { Home, ClipboardList, Brain, Activity, User } from "lucide-react";
import "../App.css";

export default function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [image, setImage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [checkins, setCheckins] = useState({});
  const [stats, setStats] = useState({ totalCheckins: 0, avgMood: 0, longestStreak: 0 });
  const [theme, setTheme] = useState("green"); // "green" or "blue"
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCheckins(user.uid);
    }
  }, [user]);

  const fetchCheckins = async (uid) => {
    try {
      const docRef = doc(db, "checkins", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCheckins(data);
        const totalCheckins = Object.values(data).filter((c) => c.submitted).length;
        const moods = Object.values(data).map((c) => c.mood || 5).filter((m) => m > 0);
        const avgMood = moods.length > 0 ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : 5;
        const longestStreak = 5; // Mock - calculate from timestamps
        setStats({ totalCheckins, avgMood, longestStreak });
        // Badges based on stats
        const newBadges = [];
        if (totalCheckins >= 5) newBadges.push("Beginner Explorer 🏆");
        if (avgMood >= 7) newBadges.push("Mood Master 😊");
        if (longestStreak >= 5) newBadges.push("Streak Champion 🔥");
        setBadges(newBadges);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      alert("Failed to log out: " + err.message);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image || !user) return;

    const storageRef = ref(storage, `profilePictures/${user.uid}/${image.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, image);
      const url = await getDownloadURL(snapshot.ref);
      await updateDoc(doc(db, "users", user.uid), { profilePicture: url });
      setImage(null);
      setUploadError(null);
      alert("Profile picture uploaded successfully!");
    } catch (err) {
      setUploadError("Failed to upload picture: " + err.message);
    }
  };

  const shareSummary = () => {
    const summary = `My Wellness Summary: Score ${stats.avgMood}/10, ${stats.totalCheckins} check-ins, ${stats.longestStreak} day streak. Join the journey! #StudentWellness`;
    navigator.clipboard.writeText(summary);
    alert("Copied summary to clipboard!");
  };

  return (
    <div className="container">
      <h1 className="auth-title">Profile</h1>
      {user ? (
        <>
          {/* User Info Card */}
          <div className="auth-card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="profile-picture" />
              ) : (
                <div className="profile-picture" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: '700'
                }}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="card-title" style={{ marginBottom: '0.5rem', color: '#1a1a1a' }}>
                {user.email?.split('@')[0] || 'User'}
              </h2>
              <p style={{ color: '#8e8e93', fontSize: '0.9rem', margin: 0 }}>
                {user.email}
              </p>
            </div>
            
            <div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px dashed rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}
              />
              <button className="button" onClick={handleUpload} disabled={!image}>
                📸 Upload Picture
              </button>
              {uploadError && <p className="error">{uploadError}</p>}
            </div>
          </div>

          {/* Wellness Stats Grid */}
          <div className="auth-card">
            <h2 className="card-title">Wellness Overview</h2>
            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.totalCheckins}</div>
                <div className="stat-label">Check-ins</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.avgMood}/10</div>
                <div className="stat-label">Avg Mood</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.longestStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="auth-card achievements-section">
            <h2 className="card-title">🏆 Achievements</h2>
            <div className="achievements-grid">
              {badges.map((badge, i) => (
                <span key={i} className="badge" style={{ animationDelay: `${i * 0.2}s` }}>
                  {badge}
                </span>
              ))}
              {badges.length === 0 && (
                <p style={{ color: '#8e8e93', textAlign: 'center', gridColumn: '1 / -1' }}>
                  Keep checking in to earn achievements! 🎯
                </p>
              )}
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="auth-card">
            <h2 className="card-title">🎨 Theme</h2>
            <div className="theme-switcher">
              <button 
                className="button" 
                onClick={() => setTheme("blue")}
                style={{ 
                  background: theme === "blue" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.2)',
                  color: theme === "blue" ? 'white' : '#1a1a1a'
                }}
              >
                🌊 Calm Blue
              </button>
              <button 
                className="button" 
                onClick={() => setTheme("green")}
                style={{ 
                  background: theme === "green" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.2)',
                  color: theme === "green" ? 'white' : '#1a1a1a'
                }}
              >
                🌿 Energizing Green
              </button>
            </div>
          </div>

          {/* Share Journey */}
          <div className="auth-card">
            <h2 className="card-title">📤 Share Your Journey</h2>
            <button className="button" onClick={shareSummary}>
              📋 Copy Weekly Summary
            </button>
            <p className="small-text">Share your progress on social media or with friends for accountability and motivation!</p>
          </div>

          {/* Logout */}
          <div className="auth-card">
            <button 
              className="button" 
              onClick={handleLogout}
              style={{ 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                marginTop: '0'
              }}
            >
              🚪 Log Out
            </button>
          </div>
        </>
      ) : (
        <div className="auth-card">
          <p style={{ textAlign: 'center', color: '#8e8e93' }}>
            Please log in to view your profile.
          </p>
        </div>
      )}
      
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
            className={`nav-item ${item.id === 'profile' ? 'active' : ''}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}