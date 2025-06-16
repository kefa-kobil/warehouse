import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const ClientTable = ({ clients, loading, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('clients.clientName'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('clients.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('clients.phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('clients.address'),
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: t('clients.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'CORPORATE' ? 'blue' : 'green'}>
          {t(`clients.types.${type}`)}
        </Tag>
      ),
      filters: [
        { text: t('clients.types.CORPORATE'), value: 'CORPORATE' },
        { text: t('clients.types.RETAIL'), value: 'RETAIL' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: t('clients.totalOrders'),
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: t('clients.totalValue'),
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value) => `$${value}`,
      sorter: (a, b) => a.totalValue - b.totalValue,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('clients.deleteClient')}
            description="Bu mijozni o'chirishni xohlaysizmi?"
            onConfirm={() => onDelete(record.clientId)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={clients}
      loading={loading}
      rowKey="clientId"
      scroll={{ x: 1000 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} / ${total} ta mijoz`,
      }}
    />
  );
};

export default ClientTable;