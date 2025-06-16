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
import { unitService } from '../../services/unitService';

const { Title } = Typography;

const Units = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const columns = [
    {
      title: t('units.unitName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
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
            title={t('units.deleteUnit')}
            onConfirm={() => handleDelete(record.unitId)}
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

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await unitService.getAll();
      setUnits(data);
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUnit(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    form.setFieldsValue(unit);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await unitService.delete(id);
      message.success(t('common.success'));
      fetchUnits();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUnit) {
        await unitService.update(editingUnit.unitId, values);
      } else {
        await unitService.create(values);
      }
      message.success(t('common.success'));
      setModalVisible(false);
      fetchUnits();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('units.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('units.addUnit')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={units}
          loading={loading}
          rowKey="unitId"
        />
      </Card>

      <Modal
        title={editingUnit ? t('units.editUnit') : t('units.addUnit')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label={t('units.unitName')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
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

export default Units;