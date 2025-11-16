/**
 * Notification Service for Wellness App
 * Handles browser notifications for daily check-in reminders
 */

// Request notification permission from the user
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn("Notification permission denied");
    return false;
  }

  // Permission is "default", request it
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

// Check if notifications are supported and enabled
export const isNotificationSupported = () => {
  return "Notification" in window;
};

// Check if notification permission is granted
export const hasNotificationPermission = () => {
  if (!isNotificationSupported()) return false;
  return Notification.permission === "granted";
};

// Show a notification
export const showNotification = (title, options = {}) => {
  if (!hasNotificationPermission()) {
    console.warn("Notification permission not granted");
    return null;
  }

  const defaultOptions = {
    icon: "/vite.svg", // You can replace this with a custom icon
    badge: "/vite.svg",
    tag: "wellness-reminder",
    requireInteraction: false,
    ...options,
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click on notification
    notification.onclick = () => {
      window.focus();
      notification.close();
      // You can navigate to check-in page here if needed
      if (options.onClick) {
        options.onClick();
      }
    };

    return notification;
  } catch (error) {
    console.error("Error showing notification:", error);
    return null;
  }
};

// Store active notification timeouts
let activeNotificationTimeouts = [];

// Clear all scheduled notifications
const clearAllScheduledNotifications = () => {
  activeNotificationTimeouts.forEach(timeoutId => {
    clearTimeout(timeoutId);
  });
  activeNotificationTimeouts = [];
};

// Schedule a daily notification
export const scheduleDailyNotification = (time, title, body, options = {}) => {
  if (!hasNotificationPermission()) {
    console.warn("Cannot schedule notification: permission not granted");
    return null;
  }

  // Clear any existing scheduled notifications
  clearAllScheduledNotifications();

  // Parse time (format: "HH:MM" or "HH:MM:SS")
  const [hours, minutes] = time.split(":").map(Number);
  
  const scheduleNext = () => {
    // Get current time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Calculate milliseconds until the scheduled time
    const msUntilNotification = scheduledTime.getTime() - now.getTime();

    console.log(`Scheduling notification for ${scheduledTime.toLocaleString()}`);

    // Schedule the notification
    const timeoutId = setTimeout(() => {
      showNotification(title, {
        body,
        ...options,
      });
      
      // Schedule the next notification (daily recurrence)
      scheduleNext();
    }, msUntilNotification);

    // Store the timeout ID
    activeNotificationTimeouts.push(timeoutId);
    return timeoutId;
  };

  return scheduleNext();
};

// Cancel a scheduled notification
export const cancelScheduledNotification = (timeoutId) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    activeNotificationTimeouts = activeNotificationTimeouts.filter(id => id !== timeoutId);
  }
};

// Export clear function for external use
export { clearAllScheduledNotifications };

// Show check-in reminder notification
export const showCheckInReminder = (streak = 0) => {
  const title = streak > 0 
    ? `🔥 ${streak} Day Streak - Keep It Going!`
    : "🌟 Time for Your Daily Check-in!";
  
  const body = streak > 0
    ? `Don't break your ${streak} day streak! Complete your check-in now.`
    : "Track your wellness and build healthy habits with a quick check-in.";

  return showNotification(title, {
    body,
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: "check-in-reminder",
    requireInteraction: false,
  });
};

// Show streak achievement notification
export const showStreakAchievement = (streak) => {
  const messages = {
    7: "🎉 Amazing! You've hit a 7-day streak!",
    14: "🚀 Incredible! 2 weeks of consistency!",
    30: "🏆 Legendary! A full month streak!",
    100: "👑 Unstoppable! 100 days of wellness!",
  };

  const message = messages[streak] || `🔥 Great job! ${streak} day streak!`;
  
  return showNotification("Streak Achievement! 🔥", {
    body: message,
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: "streak-achievement",
    requireInteraction: true,
  });
};

// Initialize notification system
export const initializeNotifications = async (userPreferences = {}) => {
  if (!isNotificationSupported()) {
    return { success: false, error: "Notifications not supported" };
  }

  const permissionGranted = await requestNotificationPermission();
  
  if (!permissionGranted) {
    return { success: false, error: "Permission denied" };
  }

  // If user has notification preferences, schedule them
  if (userPreferences.enabled && userPreferences.reminderTime) {
    const reminderTime = userPreferences.reminderTime; // Format: "HH:MM"
    const streak = userPreferences.currentStreak || 0;
    
    scheduleDailyNotification(
      reminderTime,
      "🌟 Daily Wellness Check-in",
      `Time to track your wellness! ${streak > 0 ? `You're on a ${streak} day streak!` : "Start your streak today!"}`,
      {
        onClick: () => {
          // Navigate to check-in page
          window.location.href = "/checkin";
        },
      }
    );

    return { success: true, message: "Notifications scheduled" };
  }

  return { success: true, message: "Notifications enabled" };
};
