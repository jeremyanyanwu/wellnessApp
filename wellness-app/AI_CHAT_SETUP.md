# AI Chat Setup Guide

The wellness app chatbot now supports handling ANY question, not just wellness-related topics!

## How It Works

1. **Wellness-Related Questions**: Uses your check-in data to provide personalized Gen Z-style advice
2. **General Questions**: Uses AI APIs to generate responses in Gen Z style

## API Options (Optional - for better general question handling)

The app works without any API keys, but you can add them for better responses to general questions.

### Option 1: OpenAI API (Recommended)
- **Free Tier**: $5 free credit when you sign up
- **Get API Key**: https://platform.openai.com/api-keys
- **Add to `.env`**: `VITE_OPENAI_API_KEY=your_key_here`

### Option 2: Cohere API
- **Free Tier**: Available
- **Get API Key**: https://cohere.com/
- **Add to `.env`**: `VITE_COHERE_API_KEY=your_key_here`

### Option 3: Hugging Face (Free, No Key Required)
- Works automatically without API key
- May have rate limits
- Some models may need to "wake up" on first use

## Setup Instructions

1. **Create `.env` file** in `wellness-app/` directory:
   ```
   VITE_OPENAI_API_KEY=your_key_here
   # OR
   VITE_COHERE_API_KEY=your_key_here
   ```

2. **Restart your dev server** after adding API keys

3. **Test it out**: Ask the chatbot any question - wellness or general!

## What Questions Are Wellness-Related?

The app automatically detects wellness questions based on keywords like:
- Stress, anxiety, mood, sleep, energy
- Time management, productivity, focus
- Study, exams, homework
- Exercise, food, nutrition
- Social, friends, relationships
- And more!

## Fallback Behavior

If no API keys are provided, the app will:
1. Use Hugging Face free API (may be slower)
2. Fall back to friendly Gen Z responses if API fails

## Notes

- Wellness questions always use your check-in data for personalized advice
- General questions use AI APIs for dynamic responses
- All responses are in Gen Z style (funny, relatable, but helpful)
- API keys are optional - the app works without them!

