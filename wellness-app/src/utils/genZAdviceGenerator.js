/**
 * Gen Z Style Advice Generator
 * Provides funny, relatable, Gen Z responses while still being helpful
 * Uses user data for wellness-related questions, AI API for general questions
 */

import { isWellnessRelated, getAIResponse } from './aiChatService';

/**
 * Get user wellness context from check-ins
 */
const getUserWellnessContext = (checkins) => {
  const checkinValues = Object.values(checkins).filter(c => typeof c === 'object');
  
  if (checkinValues.length === 0) {
    return {
      hasData: false,
      avgMood: 5,
      avgStress: 5,
      avgSleep: 0,
      submittedCount: 0
    };
  }

  const avgMood = checkinValues.reduce((sum, c) => sum + (c.mood || 5), 0) / checkinValues.length;
  const avgStress = checkinValues.reduce((sum, c) => sum + (c.stress || 5), 0) / checkinValues.length;
  const sleepValues = checkinValues.filter(c => c.sleep && c.sleep > 0);
  const avgSleep = sleepValues.length > 0
    ? sleepValues.reduce((sum, c) => sum + (c.sleep || 0), 0) / sleepValues.length
    : 0;
  const submittedCount = checkinValues.filter(c => c.submitted).length;

  return {
    hasData: submittedCount > 0,
    avgMood,
    avgStress,
    avgSleep,
    submittedCount
  };
};

/**
 * Generate Gen Z style advice based on user question and check-in data
 * Uses AI API for non-wellness questions
 */
