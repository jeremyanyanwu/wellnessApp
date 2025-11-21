/**
 * AI Chat Service
 * Handles general questions using AI APIs
 * Falls back to Gen Z responses if API unavailable
 */

/**
 * Check if a query is wellness-related
 */
export const isWellnessRelated = (query) => {
  const queryLower = query.toLowerCase();
  const wellnessKeywords = [
    'stress', 'anxiety', 'mood', 'sad', 'depress', 'down', 'feel',
    'sleep', 'tired', 'exhaust', 'insomnia', 'rest',
    'energy', 'motivat', 'lazy', 'unmotivat',
    'time manag', 'procrastinat', 'productivity', 'focus', 'concentrat', 'distract',
    'study', 'exam', 'test', 'homework', 'assignment', 'learn',
    'exercise', 'workout', 'fitness', 'gym', 'active', 'movement',
    'eat', 'food', 'nutrition', 'hungry', 'meal', 'diet',
    'friend', 'social', 'lonely', 'relationship', 'people',
    'wellness', 'health', 'mental', 'physical', 'emotional',
    'check-in', 'checkin', 'streak', 'wellness score',
    'doom scroll', 'phone', 'social media', 'addict',
    'breathing', 'meditation', 'mindfulness', 'self-care',
    'wellbeing', 'well-being', 'burnout', 'overwhelm'
  ];
  
  return wellnessKeywords.some(keyword => queryLower.includes(keyword));
};

/**
 * Generate Gen Z style prompt for AI
 */
const createGenZPrompt = (query) => {
  return `You are a friendly, Gen Z wellness coach chatbot. Respond to this question in a Gen Z style (use slang like "bestie", "fr", "no cap", "that's valid", "I felt that", etc.) but still be helpful and informative. Keep responses conversational, relatable, and under 200 words. Use emojis sparingly.

Question: ${query}

Response:`;
};

/**
 * Call Hugging Face Inference API (free, no API key required for some models)
 * Using a text generation model
 */
const callHuggingFaceAPI = async (query) => {
  try {
    // Using a free text generation model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: createGenZPrompt(query),
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) {
      // If model is loading, wait and retry once
      if (response.status === 503) {
        const retryAfter = response.headers.get('Retry-After') || 5;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return null; // Will fallback
      }
      throw new Error('Hugging Face API error');
    }

    const data = await response.json();
    if (data && data[0] && data[0].generated_text) {
      // Clean up the response
      let text = data[0].generated_text.trim();
      // Remove the prompt if it's included
      if (text.includes('Response:')) {
        text = text.split('Response:')[1]?.trim() || text;
      }
      return text;
    }
    throw new Error('No response from API');
  } catch (error) {
    console.error('Hugging Face API error:', error);
    return null;
  }
};

/**
 * Call OpenAI API (requires API key in env)
 */
const callOpenAIAPI = async (query) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly, Gen Z wellness coach chatbot. Respond in Gen Z style (use slang like "bestie", "fr", "no cap", "that\'s valid", "I felt that") but still be helpful. Keep responses conversational, relatable, and under 200 words. Use emojis sparingly.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    throw new Error('No response from API');
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
};

/**
 * Call Cohere API (free tier available)
 */
const callCohereAPI = async (query) => {
  const apiKey = import.meta.env.VITE_COHERE_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'command',
        prompt: createGenZPrompt(query),
        max_tokens: 200,
        temperature: 0.7,
        stop_sequences: ['\n\n']
      })
    });

    if (!response.ok) {
      throw new Error('Cohere API error');
    }

    const data = await response.json();
    if (data.generations && data.generations[0] && data.generations[0].text) {
      return data.generations[0].text.trim();
    }
    throw new Error('No response from API');
  } catch (error) {
    console.error('Cohere API error:', error);
    return null;
  }
};

/**
 * Fallback Gen Z response for general questions
 * Uses simple pattern matching for common question types
 */
const getFallbackResponse = (query) => {
  const queryLower = query.toLowerCase();
  
  // Questions about the chatbot itself
  if (queryLower.includes("who are you") || queryLower.includes("what are you")) {
    return `I'm your AI wellness coach! 💙 I'm here to help with stress, sleep, mood, and basically anything wellness-related. I use your check-in data to give personalized advice. Think of me as your supportive bestie who's always here to help!`;
  }
  
  // Questions about capabilities
  if (queryLower.includes("what can you do") || queryLower.includes("what do you do") || queryLower.includes("help me") && !queryLower.includes("wellness")) {
    return `I'm your AI wellness coach! I can help with stress, sleep, mood, time management, productivity, and basically anything wellness-related. I also use your check-in data to give personalized advice! Ask me anything wellness-related—I got you! 💙`;
  }
  
  // Questions about the app
  if (queryLower.includes("app") || queryLower.includes("this app") || queryLower.includes("wellness app")) {
    return `This is a wellness tracking app! You can check in throughout the day (morning, afternoon, evening) to track your mood, stress, sleep, hydration, and more. I use that data to give you personalized wellness advice! Want to know more about check-ins or wellness tracking? 📱`;
  }
  
  // General questions - redirect to wellness
  return `That's an interesting question! 🤔 I'm mainly here to help with wellness stuff (stress, sleep, mood, time management, productivity, etc.), but I'm always down to chat! What wellness topic can I help you with? 💙`;
};

/**
 * Get AI response for general (non-wellness) questions
 * Tries multiple APIs with fallback
 */
export const getAIResponse = async (query) => {
  // Try APIs in order of preference
  // 1. OpenAI (if API key available) - best quality
  try {
    const openAIResponse = await callOpenAIAPI(query);
    if (openAIResponse) return openAIResponse;
  } catch (error) {
    console.log('OpenAI API not available:', error.message);
  }

  // 2. Cohere (if API key available) - good alternative
  try {
    const cohereResponse = await callCohereAPI(query);
    if (cohereResponse) return cohereResponse;
  } catch (error) {
    console.log('Cohere API not available:', error.message);
  }

  // 3. Hugging Face (free, no key required) - may be slower
  try {
    const hfResponse = await callHuggingFaceAPI(query);
    if (hfResponse) return hfResponse;
  } catch (error) {
    console.log('Hugging Face API not available:', error.message);
  }

  // 4. Fallback to smart Gen Z response
  return getFallbackResponse(query);
};

