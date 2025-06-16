import api from './api';

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (category) => {
    const response = await api.post('/categories', category);
    return response.data;
  },

  update: async (id, category) => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/categories/${id}`);
  },
};