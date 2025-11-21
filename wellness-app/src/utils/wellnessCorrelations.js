/**
 * Wellness Correlations Engine
 * Research-based correlations between sleep, food, hydration, stress, mood, and activity
 * Based on scientific research on wellness factors
 */

/**
 * Research-based correlations:
 * - Sleep: Affects mood, stress, cognitive function, immune system
 * - Food: Affects energy, mood (gut-brain axis), stress response
 * - Hydration: Affects mood, cognitive function, energy, physical performance
 * - Stress: Affects sleep quality, mood, eating patterns, immune system
 * - Mood: Affects activity levels, sleep quality, eating patterns
 * - Activity: Affects mood, sleep quality, stress levels, energy
 */

/**
 * Calculate how sleep affects other wellness factors
 * Research: Sleep < 7h increases stress, decreases mood and cognitive function
 */
export const analyzeSleepImpact = (sleepHours) => {
  if (!sleepHours || sleepHours === 0) {
    return {
      impact: "high",
      affectedFactors: ["mood", "stress", "energy", "focus"],
      insights: [
        "Poor sleep (0-6h) significantly impacts mood and stress levels",
        "Chronic sleep deprivation increases cortisol (stress hormone)",
        "Sleep affects memory consolidation and learning",
      ],
      recommendations: [
        "Aim for 7-9 hours of sleep for optimal wellness",
        "Maintain consistent sleep schedule (even weekends)",
        "Avoid screens 1 hour before bedtime",
        "Create a bedtime routine (reading, stretching, meditation)",
      ],
    };
  } else if (sleepHours < 6) {
    return {
      impact: "high",
      affectedFactors: ["mood", "stress", "energy", "focus", "immune"],
      insights: [
        `Your sleep (${sleepHours}h) is below optimal (7-9h)`,
        "Insufficient sleep increases stress hormone (cortisol) by up to 45%",
        "Mood regulation suffers - increased irritability and anxiety",
        "Cognitive function drops - memory and focus affected",
      ],
      recommendations: [
        "Prioritize sleep - it affects everything else",
        "Try to get at least 7 hours tonight",
        "Limit caffeine after 2 PM",
        "Keep your bedroom cool (65-68°F) and dark",
      ],
    };
  } else if (sleepHours < 7) {
    return {
      impact: "moderate",
      affectedFactors: ["mood", "stress", "energy"],
      insights: [
        `Your sleep (${sleepHours}h) is slightly below optimal`,
        "Even 1 hour less sleep can affect mood and stress",
        "Cognitive performance improves with 7+ hours",
      ],
      recommendations: [
        "Try to get 7-8 hours for better mood and energy",
        "Gradually adjust bedtime 15 minutes earlier",
      ],
    };
  } else if (sleepHours >= 7 && sleepHours <= 9) {
    return {
      impact: "optimal",
      affectedFactors: [],
      insights: [
        `Excellent! Your sleep (${sleepHours}h) is in the optimal range`,
        "Optimal sleep supports mood regulation and stress management",
        "Memory consolidation and learning are enhanced",
      ],
      recommendations: [
        "Keep maintaining this sleep schedule!",
        "Consistency is key - same sleep/wake times daily",
      ],
    };
  } else {
    return {
      impact: "moderate",
      affectedFactors: ["mood", "energy"],
      insights: [
        `Your sleep (${sleepHours}h) is above optimal (9h max recommended)`,
        "Too much sleep can also affect mood and energy levels",
      ],
      recommendations: [
        "Aim for 7-9 hours - the sweet spot for wellness",
      ],
    };
  }
};

/**
 * Analyze how food/eating patterns affect wellness
 * Research: Skipping meals increases stress, affects mood, decreases energy
 */
