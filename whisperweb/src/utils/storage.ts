import { Settings, Session, CurrentSession } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'whisper_web_settings',
  SESSIONS: 'whisper_web_sessions',
  CURRENT_SESSION: 'whisper_web_current_session',
} as const;

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage: ${error}`);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from storage: ${error}`);
    return defaultValue;
  }
}

export function saveSettings(settings: Settings): void {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function loadSettings(defaultSettings: Settings): Settings {
  return loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
}

export function saveSessions(sessions: Session[]): void {
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
}

export function loadSessions(): Session[] {
  return loadFromStorage<Session[]>(STORAGE_KEYS.SESSIONS, []);
}

export function saveCurrentSession(session: CurrentSession): void {
  saveToStorage(STORAGE_KEYS.CURRENT_SESSION, session);
}

export function loadCurrentSession(): CurrentSession | null {
  return loadFromStorage<CurrentSession | null>(STORAGE_KEYS.CURRENT_SESSION, null);
}

export function clearStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error(`Error clearing storage: ${error}`);
  }
}
