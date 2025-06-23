import { initializeApp, getApps } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyARWPBWjKBGiXEzGzCJqqFT9fBiMgpkw3w",
  authDomain: "mynotificationapp-5ee91.firebaseapp.com",
  projectId: "mynotificationapp-5ee91",
  messagingSenderId: "699688442197",
  appId: "1:699688442197:web:36930d1cb7dacb305937dc",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging = null;

// ✅ Safe initialization for client only
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.error("Failed to initialize messaging:", e);
  }
}

export { messaging };