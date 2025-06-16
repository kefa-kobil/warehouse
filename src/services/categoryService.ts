import api from './api';

export interface Category {
  categoryId?: number;
  name: string;
  createdAt?: string;
  modifiedAt?: string;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (category: Omit<Category, 'categoryId'>): Promise<Category> => {
    const response = await api.post('/categories', category);
    return response.data;
  },

  update: async (id: number, category: Omit<Category, 'categoryId'>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};