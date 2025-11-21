/**
 * Wellness Resources API Integration
 * Provides curated wellness resources and tips based on user needs
 */

/**
 * Curated wellness resources based on common student wellness topics
 * These are research-based resources and tips
 */
const wellnessResources = {
  sleep: [
    {
      title: "Sleep Hygiene Tips",
      description: "Maintain a consistent sleep schedule, even on weekends. Your body thrives on routine!",
      source: "CDC Sleep Guidelines",
      tips: [
        "Go to bed and wake up at the same time daily",
        "Avoid screens 1 hour before bed (blue light disrupts sleep)",
        "Keep bedroom cool (65-68°F) and dark",
        "Avoid caffeine after 2 PM",
        "Create a bedtime routine: reading, stretching, or meditation",
      ],
    },
    {
      title: "How Sleep Affects Your Mood",
      description: "Sleep deprivation increases stress hormones (cortisol) by up to 45%, affecting mood and cognitive function.",
      source: "Harvard Medical School Research",
      tips: [
        "7-9 hours of sleep is optimal for mood regulation",
        "REM sleep (deep sleep) helps process emotions",
        "Poor sleep increases anxiety and irritability",
        "Sleep affects memory consolidation and learning",
      ],
    },
  ],
  hydration: [
    {
      title: "Hydration and Mental Performance",
      description: "Even mild dehydration (1-2%) can decrease mood, energy, and cognitive function.",
      source: "Journal of Nutrition Research",
      tips: [
        "Aim for 8 cups (64 oz) of water daily",
        "Drink water before feeling thirsty",
        "Carry a water bottle with you",
        "Monitor urine color (pale yellow = well hydrated)",
        "Hydration affects mood, energy, and focus",
      ],
    },
    {
      title: "Signs of Dehydration",
      description: "Fatigue, headaches, difficulty concentrating, and mood changes can indicate dehydration.",
      source: "Mayo Clinic Guidelines",
      tips: [
        "Drink water throughout the day, not just when thirsty",
        "Set hourly reminders to drink water",
        "Eat water-rich foods (fruits, vegetables)",
      ],
    },
  ],
  stress: [
    {
      title: "Stress Management Techniques",
      description: "Chronic stress affects sleep, mood, eating patterns, and immune function.",
      source: "American Psychological Association",
      tips: [
        "Practice deep breathing: 4-7-8 technique (inhale 4, hold 7, exhale 8)",
        "Physical activity reduces stress hormones",
        "Take breaks every 1-2 hours during study/work",
        "Talk to someone - social support reduces stress",
        "Try meditation or mindfulness (apps: Headspace, Calm)",
      ],
    },
    {
      title: "How Stress Affects Your Body",
      description: "High stress disrupts sleep, affects eating patterns, and impacts immune function.",
      source: "National Institute of Mental Health",
      tips: [
        "Stress increases cortisol - affects mood and sleep",
        "Chronic stress can lead to emotional eating or loss of appetite",
        "Exercise releases endorphins - natural stress relievers",
        "Seek professional help if stress persists",
      ],
    },
  ],
  mood: [
    {
      title: "Mood Boosting Strategies",
      description: "Physical activity, social connection, and sunlight exposure boost mood naturally.",
      source: "American Psychological Association",
      tips: [
        "10 minutes of physical activity releases endorphins",
        "Social connection reduces feelings of depression",
        "Sunlight exposure (10-15 min) boosts serotonin",
        "Practice gratitude - write down 3 things daily",
        "Help others - acts of kindness boost mood",
      ],
    },
    {
      title: "The Exercise-Mood Connection",
      description: "Regular exercise is as effective as medication for mild to moderate depression.",
      source: "Harvard Medical School Research",
      tips: [
        "Even 5 minutes of movement helps",
        "Find activities you enjoy - consistency matters",
        "Group activities provide social benefits",
        "Start small and build gradually",
      ],
    },
  ],
  food: [
    {
      title: "Nutrition and Mental Health",
      description: "What you eat affects your mood, energy, and cognitive function through the gut-brain axis.",
      source: "Nutrition Journal Research",
      tips: [
        "Eat regular meals - don't skip (stabilizes blood sugar)",
        "Include protein in each meal (helps mood and energy)",
        "Complex carbs (whole grains) support serotonin production",
        "Omega-3 fatty acids (fish, nuts) support brain health",
        "Stay hydrated - affects mood and cognitive function",
      ],
    },
    {
      title: "Blood Sugar and Mood",
      description: "Skipping meals causes blood sugar crashes, leading to irritability, stress, and poor focus.",
      source: "Diabetes Care Research",
      tips: [
        "Eat breakfast within 1 hour of waking",
        "Include protein + complex carbs in meals",
        "Avoid sugary snacks - they cause energy crashes",
        "Small, frequent meals stabilize blood sugar",
      ],
    },
  ],
  activity: [
    {
      title: "Physical Activity and Wellness",
      description: "Regular exercise improves mood, reduces stress, enhances sleep quality, and boosts energy.",
      source: "American Heart Association",
      tips: [
        "Aim for 150 minutes moderate activity per week (30 min/day)",
        "Start small: 10-minute walks, stretches, or dancing",
        "Find activities you enjoy - consistency > intensity",
        "Movement releases endorphins - natural mood boosters",
        "Exercise improves sleep quality and reduces stress",
      ],
    },
    {
      title: "Exercise and Cognitive Function",
      description: "Physical activity improves memory, focus, and learning ability.",
      source: "Nature Reviews Neuroscience",
      tips: [
        "Even 10 minutes of activity improves cognitive function",
        "Take active breaks during study sessions",
        "Morning exercise can boost focus for the day",
        "Movement helps with creativity and problem-solving",
      ],
    },
  ],
  general: [
    {
      title: "Crisis Resources",
      description: "If you're in crisis or having thoughts of self-harm, help is available 24/7.",
      source: "988 Suicide & Crisis Lifeline",
      tips: [
        "988 Suicide & Crisis Lifeline: Call or text 988 (24/7, free, confidential)",
        "Crisis Text Line: Text HOME to 741741",
        "National Alliance on Mental Illness (NAMI) Helpline: 1-800-950-NAMI",
        "Your campus counseling center - free for students",
      ],
      urgent: true,
    },
    {
      title: "Mental Health Resources",
      description: "Access to mental health support and information.",
      source: "SAMHSA (Substance Abuse and Mental Health Services Administration)",
      tips: [
        "SAMHSA National Helpline: 1-800-662-HELP (4357)",
        "Find local mental health services: samhsa.gov/find-treatment",
        "Campus counseling centers offer free/low-cost services",
        "Many health insurance plans cover mental health services",
      ],
    },
  ],
};

