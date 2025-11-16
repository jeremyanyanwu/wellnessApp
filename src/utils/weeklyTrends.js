/**
 * Weekly Trends Calculator
 * Calculates wellness scores for each day of the week from check-in history
 */

/**
 * Calculate wellness score from check-in data
 * @param {Object} checkinData - Check-in data for a day (morning, afternoon, evening)
 * @returns {number} - Wellness score (0-100)
 */
export const calculateDailyWellnessScore = (checkinData) => {
  if (!checkinData || !checkinData.checkins) {
    return 0;
  }

  const { morning, afternoon, evening } = checkinData.checkins;
  const checkins = [morning, afternoon, evening].filter(c => c && c.submitted);

  if (checkins.length === 0) {
    return 0;
  }

  // Calculate average mood (0-10 scale, convert to 0-100)
  const moods = checkins
    .map(c => c.mood || 5)
    .filter(m => m > 0);
  
  const avgMood = moods.length > 0 
    ? moods.reduce((a, b) => a + b, 0) / moods.length 
    : 5;

  // Calculate average stress (inverse - lower stress is better)
  // Stress is 0-10 scale, but we want lower stress = higher score
  const stresses = checkins
    .map(c => c.stress || 5)
    .filter(s => s > 0);
  
  const avgStress = stresses.length > 0 
    ? stresses.reduce((a, b) => a + b, 0) / stresses.length 
    : 5;

  // Calculate average sleep (0-12 hours, optimal is 7-8 hours)
  const sleeps = checkins
    .map(c => c.sleep || 0)
    .filter(s => s >= 0);
  
  const avgSleep = sleeps.length > 0 
    ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length 
    : 0;

  // Calculate wellness score components
  // Mood contributes 60% (0-10 scale, convert to 0-60 points)
  const moodScore = (avgMood / 10) * 60;

  // Stress contributes 30% (inverse - lower stress = higher score)
  // Convert stress (0-10) to score (0-30), where 0 stress = 30 points
  const stressScore = ((10 - avgStress) / 10) * 30;

  // Sleep contributes 10% (optimal range is 7-8 hours)
  // Score drops as sleep deviates from 7.5 hours
  let sleepScore = 0;
  if (avgSleep > 0) {
    const optimalSleep = 7.5;
    const sleepDiff = Math.abs(avgSleep - optimalSleep);
    // Full points if within 1 hour of optimal, decreases linearly
    sleepScore = Math.max(0, 10 - (sleepDiff * 2));
  }

  // Total wellness score (0-100)
  const totalScore = moodScore + stressScore + sleepScore;
  
  // Round to nearest integer
  return Math.round(Math.max(0, Math.min(100, totalScore)));
};

/**
 * Get the last 7 days of wellness data
 * @param {Array} historyData - Array of check-in history documents
 * @returns {Array} - Array of { day: string, date: string, score: number } for last 7 days
 */
export const getWeeklyWellnessData = (historyData = []) => {
  // Get last 7 days (including today)
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Get day name (Mon, Tue, etc.)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    
    // Find check-in data for this date
    const dayData = historyData.find(d => d.date === dateString);
    
    // Calculate wellness score for this day
    const score = dayData ? calculateDailyWellnessScore(dayData) : 0;
    
    days.push({
      day: dayName,
      date: dateString,
      score: score,
      hasData: !!dayData,
    });
  }
  
  return days;
};

/**
 * Format weekly data for Chart.js
 * @param {Array} weeklyData - Array from getWeeklyWellnessData
 * @returns {Object} - Chart.js data format
 */
export const formatWeeklyDataForChart = (weeklyData) => {
  return {
    labels: weeklyData.map(d => d.day),
    datasets: [
      {
        label: "Wellness Score",
        data: weeklyData.map(d => d.score),
        backgroundColor: "#ff9f55",
      },
    ],
  };
};
