import { PushSubscriptionRecord, NotificationPreferences } from '../types';
import { getNotificationPreferences, saveNotificationPreferences } from './notificationService';

const PUSH_SUBS_KEY = 'animalalert_push_subscriptions';

export const getPushPermissionState = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

export const checkPushSupport = () => {
  if (typeof window === 'undefined') {
    return { supported: false, permission: 'denied' as NotificationPermission };
  }
  const supported = 'Notification' in window && 'serviceWorker' in navigator;
  const permission = 'Notification' in window ? Notification.permission : ('denied' as NotificationPermission);
  return { supported, permission };
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
};

export const registerPushSubscription = async (
  userId: string
): Promise<PushSubscriptionRecord | null> => {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') {
    return null;
  }

  let endpoint = `web-push-${userId}-${Date.now()}`;

  // Try getting real service worker push subscription if available
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.pushManager) {
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          // Subscribe with standard applicationServerKey or simple subscription
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              'BEl62iUYgUivxIkv69yViEuiBIa-40y2pQGv1pM8N5_oZ0b9w1mK2sL3vX4yZ5a6b7c8d9e0'
            ),
          }).catch(() => null);
        }
        if (sub) {
          endpoint = sub.endpoint;
        }
      }
    } catch (e) {
      console.warn('PushManager registration fallback:', e);
    }
  }

  const existingSubs = getStoredSubscriptions();
  const newSub: PushSubscriptionRecord = {
    id: `sub-${Date.now()}`,
    user_id: userId,
    endpoint_or_token: endpoint,
    platform: typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = [newSub, ...existingSubs.filter((s) => s.user_id !== userId)];
  localStorage.setItem(PUSH_SUBS_KEY, JSON.stringify(updated));
  return newSub;
};

export const getStoredSubscriptions = (): PushSubscriptionRecord[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(PUSH_SUBS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const sendBrowserPushNotification = async (
  title: string,
  body: string,
  options: {
    tag?: string;
    caseId?: string;
    priority?: string;
  } = {}
): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  // Use ServiceWorker registration if available
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: options.tag || 'animal-alert',
        data: { caseId: options.caseId },
        vibrate: [200, 100, 200],
        requireInteraction: options.priority === 'CRITICAL',
      } as any);
      return true;
    } catch (err) {
      console.warn('ServiceWorker showNotification failed, falling back to standard Notification constructor:', err);
    }
  }

  // Fallback to standard browser Notification constructor
  try {
    const notif = new Notification(title, {
      body,
      icon: '/favicon.svg',
      tag: options.tag || 'animal-alert',
      data: { caseId: options.caseId },
    });

    if (options.caseId) {
      notif.onclick = () => {
        window.focus();
        window.location.href = `/?caseId=${options.caseId}`;
      };
    }
    return true;
  } catch (err) {
    console.error('Failed to trigger browser push notification:', err);
    return false;
  }
};

// Helper for VAPID key conversion
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