export const generateGenZAdvice = async (query, checkins = {}) => {
  if (!query || !query.trim()) {
    return {
      text: "Hey bestie! 👋 What's on your mind? Ask me anything about stress, sleep, mood, time management, or just life in general. I got you! 💙",
      isSerious: false
    };
  }

  const queryLower = query.toLowerCase().trim();
  
  // Check if question is wellness-related
  const isWellness = isWellnessRelated(query);
  
  // If not wellness-related, use AI API
  if (!isWellness) {
    try {
      const aiResponse = await getAIResponse(query);
      return {
        text: aiResponse,
        isSerious: false
      };
    } catch (error) {
      console.error('AI API error:', error);
      // Fallback to default response
      return {
        text: `That's an interesting question! 🤔 I'm mainly here to help with wellness stuff (stress, sleep, mood, etc.), but I'm always down to chat! What's on your mind?`,
        isSerious: false
      };
    }
  }

  // Get user wellness context for wellness-related questions
  const wellnessContext = getUserWellnessContext(checkins);
  const { avgMood, avgStress, avgSleep } = wellnessContext;

  // Greetings & Casual
  if (queryLower.match(/\b(hi|hey|hello|sup|what's up|wassup|yo)\b/)) {
    return {
      text: `Hey bestie! 👋 What's good? I'm here to help with whatever's on your mind. How can I help you today?`,
      isSerious: false
    };
  }

  // Stress & Anxiety - Gen Z style
  if (queryLower.includes("stress") || queryLower.includes("anxiety") || queryLower.includes("overwhelm") || queryLower.includes("pressure")) {
    if (avgStress > 7) {
      return {
        text: `Okay bestie, your stress is giving "I'm about to lose it" and that's valid 😅 But fr, let's fix this. Try the 4-7-8 breathing: Inhale 4, hold 7, exhale 8. Do it 4 times. Then write down what's stressing you—sometimes getting it out helps. What's one thing causing stress that you can actually control? 💙`,
        isSerious: true
      };
    }
    return {
      text: `Stress is literally the worst, I get it 😤 Here's what works: 1) Box breathing (inhale 4, hold 4, exhale 4, hold 4), 2) Take a 5-min walk (no phone!), 3) Do the 5-4-3-2-1 thing: name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. It grounds you fr. What's stressing you out rn?`,
      isSerious: false
    };
  }

  // Mood & Depression
  if (queryLower.includes("mood") || queryLower.includes("sad") || queryLower.includes("depress") || queryLower.includes("down") || queryLower.includes("feel") && (queryLower.includes("bad") || queryLower.includes("terrible"))) {
    if (avgMood < 4) {
      return {
        text: `Okay, I see you're going through it and that's real 💙 Low mood is tough, but we can work through this. Start tiny: 1) Open a window or step outside (even 2 min), 2) Take 10 deep breaths, 3) Text one person you trust. Movement helps too—even 5 min of walking or dancing to one song. What's one thing that usually makes you feel even slightly better?`,
        isSerious: true
      };
    }
    return {
      text: `Mood swings are giving chaos, I felt that 😔 But here's the tea: movement releases endorphins (your brain's happy chemicals). Try: 5-min walk, dance to 3 songs, or stretch. Also, sunlight helps—even 5 min outside. And text someone! Social connection is key. What's one thing that always makes you smile?`,
      isSerious: false
    };
  }

  // Sleep
  if (queryLower.includes("sleep") || queryLower.includes("tired") || queryLower.includes("exhaust") || queryLower.includes("insomnia") || queryLower.includes("can't sleep")) {
    if (avgSleep < 6) {
      return {
        text: `Your sleep is giving "I survive on 3 hours" and that's not it bestie 😴 Sleep affects EVERYTHING—mood, focus, energy, the whole vibe. Aim for 7-8 hours tonight. Tips: 1) No screens 1 hour before bed (I know, it's hard), 2) Cool, dark room, 3) Same bedtime every night (even weekends). What's your ideal bedtime?`,
        isSerious: true
      };
    }
    return {
      text: `Sleep is literally self-care, no cap 😴 Good sleep = better everything. Try: consistent sleep schedule (even weekends—I know, it's rough), no caffeine after 2 PM, and a bedtime routine (read, stretch, or meditate). What helps you wind down?`,
      isSerious: false
    };
  }

  // Time Management
  if ((queryLower.includes("time") && queryLower.includes("manag")) || queryLower.includes("procrastinat") || queryLower.includes("behind") || queryLower.includes("overwhelm") && queryLower.includes("work")) {
    if (avgStress > 6) {
      return {
        text: `Time management when stressed is like trying to solve a Rubik's cube blindfolded—it's rough 😅 Try the Pomodoro Technique: 25 min focused work, 5 min break. Use breaks to breathe or stretch (not scroll TikTok). Start with 2-3 Pomodoros today. What's one task you'll tackle first? ⏰`,
        isSerious: true
      };
    }
    return {
      text: `Time management is giving "I have 24 hours but need 48" and I felt that 😭 Here's what works: 1) Brain dump everything (get it out of your head), 2) Pick top 3 for today, 3) Time-block (assign specific times). Start with your most important task tomorrow. What's your #1 priority? 📋`,
      isSerious: false
    };
  }

  // Doom Scrolling & Social Media
  if (queryLower.includes("doom scroll") || queryLower.includes("doomscrolling") || queryLower.includes("scrolling") && (queryLower.includes("too much") || queryLower.includes("help") || queryLower.includes("stop"))) {
    return {
      text: `Okay bestie, doom scrolling is giving "I've been on TikTok for 3 hours" and that's a whole mood 😭 But fr, it's messing with your mental health. Here's how to break the cycle: 1) Set a timer (start with 10 min max), 2) When it goes off, put your phone in another room, 3) Replace it with something: walk, read, call a friend, or do one productive thing. The algorithm wants you stuck—don't let it win! What's one thing you'll do instead of scrolling? 📱➡️🚶`,
      isSerious: true
    };
  }

  // Social Media & Phone Addiction
  if (queryLower.includes("phone") && (queryLower.includes("addict") || queryLower.includes("too much") || queryLower.includes("can't stop")) || queryLower.includes("social media") && (queryLower.includes("addict") || queryLower.includes("too much"))) {
    return {
      text: `Phone addiction is real and I'm calling myself out too 😅 Here's the tea: 1) Turn off notifications (except important ones), 2) Use app timers (set limits), 3) Put phone in another room during focus time, 4) Replace scrolling with movement or real connection. Start with one hour phone-free—what will you do instead? 📱`,
      isSerious: false
    };
  }

  // Productivity & Focus
  if (queryLower.includes("productivity") || queryLower.includes("focus") || queryLower.includes("concentrat") || queryLower.includes("distract")) {
    return {
      text: `Focus is giving "squirrel!" energy and that's a mood 😂 Try this: 1) Phone on silent (or in another room—I know, it's hard), 2) Website blockers during study time, 3) Pomodoro: 25 min work, 5 min break. During breaks, walk or stretch—no screens! What will you focus on for 25 minutes? 🎯`,
      isSerious: false
    };
  }

  // Study & Exams
  if (queryLower.includes("study") || queryLower.includes("exam") || queryLower.includes("test") || queryLower.includes("homework") || queryLower.includes("assignment")) {
    if (avgStress > 6) {
      return {
        text: `Study stress is real and I'm here for it 📚 Use Pomodoro: 25 min study, 5 min break. During breaks, stretch or breathe—don't check socials (it makes stress worse). What subject needs your attention today?`,
        isSerious: true
      };
    }
    return {
      text: `Studying is giving "my brain is full" and that's valid 📖 Try active recall: after reading, close the book and summarize. Or teach someone (even your pet works!). Spaced repetition helps too—review regularly instead of cramming. What topic are you studying?`,
      isSerious: false
    };
  }

  // Energy & Motivation
  if (queryLower.includes("energy") || queryLower.includes("motivat") || queryLower.includes("lazy") || queryLower.includes("unmotivat") || queryLower.includes("tired") && !queryLower.includes("sleep")) {
    if (avgSleep < 6) {
      return {
        text: `Low energy = probably poor sleep, bestie 😴 Aim for 7-8 hours tonight. For now: get sunlight (5-10 min), move your body (even 2 min), drink water. What's one quick energy boost you can do? ⚡`,
        isSerious: true
      };
    }
    return {
      text: `Energy is giving "battery at 1%" and I felt that 🔋 Try: morning sunlight (10 min), movement (even 5 min walk), stay hydrated, eat protein. The 2-minute rule helps: do something for just 2 minutes to build momentum. What's one tiny action you can take? 🚀`,
      isSerious: false
    };
  }

  // Social & Friends
  if (queryLower.includes("friend") || queryLower.includes("social") || queryLower.includes("lonely") || queryLower.includes("relationship") || queryLower.includes("people")) {
    return {
      text: `Social connection is key, bestie! 👥 Start small: text one friend, join a study group, or go to one campus event. Quality > quantity—one good conversation beats many shallow ones. Who can you reach out to today?`,
      isSerious: false
    };
  }

  // Exercise & Fitness
  if (queryLower.includes("exercise") || queryLower.includes("workout") || queryLower.includes("fitness") || queryLower.includes("gym")) {
    return {
      text: `Movement is literally medicine, no cap 💪 Start small: 10-min walk, 5-min stretch, or dance to 3 songs. Movement releases endorphins (your brain's feel-good chemicals). Find what you enjoy—consistency > intensity. What's one way you can move today?`,
      isSerious: false
    };
  }

  // Food & Eating
  if (queryLower.includes("eat") || queryLower.includes("food") || queryLower.includes("nutrition") || queryLower.includes("hungry") || queryLower.includes("meal")) {
    return {
      text: `Food affects your whole vibe, bestie 🍎 Eat regular meals (don't skip—it messes with your blood sugar), include protein (keeps you full), stay hydrated. When stressed, avoid sugar crashes. What's one nutritious meal or snack you can have today?`,
      isSerious: false
    };
  }

  // Random/General Questions
  if (queryLower.includes("how are you") || queryLower.includes("what's up") || queryLower.includes("how's it going")) {
    return {
      text: `I'm doing great, thanks for asking! 😊 Just here vibing and ready to help you with whatever you need. How are YOU doing today? What's on your mind?`,
      isSerious: false
    };
  }

  // Default wellness response - Gen Z style with user data
  if (wellnessContext.hasData) {
    if (avgStress > 7) {
      return {
        text: `Okay bestie, your stress is high (${avgStress.toFixed(1)}/10) and that's valid 😅 Let's lower it: Try 5 deep breaths (4-7-8: inhale 4, hold 7, exhale 8). Then identify one small stressor you can address. What's one thing causing stress that you can actually tackle?`,
        isSerious: true
      };
    } else if (avgMood < 4) {
      return {
        text: `Your mood is low (${avgMood.toFixed(1)}/10) and that's okay—we all have those days 💙 Start small: 1) Take 10 deep breaths, 2) Get some sunlight (even 5 min), 3) Move your body (walk, stretch, dance). What's one thing that usually helps you feel better?`,
        isSerious: true
      };
    } else if (avgSleep < 6 && avgSleep > 0) {
      return {
        text: `Your sleep is giving "I survive on coffee" (${avgSleep.toFixed(1)}h) and that's not sustainable bestie 😴 Sleep affects everything: mood, focus, energy. Prioritize 7-8 hours tonight. Try a bedtime routine: no screens 1 hour before bed, read or stretch. What's one thing you can change tonight?`,
        isSerious: true
      };
    } else {
      return {
        text: `That's a great wellness question! 🤔 Based on your check-ins (mood: ${avgMood.toFixed(1)}/10, stress: ${avgStress.toFixed(1)}/10), you're doing pretty good! Here's the tea: Take 3 deep breaths, identify one thing you're grateful for, and do one small action toward your goal. Small wins lead to big changes. What's one thing you can do right now to feel better? ✨`,
        isSerious: false
      };
    }
  } else {
    // No check-in data available
    return {
      text: `That's a great wellness question! 🤔 Here's the tea: Take 3 deep breaths, identify one thing you're grateful for, and do one small action toward your goal. Small wins lead to big changes. Complete some check-ins so I can give you more personalized advice! What's one thing you can do right now to feel better? ✨`,
      isSerious: false
    };
  }
};

