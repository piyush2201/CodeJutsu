"use client";

import { useState, useEffect, useCallback } from 'react';

// This function now correctly returns the initialValue when on the server
function getValueFromLocalStorage<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    // If the item doesn't exist, return the initialValue.
    // This is key for letting the default code show for new languages.
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // The state is now lazily initialized with a function that reads from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getValueFromLocalStorage(key, initialValue);
  });

  // This effect will re-run ONLY when the `key` or `initialValue` changes.
  // This is crucial for updating the editor when the language (and thus the key) changes.
  useEffect(() => {
    setStoredValue(getValueFromLocalStorage(key, initialValue));
  }, [key, initialValue]);


  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === key && event.newValue !== null) {
      try {
        setStoredValue(JSON.parse(event.newValue));
      } catch (error) {
         console.error(`Error parsing localStorage key “${key}” on storage event:`, error);
      }
    }
  }, [key]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}
