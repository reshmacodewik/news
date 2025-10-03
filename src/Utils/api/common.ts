
import axios from 'axios';
import ShowToast from '../ShowToast';
import { defaultAxios } from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiParams {
  url: string;
  page?: number;
  searchText?: string;
  rowsPerPage?: number;
}

interface ApiParamsQuery {
  url: string;
  params?: string;
}

interface postParams {
  url: string;
  values: any;
  headers?: Record<string, string>;
}


export const getApiWithOutQuery = async ({
  url,
  headers,
}: {
  url: string;
  headers?: Record<string, string>;
}): Promise<any> => {
  try {
    const res = await defaultAxios.get(url, { headers });
    return res.data;
   
  } catch (err: any) {
    throw err;
  }
};

// export const getApiWithOutQueryWithToken = async ({
//   url,
// }: ApiParams & { token: string }): Promise<any> => {
//   try {
//     const token = await AsyncStorage.getItem('@auth_token');
//     const res = await defaultAxios.get(url, {
//       headers: {
//         Accept: 'application/json',
//         Authorization: `Bearer ${token}`, // Add Authorization header with token
//       },
//     });
//     return res.data;
//   } catch (err: any) {
//     return err?.response?.data;
//   }
// };

export const getApi = async ({
  url,
  page,
  searchText,
  rowsPerPage,
}: ApiParams): Promise<any> => {
  try {
    const res = await defaultAxios.get(
      url +
        '?page=' +
        page +
        '&rowsPerPage=' +
        rowsPerPage +
        '&q=' +
        searchText,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

export const getApiByParams = async ({
  url,
  params,
}: ApiParamsQuery): Promise<any> => {
  try {
    const res = await defaultAxios.get(url + '/' + params, {
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
      },
    });
    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

export const apiPost = async ({
  url,
  values,
  
}: postParams): Promise<any> => {
  try {
    const res = await defaultAxios.post(url, values);
    return res.data;
  } catch (err: any) {
    ShowToast(err?.response?.data?.error, 'error');
    return err?.response?.data;
  }
};

export const apiPATCH = async ({ url, values }: postParams): Promise<any> => {
  try {
    const res = await defaultAxios.patch(url, values, {
      headers: {
        Accept: 'application/json',
      },
    });
    console.log(res, 'res--0000000');
    // ShowToast(res.data?.message, "success");
    return res.data;
  } catch (err: any) {
    ShowToast(err?.response?.data?.message, 'error');
    return err?.response?.data;
  }
};

export const apiPostWithMultiForm = async ({
  url,
  values,
}: postParams): Promise<any> => {
  try {
    const res = await defaultAxios.post(url, values, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err: any) {
    ShowToast(err?.response?.data?.message, 'error');
    return err?.response?.data;
  }
};

export const apiPatchWithMultiForm = async ({
  url,
  values,
}: postParams): Promise<any> => {
  try {
    const res = await defaultAxios.patch(url, values, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err: any) {
    ShowToast(err?.response?.data?.message, 'error');
    return err?.response?.data;
  }
};
export const apiDelete = async ({ url }: { url: string }): Promise<any> => {
  try {
    const res = await defaultAxios.delete(url);
    ShowToast(res.data?.message || 'Deleted successfully', 'success');
    return res.data;
  } catch (err: any) {
    ShowToast(err?.response?.data?.message || 'Delete failed', 'error');
    return err?.response?.data;
  }
};
export const apiPUT = async ({
  url,
  values,
  headers,
}: postParams): Promise<any> => {
  try {
    const res = await defaultAxios.put(url, values, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    ShowToast(res.data?.message || 'Updated successfully', 'success');
    return res.data;
  } catch (err: any) {
    ShowToast(err?.response?.data?.message || 'Update failed', 'error');
    return err?.response?.data;
  }
};
