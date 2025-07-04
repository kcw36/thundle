import { useEffect, useState } from "react";

/**
 * Persist a React state value in localStorage
 * @param key   storage key
 * @param init  initial value (or fn)
 */
export function usePersistentState<T>(key: string, init: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : typeof init === "function" ? (init as () => T)() : init;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}