"use client";

import { useEffect, useState } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../../src/lib/firebase-config";
import InAppNotification from "./InAppNotification";

export default function NotificationHandler() {
  const [messagePayload, setMessagePayload] = useState(null);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📬 Foreground FCM message:", payload);
      setMessagePayload(payload);
    });

    return () => unsubscribe();
  }, []);

  return messagePayload ? <InAppNotification payload={messagePayload} /> : null;
}