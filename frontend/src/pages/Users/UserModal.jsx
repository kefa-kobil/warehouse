import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { userService } from '../../services/userService';

const { Option } = Select;

const UserModal = ({ visible, editingUser, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const roles = ['ADMIN', 'MENEJER', 'HR', 'ISHCHI', 'QOROVUL'];

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await userService.update(editingUser.userId, values);
        message.success('Foydalanuvchi muvaffaqiyatli yangilandi');
      } else {
        await userService.create(values);
        message.success('Foydalanuvchi muvaffaqiyatli yaratildi');
      }
      onSuccess();
    } catch (error) {
      message.error('Xatolik yuz berdi');
      console.error('Error saving user:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      if (editingUser) {
        form.setFieldsValue(editingUser);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingUser, form]);

  return (
    <Modal
      title={editingUser ? t('users.editUser') : t('users.addUser')}
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
        <Form.Item
          name="username"
          label={t('auth.username')}
          rules={[
            { required: true, message: t('common.required') },
            { min: 3, message: 'Foydalanuvchi nomi kamida 3 ta belgidan iborat bo\'lishi kerak' },
          ]}
        >
          <Input disabled={!!editingUser} placeholder="Foydalanuvchi nomini kiriting" />
        </Form.Item>

        <Form.Item
          name="fullName"
          label={t('users.fullName')}
          rules={[{ required: true, message: t('common.required') }]}
        >
          <Input placeholder="To'liq ismni kiriting" />
        </Form.Item>

        <Form.Item
          name="email"
          label={t('users.email')}
          rules={[
            { required: true, message: t('common.required') },
            { type: 'email', message: 'Noto\'g\'ri email format' },
          ]}
        >
          <Input placeholder="Email manzilini kiriting" />
        </Form.Item>

        {!editingUser && (
          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[
              { required: true, message: t('common.required') },
              { min: 6, message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' },
            ]}
          >
            <Input.Password placeholder="Parolni kiriting" />
          </Form.Item>
        )}

        <Form.Item
          name="tel"
          label={t('users.phone')}
        >
          <Input placeholder="Telefon raqamini kiriting" />
        </Form.Item>

        <Form.Item
          name="role"
          label={t('users.role')}
          rules={[{ required: true, message: t('common.required') }]}
        >
          <Select placeholder="Rolni tanlang">
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
          <Input placeholder="Telegram username" />
        </Form.Item>

        <Form.Item
          name="memo"
          label={t('users.memo')}
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

export default UserModal;