export const analyzeFoodImpact = (hasEaten, checkInTime) => {
  if (hasEaten === false) {
    const impactByTime = {
      morning: {
        impact: "high",
        insights: [
          "Skipping breakfast affects blood sugar and energy",
          "Research shows breakfast improves mood and cognitive function",
          "Low blood sugar can increase stress and irritability",
        ],
        recommendations: [
          "Try a protein-rich breakfast (eggs, yogurt, nuts)",
          "Even a small snack helps stabilize blood sugar",
        ],
      },
      afternoon: {
        impact: "moderate",
        insights: [
          "Skipping lunch can cause afternoon energy crash",
          "Affects blood sugar, leading to mood swings",
          "May impact stress levels and decision-making",
        ],
        recommendations: [
          "Balanced lunch with protein helps maintain energy",
          "Small healthy snack if skipping full meal",
        ],
      },
      evening: {
        impact: "moderate",
        insights: [
          "Skipping dinner can affect sleep quality",
          "May lead to late-night overeating",
        ],
        recommendations: [
          "Light dinner 2-3 hours before bedtime",
          "Include protein and complex carbs",
        ],
      },
    };

    const timeImpact = impactByTime[checkInTime] || impactByTime.afternoon;
    
    return {
      ...timeImpact,
      affectedFactors: ["mood", "stress", "energy", "focus"],
    };
  } else {
    return {
      impact: "positive",
      affectedFactors: [],
      insights: [
        "Good! Regular meals help stabilize blood sugar and mood",
        "Eating regularly supports energy levels throughout the day",
      ],
      recommendations: [
        "Continue with regular meals",
        "Include protein, complex carbs, and vegetables",
      ],
    };
  }
};

/**
 * Analyze hydration impact
 * Research: Even mild dehydration (1-2%) affects mood, cognitive function, and energy
 */
export const analyzeHydrationImpact = (waterIntake) => {
  if (!waterIntake || waterIntake === 0) {
    return {
      impact: "high",
      affectedFactors: ["mood", "energy", "focus", "physical_performance"],
      insights: [
        "No water intake recorded - dehydration affects everything",
        "Even mild dehydration (1-2%) can decrease mood and energy",
        "Dehydration increases cortisol (stress hormone)",
        "Cognitive function drops with dehydration - memory and attention affected",
      ],
      recommendations: [
        "Drink water immediately - aim for 8 cups (64oz) daily",
        "Set hourly reminders to drink water",
        "Carry a water bottle with you",
        "Drink water before feeling thirsty",
      ],
    };
  } else if (waterIntake < 4) {
    return {
      impact: "moderate",
      affectedFactors: ["mood", "energy", "focus"],
      insights: [
        `Your hydration (${waterIntake} cups) is below recommended (8 cups/day)`,
        "Low hydration affects mood, energy, and cognitive function",
        "Dehydration can increase stress levels",
      ],
      recommendations: [
        "Increase water intake - aim for 8 cups daily",
        "Drink water with meals and between meals",
        "Monitor urine color (pale yellow = well hydrated)",
      ],
    };
  } else if (waterIntake >= 4 && waterIntake < 8) {
    return {
      impact: "low",
      affectedFactors: [],
      insights: [
        `Your hydration (${waterIntake} cups) is moderate`,
        "Aim for 8 cups for optimal wellness",
      ],
      recommendations: [
        "Increase to 8 cups daily for optimal mood and energy",
      ],
    };
  } else {
    return {
      impact: "optimal",
      affectedFactors: [],
      insights: [
        `Great! Your hydration (${waterIntake} cups) is excellent`,
        "Optimal hydration supports mood, energy, and cognitive function",
      ],
      recommendations: [
        "Keep maintaining good hydration!",
      ],
    };
  }
};

/**
 * Analyze stress impact on other factors
 * Research: High stress affects sleep, eating patterns, mood, immune system
 */
export const analyzeStressImpact = (stressLevel) => {
  if (stressLevel >= 8) {
    return {
      impact: "high",
      affectedFactors: ["sleep", "mood", "eating", "immune", "energy"],
      insights: [
        `Your stress level (${stressLevel}/10) is very high`,
        "High stress disrupts sleep quality - makes falling/staying asleep harder",
        "Chronic stress affects eating patterns - may overeat or undereat",
        "Elevated cortisol affects mood - increased anxiety and irritability",
        "Immune function decreases under chronic stress",
      ],
      recommendations: [
        "Practice stress management: breathing exercises, meditation, or yoga",
        "Take breaks every 1-2 hours",
        "Talk to someone - social support reduces stress",
        "Physical activity helps reduce stress hormones",
        "Consider professional support if stress persists",
      ],
    };
  } else if (stressLevel >= 6) {
    return {
      impact: "moderate",
      affectedFactors: ["sleep", "mood", "eating"],
      insights: [
        `Your stress level (${stressLevel}/10) is elevated`,
        "Elevated stress can affect sleep quality",
        "May impact eating patterns and mood",
      ],
      recommendations: [
        "Try stress-reduction techniques: deep breathing, walking, or music",
        "Take regular breaks throughout the day",
      ],
    };
  } else if (stressLevel <= 4) {
    return {
      impact: "optimal",
      affectedFactors: [],
      insights: [
        `Excellent! Your stress level (${stressLevel}/10) is well-managed`,
        "Low stress supports better sleep, mood, and overall wellness",
      ],
      recommendations: [
        "Keep up your stress management routine!",
      ],
    };
  } else {
    return {
      impact: "moderate",
      affectedFactors: [],
      insights: [
        `Your stress level (${stressLevel}/10) is manageable`,
        "Monitor stress and use coping strategies when needed",
      ],
      recommendations: [
        "Continue monitoring stress levels",
      ],
    };
  }
};

