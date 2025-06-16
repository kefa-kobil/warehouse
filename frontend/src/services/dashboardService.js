import api from './api';

export const dashboardService = {
  getStats: async () => {
    try {
      const [users, items, products, clients, transactions] = await Promise.all([
        api.get('/users'),
        api.get('/items'),
        api.get('/products'),
        api.get('/clients'),
        api.get('/transactions'),
      ]);

      return {
        totalUsers: users.data.length,
        totalItems: items.data.length,
        totalProducts: products.data.length,
        totalClients: clients.data.length,
        totalTransactions: transactions.data.length,
        recentTransactions: transactions.data.slice(0, 5),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get('/transactions/recent');
      return response.data.slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  getWarehouseStats: async () => {
    try {
      const [warehouses, items, products] = await Promise.all([
        api.get('/warehouses'),
        api.get('/items'),
        api.get('/products'),
      ]);

      return warehouses.data.map(warehouse => {
        const warehouseItems = items.data.filter(item => 
          item.warehouse?.warehouseId === warehouse.warehouseId
        );
        const warehouseProducts = products.data.filter(product => 
          product.warehouse?.warehouseId === warehouse.warehouseId
        );

        const totalItems = warehouseItems.length;
        const totalProducts = warehouseProducts.length;
        const totalItemQuantity = warehouseItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalProductQuantity = warehouseProducts.reduce((sum, product) => sum + (product.quantity || 0), 0);
        const totalValue = 
          warehouseItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0) +
          warehouseProducts.reduce((sum, product) => sum + ((product.quantity || 0) * (product.salePrice || 0)), 0);

        return {
          ...warehouse,
          totalItems,
          totalProducts,
          totalItemQuantity,
          totalProductQuantity,
          totalValue,
        };
      });
    } catch (error) {
      console.error('Error fetching warehouse stats:', error);
      return [];
    }
  },

  getTransactionStats: async () => {
    try {
      const response = await api.get('/transactions');
      const transactions = response.data;

      const inboundCount = transactions.filter(t => t.transactionType === 'INBOUND').length;
      const outboundCount = transactions.filter(t => t.transactionType === 'OUTBOUND').length;
      const productionCount = transactions.filter(t => t.transactionType === 'PRODUCTION').length;
      const totalValue = transactions.reduce((sum, t) => sum + (parseFloat(t.totalPrice) || 0), 0);

      const monthlyData = {};
      transactions.forEach(transaction => {
        const month = new Date(transaction.transactionDate).toLocaleDateString('uz-UZ', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (!monthlyData[month]) {
          monthlyData[month] = { inbound: 0, outbound: 0, production: 0 };
        }
        if (transaction.transactionType === 'INBOUND') monthlyData[month].inbound++;
        if (transaction.transactionType === 'OUTBOUND') monthlyData[month].outbound++;
        if (transaction.transactionType === 'PRODUCTION') monthlyData[month].production++;
      });

      return {
        inboundCount,
        outboundCount,
        productionCount,
        totalValue,
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          ...data,
        })),
      };
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      return {
        inboundCount: 0,
        outboundCount: 0,
        productionCount: 0,
        totalValue: 0,
        monthlyData: [],
      };
    }
  },
};