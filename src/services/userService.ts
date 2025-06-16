import api from './api';

export interface User {
  userId?: number;
  username: string;
  fullName: string;
  email: string;
  tel?: string;
  role: string;
  state: string;
  telegram?: string;
  memo?: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  tel?: string;
  role: string;
  state?: string;
  telegram?: string;
  memo?: string;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (user: CreateUserRequest): Promise<any> => {
    const response = await api.post('/users', user);
    return response.data;
  },

  update: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleStatus: async (id: number, isActive: boolean): Promise<User> => {
    const response = await api.put(`/users/${id}/status`, { isActive });
    return response.data;
  },
};