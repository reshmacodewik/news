// src/storage/mmkvPersister.ts
import { MMKV } from 'react-native-mmkv';
import type { AuthSession } from '../Screens/Auth/AuthContext';

// Create a global MMKV instance
const storage = new MMKV();

// Keys for storage
const SESSION_KEY = 'auth_session';

// Save session
export const saveSession = (session: AuthSession) => {
  try {
    storage.set(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
};

// Get session
export const getSession = (): AuthSession | null => {
  try {
    const json = storage.getString(SESSION_KEY);
    return json ? (JSON.parse(json) as AuthSession) : null;
  } catch (e) {
    console.error('Failed to parse session:', e);
    return null;
  }
};
export const getAccessToken = (): boolean => {
  return !!getSession()?.accessToken;
};
// Clear session
export const clearSession = () => {
  try {
    storage.delete(SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
};
