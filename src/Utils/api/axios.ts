import axios from 'axios';
import { getToken, handleLogout } from '../../libs/auth';
import ShowToast from '../ShowToast';
import { APIBaseUrl } from '../constance';

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
      ShowToast(response.data?.error, 'error');
      // await handleLogout();
    }
    return response;
  },
  async error => {
    if (error?.response?.status === 401) {
      ShowToast(error.response?.data?.message, 'error');
      // await handleLogout();
    }
    return Promise.reject(error);
  },
);