/**
 * Analyze mood impact on behavior
 * Research: Mood affects activity levels, sleep quality, eating patterns, social behavior
 */
export const analyzeMoodImpact = (moodLevel) => {
  if (moodLevel <= 3) {
    return {
      impact: "high",
      affectedFactors: ["activity", "sleep", "eating", "social"],
      insights: [
        `Your mood (${moodLevel}/10) is very low`,
        "Low mood reduces motivation for physical activity",
        "Depressed mood affects sleep quality - may oversleep or have insomnia",
        "Eating patterns may change - loss of appetite or emotional eating",
        "Social withdrawal is common with low mood",
      ],
      recommendations: [
        "Start with small actions: 5-min walk, text a friend, or listen to music",
        "Movement boosts mood - even 10 minutes helps",
        "Light exposure helps - spend 10 min outside",
        "Talk to someone - friends, family, or professional support",
        "If mood persists for 2+ weeks, consider professional help",
      ],
    };
  } else if (moodLevel <= 5) {
    return {
      impact: "moderate",
      affectedFactors: ["activity", "sleep", "social"],
      insights: [
        `Your mood (${moodLevel}/10) is below average`,
        "Lower mood can reduce motivation for activities",
        "May affect sleep quality and social engagement",
      ],
      recommendations: [
        "Movement helps - try a short walk or stretch",
        "Connect with others - social support boosts mood",
        "Practice gratitude - write down 3 things you're grateful for",
      ],
    };
  } else if (moodLevel >= 7) {
    return {
      impact: "positive",
      affectedFactors: [],
      insights: [
        `Great! Your mood (${moodLevel}/10) is positive`,
        "Positive mood supports better sleep, activity, and social engagement",
      ],
      recommendations: [
        "Maintain positive habits that support your mood",
      ],
    };
  } else {
    return {
      impact: "neutral",
      affectedFactors: [],
      insights: [
        `Your mood (${moodLevel}/10) is stable`,
      ],
      recommendations: [
        "Continue activities that support positive mood",
      ],
    };
  }
};

/**
 * Analyze activity impact
 * Research: Physical activity improves mood, reduces stress, enhances sleep quality
 */
export const analyzeActivityImpact = (activityDescription) => {
  if (!activityDescription || activityDescription.trim() === "") {
    return {
      impact: "low",
      affectedFactors: ["mood", "stress", "sleep", "energy"],
      insights: [
        "No activity recorded - movement is crucial for wellness",
        "Physical activity releases endorphins - natural mood boosters",
        "Exercise reduces stress hormones and improves sleep quality",
        "Sedentary lifestyle affects mood, energy, and cognitive function",
      ],
      recommendations: [
        "Aim for at least 30 minutes of moderate activity daily",
        "Start small: 10-min walk, stretch, or dance to 3 songs",
        "Find activities you enjoy - consistency matters more than intensity",
      ],
    };
  }

  const activityLower = activityDescription.toLowerCase();
  const hasExercise = activityLower.includes("exercise") || 
                      activityLower.includes("workout") || 
                      activityLower.includes("gym") ||
                      activityLower.includes("run") ||
                      activityLower.includes("walk") ||
                      activityLower.includes("jog") ||
                      activityLower.includes("bike") ||
                      activityLower.includes("yoga") ||
                      activityLower.includes("stretch") ||
                      activityLower.includes("sport");
  
  const hasStudy = activityLower.includes("study") || 
                   activityLower.includes("homework") ||
                   activityLower.includes("class") ||
                   activityLower.includes("read");

  if (hasExercise) {
    return {
      impact: "positive",
      affectedFactors: [],
      insights: [
        "Excellent! Physical activity supports mood and reduces stress",
        "Exercise releases endorphins and improves sleep quality",
        "Regular activity boosts energy and cognitive function",
      ],
      recommendations: [
        "Keep up the great work with regular activity!",
        "Mix up activities to prevent boredom",
      ],
    };
  } else if (hasStudy) {
    return {
      impact: "neutral",
      affectedFactors: ["mood", "stress"],
      insights: [
        "Study time is important but can increase stress",
        "Take breaks every 25-30 minutes to prevent burnout",
      ],
      recommendations: [
        "Combine study with movement breaks",
        "Use the Pomodoro Technique: 25 min study, 5 min break",
      ],
    };
  } else {
    return {
      impact: "neutral",
      affectedFactors: [],
      insights: [
        "Activity recorded - consider adding physical movement",
      ],
      recommendations: [
        "Try to include some physical activity in your routine",
      ],
    };
  }
};

