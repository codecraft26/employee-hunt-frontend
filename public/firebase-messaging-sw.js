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

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  let title = "Notification";
  let body = "";
  let image = "";

  if (payload.notification) {
    title = payload.notification.title || title;
    body = payload.notification.body || body;
    image = payload.notification.image || image;
  } else if (payload.data) {
    try {
      const data = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
      if (data.notification) {
        title = data.notification.title || title;
        body = data.notification.body || body;
        image = data.notification.image || image;
      } else {
        title = data.title || title;
        body = data.body || body;
        image = data.image || image;
      }
    } catch (e) {
      title = payload.data.title || title;
      body = payload.data.body || body;
      image = payload.data.image || image;
    }
  }

  const notificationOptions = {
    body: body,
    image: image,
    icon: "/icons/icon-192x192.png",
    data: payload.data || {},
  };

  self.registration.showNotification(title, notificationOptions);
});

// UNIVERSAL PUSH HANDLER
self.addEventListener('push', function(event) {
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
    image = data.notification.image || image;
  } else if (data.title || data.body) {
    title = data.title || title;
    body = data.body || body;
    image = data.image || image;
  } else {
    // If the whole data is a stringified JSON
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed.notification) {
        title = parsed.notification.title || title;
        body = parsed.notification.body || body;
        image = parsed.notification.image || image;
      }
    } catch (e) {
      // fallback: show the stringified data
      body = JSON.stringify(data);
    }
  }

  const notificationOptions = {
    body: body,
    image: image,
    icon: "/icons/icon-192x192.png",
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});
