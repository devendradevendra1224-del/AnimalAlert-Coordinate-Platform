// Service Worker & PWA Installation Manager

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('[PWA] Service Worker registered successfully:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
};

export const initPwaInstallListener = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('[PWA] captured beforeinstallprompt event');
    notifyInstallListeners(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('[PWA] App successfully installed as standalone PWA');
    notifyInstallListeners(false);
  });
};

export const subscribeInstallStatus = (callback: (canInstall: boolean) => void) => {
  listeners.add(callback);
  callback(Boolean(deferredPrompt));
  return () => {
    listeners.delete(callback);
  };
};

const notifyInstallListeners = (canInstall: boolean) => {
  listeners.forEach((cb) => cb(canInstall));
};

export const promptPwaInstall = async (): Promise<{ outcome: 'accepted' | 'dismissed' | 'unsupported' }> => {
  if (!deferredPrompt) {
    return { outcome: 'unsupported' };
  }

  try {
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notifyInstallListeners(false);
    return { outcome: choiceResult.outcome };
  } catch (err) {
    console.error('[PWA] Install prompt error:', err);
    return { outcome: 'unsupported' };
  }
};

export const isStandalonePwa = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

export const isServiceWorkerRegistered = (): boolean => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  return Boolean(navigator.serviceWorker.controller);
};
