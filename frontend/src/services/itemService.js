import api from './api';

export const itemService = {
  getAll: async () => {
    const response = await api.get('/items');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  create: async (item) => {
    const response = await api.post('/items', item);
    return response.data;
  },

  update: async (id, item) => {
    const response = await api.put(`/items/${id}`, item);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/items/${id}`);
  },
};