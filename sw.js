// טוסטר - service worker: shows the "toast ready" alert and sets the icon badge.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  const title = d.title || 'הטוסט מוכן';
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, {
      body: d.body || 'החשמל נותק',
      icon: 'apple-touch-icon.png',
      badge: 'apple-touch-icon.png',
      tag: 'toast',
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      lang: 'he', dir: 'rtl',
    }),
    self.navigator.setAppBadge ? self.navigator.setAppBadge(1).catch(() => {}) : null,
    self.clients.matchAll({ type: 'window' }).then(cs => cs.forEach(c => c.postMessage({ type: 'toast-ready' }))),
  ]));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
