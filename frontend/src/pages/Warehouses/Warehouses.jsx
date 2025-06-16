import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Typography,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { warehouseService } from '../../services/warehouseService';

const { Title } = Typography;

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const columns = [
    {
      title: t('warehouses.warehouseName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('warehouses.location'),
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: t('warehouses.manager'),
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
            title={t('warehouses.deleteWarehouse')}
            onConfirm={() => handleDelete(record.warehouseId)}
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

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getAll();
      setWarehouses(data);
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingWarehouse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    form.setFieldsValue(warehouse);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await warehouseService.delete(id);
      message.success(t('common.success'));
      fetchWarehouses();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingWarehouse) {
        await warehouseService.update(editingWarehouse.warehouseId, values);
      } else {
        await warehouseService.create(values);
      }
      message.success(t('common.success'));
      setModalVisible(false);
      fetchWarehouses();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('warehouses.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('warehouses.addWarehouse')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={warehouses}
          loading={loading}
          rowKey="warehouseId"
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingWarehouse ? t('warehouses.editWarehouse') : t('warehouses.addWarehouse')}
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
            label={t('warehouses.warehouseName')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="location"
            label={t('warehouses.location')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="manager"
            label={t('warehouses.manager')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('common.description')}
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

export default Warehouses;