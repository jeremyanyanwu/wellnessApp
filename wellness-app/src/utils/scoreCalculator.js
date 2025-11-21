/**
 * Calculate wellness score based on research correlations
 * Factors: sleep, mood, hydration, stress, activity, food
 * Research-based weighting for optimal accuracy
 */
export function calculateScore(data) {
  const { 
    sleep = 0, 
    mood = 5, 
    hydration = 0, 
    stress = 5, 
    activity = "",
    eaten = null
  } = data;

  let score = 0;

  // Sleep (0-20 points): Research shows 7-9h is optimal
  // Penalize both too little and too much sleep
  if (sleep >= 7 && sleep <= 9) {
    score += 20; // Optimal range
  } else if (sleep >= 6 && sleep < 7) {
    score += 15; // Good but slightly below
  } else if (sleep > 9 && sleep <= 10) {
    score += 15; // Slightly above optimal
  } else if (sleep >= 5 && sleep < 6) {
    score += 10; // Moderate
  } else if (sleep > 10 && sleep <= 12) {
    score += 10; // Too much sleep
  } else if (sleep > 0 && sleep < 5) {
    score += 5; // Poor sleep
  } else {
    score += 0; // No sleep or extreme values
  }

  // Mood (0-20 points): Higher is better (scale 1-10)
  score += (mood / 10) * 20;

  // Hydration (0-20 points): 8 cups is optimal
  const hydrationScore = Math.min(hydration / 8, 1) * 20;
  score += hydrationScore;

  // Stress (0-20 points): Lower is better (scale 1-10, inverted)
  score += ((10 - stress) / 10) * 20;

  // Activity (0-15 points): Presence of activity description indicates movement
  // Activity has less direct impact on score but still matters
  const hasExercise = activity && (
    activity.toLowerCase().includes("exercise") ||
    activity.toLowerCase().includes("workout") ||
    activity.toLowerCase().includes("run") ||
    activity.toLowerCase().includes("walk") ||
    activity.toLowerCase().includes("yoga") ||
    activity.toLowerCase().includes("sport") ||
    activity.toLowerCase().includes("gym")
  );
  const hasMovement = activity && (
    hasExercise ||
    activity.toLowerCase().includes("stretch") ||
    activity.toLowerCase().includes("dance")
  );
  
  if (hasExercise) {
    score += 15; // Regular exercise
  } else if (hasMovement) {
    score += 10; // Some movement
  } else if (activity && activity.trim() !== "") {
    score += 5; // Any activity
  } else {
    score += 0; // No activity recorded
  }

  // Food (0-5 points): Regular eating patterns matter
  // Skipping meals affects blood sugar and mood
  if (eaten === true) {
    score += 5; // Eating regularly
  } else if (eaten === false) {
    score += 0; // Skipping meals affects wellness
  } else {
    score += 2.5; // Unknown/neutral
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}