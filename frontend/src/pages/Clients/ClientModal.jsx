import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, message, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { clientService } from '../../services/clientService';

const { Option } = Select;

const ClientModal = ({ visible, editingClient, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const clientTypes = ['CORPORATE', 'RETAIL'];

  const handleSubmit = async (values) => {
    try {
      if (editingClient) {
        await clientService.update(editingClient.clientId, values);
        message.success('Mijoz muvaffaqiyatli yangilandi');
      } else {
        await clientService.create(values);
        message.success('Mijoz muvaffaqiyatli yaratildi');
      }
      onSuccess();
    } catch (error) {
      message.error('Xatolik yuz berdi');
      console.error('Error saving client:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      if (editingClient) {
        form.setFieldsValue(editingClient);
      } else {
        form.resetFields();
        form.setFieldsValue({ type: 'RETAIL' });
      }
    }
  }, [visible, editingClient, form]);

  return (
    <Modal
      title={editingClient ? t('clients.editClient') : t('clients.addClient')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
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
              name="name"
              label={t('clients.clientName')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input placeholder="Mijoz nomini kiriting" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label={t('clients.type')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Select placeholder="Mijoz turini tanlang">
                {clientTypes.map(type => (
                  <Option key={type} value={type}>
                    {t(`clients.types.${type}`)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label={t('clients.email')}
              rules={[
                { required: true, message: t('common.required') },
                { type: 'email', message: 'Noto\'g\'ri email format' },
              ]}
            >
              <Input placeholder="Email manzilini kiriting" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={t('clients.phone')}
            >
              <Input placeholder="Telefon raqamini kiriting" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label={t('clients.address')}
        >
          <Input.TextArea rows={3} placeholder="Manzilni kiriting" />
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

export default ClientModal;