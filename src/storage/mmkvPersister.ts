import { setItem, getItem, removeItem } from './mmkv';

const AUTH_KEY = 'auth-session';

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
};

export const saveSession = (session: AuthSession) => {
  setItem(AUTH_KEY, session);
};

export const getSession = (): AuthSession | null => {
  const session = getItem<AuthSession>(AUTH_KEY);
  console.log(session, 'session fetched from storage');
  return session;
};

export const clearSession = () => {
  removeItem(AUTH_KEY);
};

export const getAccessToken = (): boolean => {
  return !!getSession()?.accessToken;
};

export const getRefreshToken = (): string | null => {
  return getSession()?.refreshToken ?? null;
};
