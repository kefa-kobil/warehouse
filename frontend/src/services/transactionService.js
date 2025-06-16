import api from './api';

export const transactionService = {
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (transaction) => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  update: async (id, transaction) => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/transactions/${id}`);
  },

  getByType: async (type) => {
    const response = await api.get(`/transactions/type/${type}`);
    return response.data;
  },

  getByEntityType: async (entityType) => {
    const response = await api.get(`/transactions/entity-type/${entityType}`);
    return response.data;
  },

  getByStatus: async (status) => {
    const response = await api.get(`/transactions/status/${status}`);
    return response.data;
  },

  getByUserId: async (userId) => {
    const response = await api.get(`/transactions/user/${userId}`);
    return response.data;
  },

  getByWarehouseId: async (warehouseId) => {
    const response = await api.get(`/transactions/warehouse/${warehouseId}`);
    return response.data;
  },

  getByItemId: async (itemId) => {
    const response = await api.get(`/transactions/item/${itemId}`);
    return response.data;
  },

  getByProductId: async (productId) => {
    const response = await api.get(`/transactions/product/${productId}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/transactions/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  searchByReference: async (reference) => {
    const response = await api.get(`/transactions/search?reference=${reference}`);
    return response.data;
  },

  getRecent: async () => {
    const response = await api.get('/transactions/recent');
    return response.data;
  },

  createItemInbound: async (data) => {
    const response = await api.post('/transactions/item/inbound', data);
    return response.data;
  },

  createProductInbound: async (data) => {
    const response = await api.post('/transactions/product/inbound', data);
    return response.data;
  },

  createItemOutbound: async (data) => {
    const response = await api.post('/transactions/item/outbound', data);
    return response.data;
  },

  createProductOutbound: async (data) => {
    const response = await api.post('/transactions/product/outbound', data);
    return response.data;
  },
};