/**
 * Get wellness resources based on user's check-in data
 * @param {Object} checkins - User's check-in data
 * @returns {Array} - Array of relevant wellness resources
 */
export const getPersonalizedResources = (checkins = {}) => {
  // Analyze check-ins to determine what resources are most relevant
  const relevantResources = [];
  
  // Get average sleep across all check-ins
  const sleepValues = Object.values(checkins)
    .filter(c => typeof c === 'object' && c.sleep)
    .map(c => c.sleep || 0);
  const avgSleep = sleepValues.length > 0 
    ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length 
    : 0;

  // Get average stress
  const stressValues = Object.values(checkins)
    .filter(c => typeof c === 'object' && c.stress)
    .map(c => c.stress || 5);
  const avgStress = stressValues.length > 0 
    ? stressValues.reduce((a, b) => a + b, 0) / stressValues.length 
    : 5;

  // Get average mood
  const moodValues = Object.values(checkins)
    .filter(c => typeof c === 'object' && c.mood)
    .map(c => c.mood || 5);
  const avgMood = moodValues.length > 0 
    ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length 
    : 5;

  // Get hydration (sum across all check-ins)
  const hydrationValues = Object.values(checkins)
    .filter(c => typeof c === 'object' && c.hydration)
    .map(c => c.hydration || 0);
  const totalHydration = hydrationValues.reduce((a, b) => a + b, 0);

  // Determine priority resources based on user's data
  if (avgSleep < 6) {
    relevantResources.push(...wellnessResources.sleep);
  }
  
  if (totalHydration < 4) {
    relevantResources.push(...wellnessResources.hydration);
  }
  
  if (avgStress >= 6) {
    relevantResources.push(...wellnessResources.stress);
  }
  
  if (avgMood <= 5) {
    relevantResources.push(...wellnessResources.mood);
  }

  // Check if user is skipping meals
  const hasSkippedMeals = Object.values(checkins)
    .filter(c => typeof c === 'object' && c.eaten !== null)
    .some(c => c.eaten === false);
  
  if (hasSkippedMeals) {
    relevantResources.push(...wellnessResources.food);
  }

  // Always include activity resources
  relevantResources.push(...wellnessResources.activity);

  // Remove duplicates
  const uniqueResources = relevantResources.filter((resource, index, self) =>
    index === self.findIndex(r => r.title === resource.title)
  );

  // Add general resources at the end
  uniqueResources.push(...wellnessResources.general);

  return uniqueResources;
};

/**
 * Get resources by category
 * @param {string} category - Resource category (sleep, hydration, stress, mood, food, activity)
 * @returns {Array} - Resources for that category
 */
export const getResourcesByCategory = (category) => {
  return wellnessResources[category] || wellnessResources.general;
};

/**
 * Search resources by keyword
 * @param {string} keyword - Search keyword
 * @returns {Array} - Matching resources
 */
export const searchResources = (keyword) => {
  const keywordLower = keyword.toLowerCase();
  const matchingResources = [];

  Object.values(wellnessResources).flat().forEach(resource => {
    if (
      resource.title.toLowerCase().includes(keywordLower) ||
      resource.description.toLowerCase().includes(keywordLower) ||
      resource.tips.some(tip => tip.toLowerCase().includes(keywordLower))
    ) {
      matchingResources.push(resource);
    }
  });

  return matchingResources;
};
