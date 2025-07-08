"use client";

import { getToken, Messaging } from "firebase/messaging";
import { messaging } from "../lib/firebase-config";

/**
 * Utility functions for Firebase Cloud Messaging (FCM)
 */
export class FCMUtils {
  /**
   * Request notification permission from the user
   * @returns Promise<NotificationPermission>
   */
  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    return await Notification.requestPermission();
  }

  /**
   * Register service worker for FCM
   * @returns Promise<ServiceWorkerRegistration>
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker not supported");
    }

    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      throw error;
    }
  }

  /**
   * Generate FCM token for push notifications
   * @param silent - If true, won't request permission if not already granted
   * @returns Promise<string | null> - Returns FCM token or null if failed
   */
  static async generateFCMToken(silent: boolean = false): Promise<string | null> {
    try {
      // Check if messaging is available
      if (!messaging || typeof messaging === 'undefined') {
        if (!silent) console.warn("Firebase messaging not available");
        return null;
      }

      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        if (!silent) console.warn("Not in browser environment");
        return null;
      }

      // Check current permission status
      const currentPermission = this.getNotificationPermission();
      
      // If silent mode and permission not granted, return null
      if (silent && currentPermission !== 'granted') {
        console.log("Silent mode: Permission not granted, skipping token generation");
        return null;
      }

      // Request notification permission (only if not in silent mode)
      let permission: NotificationPermission;
      try {
        permission = silent ? currentPermission! : await this.requestNotificationPermission();
      } catch (permissionError) {
        console.warn("Permission request failed:", permissionError);
        return null;
      }
      
      if (permission !== "granted") {
        if (!silent) console.warn("Notification permission not granted:", permission);
        return null;
      }

      // Register service worker
      let registration: ServiceWorkerRegistration;
      try {
        registration = await this.registerServiceWorker();
      } catch (swError) {
        console.warn("Service worker registration failed:", swError);
        return null;
      }

      // Get VAPID key from environment
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
      if (!vapidKey) {
        console.error("VAPID key not found in environment variables");
        return null;
      }

      // Generate FCM token
      const token = await getToken(messaging as Messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        if (!silent) console.log("FCM Token generated successfully");
        return token;
      } else {
        console.warn("No registration token available");
        return null;
      }

    } catch (error) {
      console.error("Error generating FCM token:", error);
      return null;
    }
  }

  /**
   * Check if notifications are supported and enabled
   * @returns boolean
   */
  static isNotificationSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator
    );
  }

  /**
   * Get current notification permission status
   * @returns NotificationPermission | null
   */
  static getNotificationPermission(): NotificationPermission | null {
    if (!this.isNotificationSupported()) {
      return null;
    }
    return Notification.permission;
  }


  /**
   * Get or generate a unique device ID for this browser/device
   */
  static getDeviceId(): string {
    if (typeof window === "undefined") return "server-device";
    let deviceId = localStorage.getItem("fcm_device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("fcm_device_id", deviceId);
    }
    return deviceId;
  }

  /**
   * Store FCM token in localStorage for later use, using device ID as key
   * @param token - FCM token to store
   */
  static storeFCMToken(token: string): void {
    if (typeof window !== "undefined") {
      const deviceId = this.getDeviceId();
      localStorage.setItem(`fcm_token_${deviceId}`, token);
    }
  }

  /**
   * Retrieve stored FCM token from localStorage using device ID
   * @returns string | null
   */
  static getStoredFCMToken(): string | null {
    if (typeof window !== "undefined") {
      const deviceId = this.getDeviceId();
      return localStorage.getItem(`fcm_token_${deviceId}`);
    }
    return null;
  }

  /**
   * Clear stored FCM token from localStorage for this device
   */
  static clearStoredFCMToken(): void {
    if (typeof window !== "undefined") {
      const deviceId = this.getDeviceId();
      localStorage.removeItem(`fcm_token_${deviceId}`);
    }
  }

  /**
   * Generate or retrieve existing FCM token
   * This method will first check for a stored token, and if not found, generate a new one
   * @param requestPermission - Whether to request permission if not already granted
   * @returns Promise<string | null>
   */
  static async getOrGenerateFCMToken(requestPermission: boolean = true): Promise<string | null> {
    try {
      // First, check if we have a stored token
      // const storedToken = this.getStoredFCMToken();
      // if (storedToken) {
      //   console.log("Using stored FCM token");
      //   return storedToken;
      // }

      // If no stored token, try to generate one silently first
      let newToken = await this.generateFCMToken(true); // Silent mode
      
      // If silent generation failed and we're allowed to request permission
      if (!newToken && requestPermission) {
        console.log("Silent token generation failed, requesting permission...");
        newToken = await this.generateFCMToken(false); // With permission request
      }
      
      if (newToken) {
        this.storeFCMToken(newToken);
      }
      
      return newToken;
    } catch (error) {
      console.error("Error getting or generating FCM token:", error);
      return null;
    }
  }
}

export default FCMUtils;
