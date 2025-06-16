import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../../services/categoryService';

const CategoryModal = ({ visible, editingCategory, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.categoryId, values);
        message.success('Kategoriya muvaffaqiyatli yangilandi');
      } else {
        await categoryService.create(values);
        message.success('Kategoriya muvaffaqiyatli yaratildi');
      }
      onSuccess();
    } catch (error) {
      message.error('Xatolik yuz berdi');
      console.error('Error saving category:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      if (editingCategory) {
        form.setFieldsValue(editingCategory);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingCategory, form]);

  return (
    <Modal
      title={editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label={t('categories.categoryName')}
          rules={[
            { required: true, message: t('common.required') },
            { min: 2, message: 'Kategoriya nomi kamida 2 ta belgidan iborat bo\'lishi kerak' },
            { max: 100, message: 'Kategoriya nomi 100 ta belgidan oshmasligi kerak' },
          ]}
        >
          <Input placeholder="Kategoriya nomini kiriting" />
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

export default CategoryModal;