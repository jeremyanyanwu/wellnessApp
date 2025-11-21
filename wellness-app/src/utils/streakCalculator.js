/**
 * Streak Calculator Utility
 * Calculates daily streaks based on check-in history
 */

/**
 * Calculate the current streak from check-in history
 * @param {Array} historyData - Array of check-in history documents
 * @returns {Object} - { currentStreak: number, longestStreak: number, lastCheckInDate: string }
 */
export const calculateStreak = (historyData = []) => {
  if (!historyData || historyData.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
    };
  }

  // Sort by date (newest first)
  const sortedData = [...historyData]
    .filter(day => day.date) // Filter out invalid entries
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedData.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
    };
  }

  // Check if user has checked in today
  const today = new Date().toISOString().split('T')[0];
  const todayData = sortedData.find(day => day.date === today);
  const hasCheckedInToday = todayData && 
    (todayData.checkins?.morning?.submitted || 
     todayData.checkins?.afternoon?.submitted || 
     todayData.checkins?.evening?.submitted);

  // Get unique dates where user has at least one check-in
  const checkInDates = sortedData
    .filter(day => {
      const checkins = day.checkins || {};
      return checkins.morning?.submitted || 
             checkins.afternoon?.submitted || 
             checkins.evening?.submitted;
    })
    .map(day => day.date)
    .filter((date, index, self) => self.indexOf(date) === index); // Get unique dates

  if (checkInDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
    };
  }

  // Calculate current streak
  let currentStreak = 0;
  const todayDate = new Date(today);
  let expectedDate = new Date(todayDate);

  // If user hasn't checked in today, start from yesterday
  if (!hasCheckedInToday) {
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  // Count consecutive days backwards
  for (let i = 0; i < checkInDates.length; i++) {
    const checkInDate = new Date(checkInDates[i]);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    const checkInDateStr = checkInDate.toISOString().split('T')[0];

    if (checkInDateStr === expectedDateStr) {
      currentStreak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (checkInDate < expectedDate) {
      // Gap in streak, stop counting
      break;
    }
    // If checkInDate is after expectedDate, skip it (shouldn't happen with sorted data)
  }

  // If user checked in today, the streak includes today
  if (hasCheckedInToday && currentStreak === 0) {
    currentStreak = 1;
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  // Sort dates chronologically (oldest first) for longest streak calculation
  const sortedDates = [...checkInDates].sort((a, b) => new Date(a) - new Date(b));

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currentDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      // Gap in streak, reset
      tempStreak = 1;
    }
  }

  return {
    currentStreak: Math.max(currentStreak, hasCheckedInToday ? 1 : 0),
    longestStreak,
    lastCheckInDate: checkInDates[0] || null,
  };
};

/**
 * Check if user has checked in today
 * @param {Object} todayData - Today's check-in data
 * @returns {boolean}
 */
export const hasCheckedInToday = (todayData) => {
  if (!todayData || !todayData.checkins) return false;
  
  const { morning, afternoon, evening } = todayData.checkins;
  return (morning?.submitted || false) || 
         (afternoon?.submitted || false) || 
         (evening?.submitted || false);
};

/**
 * Get streak message based on streak count
 * @param {number} streak - Current streak count
 * @returns {string} - Motivational message
 */
export const getStreakMessage = (streak) => {
  if (streak === 0) {
    return "Start your streak today! 🌟";
  } else if (streak === 1) {
    return "Great start! Keep it going! 🔥";
  } else if (streak < 7) {
    return `${streak} day streak! You're on fire! 🔥`;
  } else if (streak < 30) {
    return `${streak} days strong! Amazing! 💪`;
  } else if (streak < 100) {
    return `${streak} days! You're a legend! 🏆`;
  } else {
    return `${streak} days! Unstoppable! 👑`;
  }
};
