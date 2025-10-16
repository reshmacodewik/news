import axios from 'axios';
import { getToken, handleLogout } from '../../libs/auth';
import ShowToast from '../ShowToast';
import { APIBaseUrl } from '../constance';
import { processColor } from 'react-native';

export const defaultAxios = axios.create({ baseURL: APIBaseUrl });

defaultAxios.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

defaultAxios.interceptors.response.use(
  async response => {
    if (response?.data?.status === 401) {
       await handleLogout();
    }
    return response;
  },
  async error => {
    if (error?.response?.status === 401) {
      await handleLogout();
    }
    return Promise.reject(error);
  },
);



