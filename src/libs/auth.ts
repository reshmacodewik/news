import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../Navigators/utils';
import { UserData } from '../Interface/Interface';

export const handleLogin = async ({ token, user }: any) => {
  try {
    await AsyncStorage.removeItem('@userSession');
  } catch (e) {
    throw new Error('Login failed! Please check your credentials.');
  }
};

// Logout function - Clears session data from AsyncStorage
export const handleLogout = async () => {
  await AsyncStorage.removeItem('userSession');
};

export const getToken = async (): Promise<string | null> => {
  try {
    const tokenStr = await AsyncStorage.getItem('userSession');
    if (!tokenStr) return null;
    const tokenObj = JSON.parse(tokenStr);
    return tokenObj.accessToken || null;
  } catch (e) {
    console.error('Failed to fetch token from AsyncStorage', e);
    throw new Error('Failed to fetch token from AsyncStorage');
  }
};
export const getCurrentUserInfo = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem('@user_data');
    if (userData) {
      return JSON.parse(userData) as UserData;
    } else {
      return null;
    }
  } catch (e) {
    throw new Error('Failed to fetch user data from AsyncStorage:');
  }
};



