import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, message, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/productService';

const { Option } = Select;

const ProductModal = ({ visible, editingProduct, categories, warehouses, units, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

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
        message.success('Mahsulot muvaffaqiyatli yangilandi');
      } else {
        await productService.create(payload);
        message.success('Mahsulot muvaffaqiyatli yaratildi');
      }
      onSuccess();
    } catch (error) {
      message.error('Xatolik yuz berdi');
      console.error('Error saving product:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      if (editingProduct) {
        form.setFieldsValue({
          ...editingProduct,
          categoryId: editingProduct.category?.categoryId,
          warehouseId: editingProduct.warehouse?.warehouseId,
          unitId: editingProduct.unit?.unitId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingProduct, form]);

  return (
    <Modal
      title={editingProduct ? t('products.editProduct') : t('products.addProduct')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label={t('common.code')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input placeholder="Mahsulot kodini kiriting" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label={t('products.productName')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input placeholder="Mahsulot nomini kiriting" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="categoryId"
              label={t('products.category')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Select placeholder="Kategoriyani tanlang">
                {categories.map(category => (
                  <Option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="warehouseId"
              label={t('products.warehouse')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Select placeholder="Omborxonani tanlang">
                {warehouses.map(warehouse => (
                  <Option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                    {warehouse.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="unitId"
              label={t('products.unit')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Select placeholder="O'lchov birligini tanlang">
                {units.map(unit => (
                  <Option key={unit.unitId} value={unit.unitId}>
                    {unit.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="quantity"
              label={t('common.quantity')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <InputNumber min={0} step={0.001} className="w-full" placeholder="Miqdorni kiriting" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="totalCostPrice"
              label={t('products.costPrice')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <InputNumber min={0} step={0.01} className="w-full" placeholder="Tan narxini kiriting" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="salePrice"
              label={t('products.salePrice')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <InputNumber min={0} step={0.01} className="w-full" placeholder="Sotuv narxini kiriting" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={t('common.description')}
        >
          <Input.TextArea rows={3} placeholder="Qo'shimcha ma'lumot" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {t('common.save')}
            </Button>
            <Button onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductModal;