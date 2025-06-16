import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { unitService } from '../../services/unitService';

const UnitModal = ({ visible, editingUnit, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleSubmit = async (values) => {
    try {
      if (editingUnit) {
        await unitService.update(editingUnit.unitId, values);
        message.success('O\'lchov birligi muvaffaqiyatli yangilandi');
      } else {
        await unitService.create(values);
        message.success('O\'lchov birligi muvaffaqiyatli yaratildi');
      }
      onSuccess();
    } catch (error) {
      message.error('Xatolik yuz berdi');
      console.error('Error saving unit:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      if (editingUnit) {
        form.setFieldsValue(editingUnit);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingUnit, form]);

  return (
    <Modal
      title={editingUnit ? t('units.editUnit') : t('units.addUnit')}
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
          label={t('units.unitName')}
          rules={[
            { required: true, message: t('common.required') },
            { min: 1, message: 'O\'lchov birligi nomi kamida 1 ta belgidan iborat bo\'lishi kerak' },
            { max: 50, message: 'O\'lchov birligi nomi 50 ta belgidan oshmasligi kerak' },
          ]}
        >
          <Input placeholder="O'lchov birligi nomini kiriting (masalan: kg, dona, litr)" />
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

export default UnitModal;