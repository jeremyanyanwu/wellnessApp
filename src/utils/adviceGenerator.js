/**
 * Advice Generator Utility
 * Generates personalized wellness advice based on user questions and check-in data
 */

/**
 * Calculate average mood from check-ins
 * @param {Object} checkins - Check-in data
 * @returns {number} - Average mood (0-10)
 */
const getAverageMood = (checkins) => {
  const checkinValues = Object.values(checkins).filter(c => typeof c === 'object' && c.mood);
  if (checkinValues.length === 0) return 5;
  const moods = checkinValues.map(c => c.mood || 5).filter(m => m > 0);
  return moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 5;
};

/**
 * Calculate average stress from check-ins
 * @param {Object} checkins - Check-in data
 * @returns {number} - Average stress (0-10)
 */
const getAverageStress = (checkins) => {
  const checkinValues = Object.values(checkins).filter(c => typeof c === 'object' && c.stress);
  if (checkinValues.length === 0) return 5;
  const stresses = checkinValues.map(c => c.stress || 5).filter(s => s > 0);
  return stresses.length > 0 ? stresses.reduce((a, b) => a + b, 0) / stresses.length : 5;
};

/**
 * Calculate average sleep from check-ins
 * @param {Object} checkins - Check-in data
 * @returns {number} - Average sleep (hours)
 */
const getAverageSleep = (checkins) => {
  const checkinValues = Object.values(checkins).filter(c => typeof c === 'object' && c.sleep);
  if (checkinValues.length === 0) return 0;
  const sleeps = checkinValues.map(c => c.sleep || 0).filter(s => s >= 0);
  return sleeps.length > 0 ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : 0;
};

/**
 * Generate personalized advice based on user question and check-in data
 * @param {string} query - User's question
 * @param {Object} checkins - User's check-in data
 * @returns {string} - Personalized advice
 */
