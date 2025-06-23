import api from './api';

export const materialReceiptService = {
  getAll: async () => {
    const response = await api.get('/material-receipts');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/material-receipts/${id}`);
    return response.data;
  },

  create: async (materialReceipt) => {
    const response = await api.post('/material-receipts', materialReceipt);
    return response.data;
  },

  update: async (id, materialReceipt) => {
    const response = await api.put(`/material-receipts/${id}`, materialReceipt);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/material-receipts/${id}`);
  },

  getByStatus: async (status) => {
    const response = await api.get(`/material-receipts/status/${status}`);
    return response.data;
  },

  getByUserId: async (userId) => {
    const response = await api.get(`/material-receipts/user/${userId}`);
    return response.data;
  },

  getByWarehouseId: async (warehouseId) => {
    const response = await api.get(`/material-receipts/warehouse/${warehouseId}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/material-receipts/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  searchBySupplier: async (supplier) => {
    const response = await api.get(`/material-receipts/search?supplier=${supplier}`);
    return response.data;
  },

  receive: async (id) => {
    const response = await api.post(`/material-receipts/${id}/receive`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/material-receipts/${id}/cancel`);
    return response.data;
  },

  getItems: async (id) => {
    const response = await api.get(`/material-receipts/${id}/items`);
    return response.data;
  },

  addItem: async (id, item) => {
    const response = await api.post(`/material-receipts/${id}/items`, item);
    return response.data;
  },

  updateItem: async (itemId, item) => {
    const response = await api.put(`/material-receipts/items/${itemId}`, item);
    return response.data;
  },

  removeItem: async (itemId) => {
    await api.delete(`/material-receipts/items/${itemId}`);
  },
};