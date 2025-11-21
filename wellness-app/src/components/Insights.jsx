import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Home, ClipboardList, Brain, Activity, User, TrendingUp, Award, Lightbulb, MessageCircle, BarChart3, Zap, Heart, Coffee, Moon, Sun, BookOpen } from "lucide-react";
import { getPersonalizedResources, getResourcesByCategory } from "../utils/wellnessResources";
import { analyzeWellnessFactors } from "../utils/wellnessCorrelations";
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
  const [showFullResult, setShowFullResult] = useState(false);
  const [wellnessResources, setWellnessResources] = useState([]);
  const [wellnessAnalysis, setWellnessAnalysis] = useState(null);

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
        const data = todayDocSnap.data();
        setUserData(data);

        // Get personalized wellness resources based on today's check-ins
        const resources = getPersonalizedResources(data);
        setWellnessResources(resources);

        // Analyze wellness factors and correlations using today's check-in data
        // Use the most recent check-in or aggregate all check-ins
        const checkins = data.morning || data.afternoon || data.evening ? {
          morning: data.morning || {},
          afternoon: data.afternoon || {},
          evening: data.evening || {},
        } : {};

        if (Object.keys(checkins).length > 0) {
          // Analyze each check-in and aggregate insights
          const latestCheckIn = data.evening || data.afternoon || data.morning || {};
          const analysis = analyzeWellnessFactors(latestCheckIn, 'daily');
          setWellnessAnalysis(analysis);
        }
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
    if (answers.length < 5) {
      setQuizResult({
        type: "incomplete",
        title: "Complete the Quiz! 📝",
        description: "Please answer all 5 questions to get your wellness personality result.",
        advice: "Answer all questions honestly for the most accurate results!"
      });
      return;
    }

    const total = answers.reduce((sum, answer) => sum + answer, 0);
    const avgScore = total / answers.length;
    
    // Analyze specific areas
    const stressCoping = quizAnswers.q1 || 0; // Lower is better (1 = nap, 4 = eat ice cream)
    const morningRoutine = quizAnswers.q2 || 0;
    const downFeeling = quizAnswers.q3 || 0;
    const sleepSchedule = quizAnswers.q4 || 0;
    const exercise = quizAnswers.q5 || 0;

    // Calculate wellness profile
    let wellnessLevel = "balanced";
    let title = "";
    let description = "";
    let advice = "";
    let specificTips = [];

    if (total <= 10) {
      // All answers are 1-2 (very healthy choices)
      wellnessLevel = "zen-master";
      title = "Zen Master Level: Unlocked! 🧘‍♀️";
      description = "Okay bestie, you're literally built different. Your wellness game is TOO strong—we're taking notes fr.";
      advice = "You're giving main character energy and we're here for it! Keep doing you, wellness queen/king! 👑";
      specificTips = [
        "Keep doing what you're doing—you're literally winning at life",
        "Your habits are immaculate, no notes",
        "Maybe teach the rest of us your ways? Asking for a friend",
      ];
    } else if (total <= 15) {
      // Mostly healthy choices (average 2-3)
      wellnessLevel = "balanced";
      title = "You're Doing Pretty Good! ⚖️";
      description = "Not bad, not bad at all! You've got the basics down, but we see some areas where you could level up (no judgment, we're all works in progress).";
      advice = "You're on the right track, but there's always room to grow! Let's get you from 'pretty good' to 'absolutely slaying'.";
      
      // Specific feedback based on answers
      if (stressCoping >= 3) {
        specificTips.push("Okay so when you're stressed, maybe try something other than stress-eating? Just a thought 💭");
      }
      if (sleepSchedule >= 3) {
        specificTips.push("Your sleep schedule is giving chaos—maybe try being consistent? Your future self will thank you");
      }
      if (exercise >= 3) {
        specificTips.push("Exercise and you need to have a conversation—even 10 minutes of movement helps, no cap");
      }
      if (specificTips.length === 0) {
        specificTips.push("You're doing good, but we know you can do better. Let's add a bit more self-care to the mix");
      }
    } else if (total <= 20) {
      // Some areas need work (average 3-4)
      wellnessLevel = "improving";
      title = "Wellness Warrior in Training! 💪";
      description = "Okay, we see you trying and that's what matters! But fr, some of these answers... we need to talk 😅";
      advice = "No shame in the game, but let's be real—you could be doing better. The good news? Every small change counts!";
      
      specificTips = [];
      if (stressCoping >= 3) {
        specificTips.push("When you're stressed, try breathing (4-7-8 technique) or a 10-min walk instead of... whatever you're doing now");
      }
      if (sleepSchedule >= 3) {
        specificTips.push("Your sleep schedule is chaotic and we're concerned. Try a consistent bedtime—your brain will thank you");
      }
      if (exercise >= 4) {
        specificTips.push("Exercise? Never heard of it? BFFR 😭 Start small: 10-min walk or dance to 3 songs. You got this!");
      }
      if (downFeeling >= 3) {
        specificTips.push("When you're feeling down, try moving your body (even 5 min), talking to someone, or getting some sunlight");
      }
      if (specificTips.length === 0) {
        specificTips.push("Focus on one thing at a time—consistency is key, not perfection!");
      }
    } else {
      // Multiple areas need attention (average 4+)
      wellnessLevel = "needs-support";
      title = "We Need to Talk... 😬";
      description = "Okay bestie, we love you but we're concerned. These answers are giving 'I need help' and that's valid! No judgment, just facts.";
      advice = "Wellness is a journey, not a destination. You're taking the first step by being honest, and that's huge! Let's work on this together—one small change at a time. You've got this!";
      
      specificTips = [
        "Priority 1: Start moving—even 5 minutes helps (walk, stretch, dance to your fave song)",
        "Priority 2: Fix your sleep schedule—aim for consistent bedtime and 7-8 hours (yes, really)",
        "Priority 3: When stressed, try breathing exercises (4-7-8: inhale 4, hold 7, exhale 8)",
        "Priority 4: Connect with people—isolation isn't it. Social support is crucial!",
      ];
    }

      setQuizResult({
        type: wellnessLevel,
        title,
        description,
        advice,
        specificTips,
        total,
        avgScore: avgScore.toFixed(1),
      });
      setShowFullResult(false); // Reset to show summary first
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
      <p>No cap, let's see what your wellness vibe is fr fr. Be honest (we can tell if you're lying 👀)</p>
      
      <div className="quiz-container">
        <div className="quiz-question">
          <h4>1. When you're stressed, you're probably:</h4>
          <div className="quiz-options">
            <button 
              className={`quiz-option ${quizAnswers.q1 === 1 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q1', 1)}
            >
              Taking a power nap (we respect it) 😴
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q1 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q1', 2)}
            >
              Going for a walk (main character energy) 🚶‍♀️
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q1 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q1', 3)}
            >
              Texting your bestie (valid) 💬
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q1 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q1', 4)}
            >
              Stress-eating ice cream (no judgment, we've all been there) 🍦
            </button>
          </div>
        </div>

        <div className="quiz-question">
          <h4>2. Your morning routine is giving:</h4>
          <div className="quiz-options">
            <button 
              className={`quiz-option ${quizAnswers.q2 === 1 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q2', 1)}
            >
              Meditation and journaling (you're that person, we see you) ✨
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q2 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q2', 2)}
            >
              Coffee and doom-scrolling (relatable) ☕
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q2 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q2', 3)}
            >
              Actually exercising (who hurt you?) 💪
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q2 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q2', 4)}
            >
              Hitting snooze 47 times (mood) ⏰
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
              Practice gratitude (you're built different) 🙏
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q3 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q3', 2)}
            >
              Watch TikTok/YouTube (the algorithm knows) 📱
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q3 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q3', 3)}
            >
              Talk to someone (communication is key, we stan) 💙
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q3 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q3', 4)}
            >
              Isolate and rot in bed (we've all been there, no shame) 🛏️
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
              Consistent and early (are you even human?) 🌅
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q4 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q4', 2)}
            >
              Consistent but late (night owl vibes) 🦉
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q4 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q4', 3)}
            >
              Completely chaotic (we felt that) 😵
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q4 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q4', 4)}
            >
              Sleep? In this economy? (valid) 💀
            </button>
          </div>
        </div>

        <div className="quiz-question">
          <h4>5. You and exercise are:</h4>
          <div className="quiz-options">
            <button 
              className={`quiz-option ${quizAnswers.q5 === 1 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q5', 1)}
            >
              Besties (we're jealous) 💪
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q5 === 2 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q5', 2)}
            >
              On good terms (respect) 👍
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q5 === 3 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q5', 3)}
            >
              It's complicated (relatable) 🤷‍♀️
            </button>
            <button 
              className={`quiz-option ${quizAnswers.q5 === 4 ? 'selected' : ''}`}
              onClick={() => handleQuizAnswer('q5', 4)}
            >
              Strangers (we don't judge) 🚶‍♀️
            </button>
          </div>
        </div>

        <button 
          className="quiz-submit-btn"
          onClick={calculateQuizResult}
          disabled={Object.keys(quizAnswers).length < 5}
        >
          {Object.keys(quizAnswers).length < 5 
            ? `Answer ${5 - Object.keys(quizAnswers).length} more question${5 - Object.keys(quizAnswers).length > 1 ? 's' : ''} first! 👀`
            : "Get My Results! 🎯"}
        </button>

        {quizResult && (
          <div className="quiz-result">
            {!showFullResult ? (
              // Summary view - compact
              <div 
                onClick={() => setShowFullResult(true)}
                style={{
                  cursor: 'pointer',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="result-header" style={{ marginBottom: '0.5rem' }}>
                  <div className="result-icon">
                    {quizResult.type === 'zen-master' ? '🧘‍♀️' : 
                     quizResult.type === 'balanced' ? '⚖️' : 
                     quizResult.type === 'improving' ? '💪' :
                     quizResult.type === 'needs-support' ? '💪' : '📝'}
                  </div>
                  <h4 style={{ margin: 0 }}>{quizResult.title}</h4>
                </div>
                <p className="result-description" style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  {quizResult.description}
                </p>
                <p style={{ 
                  margin: '0.75rem 0 0 0', 
                  fontSize: '0.85rem', 
                  color: '#667eea',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  👆 Tap to see your full results and tips!
                </p>
              </div>
            ) : (
              // Full expanded view
              <>
                <div className="result-header">
                  <div className="result-icon">
                    {quizResult.type === 'zen-master' ? '🧘‍♀️' : 
                     quizResult.type === 'balanced' ? '⚖️' : 
                     quizResult.type === 'improving' ? '💪' :
                     quizResult.type === 'needs-support' ? '💪' : '📝'}
                  </div>
                  <h4>{quizResult.title}</h4>
                </div>
                <p className="result-description">{quizResult.description}</p>
                <p className="result-advice">{quizResult.advice}</p>
                
                {quizResult.specificTips && quizResult.specificTips.length > 0 && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: 'rgba(102, 126, 234, 0.1)', 
                    borderRadius: '12px' 
                  }}>
                    <h5 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                      {quizResult.type === 'zen-master' ? '✨ You\'re Already Winning:' : 
                       quizResult.type === 'balanced' ? '💡 Areas to Level Up:' :
                       quizResult.type === 'improving' ? '📝 Let\'s Be Real, You Could:' :
                       '🚨 We Need to Talk About:'}
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      {quizResult.specificTips.map((tip, index) => (
                        <li key={index} style={{ marginBottom: '0.5rem', color: '#2d2d2d' }}>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button 
                  className="retake-quiz-btn"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizResult(null);
                    setShowFullResult(false);
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Retake Quiz (Maybe Answer Differently This Time?) 🔄
                </button>
              </>
            )}
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

  const renderWellnessResources = () => (
    <div className="insights-section">
      <h3>📚 Wellness Resources</h3>
      <p>Research-based resources and tips personalized to your wellness journey!</p>
      
      {wellnessResources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>Complete some check-ins to get personalized wellness resources!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {wellnessResources.map((resource, index) => (
            <div 
              key={index}
              style={{
                background: resource.urgent 
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' 
                  : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: resource.urgent ? '2px solid #ff6b6b' : '1px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  minWidth: '3rem', 
                  textAlign: 'center' 
                }}>
                  {resource.urgent ? '🚨' : '📖'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: resource.urgent ? '#fff' : '#1a1a1a',
                    fontSize: '1.1rem'
                  }}>
                    {resource.title}
                  </h4>
                  <p style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: resource.urgent ? 'rgba(255,255,255,0.9)' : '#666',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {resource.description}
                  </p>
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    fontSize: '0.8rem', 
                    color: resource.urgent ? 'rgba(255,255,255,0.7)' : '#999',
                    fontStyle: 'italic'
                  }}>
                    Source: {resource.source}
                  </p>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.25rem', 
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    color: resource.urgent ? 'rgba(255,255,255,0.95)' : '#2d2d2d'
                  }}>
                    {resource.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} style={{ marginBottom: '0.5rem' }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWellnessFactors = () => {
    if (!wellnessAnalysis || !userData) {
      return (
        <div className="insights-section">
          <h3>🔍 How Wellness Factors Affect You</h3>
          <p>Complete check-ins to see how sleep, food, hydration, stress, mood, and activity affect your wellness!</p>
        </div>
      );
    }

    return (
      <div className="insights-section">
        <h3>🔍 How Wellness Factors Affect You</h3>
        <p>Research-based analysis of how your wellness factors impact each other and your overall health.</p>
        
        {wellnessAnalysis.summary && (
          <div style={{
            background: wellnessAnalysis.summary.priority === 'high' 
              ? 'rgba(255, 107, 107, 0.1)' 
              : wellnessAnalysis.summary.priority === 'optimal'
              ? 'rgba(78, 205, 196, 0.1)'
              : 'rgba(255, 217, 61, 0.1)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: `1px solid ${wellnessAnalysis.summary.priority === 'high' 
              ? '#ff6b6b' 
              : wellnessAnalysis.summary.priority === 'optimal'
              ? '#4ecdc4'
              : '#ffd93d'}`,
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              {wellnessAnalysis.summary.priority === 'high' ? '⚠️' : 
               wellnessAnalysis.summary.priority === 'optimal' ? '✅' : '💡'} 
              {' '}Summary
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              {wellnessAnalysis.summary.message}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {Object.entries(wellnessAnalysis.analyses).map(([factor, analysis]) => (
            <div 
              key={factor}
              style={{
                background: analysis.impact === 'high' 
                  ? 'rgba(255, 107, 107, 0.1)' 
                  : analysis.impact === 'optimal' || analysis.impact === 'positive'
                  ? 'rgba(78, 205, 196, 0.1)'
                  : 'rgba(255, 217, 61, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                border: `1px solid ${analysis.impact === 'high' 
                  ? '#ff6b6b' 
                  : analysis.impact === 'optimal' || analysis.impact === 'positive'
                  ? '#4ecdc4'
                  : '#ffd93d'}`,
              }}
            >
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '1rem',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {factor === 'sleep' && '😴'}
                {factor === 'food' && '🍽️'}
                {factor === 'hydration' && '💧'}
                {factor === 'stress' && '😰'}
                {factor === 'mood' && '😊'}
                {factor === 'activity' && '🏃‍♂️'}
                {factor.charAt(0).toUpperCase() + factor.slice(1)}
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 'normal',
                  color: analysis.impact === 'high' 
                    ? '#ff6b6b' 
                    : analysis.impact === 'optimal' || analysis.impact === 'positive'
                    ? '#4ecdc4'
                    : '#ffd93d'
                }}>
                  ({analysis.impact})
                </span>
              </h4>
              
              {analysis.insights && analysis.insights.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.85rem', 
                    fontWeight: '600',
                    color: '#666'
                  }}>
                    Research Insights:
                  </p>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.25rem', 
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    color: '#2d2d2d'
                  }}>
                    {analysis.insights.map((insight, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.85rem', 
                    fontWeight: '600',
                    color: '#666'
                  }}>
                    Recommendations:
                  </p>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.25rem', 
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    color: '#2d2d2d'
                  }}>
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.affectedFactors && analysis.affectedFactors.length > 0 && (
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.8rem', 
                  color: '#999',
                  fontStyle: 'italic'
                }}>
                  Affects: {analysis.affectedFactors.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>

        {wellnessAnalysis.correlations && wellnessAnalysis.correlations.length > 0 && (
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
              🔗 Factor Correlations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wellnessAnalysis.correlations.map((correlation, index) => (
                <div 
                  key={index}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                  }}
                >
                  <h5 style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.95rem',
                    textTransform: 'capitalize'
                  }}>
                    {correlation.factor1} ↔ {correlation.factor2}
                  </h5>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    color: '#2d2d2d'
                  }}>
                    {correlation.insight}
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    color: '#667eea',
                    fontWeight: '600'
                  }}>
                    💡 {correlation.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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
        <button 
          className={`tab-btn ${selectedTab === 'resources' ? 'active' : ''}`}
          onClick={() => setSelectedTab('resources')}
        >
          <BookOpen size={20} />
          Resources
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'factors' ? 'active' : ''}`}
          onClick={() => setSelectedTab('factors')}
        >
          <TrendingUp size={20} />
          Factors
        </button>
      </div>

      <div className="insights-content">
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'trends' && renderTrends()}
        {selectedTab === 'quiz' && renderQuiz()}
        {selectedTab === 'recommendations' && renderRecommendations()}
        {selectedTab === 'resources' && renderWellnessResources()}
        {selectedTab === 'factors' && renderWellnessFactors()}
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

