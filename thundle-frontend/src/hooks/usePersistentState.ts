import { useEffect, useState, useRef } from "react";

/**
 * Persist a React state value in localStorage
 * @param key   storage key
 * @param init  initial value (or fn)
 */
export function usePersistentState<T>(key: string, init: T | (() => T)) {
  // Track the *current* storage key we’re using
  const keyRef = useRef(key);

  // Initialise from the *initial* key
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored != null) return JSON.parse(stored) as T;
    return typeof init === "function" ? (init as () => T)() : init;
  });

  /* ── If the key prop changes, switch state to the new bucket ── */
  useEffect(() => {
    if (keyRef.current === key) return;        // same key → nothing to do
    keyRef.current = key;                      // update ref
    const stored = localStorage.getItem(key);
    setValue(
      stored != null
        ? (JSON.parse(stored) as T)
        : typeof init === "function"
        ? (init as () => T)()
        : init
    );
  }, [key, init]);

  /* ── Always write the *current* value to the *current* key ── */
  useEffect(() => {
    localStorage.setItem(keyRef.current, JSON.stringify(value));
  }, [value]);

  return [value, setValue] as const;
}