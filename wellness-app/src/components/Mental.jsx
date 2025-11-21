import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Home, ClipboardList, Brain, Activity, User, Send } from "lucide-react";
import { generateGenZAdvice } from "../utils/genZAdviceGenerator";
import "../App.css";

export default function Mental() {
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState({});
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey bestie! 👋 I'm your AI wellness coach. Ask me anything about stress, sleep, mood, time management, or just life in general. I got you! 💙",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const fetchCheckins = async () => {
        try {
          const todayDocRef = doc(db, "dailyCheckins", user.uid);
          const todayDocSnap = await getDoc(todayDocRef);
          if (todayDocSnap.exists()) {
            setCheckins(todayDocSnap.data());
          } else {
            const today = new Date().toISOString().split('T')[0];
            const defaultCheckins = {
              morning: { eaten: null, activity: "", mood: 5, stress: 5, sleep: 0, hydration: 0, submitted: false, advice: "" },
              afternoon: { eaten: null, activity: "", mood: 5, stress: 5, hydration: 0, submitted: false, advice: "" },
              evening: { eaten: null, activity: "", mood: 5, stress: 5, hydration: 0, submitted: false, advice: "" },
              date: today
            };
            setCheckins(defaultCheckins);
          }
        } catch (err) {
          setError("Failed to load data.");
          console.error(err);
        }
      };
      fetchCheckins();
    }
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue.trim();
    setInputValue("");
    setIsTyping(true);

    try {
      // Generate response (async now)
      const response = await generateGenZAdvice(currentQuery, checkins);
      
      // Simulate typing delay for more natural feel
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: response.text,
          sender: "bot",
          timestamp: new Date(),
          isSerious: response.isSerious
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800 + Math.random() * 400);
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Oops, something went wrong! 😅 Try asking again or rephrase your question. I'm here to help! 💙",
        sender: "bot",
        timestamp: new Date(),
        isSerious: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "I'm stressed 😰", query: "I'm stressed" },
    { text: "Can't sleep 😴", query: "I can't sleep" },
    { text: "Low mood 😔", query: "I'm feeling down" },
    { text: "Time management ⏰", query: "help with time management" },
  ];

  const handleQuickAction = async (query) => {
    const userMessage = {
      id: Date.now(),
      text: query,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await generateGenZAdvice(query, checkins);
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: response.text,
          sender: "bot",
          timestamp: new Date(),
          isSerious: response.isSerious
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800 + Math.random() * 400);
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Oops, something went wrong! 😅 Try asking again. I'm here to help! 💙",
        sender: "bot",
        timestamp: new Date(),
        isSerious: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="container" style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '1rem 1.25rem', 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 className="auth-title" style={{ margin: 0, fontSize: '1.3rem', textAlign: 'left' }}>
          💬 AI Wellness Coach
        </h1>
      </div>

      {error && <p className="error" style={{ margin: '0.5rem 1.25rem' }}>{error}</p>}

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}
          >
            {message.sender === 'bot' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                🤖
              </div>
            )}
            <div
              style={{
                maxWidth: '75%',
                padding: '0.75rem 1rem',
                borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: message.sender === 'user'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : message.isSerious
                  ? 'rgba(255, 255, 255, 0.25)'
                  : 'rgba(255, 255, 255, 0.2)',
                color: message.sender === 'user' ? '#ffffff' : '#1a1a1a',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                wordWrap: 'break-word',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: message.sender === 'bot' && message.isSerious 
                  ? '1px solid rgba(255, 107, 107, 0.3)' 
                  : 'none'
              }}
            >
              {message.text}
            </div>
            {message.sender === 'user' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0,
                fontWeight: '600',
                color: '#fff'
              }}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              🤖
            </div>
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '18px 18px 18px 4px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              gap: '0.3rem'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#667eea',
                animation: 'typing 1.4s infinite'
              }}></span>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#667eea',
                animation: 'typing 1.4s infinite 0.2s'
              }}></span>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#667eea',
                animation: 'typing 1.4s infinite 0.4s'
              }}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '0.85rem', 
            color: '#1a1a1a', 
            fontWeight: '500',
            whiteSpace: 'nowrap',
            paddingRight: '0.5rem'
          }}>
            Quick actions:
          </p>
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(action.query)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#1a1a1a',
                fontSize: '0.85rem',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.4)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {action.text}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
        <input
            ref={inputRef}
          className="input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything... (press Enter to send)"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.25)',
              fontSize: '0.95rem',
              color: '#1a1a1a'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: inputValue.trim() 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#fff',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: inputValue.trim() ? 1 : 0.6
            }}
          >
            <Send size={20} />
        </button>
        </div>
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
              className={`nav-item ${item.id === 'mental' ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
