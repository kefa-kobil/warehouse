import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag } from 'antd';
import { UserOutlined, BoxPlotOutlined, ShoppingCartOutlined, TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalProducts: 0,
    totalClients: 0,
  });

  const chartData = [
    { name: t('navigation.users'), value: stats.totalUsers },
    { name: t('navigation.items'), value: stats.totalItems },
    { name: t('navigation.products'), value: stats.totalProducts },
    { name: t('navigation.clients'), value: stats.totalClients },
  ];

  const recentActivities = [
    {
      key: '1',
      action: 'Yangi foydalanuvchi qo\'shildi',
      user: 'Admin',
      time: '2 daqiqa oldin',
      status: 'success',
    },
    {
      key: '2',
      action: 'Mahsulot yangilandi',
      user: 'Manager',
      time: '5 daqiqa oldin',
      status: 'info',
    },
    {
      key: '3',
      action: 'Xomashyo qo\'shildi',
      user: 'Worker',
      time: '10 daqiqa oldin',
      status: 'success',
    },
  ];

  const columns = [
    {
      title: 'Amal',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Foydalanuvchi',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Vaqt',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'blue'}>
          {status === 'success' ? 'Muvaffaqiyatli' : 'Ma\'lumot'}
        </Tag>
      ),
    },
  ];

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalUsers: 25,
      totalItems: 150,
      totalProducts: 75,
      totalClients: 40,
    });
  }, []);

  return (
    <div>
      <Title level={2} className="mb-6">
        {t('dashboard.title')}
      </Title>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalUsers')}
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalItems')}
              value={stats.totalItems}
              prefix={<BoxPlotOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalProducts')}
              value={stats.totalProducts}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalClients')}
              value={stats.totalClients}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.statistics')}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.recentActivity')}>
            <Table
              columns={columns}
              dataSource={recentActivities}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;