/**
 * Comprehensive wellness analysis combining all factors
 */
export const analyzeWellnessFactors = (checkInData, checkInTime) => {
  const {
    eaten,
    activity = "",
    mood = 5,
    stress = 5,
    sleep = 0,
    hydration = 0, // Will be added to check-in form
  } = checkInData;

  const analyses = {
    sleep: analyzeSleepImpact(sleep),
    food: analyzeFoodImpact(eaten, checkInTime),
    hydration: analyzeHydrationImpact(hydration),
    stress: analyzeStressImpact(stress),
    mood: analyzeMoodImpact(mood),
    activity: analyzeActivityImpact(activity),
  };

  // Find correlations between factors
  const correlations = [];

  // Sleep-Stress correlation
  if (sleep < 6 && stress >= 6) {
    correlations.push({
      factor1: "sleep",
      factor2: "stress",
      correlation: "negative",
      insight: "Poor sleep and high stress create a negative cycle - each makes the other worse. Prioritize sleep to break the cycle.",
      recommendation: "Focus on sleep hygiene first - better sleep will help reduce stress.",
    });
  }

  // Mood-Activity correlation
  if (mood <= 5 && !activity.toLowerCase().includes("exercise") && !activity.toLowerCase().includes("walk")) {
    correlations.push({
      factor1: "mood",
      factor2: "activity",
      correlation: "negative",
      insight: "Low mood reduces motivation for activity, but activity actually improves mood.",
      recommendation: "Try a short 10-minute walk - movement releases endorphins that boost mood.",
    });
  }

  // Food-Stress correlation
  if (eaten === false && stress >= 6) {
    correlations.push({
      factor1: "food",
      factor2: "stress",
      correlation: "negative",
      insight: "Skipping meals increases stress levels - low blood sugar triggers stress response.",
      recommendation: "Eat regular meals to stabilize blood sugar and reduce stress.",
    });
  }

  // Hydration-Energy correlation
  if (hydration < 4) {
    correlations.push({
      factor1: "hydration",
      factor2: "energy",
      correlation: "negative",
      insight: "Low hydration affects energy levels and cognitive function.",
      recommendation: "Increase water intake - even mild dehydration reduces energy.",
    });
  }

  // Stress-Sleep correlation
  if (stress >= 7 && sleep < 7) {
    correlations.push({
      factor1: "stress",
      factor2: "sleep",
      correlation: "negative",
      insight: "High stress disrupts sleep quality, and poor sleep increases stress - it's a cycle.",
      recommendation: "Try stress-reduction techniques before bed: meditation, breathing, or light stretching.",
    });
  }

  return {
    analyses,
    correlations,
    summary: generateWellnessSummary(analyses, correlations),
  };
};

/**
 * Generate a comprehensive wellness summary
 */
const generateWellnessSummary = (analyses, correlations) => {
  const highImpactIssues = Object.entries(analyses)
    .filter(([_, analysis]) => analysis.impact === "high")
    .map(([factor, _]) => factor);

  if (highImpactIssues.length > 0) {
    return {
      priority: "high",
      message: `Your wellness analysis shows ${highImpactIssues.length} high-impact area${highImpactIssues.length > 1 ? 's' : ''}: ${highImpactIssues.join(', ')}. Focus on these first for the biggest impact.`,
    };
  }

  const moderateIssues = Object.entries(analyses)
    .filter(([_, analysis]) => analysis.impact === "moderate")
    .map(([factor, _]) => factor);

  if (moderateIssues.length > 0) {
    return {
      priority: "moderate",
      message: `Overall wellness is good, but ${moderateIssues.join(' and ')} could be improved for better results.`,
    };
  }

  return {
    priority: "optimal",
    message: "Your wellness factors are well-balanced! Keep maintaining these healthy habits.",
  };
};
