import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const ProductTable = ({ products, loading, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('common.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: t('products.productName'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('products.category'),
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (categoryName) => (
        <Tag color="blue">{categoryName}</Tag>
      ),
    },
    {
      title: t('products.warehouse'),
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      render: (warehouseName) => (
        <Tag color="green">{warehouseName}</Tag>
      ),
    },
    {
      title: t('products.unit'),
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
        <span className={quantity < 5 ? 'text-red-500 font-bold' : ''}>
          {quantity}
        </span>
      ),
    },
    {
      title: t('products.costPrice'),
      dataIndex: 'totalCostPrice',
      key: 'totalCostPrice',
      render: (price) => `$${price}`,
      sorter: (a, b) => a.totalCostPrice - b.totalCostPrice,
    },
    {
      title: t('products.salePrice'),
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (price) => `$${price}`,
      sorter: (a, b) => a.salePrice - b.salePrice,
    },
    {
      title: 'Foyda',
      key: 'profit',
      render: (_, record) => {
        const profit = record.salePrice - record.totalCostPrice;
        return (
          <span className={profit > 0 ? 'text-green-600 font-bold' : 'text-red-600'}>
            ${profit.toFixed(2)}
          </span>
        );
      },
      sorter: (a, b) => (a.salePrice - a.totalCostPrice) - (b.salePrice - b.totalCostPrice),
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
            title={t('products.deleteProduct')}
            description="Bu mahsulotni o'chirishni xohlaysizmi?"
            onConfirm={() => onDelete(record.productId)}
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
      dataSource={products}
      loading={loading}
      rowKey="productId"
      scroll={{ x: 1200 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} / ${total} ta mahsulot`,
      }}
    />
  );
};

export default ProductTable;