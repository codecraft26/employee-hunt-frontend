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

  const notificationTitle = payload.notification?.title;
  const notificationOptions = {
    body: payload.notification?.body,
    image: payload.notification?.image,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
