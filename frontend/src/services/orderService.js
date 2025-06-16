import api from './api';

export const orderService = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (order) => {
    const response = await api.post('/orders', order);
    return response.data;
  },

  update: async (id, order) => {
    const response = await api.put(`/orders/${id}`, order);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/orders/${id}`);
  },

  getByStatus: async (status) => {
    const response = await api.get(`/orders/status/${status}`);
    return response.data;
  },

  getByUserId: async (userId) => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },

  getByWarehouseId: async (warehouseId) => {
    const response = await api.get(`/orders/warehouse/${warehouseId}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/orders/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  searchBySupplier: async (supplier) => {
    const response = await api.get(`/orders/search?supplier=${supplier}`);
    return response.data;
  },

  confirm: async (id) => {
    const response = await api.post(`/orders/${id}/confirm`);
    return response.data;
  },

  receive: async (id) => {
    const response = await api.post(`/orders/${id}/receive`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  getItems: async (id) => {
    const response = await api.get(`/orders/${id}/items`);
    return response.data;
  },

  addItem: async (id, item) => {
    const response = await api.post(`/orders/${id}/items`, item);
    return response.data;
  },

  updateItem: async (itemId, item) => {
    const response = await api.put(`/orders/items/${itemId}`, item);
    return response.data;
  },

  removeItem: async (itemId) => {
    await api.delete(`/orders/items/${itemId}`);
  },
};