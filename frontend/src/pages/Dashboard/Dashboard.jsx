import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Spin, Alert } from 'antd';
import { 
  UserOutlined, 
  BoxPlotOutlined, 
  ShoppingCartOutlined, 
  TeamOutlined,
  SwapOutlined,
  ShopOutlined,
  InboxOutlined,
  SendOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService } from '../../services/dashboardService';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalProducts: 0,
    totalClients: 0,
    totalTransactions: 0,
    recentTransactions: [],
  });
  const [warehouseStats, setWarehouseStats] = useState([]);
  const [transactionStats, setTransactionStats] = useState({
    inboundCount: 0,
    outboundCount: 0,
    productionCount: 0,
    totalValue: 0,
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardStats, warehouseData, transactionData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getWarehouseStats(),
        dashboardService.getTransactionStats(),
      ]);

      setStats(dashboardStats);
      setWarehouseStats(warehouseData);
      setTransactionStats(transactionData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: t('navigation.users'), value: stats.totalUsers, color: '#3f8600' },
    { name: t('navigation.items'), value: stats.totalItems, color: '#cf1322' },
    { name: t('navigation.products'), value: stats.totalProducts, color: '#1890ff' },
    { name: t('navigation.clients'), value: stats.totalClients, color: '#722ed1' },
  ];

  const transactionChartData = [
    { name: 'Kirish', value: transactionStats.inboundCount, color: '#52c41a' },
    { name: 'Chiqish', value: transactionStats.outboundCount, color: '#ff4d4f' },
    { name: 'Ishlab chiqarish', value: transactionStats.productionCount, color: '#1890ff' },
  ];

  const recentActivityColumns = [
    {
      title: 'Turi',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 80,
      render: (type) => {
        const colors = {
          INBOUND: 'green',
          OUTBOUND: 'red',
          PRODUCTION: 'blue',
          TRANSFER: 'orange',
          ADJUSTMENT: 'purple',
        };
        const labels = {
          INBOUND: 'Kirish',
          OUTBOUND: 'Chiqish',
          PRODUCTION: 'Ishlab chiqarish',
          TRANSFER: 'Ko\'chirish',
          ADJUSTMENT: 'Tuzatish',
        };
        return <Tag color={colors[type]} className="text-xs">{labels[type]}</Tag>;
      },
    },
    {
      title: 'Obyekt',
      key: 'entity',
      width: 120,
      render: (_, record) => {
        if (record.entityType === 'ITEMS' && record.item) {
          return <span className="text-xs">{record.item.name}</span>;
        } else if (record.entityType === 'PRODUCTS' && record.product) {
          return <span className="text-xs">{record.product.name}</span>;
        }
        return '-';
      },
    },
    {
      title: 'Miqdor',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      render: (quantity) => <span className="text-xs">{quantity}</span>,
    },
    {
      title: 'Jami',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 70,
      render: (price) => <span className="text-xs">${price}</span>,
    },
    {
      title: 'Sana',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 80,
      render: (date) => <span className="text-xs">{new Date(date).toLocaleDateString('uz-UZ')}</span>,
    },
  ];

  const warehouseColumns = [
    {
      title: 'Omborxona',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name) => <span className="text-xs font-medium">{name}</span>,
    },
    {
      title: 'Xomashyolar',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 80,
      render: (count) => <span className="text-xs">{count}</span>,
    },
    {
      title: 'Mahsulotlar',
      dataIndex: 'totalProducts',
      key: 'totalProducts',
      width: 80,
      render: (count) => <span className="text-xs">{count}</span>,
    },
    {
      title: 'Jami qiymat',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 80,
      render: (value) => <span className="text-xs">${value.toFixed(2)}</span>,
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Xatolik"
        description={error}
        type="error"
        showIcon
        action={
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Qayta urinish
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Title level={2} className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl">
        {t('dashboard.title')}
      </Title>

      {/* Main Statistics */}
      <Row gutter={[8, 8]} className="mb-4 sm:mb-6">
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs sm:text-sm">{t('dashboard.totalUsers')}</span>}
              value={stats.totalUsers}
              prefix={<UserOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#3f8600', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs sm:text-sm">{t('dashboard.totalItems')}</span>}
              value={stats.totalItems}
              prefix={<BoxPlotOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#cf1322', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs sm:text-sm">{t('dashboard.totalProducts')}</span>}
              value={stats.totalProducts}
              prefix={<ShoppingCartOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#1890ff', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs sm:text-sm">{t('dashboard.totalClients')}</span>}
              value={stats.totalClients}
              prefix={<TeamOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#722ed1', fontSize: '16px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Transaction Statistics */}
      <Row gutter={[8, 8]} className="mb-4 sm:mb-6">
        <Col xs={8} sm={8}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs sm:text-sm">Kirish tranzaksiyalari</span>}
              value={transactionStats.inboundCount}
              prefix={<InboxOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#52c41a', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs sm:text-sm">Chiqish tranzaksiyalari</span>}
              value={transactionStats.outboundCount}
              prefix={<SendOutlined className="text-sm sm:text-base" />}
              valueStyle={{ color: '#ff4d4f', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs sm:text-sm">Jami qiymat</span>}
              value={transactionStats.totalValue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#1890ff', fontSize: '14px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Row gutter={[8, 8]}>
        <Col xs={24} lg={12}>
          <Card title={<span className="text-sm sm:text-base">{t('dashboard.statistics')}</span>} className="h-full">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<span className="text-sm sm:text-base">Tranzaksiya turlari</span>} className="h-full">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={transactionChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-4 sm:mt-6">
        <Col xs={24} lg={12}>
          <Card title={<span className="text-sm sm:text-base">{t('dashboard.recentActivity')}</span>}>
            <Table
              columns={recentActivityColumns}
              dataSource={stats.recentTransactions}
              pagination={false}
              size="small"
              rowKey="transactionId"
              scroll={{ x: 400 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<span className="text-sm sm:text-base">Omborxona statistikasi</span>}>
            <Table
              columns={warehouseColumns}
              dataSource={warehouseStats}
              pagination={false}
              size="small"
              rowKey="warehouseId"
              scroll={{ x: 350 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Monthly Transaction Chart */}
      {transactionStats.monthlyData.length > 0 && (
        <Row className="mt-4 sm:mt-6">
          <Col span={24}>
            <Card title={<span className="text-sm sm:text-base">Oylik tranzaksiya statistikasi</span>}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionStats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="inbound" fill="#52c41a" name="Kirish" />
                  <Bar dataKey="outbound" fill="#ff4d4f" name="Chiqish" />
                  <Bar dataKey="production" fill="#1890ff" name="Ishlab chiqarish" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;