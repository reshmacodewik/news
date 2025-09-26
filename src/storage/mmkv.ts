import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  id: "app-storage",
    encryptionKey: 'b7d8f1a2e4c9g6h3k1m5n0p8q2r4s9',
});

export const setItem = (key: string, value: any) => {
  storage.set(key, JSON.stringify(value));
};

export const getItem = <T = any>(key: string): T | null => {
  const raw = storage.getString(key);
  return raw ? JSON.parse(raw) : null;
};

export const removeItem = (key: string) => {
  storage.delete(key);
};
