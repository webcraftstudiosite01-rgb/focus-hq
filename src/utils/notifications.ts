// Browser notifications helper with proper permissions handling

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('[Notification] Permission request error:', e);
      return false;
    }
  }

  return false;
}

export function sendNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: './icon.svg',
        badge: './icon.svg',
        ...options,
      });
    } catch (e) {
      console.warn('[Notification] Error showing notification:', e);
    }
  }
}
