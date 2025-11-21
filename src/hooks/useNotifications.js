import { useEffect, useRef } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { initializeNotifications } from "../utils/notifications";

/**
 * Custom hook to manage notifications
 * Initializes notifications when user logs in and has preferences set
 */
export const useNotifications = () => {
  const notificationInitialized = useRef(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && !notificationInitialized.current) {
        try {
          // Get user notification preferences
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.notifications && userData.notifications.enabled) {
              // Initialize notifications with user preferences
              await initializeNotifications({
                enabled: true,
                reminderTime: userData.notifications.reminderTime || "09:00",
                currentStreak: userData.currentStreak || 0,
              });
              
              notificationInitialized.current = true;
              console.log("Notifications initialized for user");
            }
          }
        } catch (error) {
          // Handle permission errors gracefully - don't break the app
          if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
            console.warn("Cannot initialize notifications: Firestore permissions not available. Please deploy security rules.");
          } else {
            console.error("Error initializing notifications:", error);
          }
          // Don't set notificationInitialized to true on error, so we can retry later
        }
      } else if (!user) {
        // Reset when user logs out
        notificationInitialized.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};
