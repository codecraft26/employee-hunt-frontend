// src/components/InAppNotification.tsx
"use client";
import { useEffect, useState } from "react";

export default function InAppNotification({ payload }: { payload: any }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 5000); // hide after 5 sec
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  const { title, body, image } = payload.notification || {};

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border w-80 z-50 flex gap-3 items-start animate-slide-in">
      {image && (
        <img
          src={image}
          alt="notification"
          className="w-12 h-12 object-cover rounded"
        />
      )}
      <div>
        <h4 className="font-bold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600">{body}</p>
      </div>
    </div>
  );
}