import api from './api';

export const warehouseService = {
  getAll: async () => {
    const response = await api.get('/warehouses');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },

  create: async (warehouse) => {
    const response = await api.post('/warehouses', warehouse);
    return response.data;
  },

  update: async (id, warehouse) => {
    const response = await api.put(`/warehouses/${id}`, warehouse);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/warehouses/${id}`);
  },
};