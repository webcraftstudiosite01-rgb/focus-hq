// Storage Data Access Layer for Focus HQ
// All reads and writes are safely wrapped in try/catch

const STORAGE_PREFIX = 'focus_hq_';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[Storage] Failed to read key "${key}":`, err);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[Storage] Failed to write key "${key}":`, err);
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (err) {
      console.error(`[Storage] Failed to remove key "${key}":`, err);
      return false;
    }
  },

  clearAll(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      return true;
    } catch (err) {
      console.error('[Storage] Failed to clear all keys:', err);
      return false;
    }
  }
};
