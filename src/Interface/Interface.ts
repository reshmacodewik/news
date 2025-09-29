export interface ImageInterface {
  type: string;
  uri: string;
  fileSize: string;
  fileName: string;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

export interface LocationLat {
  lat?: number | null;
  lng?: number | null;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export type StackParamList = {
  Registerphone: undefined;
};
