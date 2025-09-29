import axios from 'axios';
import { getToken, handleLogout } from '../../libs/auth';
import { getSession } from '../../storage/mmkvPersister';
import ShowToast from '../ShowToast';
import { APIBaseUrl } from '../constance';

export const defaultAxios = axios.create({ baseURL: APIBaseUrl });

defaultAxios.interceptors.request.use(async config => {
  const session = getSession();
  const token = session?.accessToken;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

defaultAxios.interceptors.response.use(
  async response => {
    if (response?.data?.code === 401) {
      ShowToast(response.data?.error, 'error');
      await handleLogout();
    }
    return response;
  },
  async error => {
    if (error?.response?.status === 498) {
      ShowToast(error.response?.data?.message, 'error');
      await handleLogout();
    }
    return Promise.reject(error);
  },
);
