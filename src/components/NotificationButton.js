"use client";

import { messaging } from "../lib/firebase-config";
import { getToken } from "firebase/messaging";

export default function NotificationButton() {
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return;
    }
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted" && messaging) {
        // ✅ Register the service worker first
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        // ✅ Then use it to get token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        console.log("FCM Token:", token);

        await fetch("/api/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } else {
        console.warn("Permission denied or messaging not available");
      }
    } catch (err) {
      console.error("Token error:", err);
    }
  };

  return (
    <button
      onClick={requestPermission}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
    >
      Enable Notifications
    </button>
  );
}
