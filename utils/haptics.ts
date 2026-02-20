import * as Haptics from 'expo-haptics';

/**
 * Haptic Feedback Utilities
 * Add tactile feedback like iOS/Android native apps
 *
 * NOTE: Haptics DON'T work in Expo Go!
 * They require a custom development build.
 * These are safe to call - they just won't do anything in Expo Go.
 */

const isHapticsAvailable = async () => {
  try {
    // Check if haptics are supported on this device
    return true; // Assume available, will fail gracefully if not
  } catch {
    return false;
  }
};

export const haptics = {
  /**
   * Light tap - For buttons, chips, small interactions
   */
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail - haptics not available (probably Expo Go)
    }
  },

  /**
   * Medium tap - For important actions
   */
  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Silently fail
    }
  },

  /**
   * Heavy tap - For critical actions
   */
  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Silently fail
    }
  },

  /**
   * Success feedback - For completed actions
   */
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Silently fail
    }
  },

  /**
   * Warning feedback - For alerts
   */
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Silently fail
    }
  },

  /**
   * Error feedback - For errors
   */
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Silently fail
    }
  },

  /**
   * Selection changed - For pickers, tabs
   */
  selection: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Silently fail
    }
  },
};
