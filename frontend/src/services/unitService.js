import api from './api';

export const unitService = {
  getAll: async () => {
    const response = await api.get('/units');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/units/${id}`);
    return response.data;
  },

  create: async (unit) => {
    const response = await api.post('/units', unit);
    return response.data;
  },

  update: async (id, unit) => {
    const response = await api.put(`/units/${id}`, unit);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/units/${id}`);
  },
};