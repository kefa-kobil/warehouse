import api from './api';

export const productionService = {
  getAll: async () => {
    const response = await api.get('/productions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/productions/${id}`);
    return response.data;
  },

  create: async (production) => {
    const response = await api.post('/productions', production);
    return response.data;
  },

  update: async (id, production) => {
    const response = await api.put(`/productions/${id}`, production);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/productions/${id}`);
  },

  getByStatus: async (status) => {
    const response = await api.get(`/productions/status/${status}`);
    return response.data;
  },

  getByUserId: async (userId) => {
    const response = await api.get(`/productions/user/${userId}`);
    return response.data;
  },

  getByWarehouseId: async (warehouseId) => {
    const response = await api.get(`/productions/warehouse/${warehouseId}`);
    return response.data;
  },

  getByProductId: async (productId) => {
    const response = await api.get(`/productions/product/${productId}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/productions/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  start: async (id) => {
    const response = await api.post(`/productions/${id}/start`);
    return response.data;
  },

  complete: async (id) => {
    const response = await api.post(`/productions/${id}/complete`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/productions/${id}/cancel`);
    return response.data;
  },

  getItems: async (id) => {
    const response = await api.get(`/productions/${id}/items`);
    return response.data;
  },

  addItem: async (id, item) => {
    const response = await api.post(`/productions/${id}/items`, item);
    return response.data;
  },

  updateItem: async (itemId, item) => {
    const response = await api.put(`/productions/items/${itemId}`, item);
    return response.data;
  },

  removeItem: async (itemId) => {
    await api.delete(`/productions/items/${itemId}`);
  },
};