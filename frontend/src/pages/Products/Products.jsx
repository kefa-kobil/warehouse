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
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { warehouseService } from '../../services/warehouseService';
import { unitService } from '../../services/unitService';

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const columns = [
    {
      title: t('common.code'),
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: t('products.productName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('products.category'),
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: t('products.warehouse'),
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
    },
    {
      title: t('products.unit'),
      dataIndex: ['unit', 'name'],
      key: 'unit',
    },
    {
      title: t('common.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('products.costPrice'),
      dataIndex: 'totalCostPrice',
      key: 'totalCostPrice',
      render: (price) => `$${price}`,
    },
    {
      title: t('products.salePrice'),
      dataIndex: 'salePrice',
      key: 'salePrice',
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
            title={t('products.deleteProduct')}
            onConfirm={() => handleDelete(record.productId)}
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
      const [productsData, categoriesData, warehousesData, unitsData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        warehouseService.getAll(),
        unitService.getAll(),
      ]);
      setProducts(productsData);
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
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      categoryId: product.category?.categoryId,
      warehouseId: product.warehouse?.warehouseId,
      unitId: product.unit?.unitId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
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
      
      if (editingProduct) {
        await productService.update(editingProduct.productId, payload);
      } else {
        await productService.create(payload);
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
        <Title level={2}>{t('products.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('products.addProduct')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          rowKey="productId"
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingProduct ? t('products.editProduct') : t('products.addProduct')}
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
            label={t('products.productName')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label={t('products.category')}
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
            label={t('products.warehouse')}
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
            label={t('products.unit')}
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
            name="totalCostPrice"
            label={t('products.costPrice')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <InputNumber min={0} step={0.01} className="w-full" />
          </Form.Item>

          <Form.Item
            name="salePrice"
            label={t('products.salePrice')}
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

export default Products;