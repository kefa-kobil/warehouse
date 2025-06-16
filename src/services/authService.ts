import api from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: number;
    username: string;
    fullName: string;
    email: string;
    role: string;
    state: string;
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<LoginResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};