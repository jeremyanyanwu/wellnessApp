import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc } from "firebase/firestore";
import { Home, ClipboardList, Brain, Activity, User } from "lucide-react";
import "../App.css";

export default function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [image, setImage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [checkins, setCheckins] = useState({});
  const [stats, setStats] = useState({ totalCheckins: 0, avgMood: 0, longestStreak: 0 });
  const [theme, setTheme] = useState("green"); // "green" or "blue"
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCheckins(user.uid);
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setProfilePicture(userData.profilePicture);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const fetchCheckins = async (uid) => {
    try {
      // Get today's check-ins for current stats
      const todayDocRef = doc(db, "dailyCheckins", uid);
      const todayDocSnap = await getDoc(todayDocRef);
      
      if (todayDocSnap.exists()) {
        const data = todayDocSnap.data();
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
      } else {
        // Initialize with empty data if no check-ins today
        const today = new Date().toISOString().split('T')[0];
        const defaultCheckins = {
          morning: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, submitted: false, advice: "" },
          afternoon: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, submitted: false, advice: "" },
          evening: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, submitted: false, advice: "" },
          date: today
        };
        setCheckins(defaultCheckins);
        setStats({ totalCheckins: 0, avgMood: 5, longestStreak: 0 });
        setBadges([]);
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
    if (!image || !user) {
      setUploadError("Please select an image first.");
      return;
    }

    // Validate file size (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      setUploadError("Please select a valid image file.");
      return;
    }

    const storageRef = ref(storage, `profilePictures/${user.uid}/${Date.now()}_${image.name}`);
    
    try {
      setUploadError(null);
      setUploading(true);
      
      const snapshot = await uploadBytes(storageRef, image);
      const url = await getDownloadURL(snapshot.ref);
      
      // Create or update user document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, { 
          profilePicture: url,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new document
        await setDoc(userDocRef, {
          email: user.email,
          profilePicture: url,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Also update the auth user's photoURL
      await user.updateProfile({ photoURL: url });
      
      // Update local state
      setProfilePicture(url);
      setImage(null);
      setUploading(false);
      
      alert("Profile picture uploaded successfully!");
      
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Failed to upload picture: " + err.message);
      setUploading(false);
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
              {profilePicture || user.photoURL ? (
                <img 
                  src={profilePicture || user.photoURL} 
                  alt="Profile" 
                  className="profile-picture"
                  style={{ objectFit: 'cover' }}
                />
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
                disabled={uploading}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px dashed rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  background: uploading ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  opacity: uploading ? 0.6 : 1
                }}
              />
              {image && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: '#667eea', 
                    margin: '0 0 0.5rem 0',
                    textAlign: 'center'
                  }}>
                    Selected: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <div style={{ 
                    textAlign: 'center',
                    margin: '0.5rem 0'
                  }}>
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100px', 
                        maxHeight: '100px', 
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(102, 126, 234, 0.3)'
                      }} 
                    />
                  </div>
                </div>
              )}
              <button 
                className="button" 
                onClick={handleUpload} 
                disabled={!image || uploading}
                style={{ 
                  opacity: (!image || uploading) ? 0.6 : 1,
                  cursor: (!image || uploading) ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? '⏳ Uploading...' : '📸 Upload Picture'}
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
      
      <div className="nav-wrapper">
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
    </div>
  );
}