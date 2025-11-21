# Firebase Setup Guide

## Issue: Missing Firestore Permissions

You're getting "Missing or insufficient permissions" errors because your Firestore database doesn't have security rules configured.

## Solution: Deploy Firestore Security Rules

### Option 1: Deploy via Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wellness-app-86008**
3. Go to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the content from `firestore.rules` file
6. Click **Publish**

### Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## Security Rules Explanation

The rules in `firestore.rules` allow:
- ✅ Authenticated users to read/write their own daily check-ins (`dailyCheckins/{userId}`)
- ✅ Authenticated users to write their own check-in history (`checkinHistory`)
- ❌ Denies access to all other collections
- ❌ Prevents unauthenticated users from accessing any data

## Testing

After deploying the rules:
1. Make sure you're logged in to your app
2. Try submitting a check-in
3. The permission errors should be resolved

## Current Project Details

- **Project ID**: wellness-app-86008
- **Firebase Config**: Already set up in `firebaseConfig.js`

## Important: Deploy Rules for Notifications

The notification system requires access to the `users` collection to save preferences. Make sure the Firestore rules are deployed, which include:

```firestore
// Allow authenticated users to read/write their own user preferences
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### If You Get Permission Errors

If you see "Missing or insufficient permissions" errors when trying to save notification preferences:

1. **Deploy the rules immediately** using one of the methods above
2. **Wait a few seconds** for the rules to propagate
3. **Refresh the app** and try again
4. The notification settings will work once the rules are deployed





