import api from './api';

export const clientService = {
  getAll: async () => {
    const response = await api.get('/clients');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (client) => {
    const response = await api.post('/clients', client);
    return response.data;
  },

  update: async (id, client) => {
    const response = await api.put(`/clients/${id}`, client);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/clients/${id}`);
  },
};