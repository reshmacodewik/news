import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../Navigators/utils';
import { UserData } from '../Interface/Interface';


export const handleLogin = async ({ token, user }: any) => {
  try {
    await AsyncStorage.setItem('@auth_token', token);
    await AsyncStorage.setItem('@user_data', JSON.stringify(user));
  } catch (e) {
    throw new Error('Login failed! Please check your credentials.');
  }
};

// Logout function - Clears session data from AsyncStorage
export const handleLogout = async () => {
  await AsyncStorage.removeItem('@auth_token');
  await AsyncStorage.removeItem('@user_data');
 // ✅ typed and safe
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    return token;
  } catch (e) {
    // Throw an error instead of returning an empty string
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

export const handleLocalStore = async (data: any) => {
  try {
    await AsyncStorage.setItem('car_parked_cus_id', JSON.stringify(data));
  } catch (e) {
    throw new Error('Login failed! Please check your credentials.');
  }
};

export const handleLocalGetCus = async () => {
  try {
    let getData: any = await AsyncStorage.getItem('car_parked_cus_id');
    if (getData) {
      return JSON.parse(getData);
    } else {
      return null;
    }
  } catch (e) {
    throw new Error('Login failed! Please check your credentials.');
  }
};

