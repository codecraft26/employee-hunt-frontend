// utils/clientStorage.ts
import { useState } from 'react';

/**
 * Utility functions for safely accessing client-side storage during SSR
 */

/**
 * Safely get an item from localStorage
 * Returns null if localStorage is not available (during SSR)
 */
export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error);
    return null;
  }
};

/**
 * Safely set an item in localStorage
 * Does nothing if localStorage is not available (during SSR)
 */
export const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to set localStorage item "${key}":`, error);
  }
};

/**
 * Safely remove an item from localStorage
 * Does nothing if localStorage is not available (during SSR)
 */
export const removeLocalStorageItem = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error);
  }
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Hook to safely use localStorage with SSR
 */
export const useLocalStorage = (key: string, initialValue: string = '') => {
  const [storedValue, setStoredValue] = useState(() => {
    return getLocalStorageItem(key) ?? initialValue;
  });

  const setValue = (value: string) => {
    setStoredValue(value);
    setLocalStorageItem(key, value);
  };

  const removeValue = () => {
    setStoredValue(initialValue);
    removeLocalStorageItem(key);
  };

  return [storedValue, setValue, removeValue] as const;
};
