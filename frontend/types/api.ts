import { User } from './user';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface LoginResponseData {
  tokenType: string;
  accessToken: string;
  accessExpiresIn: string;
  refreshToken: string;
  refreshExpiresIn: string;
  user: User;
}

export interface GetMeResponseData {
  user: User;
}
