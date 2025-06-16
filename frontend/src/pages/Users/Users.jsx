import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { userService } from '../../services/userService';

const { Title } = Typography;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const roles = ['ADMIN', 'MENEJER', 'HR', 'ISHCHI', 'QOROVUL'];

  const columns = [
    {
      title: t('users.fullName'),
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: t('auth.username'),
      dataIndex: 'username',
      key: 'username',
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
      render: (role) => t(`users.roles.${role}`),
    },
    {
      title: t('common.status'),
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <span className={state === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>
          {state === 'ACTIVE' ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('users.deleteUser')}
            onConfirm={() => handleDelete(record.userId)}
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await userService.delete(id);
      message.success(t('common.success'));
      fetchUsers();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await userService.update(editingUser.userId, values);
      } else {
        await userService.create(values);
      }
      message.success(t('common.success'));
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('users.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('users.addUser')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="userId"
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingUser ? t('users.editUser') : t('users.addUser')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label={t('auth.username')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="fullName"
            label={t('users.fullName')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('users.email')}
            rules={[
              { required: true, message: t('common.required') },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label={t('auth.password')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="tel"
            label={t('users.phone')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label={t('users.role')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select>
              {roles.map(role => (
                <Option key={role} value={role}>
                  {t(`users.roles.${role}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="telegram"
            label={t('users.telegram')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="memo"
            label={t('users.memo')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('common.save')}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;