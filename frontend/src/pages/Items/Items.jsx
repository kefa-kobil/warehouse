import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Typography,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { itemService } from '../../services/itemService';
import { categoryService } from '../../services/categoryService';
import { warehouseService } from '../../services/warehouseService';
import { unitService } from '../../services/unitService';

const { Title } = Typography;
const { Option } = Select;

const Items = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const columns = [
    {
      title: t('common.code'),
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: t('items.itemName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('items.category'),
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: t('items.warehouse'),
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
    },
    {
      title: t('items.unit'),
      dataIndex: ['unit', 'name'],
      key: 'unit',
    },
    {
      title: t('common.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('common.price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price}`,
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
            title={t('items.deleteItem')}
            onConfirm={() => handleDelete(record.itemId)}
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData, warehousesData, unitsData] = await Promise.all([
        itemService.getAll(),
        categoryService.getAll(),
        warehouseService.getAll(),
        unitService.getAll(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
      setWarehouses(warehousesData);
      setUnits(unitsData);
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      categoryId: item.category?.categoryId,
      warehouseId: item.warehouse?.warehouseId,
      unitId: item.unit?.unitId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await itemService.delete(id);
      message.success(t('common.success'));
      fetchData();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        category: { categoryId: values.categoryId },
        warehouse: { warehouseId: values.warehouseId },
        unit: { unitId: values.unitId },
      };
      
      if (editingItem) {
        await itemService.update(editingItem.itemId, payload);
      } else {
        await itemService.create(payload);
      }
      message.success(t('common.success'));
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('items.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('items.addItem')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="itemId"
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingItem ? t('items.editItem') : t('items.addItem')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="code"
            label={t('common.code')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label={t('items.itemName')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label={t('items.category')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select>
              {categories.map(category => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="warehouseId"
            label={t('items.warehouse')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select>
              {warehouses.map(warehouse => (
                <Option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                  {warehouse.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unitId"
            label={t('items.unit')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select>
              {units.map(unit => (
                <Option key={unit.unitId} value={unit.unitId}>
                  {unit.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={t('common.quantity')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="price"
            label={t('common.price')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <InputNumber min={0} step={0.01} className="w-full" />
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

export default Items;