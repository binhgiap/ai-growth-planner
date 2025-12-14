import { useState, useCallback } from "react";

interface UseLocalStorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

export function useLocalStorage<T>(key: string, initialValue: T, options?: UseLocalStorageOptions) {
  const serialize = options?.serialize || JSON.stringify;
  const deserialize = options?.deserialize || JSON.parse;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, serialize(valueToStore));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key, serialize, storedValue]
  );

  return [storedValue, setValue] as const;
}
