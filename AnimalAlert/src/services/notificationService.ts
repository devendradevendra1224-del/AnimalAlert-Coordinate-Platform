import { NotificationPreferences } from '../types';

let defaultPreferences: NotificationPreferences = {
  rescue_alerts: true,
  critical_alerts: true,
  nearby_alerts: true,
  case_updates: true,
  organization_alerts: true,
};

const lastNotifiedMap = new Map<string, number>();

export const getNotificationPreferences = (): NotificationPreferences => {
  const saved = localStorage.getItem('animalalert_notif_prefs');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultPreferences;
    }
  }
  return defaultPreferences;
};

export const saveNotificationPreferences = (prefs: NotificationPreferences) => {
  defaultPreferences = prefs;
  localStorage.setItem('animalalert_notif_prefs', JSON.stringify(prefs));
};

export const shouldSendNotification = (
  userId: string,
  eventKey: string,
  minIntervalSeconds: number = 60
): boolean => {
  const key = `${userId}_${eventKey}`;
  const now = Date.now();
  const lastTime = lastNotifiedMap.get(key) || 0;

  if (now - lastTime < minIntervalSeconds * 1000) {
    return false; // Throttled
  }

  lastNotifiedMap.set(key, now);
  return true;
};
