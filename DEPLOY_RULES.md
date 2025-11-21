# Quick Guide: Deploy Firestore Security Rules

## 🚨 You're Getting Permission Errors!

The notification system needs Firestore security rules to be deployed. Here's how to fix it:

## Option 1: Firebase Console (Recommended - 2 minutes)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `wellness-app-86008`
3. **Navigate to Firestore Database**:
   - Click "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top
4. **Copy the rules**:
   - Open the `firestore.rules` file in this project
   - Copy ALL the content
5. **Paste and publish**:
   - Paste the rules into the Firebase Console editor
   - Click "Publish" button
   - Wait for confirmation (usually 10-30 seconds)

## Option 2: Firebase CLI (If you have it installed)

```bash
# Navigate to project root
cd C:\Users\jerem\VisualCoding\wellnessApp

# Login to Firebase (if not already logged in)
firebase login

# Initialize Firebase (if not already initialized)
firebase init firestore
# When prompted:
# - Select "Use an existing rules file"
# - Enter: firestore.rules
# - Select "Yes" for other prompts

# Deploy the rules
firebase deploy --only firestore:rules
```

## Verify Rules Are Deployed

After deploying:
1. Refresh your app
2. Go to Profile → Daily Reminders
3. Try enabling notifications
4. The error should be gone!

## What the Rules Do

The deployed rules allow:
- ✅ Users to read/write their own daily check-ins
- ✅ Users to read/write their own check-in history
- ✅ Users to read/write their own user preferences (for notifications)
- ✅ Users to read/write their own profile data
- ❌ Blocks all other access
- ❌ Blocks unauthenticated users

## Need Help?

If you're still getting errors after deploying:
1. Make sure you're logged in to the app
2. Wait a few seconds after deploying (rules need to propagate)
3. Clear your browser cache and refresh
4. Check the Firebase Console to verify rules were published

## Current Rules File

The rules are in: `firestore.rules`

They include access to:
- `dailyCheckins/{userId}`
- `checkinHistory/{historyId}`
- `profiles/{userId}`
- `wellnessData/{userId}`
- `users/{userId}` ← **This is needed for notifications!**
