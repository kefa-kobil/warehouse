import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const ItemTable = ({ items, loading, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('common.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: t('items.itemName'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('items.category'),
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (categoryName) => (
        <Tag color="blue">{categoryName}</Tag>
      ),
    },
    {
      title: t('items.warehouse'),
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      render: (warehouseName) => (
        <Tag color="green">{warehouseName}</Tag>
      ),
    },
    {
      title: t('items.unit'),
      dataIndex: ['unit', 'name'],
      key: 'unit',
      render: (unitName) => (
        <Tag color="orange">{unitName}</Tag>
      ),
    },
    {
      title: t('common.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity) => (
        <span className={quantity < 10 ? 'text-red-500 font-bold' : ''}>
          {quantity}
        </span>
      ),
    },
    {
      title: t('common.price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price}`,
      sorter: (a, b) => a.price - b.price,
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
            title={t('items.deleteItem')}
            description="Bu xomashyoni o'chirishni xohlaysizmi?"
            onConfirm={() => onDelete(record.itemId)}
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
      dataSource={items}
      loading={loading}
      rowKey="itemId"
      scroll={{ x: 1000 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} / ${total} ta xomashyo`,
      }}
    />
  );
};

export default ItemTable;