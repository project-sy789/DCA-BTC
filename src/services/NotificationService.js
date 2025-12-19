/**
 * NotificationService - Handles browser notifications for price alerts
 * Provides notification permission management and display functionality
 */

class NotificationService {
  /**
   * Check if the browser supports the Notification API
   * @returns {boolean} True if notifications are supported, false otherwise
   */
  static isSupported() {
    return 'Notification' in window;
  }

  /**
   * Request permission to show notifications
   * @returns {Promise<boolean>} True if permission granted, false otherwise
   */
  static async requestPermission() {
    // Check if notifications are supported
    if (!this.isSupported()) {
      console.warn('Browser does not support notifications');
      return false;
    }

    // Check current permission status
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission has been denied');
      return false;
    }

    try {
      // Request permission from user
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a notification to the user
   * @param {string} title - The notification title
   * @param {string} body - The notification body text
   * @param {string} icon - Optional icon URL for the notification
   */
  static showNotification(title, body, icon = null) {
    // Check if notifications are supported
    if (!this.isSupported()) {
      console.warn('Cannot show notification: Browser does not support notifications');
      return;
    }

    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      console.warn('Cannot show notification: Permission not granted');
      return;
    }

    try {
      // Create notification options
      const options = {
        body: body,
        icon: icon || undefined,
        badge: icon || undefined,
        tag: 'price-alert', // Prevents duplicate notifications
        requireInteraction: false,
        silent: false
      };

      // Show the notification
      const notification = new Notification(title, options);

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Get the current permission status
   * @returns {string} The permission status: 'granted', 'denied', or 'default'
   */
  static getPermissionStatus() {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

export default NotificationService;
