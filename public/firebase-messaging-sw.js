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
  
    const notificationTitle = payload.notification?.title || payload.data?.title || "Notification";
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || "",
      image: payload.notification?.image || payload.data?.image,
      icon: payload.notification?.icon || "/icons/icon-192x192.png",
      data: payload.data || {},
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // UNIVERSAL PUSH HANDLER (for all push events, including FCM data-only)
  self.addEventListener('push', function(event) {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      data = {};
    }
    const notificationTitle = data.notification?.title || data.title || "Notification";
    const notificationOptions = {
      body: data.notification?.body || data.body || "",
      image: data.notification?.image || data.image,
      icon: data.notification?.icon || "/icons/icon-192x192.png",
      data: data.data || {},
    };
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  });