export const generatePersonalizedAdvice = (query, checkins = {}) => {
  if (!query || !query.trim()) {
    return "Ask me something! I can help with time management, stress, sleep, mood, productivity, and more! 😊";
  }

  const queryLower = query.toLowerCase().trim();
  const avgMood = getAverageMood(checkins);
  const avgStress = getAverageStress(checkins);
  const avgSleep = getAverageSleep(checkins);
  
  // Count submitted check-ins
  const submittedCount = Object.values(checkins)
    .filter(c => typeof c === 'object' && c.submitted)
    .length;

  // Build context from check-ins
  let context = `Based on your recent check-ins`;
  if (submittedCount > 0) {
    context += ` (mood: ${avgMood.toFixed(1)}/10, stress: ${avgStress.toFixed(1)}/10`;
    if (avgSleep > 0) {
      context += `, sleep: ${avgSleep.toFixed(1)}h`;
    }
    context += `)`;
  } else {
    context += ` (complete check-ins for personalized tips!)`;
  }
  context += `, here's some student-friendly advice: `;

  // Time Management & Productivity
  if (queryLower.includes("time") && queryLower.includes("manag")) {
    if (avgStress > 6) {
      return context + `Time management gets harder when stressed! Try the Pomodoro Technique: 25 min focused work, 5 min break. Use your breaks to breathe or stretch. Start with 2-3 Pomodoros today—what's one task you'll tackle first? ⏰`;
    } else if (avgMood < 5) {
      return context + `When feeling low, start small! Make a 3-item to-do list for today. Pick the easiest task first to build momentum. What's one quick win you can check off? ✨`;
    } else {
      return context + `Great question! Here's a proven system: 1) Write down all tasks (brain dump), 2) Pick top 3 for today, 3) Use time-blocking (assign specific times). Start tomorrow with your most important task—what's your #1 priority? 📋`;
    }
  }

  // Productivity & Focus
  if (queryLower.includes("productivity") || queryLower.includes("focus") || queryLower.includes("concentrat") || 
      queryLower.includes("distract") || queryLower.includes("procrastinat")) {
    if (avgStress > 7) {
      return context + `High stress kills productivity! First, reduce stress with 5 deep breaths. Then try the 2-minute rule: if a task takes <2 min, do it now. Break big tasks into tiny steps. What's one 2-minute task you can do right now? 🎯`;
    } else if (avgSleep < 6) {
      return context + `Poor sleep = poor focus! Aim for 7-8 hours tonight. For now, try the Pomodoro Technique: 25 min work, 5 min break. During breaks, walk or stretch—no screens! What will you focus on for 25 minutes? 🧠`;
    } else {
      return context + `Boost focus with these tricks: 1) Remove distractions (phone on silent), 2) Use website blockers during study time, 3) Take breaks every 25-30 min. Start a 25-minute focused session now—what's your focus goal? 💪`;
    }
  }

  // Study & Learning
  if (queryLower.includes("study") || queryLower.includes("learn") || queryLower.includes("exam") || 
      queryLower.includes("test") || queryLower.includes("homework") || queryLower.includes("assignment")) {
    if (avgStress > 6) {
      return context + `Study stress is real! Use the Pomodoro Technique: 25 min study, 5 min break. During breaks, stretch or breathe—don't check social media. What subject needs your attention today? 📚`;
    } else if (avgSleep < 6) {
      return context + `Sleep affects memory! Aim for 7-8 hours tonight to retain what you study. For now, try active recall: after reading, close the book and summarize. What topic are you studying? 🎓`;
    } else {
      return context + `Effective studying tips: 1) Active recall (test yourself), 2) Spaced repetition (review regularly), 3) Teach someone else (even if it's your pet!). What's one concept you can explain right now? ✏️`;
    }
  }

  // Stress & Anxiety
  if (queryLower.includes("stress") || queryLower.includes("anxiety") || queryLower.includes("worri") || 
      queryLower.includes("overwhelm") || queryLower.includes("pressure")) {
    if (avgStress > 7) {
      return context + `Your stress is high—let's lower it! Try the 4-7-8 breathing: Inhale 4, hold 7, exhale 8. Repeat 4 times. Then, write down 3 things causing stress—pick one small action you can take. What's one stressor you can address today? 😌`;
    } else if (avgMood < 5) {
      return context + `Stress + low mood = tough combo! Start with movement: 5-min walk or stretch. Then try box breathing: Inhale 4, hold 4, exhale 4, hold 4. What's one small thing bringing you joy today? 🌱`;
    } else {
      return context + `Stress management starts small! Try the 5-4-3-2-1 technique: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. This grounds you in the present. What's one thing you're grateful for? 🧘`;
    }
  }

  // Mood & Depression
  if (queryLower.includes("mood") || queryLower.includes("sad") || queryLower.includes("depress") || 
      queryLower.includes("down") || queryLower.includes("feel") && queryLower.includes("bad")) {
    if (avgMood < 4) {
      return context + `Your mood is really low—that's tough. Start tiny: 1) Open curtains/window, 2) Take 10 deep breaths, 3) Text one friend. Movement helps: 5-min walk or dance to one song. What's one thing that usually helps? 💙`;
    } else if (avgSleep < 6) {
      return context + `Low mood + poor sleep = rough combo! Prioritize sleep tonight (7-8 hours). For now, try sunlight exposure (even 5 min outside) or light therapy. Small wins: drink water, eat something. What's one thing you can do right now? ☀️`;
    } else {
      return context + `Mood boosters: 1) Movement (even 5 min walk), 2) Social connection (text a friend), 3) Gratitude (3 things you're grateful for). What's one thing that always makes you smile? 😊`;
    }
  }

  // Sleep & Rest
  if (queryLower.includes("sleep") || queryLower.includes("tired") || queryLower.includes("exhaust") || 
      queryLower.includes("rest") || queryLower.includes("insomnia")) {
    if (avgSleep < 6) {
      return context + `Your sleep is low! Aim for 7-8 hours tonight. Sleep hygiene: 1) No screens 1 hour before bed, 2) Cool, dark room, 3) Regular sleep schedule. Try a bedtime routine: read, stretch, or meditate. What's your ideal bedtime? 😴`;
    } else if (avgStress > 6) {
      return context + `Stress disrupts sleep! Try progressive muscle relaxation before bed: tense each muscle group for 5 sec, then release. Or try 4-7-8 breathing. Create a calming bedtime routine. What helps you relax? 🌙`;
    } else {
      return context + `Good sleep = better everything! Tips: 1) Consistent sleep schedule (even weekends), 2) No caffeine after 2 PM, 3) Cool room (65-68°F). What's one thing you can change tonight? 💤`;
    }
  }

  // Energy & Motivation
  if (queryLower.includes("energy") || queryLower.includes("tired") || queryLower.includes("motivat") || 
      queryLower.includes("lazy") || queryLower.includes("unmotivat")) {
    if (avgSleep < 6) {
      return context + `Low energy = likely poor sleep! Aim for 7-8 hours tonight. For now: 1) Get sunlight (5-10 min), 2) Move your body (even 2 min), 3) Drink water. What's one quick energy boost you can do? ⚡`;
    } else if (avgMood < 5) {
      return context + `Low mood = low energy! Start with movement: 5-min walk, dance to one song, or stretch. Then try the 2-minute rule: do something for just 2 minutes. What's one tiny action you can take? 🚀`;
    } else {
      return context + `Energy boosters: 1) Morning sunlight (10 min), 2) Movement (even 5 min), 3) Stay hydrated, 4) Eat protein-rich snacks. What's one thing you can do right now to boost energy? 💪`;
    }
  }

  // Social & Relationships
  if (queryLower.includes("friend") || queryLower.includes("social") || queryLower.includes("lonely") || 
      queryLower.includes("relationship") || queryLower.includes("people")) {
    if (avgMood < 5) {
      return context + `Social connection helps mood! Start small: text one friend, join a study group, or attend one campus event. Quality > quantity—one good conversation beats many shallow ones. Who can you reach out to today? 💙`;
    } else {
      return context + `Social wellness tips: 1) Schedule regular check-ins with friends, 2) Join clubs/activities you enjoy, 3) Be present in conversations (put phone away). What's one way you can connect today? 👥`;
    }
  }

  // Exercise & Fitness
  if (queryLower.includes("exercise") || queryLower.includes("workout") || queryLower.includes("fitness") || 
      queryLower.includes("active") || queryLower.includes("gym")) {
    if (avgStress > 6) {
      return context + `Exercise reduces stress! Start small: 10-min walk, 5-min stretch, or dance to 3 songs. Movement releases endorphins—your brain's feel-good chemicals. What's one movement you enjoy? 🏃`;
    } else if (avgMood < 5) {
      return context + `Exercise boosts mood! Even 5 minutes helps. Try: walking, dancing, stretching, or yoga. Start with one song or 5 minutes—build from there. What's one movement you can do today? 🧘`;
    } else {
      return context + `Movement is medicine! Tips: 1) Start small (5-10 min), 2) Find what you enjoy, 3) Make it social (walk with a friend). Consistency > intensity. What's one way you can move today? 💪`;
    }
  }

  // Eating & Nutrition
  if (queryLower.includes("eat") || queryLower.includes("food") || queryLower.includes("nutrition") || 
      queryLower.includes("diet") || queryLower.includes("hungry") || queryLower.includes("meal")) {
    if (avgMood < 5) {
      return context + `Food affects mood! Eat regular meals (don't skip), include protein, and stay hydrated. When stressed, avoid sugar crashes. What's one nutritious meal or snack you can have today? 🍎`;
    } else {
      return context + `Nutrition tips: 1) Eat regular meals, 2) Include protein (keeps you full), 3) Stay hydrated, 4) Balance meals (protein + carbs + veggies). What's one healthy choice you can make today? 🥗`;
    }
  }

  // Default: Context-aware general advice
  if (avgStress > 7) {
    return context + `Your stress is high! Let's lower it: Try 5 deep breaths (4-7-8: inhale 4, hold 7, exhale 8). Then, identify one small stressor you can address. What's one thing causing stress that you can tackle? 😌`;
  } else if (avgMood < 4) {
    return context + `Your mood is low—that's okay. Start small: 1) Take 10 deep breaths, 2) Get some sunlight (even 5 min), 3) Move your body (walk, stretch, dance). What's one thing that usually helps you feel better? 💙`;
  } else if (avgSleep < 6) {
    return context + `Your sleep is low! Prioritize 7-8 hours tonight. Sleep affects everything: mood, focus, energy. Try a bedtime routine: no screens 1 hour before bed, read or stretch. What's one thing you can change tonight? 😴`;
  } else {
    return context + `Great question! Here's a general wellness tip: Take 3 deep breaths, identify one thing you're grateful for, and do one small action toward your goal. What's one thing you can do right now to feel better? ✨`;
  }
};
