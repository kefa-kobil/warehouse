import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Avatar,
  Divider,
  Table,
  Select,
  InputNumber,
  Tabs,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ShopOutlined,
  InboxOutlined,
  SendOutlined,
  BarChartOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { warehouseService } from '../../services/warehouseService';
import { itemService } from '../../services/itemService';
import { transactionService } from '../../services/transactionService';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [bulkItems, setBulkItems] = useState([{ itemId: null, quantity: 0, unitPrice: 0 }]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [warehousesData, itemsData] = await Promise.all([
        warehouseService.getAll(),
        itemService.getAll(),
      ]);
      setWarehouses(warehousesData);
      setItems(itemsData);
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
      fetchData();
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
      fetchData();
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const handleBulkInbound = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setBulkItems([{ itemId: null, quantity: 0, unitPrice: 0 }]);
    bulkForm.resetFields();
    setBulkModalVisible(true);
  };

  const addBulkItem = () => {
    setBulkItems([...bulkItems, { itemId: null, quantity: 0, unitPrice: 0 }]);
  };

  const removeBulkItem = (index) => {
    if (bulkItems.length > 1) {
      const newItems = bulkItems.filter((_, i) => i !== index);
      setBulkItems(newItems);
    }
  };

  const updateBulkItem = (index, field, value) => {
    const newItems = [...bulkItems];
    newItems[index][field] = value;
    setBulkItems(newItems);
  };

  const handleBulkSubmit = async () => {
    try {
      const validItems = bulkItems.filter(item => 
        item.itemId && item.quantity > 0 && item.unitPrice >= 0
      );

      if (validItems.length === 0) {
        message.error('Kamida bitta to\'liq ma\'lumot kiriting');
        return;
      }

      const promises = validItems.map(item => 
        transactionService.createItemInbound({
          itemId: item.itemId,
          warehouseId: selectedWarehouse.warehouseId,
          userId: user.userId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: `Ommaviy kirish - ${selectedWarehouse.name}`,
        })
      );

      await Promise.all(promises);
      message.success(`${validItems.length} ta xomashyo muvaffaqiyatli qo'shildi`);
      setBulkModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const getWarehouseStats = (warehouse) => {
    const warehouseItems = items.filter(item => 
      item.warehouse?.warehouseId === warehouse.warehouseId
    );
    
    const totalItems = warehouseItems.length;
    const totalQuantity = warehouseItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = warehouseItems.reduce((sum, item) => 
      sum + ((item.quantity || 0) * (item.price || 0)), 0
    );

    return { totalItems, totalQuantity, totalValue };
  };

  useEffect(() => {
    fetchData();
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

      <Row gutter={[16, 16]}>
        {warehouses.map(warehouse => {
          const stats = getWarehouseStats(warehouse);
          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={warehouse.warehouseId}>
              <Card
                hoverable
                className="h-full"
                actions={[
                  <Button
                    type="text"
                    icon={<InboxOutlined />}
                    onClick={() => handleBulkInbound(warehouse)}
                    title="Ommaviy kirish"
                  >
                    Kirish
                  </Button>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(warehouse)}
                    title="Tahrirlash"
                  >
                    Tahrirlash
                  </Button>,
                  <Popconfirm
                    title={t('warehouses.deleteWarehouse')}
                    onConfirm={() => handleDelete(warehouse.warehouseId)}
                    okText={t('common.yes')}
                    cancelText={t('common.no')}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      title="O'chirish"
                    >
                      O'chirish
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className="text-center mb-4">
                  <Avatar 
                    size={64} 
                    icon={<ShopOutlined />} 
                    className="bg-blue-500 mb-3"
                  />
                  <Title level={4} className="mb-1">{warehouse.name}</Title>
                  <Text type="secondary">{warehouse.location}</Text>
                </div>

                <Divider />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text>Menejer:</Text>
                    <Text strong>{warehouse.manager}</Text>
                  </div>
                  
                  <Row gutter={8}>
                    <Col span={12}>
                      <Statistic
                        title="Xomashyolar"
                        value={stats.totalItems}
                        prefix={<BarChartOutlined />}
                        valueStyle={{ fontSize: '16px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Jami miqdor"
                        value={stats.totalQuantity}
                        valueStyle={{ fontSize: '16px' }}
                      />
                    </Col>
                  </Row>

                  <Statistic
                    title="Jami qiymat"
                    value={stats.totalValue}
                    prefix="$"
                    precision={2}
                    valueStyle={{ fontSize: '16px', color: '#3f8600' }}
                  />

                  {warehouse.description && (
                    <>
                      <Divider />
                      <Text type="secondary" className="text-sm">
                        {warehouse.description}
                      </Text>
                    </>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Warehouse Add/Edit Modal */}
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

      {/* Bulk Inbound Modal */}
      <Modal
        title={`Ommaviy kirish - ${selectedWarehouse?.name}`}
        open={bulkModalVisible}
        onCancel={() => setBulkModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="mb-4">
          <Text type="secondary">
            Bir vaqtda ko'plab xomashyolarni omborga qo'shish uchun quyidagi jadvalni to'ldiring
          </Text>
        </div>

        <div className="space-y-4">
          {bulkItems.map((item, index) => (
            <Card key={index} size="small" className="border-dashed">
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Select
                    placeholder="Xomashyoni tanlang"
                    value={item.itemId}
                    onChange={(value) => updateBulkItem(index, 'itemId', value)}
                    className="w-full"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {items.map(itemOption => (
                      <Option key={itemOption.itemId} value={itemOption.itemId}>
                        {itemOption.name} ({itemOption.code})
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={5}>
                  <InputNumber
                    placeholder="Miqdor"
                    value={item.quantity}
                    onChange={(value) => updateBulkItem(index, 'quantity', value)}
                    min={0.001}
                    step={0.001}
                    className="w-full"
                  />
                </Col>
                <Col span={5}>
                  <InputNumber
                    placeholder="Birlik narxi"
                    value={item.unitPrice}
                    onChange={(value) => updateBulkItem(index, 'unitPrice', value)}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                </Col>
                <Col span={4}>
                  <Text strong>
                    ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                  </Text>
                </Col>
                <Col span={2}>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeBulkItem(index)}
                    disabled={bulkItems.length === 1}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Button
            type="dashed"
            icon={<PlusCircleOutlined />}
            onClick={addBulkItem}
          >
            Xomashyo qo'shish
          </Button>

          <div>
            <Text strong className="mr-4">
              Jami: ${bulkItems.reduce((sum, item) => 
                sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0
              ).toFixed(2)}
            </Text>
          </div>
        </div>

        <Divider />

        <div className="flex justify-end space-x-2">
          <Button onClick={() => setBulkModalVisible(false)}>
            Bekor qilish
          </Button>
          <Button type="primary" onClick={handleBulkSubmit}>
            Barchasini saqlash
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Warehouses;