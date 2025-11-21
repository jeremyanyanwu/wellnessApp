import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebaseConfig";
import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc } from "firebase/firestore";
import { Home, ClipboardList, Brain, Activity, User } from "lucide-react";
import { calculateStreak } from "../utils/streakCalculator";
import { 
  requestNotificationPermission, 
  hasNotificationPermission, 
  initializeNotifications,
  showCheckInReminder 
} from "../utils/notifications";
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
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("");

  useEffect(() => {
    if (user) {
      fetchCheckins(user.uid);
      fetchUserProfile();
      checkNotificationPermission();
    }
  }, [user]);

  // Apply theme to body element and save preference
  useEffect(() => {
    document.body.className = `${theme}-theme`;
    
    // Save theme preference to Firestore
    if (user) {
      const saveTheme = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            await updateDoc(userDocRef, { 
              theme: theme,
              updatedAt: new Date().toISOString()
            });
          } else {
            await setDoc(userDocRef, {
              email: user.email,
              theme: theme,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Error saving theme:", err);
        }
      };
      saveTheme();
    }
    
    return () => {
      // Don't clear on unmount - keep theme persistent
    };
  }, [theme, user]);

  const checkNotificationPermission = () => {
    const hasPermission = hasNotificationPermission();
    setNotificationPermission(hasPermission);
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture);
        }
        // Load notification preferences
        if (userData.notifications) {
          setNotificationEnabled(userData.notifications.enabled || false);
          setReminderTime(userData.notifications.reminderTime || "09:00");
        }
        // Load theme preference
        if (userData.theme) {
          setTheme(userData.theme);
        }
      } else {
        // Document doesn't exist yet - this is OK, we'll create it when needed
        console.log("User profile document doesn't exist yet - will be created when saving preferences");
      }
    } catch (err) {
      // Handle permission errors gracefully
      const errorCode = err.code || err.message || '';
      const errorMessage = err.message || '';
      
      if (errorCode.includes('permission') || errorCode.includes('Permission') || 
          errorMessage.includes('permission') || errorMessage.includes('Permission') ||
          errorCode === 'permission-denied' || errorCode === 'missing-or-insufficient-permissions') {
        console.warn("Firestore permissions not available. Please deploy Firestore security rules.");
        // Don't show error in UI on initial load - just log it
        // The error will show when user tries to save preferences
      } else {
        console.error("Failed to fetch user profile:", err);
      }
    }
  };

  const fetchCheckins = async (uid) => {
    try {
      // Get today's check-ins for current stats
      const todayDocRef = doc(db, "dailyCheckins", uid);
      const todayDocSnap = await getDoc(todayDocRef);
      
      let todayData = {};
      if (todayDocSnap.exists()) {
        todayData = todayDocSnap.data();
        setCheckins(todayData);
        const totalCheckins = Object.values(todayData)
          .filter(c => typeof c === 'object' && c.submitted)
          .length;
        const moods = Object.values(todayData)
          .filter(c => typeof c === 'object' && c.mood)
          .map(c => c.mood)
          .filter(m => m > 0);
        const avgMood = moods.length > 0 ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : 5;
        
        // Calculate real streak from history
        try {
          const historyQuery = query(
            collection(db, "checkinHistory"),
            where("userId", "==", uid),
            orderBy("timestamp", "desc"),
            limit(30)
          );
          const historySnapshot = await getDocs(historyQuery);
          const historyData = historySnapshot.docs.map(doc => doc.data());
          
          // Add today's data if it has check-ins
          const today = new Date().toISOString().split('T')[0];
          const hasCheckInToday = todayData.morning?.submitted || 
                                  todayData.afternoon?.submitted || 
                                  todayData.evening?.submitted;
          
          if (hasCheckInToday) {
            const todayInHistory = historyData.find(d => d.date === today);
            if (!todayInHistory) {
              historyData.unshift({
                date: today,
                checkins: todayData,
                userId: uid,
                timestamp: new Date().toISOString()
              });
            }
          }
          
          const streakData = calculateStreak(historyData);
          const longestStreak = streakData.longestStreak;
          setStats({ totalCheckins, avgMood, longestStreak });
          
          // Badges based on stats
          const newBadges = [];
          if (totalCheckins >= 5) newBadges.push("Beginner Explorer 🏆");
          if (avgMood >= 7) newBadges.push("Mood Master 😊");
          if (longestStreak >= 5) newBadges.push("Streak Champion 🔥");
          if (longestStreak >= 30) newBadges.push("Monthly Warrior 🏅");
          if (longestStreak >= 100) newBadges.push("Century Club 👑");
          setBadges(newBadges);
        } catch (streakErr) {
          // Fallback if query fails
          console.warn("Could not calculate streak:", streakErr);
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
            
            const streakData = calculateStreak(historyData);
            const longestStreak = streakData.longestStreak;
            setStats({ totalCheckins, avgMood, longestStreak });
            
            const newBadges = [];
            if (totalCheckins >= 5) newBadges.push("Beginner Explorer 🏆");
            if (avgMood >= 7) newBadges.push("Mood Master 😊");
            if (longestStreak >= 5) newBadges.push("Streak Champion 🔥");
            setBadges(newBadges);
          } catch (err) {
            console.error("Error calculating streak:", err);
            setStats({ totalCheckins, avgMood, longestStreak: 0 });
            setBadges([]);
          }
        }
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

  const handleEnableNotifications = async () => {
    if (!user) {
      setNotificationStatus("Please log in to enable notifications.");
      return;
    }

    // Request browser notification permission first
    if (!notificationPermission) {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        setNotificationStatus("❌ Browser notification permission denied. Please enable notifications in your browser settings.");
        return;
      }
      setNotificationPermission(true);
    }

    // Save notification preferences to Firestore
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      const notificationPrefs = {
        enabled: notificationEnabled,
        reminderTime: reminderTime,
      };

      const userData = {
        email: user.email,
        notifications: notificationPrefs,
        updatedAt: new Date().toISOString(),
      };

      if (userDocSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          notifications: notificationPrefs,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new document
        await setDoc(userDocRef, {
          ...userData,
          createdAt: new Date().toISOString(),
        });
      }

      // Initialize notifications if enabled
      if (notificationEnabled) {
        const result = await initializeNotifications({
          enabled: true,
          reminderTime: reminderTime,
          currentStreak: stats.longestStreak || 0,
        });
        
        if (result.success) {
          setNotificationStatus("✅ Notifications enabled! You'll receive daily reminders at " + reminderTime + ".");
          // Clear status after 3 seconds
          setTimeout(() => setNotificationStatus(""), 3000);
        } else {
          setNotificationStatus(result.error || "⚠️ Failed to enable notifications. Check console for details.");
        }
      } else {
        setNotificationStatus("✅ Notifications disabled.");
        // Clear status after 2 seconds
        setTimeout(() => setNotificationStatus(""), 2000);
      }
    } catch (err) {
      console.error("Error saving notification preferences:", err);
      
      // Provide helpful error messages based on Firebase error codes
      const errorCode = err.code || err.message || '';
      const errorMessage = err.message || '';
      
      if (errorCode.includes('permission') || errorCode.includes('Permission') || 
          errorMessage.includes('permission') || errorMessage.includes('Permission') ||
          errorCode === 'permission-denied' || errorCode === 'missing-or-insufficient-permissions') {
        setNotificationStatus("❌ Permission denied. Please deploy Firestore security rules to Firebase Console. See FIREBASE_SETUP.md");
      } else if (errorCode === 'unavailable' || errorMessage.includes('unavailable')) {
        setNotificationStatus("⚠️ Firestore is unavailable. Please check your internet connection and try again.");
      } else {
        setNotificationStatus("❌ Failed to save preferences: " + (errorMessage || errorCode || "Unknown error"));
      }
    }
  };

  const handleTestNotification = async () => {
    if (!notificationPermission) {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        setNotificationStatus("Permission denied. Please enable notifications in your browser settings.");
        return;
      }
      setNotificationPermission(true);
    }

    showCheckInReminder(stats.longestStreak);
    setNotificationStatus("Test notification sent! Check your notifications.");
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
              <p style={{ color: '#2d2d2d', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
                {user.email}
              </p>
            </div>
            
            <div>
              <label 
                htmlFor="profile-picture-upload"
                style={{ 
                  display: 'block',
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px dashed rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  background: uploading ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  opacity: uploading ? 0.6 : 1,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  color: '#1a1a1a',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.target.style.background = 'rgba(102, 126, 234, 0.15)';
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploading) {
                    e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  }
                }}
              >
                {image ? '📷 Change Picture' : '📷 Choose Profile Picture'}
              </label>
              <input 
                id="profile-picture-upload"
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                disabled={uploading}
                style={{ 
                  display: 'none'
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
                <p style={{ color: '#2d2d2d', textAlign: 'center', gridColumn: '1 / -1', fontWeight: '500' }}>
                  Keep checking in to earn achievements! 🎯
                </p>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="auth-card">
            <h2 className="card-title">🔔 Daily Reminders</h2>
            <p style={{ fontSize: '0.9rem', color: '#2d2d2d', marginBottom: '1rem', fontWeight: '500' }}>
              Get daily notifications to help maintain your wellness streak!
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={(e) => setNotificationEnabled(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                Enable daily check-in reminders
              </label>
            </div>

            {notificationEnabled && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Reminder Time</label>
                <input
                  type="time"
                  className="input"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {notificationStatus && (
              <p style={{ 
                fontSize: '0.85rem', 
                color: notificationStatus.includes('error') || notificationStatus.includes('Failed') || notificationStatus.includes('denied') ? '#ff2d55' : '#34c759',
                marginBottom: '1rem',
                padding: '0.5rem',
                background: notificationStatus.includes('error') || notificationStatus.includes('Failed') || notificationStatus.includes('denied') ? 'rgba(255, 45, 85, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                borderRadius: '8px'
              }}>
                {notificationStatus}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                className="button" 
                onClick={handleEnableNotifications}
                style={{ flex: '1', minWidth: '120px' }}
              >
                {notificationEnabled ? '✅ Save Settings' : 'Enable Notifications'}
              </button>
              {notificationPermission && (
                <button 
                  className="button" 
                  onClick={handleTestNotification}
                  style={{ 
                    flex: '1', 
                    minWidth: '120px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#1a1a1a'
                  }}
                >
                  📬 Test Notification
                </button>
              )}
            </div>

            {!notificationPermission && (
              <p style={{ fontSize: '0.8rem', color: '#2d2d2d', marginTop: '0.5rem', fontWeight: '500' }}>
                Click "Enable Notifications" to request browser permission.
              </p>
            )}
          </div>

          {/* Theme Switcher */}
          <div className="auth-card">
            <h2 className="card-title">🎨 Theme</h2>
            <div className="theme-switcher">
              <button 
                className="button" 
                onClick={() => setTheme("blue")}
                style={{ 
                  background: theme === "blue" ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'rgba(255, 255, 255, 0.3)',
                  color: theme === "blue" ? 'white' : '#1a1a1a',
                  fontWeight: theme === "blue" ? '600' : '500',
                  border: theme === "blue" ? '2px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                🌊 Calm Blue
              </button>
              <button 
                className="button" 
                onClick={() => setTheme("green")}
                style={{ 
                  background: theme === "green" ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'rgba(255, 255, 255, 0.3)',
                  color: theme === "green" ? 'white' : '#1a1a1a',
                  fontWeight: theme === "green" ? '600' : '500',
                  border: theme === "green" ? '2px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)'
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
          <p style={{ textAlign: 'center', color: '#2d2d2d', fontWeight: '500' }}>
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