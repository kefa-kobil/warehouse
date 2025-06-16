import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const UserTable = ({ users, loading, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('users.fullName'),
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: t('auth.username'),
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: t('users.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('users.phone'),
      dataIndex: 'tel',
      key: 'tel',
    },
    {
      title: t('users.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color="blue">{t(`users.roles.${role}`)}</Tag>
      ),
      filters: [
        { text: t('users.roles.ADMIN'), value: 'ADMIN' },
        { text: t('users.roles.MENEJER'), value: 'MENEJER' },
        { text: t('users.roles.HR'), value: 'HR' },
        { text: t('users.roles.ISHCHI'), value: 'ISHCHI' },
        { text: t('users.roles.QOROVUL'), value: 'QOROVUL' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: t('common.status'),
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Tag color={state === 'ACTIVE' ? 'green' : 'red'}>
          {state === 'ACTIVE' ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
      filters: [
        { text: t('common.active'), value: 'ACTIVE' },
        { text: t('common.inactive'), value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.state === value,
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
            title={t('users.deleteUser')}
            description="Bu foydalanuvchini o'chirishni xohlaysizmi?"
            onConfirm={() => onDelete(record.userId)}
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
      dataSource={users}
      loading={loading}
      rowKey="userId"
      scroll={{ x: 800 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} / ${total} ta foydalanuvchi`,
      }}
    />
  );
};

export default UserTable;