importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyARWPBWjKBGiXEzGzCJqqFT9fBiMgpkw3w",
  authDomain: "mynotificationapp-5ee91.firebaseapp.com",
  projectId: "mynotificationapp-5ee91",
  messagingSenderId: "699688442197",
  appId: "1:699688442197:web:36930d1cb7dacb305937dc",
});

const messaging = firebase.messaging();

const fallbackImage = "/dashboard_tiles/app-logo.svg";

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Background message:", payload);
  // Do NOT show notification here to avoid duplicates
  // self.registration.showNotification(title, notificationOptions);
});

// UNIVERSAL PUSH HANDLER
self.addEventListener('push', function(event) {
  console.log('[firebase-messaging-sw.js] Push event:', event);
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {};
  }

  let title = "Notification";
  let body = "";
  let image = "";

  if (data.notification) {
    title = data.notification.title || title;
    body = data.notification.body || body;
    image = data.notification.image || image || fallbackImage;
  } else if (data.title || data.body) {
    title = data.title || title;
    body = data.body || body;
    image = data.image || image || fallbackImage;
  } else {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed.notification) {
        title = parsed.notification.title || title;
        body = parsed.notification.body || body;
        image = parsed.notification.image || image || fallbackImage;
      }
    } catch (e) {
      body = JSON.stringify(data);
      image = fallbackImage;
    }
  }

  const notificationOptions = {
    body: body,
    image: image || fallbackImage,
    icon: "/icons/icon-192x192.png",
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = 'https://www.banndhann.com/dashboard/activities';

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
