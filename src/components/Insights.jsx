import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Home, ClipboardList, Brain, Activity, User, TrendingUp, Award, Lightbulb, MessageCircle, BarChart3, Zap, Heart, Coffee, Moon, Sun } from "lucide-react";
import "../App.css";

export default function Insights() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [aiPersonality, setAiPersonality] = useState("analytical"); // Default to valid personality
  const [currentInsight, setCurrentInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Get today's data
      const todayDocRef = doc(db, "dailyCheckins", user.uid);
      const todayDocSnap = await getDoc(todayDocRef);
      
      if (todayDocSnap.exists()) {
        setUserData(todayDocSnap.data());
      }

      // Get historical data for trends - filter by userId to match security rules
      // Note: This query requires a composite index on (userId, timestamp)
      // If you get an index error, Firebase will provide a link to create it
      try {
        const historyQuery = query(
          collection(db, "checkinHistory"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(7)
        );
        const historySnapshot = await getDocs(historyQuery);
        const historyData = historySnapshot.docs.map(doc => doc.data());
        setHistoricalData(historyData);

        // Generate AI personality based on data
        if (historyData.length > 0) {
          generateAiPersonality(historyData);
        } else {
          setAiPersonality("analytical"); // Default if no data
        }
      } catch (historyErr) {
        // If composite index is missing, try without orderBy
        if (historyErr.code === 'failed-precondition') {
          console.warn("Composite index needed. Trying query without orderBy...");
          const historyQuery = query(
            collection(db, "checkinHistory"),
            where("userId", "==", user.uid),
            limit(7)
          );
          const historySnapshot = await getDocs(historyQuery);
          const historyData = historySnapshot.docs
            .map(doc => doc.data())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 7);
          setHistoricalData(historyData);

          if (historyData.length > 0) {
            generateAiPersonality(historyData);
          } else {
            setAiPersonality("analytical");
          }
        } else {
          console.error("Error fetching history:", historyErr);
          setAiPersonality("analytical");
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
      setAiPersonality("analytical"); // Ensure personality is set even on error
    }
  };

  const generateAiPersonality = (data) => {
    const avgMood = data.reduce((sum, day) => {
      const checkins = day.checkins || {};
      const moods = Object.values(checkins).map(c => c.mood || 5).filter(m => m > 0);
      return sum + (moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 5);
    }, 0) / Math.max(data.length, 1);

    const avgStress = data.reduce((sum, day) => {
      const checkins = day.checkins || {};
      const stresses = Object.values(checkins).map(c => c.stress || 5).filter(s => s > 0);
      return sum + (stresses.length > 0 ? stresses.reduce((a, b) => a + b, 0) / stresses.length : 5);
    }, 0) / Math.max(data.length, 1);

    if (avgMood >= 7 && avgStress <= 4) {
      setAiPersonality("cheerful");
    } else if (avgMood <= 4 || avgStress >= 7) {
      setAiPersonality("supportive");
    } else {
      setAiPersonality("analytical");
    }
  };

  const getAiGreeting = () => {
    const greetings = {
      cheerful: [
        "Hey there, wellness warrior! 🌟 Your data is looking brighter than a disco ball!",
        "Well, well, well... look who's been crushing their wellness goals! 🎉",
        "Hello, you magnificent human! Ready for some AI-powered wisdom? ✨"
      ],
      supportive: [
        "Hey friend, I'm here to help you navigate this wellness journey. 💙",
        "I see you've been going through some ups and downs. Let's work through this together. 🤗",
        "Your wellness journey is unique, and I'm here to support you every step of the way. 🌱"
      ],
      analytical: [
        "Greetings, data enthusiast! Let me analyze your wellness patterns. 📊",
        "Hello! I've been studying your check-ins like a detective with a magnifying glass. 🔍",
        "Welcome! Your wellness data tells quite the story. Let me break it down for you. 📈"
      ]
    };
    // Default to analytical if aiPersonality is not set or invalid
    const personality = greetings[aiPersonality] ? aiPersonality : "analytical";
    const personalityGreetings = greetings[personality];
    return personalityGreetings[Math.floor(Math.random() * personalityGreetings.length)];
  };

  const generateInsight = (type) => {
    const insights = {
      mood: {
        cheerful: [
          "Your mood is soaring higher than a kite on a windy day! 🪁 Keep doing whatever you're doing!",
          "Mood level: Absolutely fantastic! You're basically a walking ray of sunshine! ☀️",
          "Your happiness is so contagious, I'm getting secondhand joy just from your data! 😄"
        ],
        supportive: [
          "I notice your mood has been a bit low lately. Remember, it's okay to have tough days. 💙",
          "Your mood is like a roller coaster, but guess what? Every roller coaster has an up! 🎢",
          "Mood swings are normal, and you're handling them like a champ. Proud of you! 🌟"
        ],
        analytical: [
          "Mood analysis: Your emotional patterns show resilience and adaptability. 📊",
          "Data shows your mood correlates strongly with sleep quality. Interesting! 🧠",
          "Your mood stability has improved 23% over the past week. Well done! 📈"
        ]
      },
      stress: {
        cheerful: [
          "Stress? What stress? You're handling life like a zen master! 🧘‍♀️",
          "Your stress levels are lower than my battery percentage! Impressive! 🔋",
          "Stress management level: Expert! You're basically a stress-busting superhero! 🦸‍♀️"
        ],
        supportive: [
          "I see stress has been visiting you lately. Let's show it the door together. 🚪",
          "Your stress levels are up, but so is your strength. You've got this! 💪",
          "Stress is temporary, but your resilience is permanent. Keep going! 🌱"
        ],
        analytical: [
          "Stress analysis: Peak levels occur during afternoon check-ins. Pattern detected. 📊",
          "Your stress response shows healthy coping mechanisms. Data approved! ✅",
          "Stress reduction techniques appear effective. Continue current strategies. 📈"
        ]
      },
      sleep: {
        cheerful: [
          "Your sleep is so good, even Sleeping Beauty is jealous! 😴✨",
          "Sleep quality: Absolutely dreamy! You're basically a professional napper! 🌙",
          "Your sleep schedule is more consistent than my coffee addiction! ☕"
        ],
        supportive: [
          "Sleep is your superpower, and I can see you're working on recharging it. 🌙",
          "Your sleep patterns are improving. Every hour counts! 💤",
          "Rest is not a luxury, it's a necessity. You're doing great! 🌟"
        ],
        analytical: [
          "Sleep efficiency: 87%. Optimal range achieved. Well done! 📊",
          "Sleep duration correlates with next-day mood. Science! 🧬",
          "Your sleep consistency has improved by 15%. Data-driven success! 📈"
        ]
      }
    };
    
    const category = insights[type] || insights.mood;
    const personalityInsights = category[aiPersonality] || category.analytical;
    return personalityInsights[Math.floor(Math.random() * personalityInsights.length)];
  };

  const getWellnessScore = () => {
    const checkins = userData;
    if (!checkins || Object.keys(checkins).length === 0) return 66;
    
    const moods = Object.values(checkins)
      .filter(c => typeof c === 'object' && c.mood)
      .map(c => c.mood);
    
    if (moods.length === 0) return 66;
    
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    return Math.round(avgMood * 10);
  };

  const getTrendData = () => {
    if (historicalData.length === 0) return [];
    
    return historicalData.map(day => {
      const checkins = day.checkins || {};
      const moods = Object.values(checkins)
        .filter(c => typeof c === 'object' && c.mood)
        .map(c => c.mood);
      
      const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 5;
      return {
        date: day.date,
        mood: Math.round(avgMood * 10),
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
      };
    }).reverse();
  };

  const getFunnyAchievement = () => {
    const score = getWellnessScore();
    const achievements = [
      { 
        icon: "☕", 
        title: "Coffee Dependency Level: Expert", 
        description: "Your stress peaks at 2 PM like clockwork. Time for that afternoon pick-me-up!",
        condition: score < 50
      },
      { 
        icon: "🌙", 
        title: "Night Owl Certified", 
        description: "You're more productive at night than a vampire with a to-do list!",
        condition: userData.evening?.mood > 7
      },
      { 
        icon: "🌅", 
        title: "Morning Person Wannabe", 
        description: "You try to be a morning person, but your bed has other plans!",
        condition: userData.morning?.mood < 5
      },
      { 
        icon: "📚", 
        title: "Study Stress Survivor", 
        description: "You've survived another study session without turning into a stress monster!",
        condition: userData.afternoon?.stress > 6
      },
      { 
        icon: "🎯", 
        title: "Wellness Warrior", 
        description: "Your wellness score is higher than my expectations! You're crushing it!",
        condition: score > 80
      }
    ];
    
    return achievements.find(a => a.condition) || achievements[4];
  };

  const handleQuizAnswer = (question, answer) => {
    setQuizAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const calculateQuizResult = () => {
    const answers = Object.values(quizAnswers);
    const total = answers.reduce((sum, answer) => sum + answer, 0);
    
    if (total <= 10) {
      setQuizResult({
        type: "zen-master",
        title: "Zen Master Level: Unlocked! 🧘‍♀️",
        description: "You're so chill, even your stress has stress! Teach us your ways!",
        advice: "Keep doing whatever you're doing. You're basically a wellness guru!"
      });
    } else if (total <= 20) {
      setQuizResult({
        type: "balanced",
        title: "Perfectly Balanced! ⚖️",
        description: "Like Thanos, but for wellness. You've found the sweet spot!",
        advice: "You're doing great! Maybe add a little more self-care to your routine."
      });
    } else {
      setQuizResult({
        type: "needs-support",
        title: "Wellness Warrior in Training! 💪",
        description: "You're fighting the good fight! Every step forward counts!",
        advice: "Let's work on some stress management techniques together. You've got this!"
      });
    }
  };

  const renderOverview = () => (
    <div className="insights-section">
      <div className="ai-greeting">
        <div className="ai-avatar">🤖</div>
        <div className="ai-message">
          <h3>Your AI Wellness Coach</h3>
          <p>{getAiGreeting()}</p>
        </div>
      </div>

      <div className="wellness-score-card">
        <h3>Today's Wellness Score</h3>
        <div className="score-display">
          <div className="score-circle">
            <span className="score-number">{getWellnessScore()}</span>
            <span className="score-label">/100</span>
          </div>
        </div>
        <p className="score-description">
          {getWellnessScore() > 80 ? "You're absolutely crushing it! 🌟" : 
           getWellnessScore() > 60 ? "You're doing great! Keep it up! 💪" : 
           "Let's work on boosting that score together! 🚀"}
        </p>
      </div>

      <div className="achievement-card">
        <h3>🏆 Today's Achievement</h3>
        {(() => {
          const achievement = getFunnyAchievement();
          return (
            <div className="achievement-content">
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-text">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="insights-grid">
        <div className="insight-card" onClick={() => setCurrentInsight(generateInsight('mood'))}>
          <div className="insight-icon">😊</div>
          <h4>Mood Analysis</h4>
          <p>Get your emotional weather report!</p>
        </div>
        <div className="insight-card" onClick={() => setCurrentInsight(generateInsight('stress'))}>
          <div className="insight-icon">😰</div>
          <h4>Stress Check</h4>
          <p>Let's talk about that tension!</p>
        </div>
        <div className="insight-card" onClick={() => setCurrentInsight(generateInsight('sleep'))}>
          <div className="insight-icon">😴</div>
          <h4>Sleep Insights</h4>
          <p>Dream analysis incoming!</p>
        </div>
        <div className="insight-card" onClick={() => setCurrentInsight("Based on your patterns, you're most productive between 10 AM - 2 PM. Your brain is basically a morning person trapped in a night owl's body! 🦉")}>
          <div className="insight-icon">🧠</div>
          <h4>Productivity Tips</h4>
          <p>Unlock your peak performance!</p>
        </div>
      </div>

      {currentInsight && (
        <div className="insight-popup">
          <div className="insight-content">
            <h4>💡 AI Insight</h4>
            <p>{currentInsight}</p>
            <button onClick={() => setCurrentInsight("")} className="close-btn">Got it!</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTrends = () => {
    const trendData = getTrendData();
    
    return (
      <div className="insights-section">
        <h3>📈 Your Wellness Trends</h3>
        
        <div className="trend-chart">
          <div className="chart-header">
            <h4>Mood Over Time</h4>
            <p>Your emotional journey, visualized!</p>
          </div>
          
          <div className="chart-container">
            {trendData.length > 0 ? (
              <div className="simple-chart">
                {trendData.map((point, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar" 
                      style={{ height: `${point.mood}%` }}
                    ></div>
                    <div className="bar-label">{point.day}</div>
                    <div className="bar-value">{point.mood}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No trend data available yet. Check in more to see your patterns! 📊</p>
              </div>
            )}
          </div>
        </div>

        <div className="pattern-insights">
          <h4>🔍 Pattern Recognition</h4>
          <div className="pattern-grid">
            <div className="pattern-card">
              <div className="pattern-icon">🌅</div>
              <h5>Morning Mood</h5>
              <p>{userData.morning?.mood > 6 ? 
                "You're a morning person! The early bird gets the worm... and the good mood! 🌅" : 
                "Mornings are tough, but you're tougher! Maybe try some morning stretches? 🤸‍♀️"}
              </p>
            </div>
            <div className="pattern-card">
              <div className="pattern-icon">☀️</div>
              <h5>Afternoon Energy</h5>
              <p>{userData.afternoon?.stress > 6 ? 
                "Afternoon stress is real! Time for a quick walk or some deep breathing? 🚶‍♀️" : 
                "You're crushing the afternoon! Your energy is infectious! ⚡"}
              </p>
            </div>
            <div className="pattern-card">
              <div className="pattern-icon">🌙</div>
              <h5>Evening Wind-down</h5>
              <p>{userData.evening?.mood > 6 ? 
                "Evening you is the best you! You know how to end the day right! 🌙" : 
                "Evenings are for reflection and rest. You're doing great! 🌟"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => (
    <div className="insights-section">
      <h3>🧠 Wellness Personality Quiz</h3>
      <p>Let's discover your wellness personality! Answer honestly for the most accurate results.</p>
      
      <div className="quiz-container">
        <div className="quiz-question">
          <h4>1. When you're stressed, you prefer to:</h4>
          <div className="quiz-options">
            <button 
              className={`quiz-option ${quizAnswers.q1 === 1 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q1', 1)}
            >
              Take a nap (1 point)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q1 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q1', 2)}
            >
              Go for a walk (2 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q1 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q1', 3)}
            >
              Call a friend (3 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q1 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q1', 4)}
            >
              Eat ice cream (4 points)
            </button>
          </div>
        </div>

        <div className="quiz-question">
          <h4>2. Your ideal morning routine includes:</h4>
          <div className="quiz-options">
            <button 
              className={`quiz-option ${quizAnswers.q2 === 1 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q2', 1)}
            >
              Meditation and journaling (1 point)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q2 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q2', 2)}
            >
              Coffee and news (2 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q2 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q2', 3)}
            >
              Exercise (3 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q2 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q2', 4)}
            >
              Snooze button (4 points)
            </button>
          </div>
        </div>

        <div className="quiz-question">
          <h4>3. When you're feeling down, you:</h4>
          <div className="quiz-options">
            <button 
              className={`quiz-option ${quizAnswers.q3 === 1 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q3', 1)}
            >
              Practice gratitude (1 point)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q3 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q3', 2)}
            >
              Watch funny videos (2 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q3 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q3', 3)}
            >
              Talk to someone (3 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q3 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q3', 4)}
            >
              Isolate yourself (4 points)
            </button>
          </div>
        </div>

        <div className="quiz-question">
          <h4>4. Your sleep schedule is:</h4>
          <div className="quiz-options">
            <button 
              className={`quiz-option ${quizAnswers.q4 === 1 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q4', 1)}
            >
              Consistent and early (1 point)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q4 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q4', 2)}
            >
              Consistent but late (2 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q4 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q4', 3)}
            >
              Inconsistent (3 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q4 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q4', 4)}
            >
              What's sleep? (4 points)
            </button>
          </div>
        </div>

        <div className="quiz-question">
          <h4>5. Your relationship with exercise is:</h4>
          <div className="quiz-options">
            <button 
              className={`quiz-option ${quizAnswers.q5 === 1 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q5', 1)}
            >
              I love it! (1 point)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q5 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q5', 2)}
            >
              I do it regularly (2 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q5 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q5', 3)}
            >
              I try to (3 points)
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q5 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q5', 4)}
            >
              Exercise? Never heard of it (4 points)
            </button>
          </div>
        </div>

        <button 
          className="quiz-submit-btn"
          onClick={calculateQuizResult}
          disabled={Object.keys(quizAnswers).length < 5}
        >
          Get My Results! 🎯
        </button>

        {quizResult && (
          <div className="quiz-result">
            <div className="result-header">
              <div className="result-icon">
                {quizResult.type === 'zen-master' ? '🧘‍♀️' : 
                 quizResult.type === 'balanced' ? '⚖️' : '💪'}
              </div>
              <h4>{quizResult.title}</h4>
            </div>
            <p className="result-description">{quizResult.description}</p>
            <p className="result-advice">{quizResult.advice}</p>
            <button 
              className="retake-quiz-btn"
              onClick={() => {
                setQuizAnswers({});
                setQuizResult(null);
              }}
            >
              Take Quiz Again 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="insights-section">
      <h3>💡 Personalized Recommendations</h3>
      <p>Your AI coach has some suggestions based on your data!</p>
      
      <div className="recommendations-grid">
        <div className="recommendation-card">
          <div className="rec-icon">🌅</div>
          <h4>Morning Boost</h4>
          <p>{userData.morning?.mood < 6 ? 
            "Try starting your day with 5 minutes of stretching or a short walk. Your future self will thank you!" :
            "Your morning routine is working great! Keep it up! 🌟"
          }</p>
        </div>
        
        <div className="recommendation-card">
          <div className="rec-icon">☕</div>
          <h4>Energy Management</h4>
          <p>{userData.afternoon?.stress > 6 ? 
            "Your afternoon stress peaks around 2 PM. Try a 10-minute break with deep breathing exercises!" :
            "Your energy levels are well-managed! You're doing amazing! ⚡"
          }</p>
        </div>
        
        <div className="recommendation-card">
          <div className="rec-icon">😴</div>
          <h4>Sleep Optimization</h4>
          <p>{userData.evening?.sleep < 7 ? 
            "Aim for 7-8 hours of sleep tonight. Your brain needs that recharge time!" :
            "Your sleep schedule is on point! Sweet dreams! 🌙"
          }</p>
        </div>
        
        <div className="recommendation-card">
          <div className="rec-icon">🧠</div>
          <h4>Mental Health</h4>
          <p>Practice gratitude by writing down 3 good things that happened today. It's scientifically proven to boost mood!</p>
        </div>
        
        <div className="recommendation-card">
          <div className="rec-icon">💧</div>
          <h4>Hydration</h4>
          <p>Drink a glass of water right now! Your brain is 75% water and needs that H2O to function at its best!</p>
        </div>
        
        <div className="recommendation-card">
          <div className="rec-icon">🎯</div>
          <h4>Goal Setting</h4>
          <p>Set one small wellness goal for tomorrow. Small wins lead to big victories!</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner">🤖</div>
          <p>Your AI coach is analyzing your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="nav-wrapper">
        <div className="top-nav">
          <h1 className="nav-title">AI Insights</h1>
          <button className="logout-btn" onClick={() => auth.signOut()}>
            Logout
          </button>
        </div>
      </div>

      <div className="insights-tabs">
        <button 
          className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          <BarChart3 size={20} />
          Overview
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'trends' ? 'active' : ''}`}
          onClick={() => setSelectedTab('trends')}
        >
          <TrendingUp size={20} />
          Trends
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setSelectedTab('quiz')}
        >
          <Brain size={20} />
          Quiz
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setSelectedTab('recommendations')}
        >
          <Lightbulb size={20} />
          Tips
        </button>
      </div>

      <div className="insights-content">
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'trends' && renderTrends()}
        {selectedTab === 'quiz' && renderQuiz()}
        {selectedTab === 'recommendations' && renderRecommendations()}
      </div>

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
              className={`nav-item ${item.id === 'insights' ? 'active' : ''}`}
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

