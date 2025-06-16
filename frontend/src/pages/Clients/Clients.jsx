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
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { clientService } from '../../services/clientService';

const { Title } = Typography;
const { Option } = Select;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const clientTypes = ['CORPORATE', 'RETAIL'];

  const columns = [
    {
      title: t('clients.clientName'),
      dataIndex: 'name',
      key: 'name',
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
    },
    {
      title: t('clients.totalOrders'),
      dataIndex: 'totalOrders',
      key: 'totalOrders',
    },
    {
      title: t('clients.totalValue'),
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value) => `$${value}`,
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
            title={t('clients.deleteClient')}
            onConfirm={() => handleDelete(record.clientId)}
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

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    form.setFieldsValue(client);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await clientService.delete(id);
      message.success(t('common.success'));
      fetchClients();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingClient) {
        await clientService.update(editingClient.clientId, values);
      } else {
        await clientService.create(values);
      }
      message.success(t('common.success'));
      setModalVisible(false);
      fetchClients();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('clients.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('clients.addClient')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={clients}
          loading={loading}
          rowKey="clientId"
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingClient ? t('clients.editClient') : t('clients.addClient')}
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
            name="name"
            label={t('clients.clientName')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('clients.email')}
            rules={[
              { required: true, message: t('common.required') },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t('clients.phone')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label={t('clients.address')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="type"
            label={t('clients.type')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select>
              {clientTypes.map(type => (
                <Option key={type} value={type}>
                  {t(`clients.types.${type}`)}
                </Option>
              ))}
            </Select>
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

export default Clients;