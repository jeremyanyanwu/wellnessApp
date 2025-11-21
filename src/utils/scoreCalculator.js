export function calculateScore(data) {
  const { sleep, mood, hydration, stress, activity } = data;
  let score = 0;

  score += (sleep / 8) * 20; // Max 8 hours = 20 points
  score += (mood / 10) * 20; // Max 10 = 20 points
  score += (hydration / 8) * 20; // Max 8 cups = 20 points
  score += ((10 - stress) / 10) * 20; // Lower stress = higher score
  score += (activity / 60) * 20; // Max 60 minutes = 20 points

  return Math.min(100, Math.max(0, Math.round(score)));
}