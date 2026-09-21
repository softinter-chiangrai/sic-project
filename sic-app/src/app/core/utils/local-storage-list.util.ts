/**
 * Small shared read/write helpers for "a JSON array persisted under one localStorage key",
 * the pattern reimplemented ad-hoc in both AiHistoryService and AiNavigatorService.
 */

export function readLocalStorageList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`[localStorage] Failed to read list at "${key}"`, e);
    return [];
  }
}

export function writeLocalStorageList<T>(key: string, list: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error(`[localStorage] Failed to write list at "${key}"`, e);
  }
}

export function readLocalStorageValue(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch (e) {
    console.error(`[localStorage] Failed to read value at "${key}"`, e);
    return fallback;
  }
}

export function writeLocalStorageValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`[localStorage] Failed to write value at "${key}"`, e);
  }
}
