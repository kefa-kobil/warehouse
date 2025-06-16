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
  DatePicker,
  message,
  Popconfirm,
  Typography,
  Card,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Divider,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  StopOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { orderService } from '../../services/orderService';
import { warehouseService } from '../../services/warehouseService';
import { userService } from '../../services/userService';
import { itemService } from '../../services/itemService';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemsModalVisible, setItemsModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [bulkItems, setBulkItems] = useState([{ itemId: null, orderedQuantity: 0, unitPrice: 0 }]);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const orderStatuses = ['PENDING', 'CONFIRMED', 'RECEIVED', 'CANCELLED'];

  const columns = [
    {
      title: 'Buyurtma raqami',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
    },
    {
      title: 'Ta\'minlovchi',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
    },
    {
      title: 'Omborxona',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      width: 120,
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          PENDING: 'orange',
          CONFIRMED: 'blue',
          RECEIVED: 'green',
          CANCELLED: 'red'
        };
        const labels = {
          PENDING: 'Kutilmoqda',
          CONFIRMED: 'Tasdiqlangan',
          RECEIVED: 'Qabul qilingan',
          CANCELLED: 'Bekor qilingan'
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Buyurtma sanasi',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 140,
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Qabul sanasi',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 140,
      render: (date) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Jami summa',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => `$${amount || 0}`,
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirm(record.orderId)}
            >
              Tasdiqlash
            </Button>
          )}
          {record.status === 'CONFIRMED' && (
            <Button
              type="primary"
              size="small"
              icon={<InboxOutlined />}
              onClick={() => handleReceive(record.orderId)}
            >
              Qabul qilish
            </Button>
          )}
          <Button
            size="small"
            onClick={() => handleViewItems(record)}
          >
            Xomashyolar
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Tahrirlash
          </Button>
          {record.status !== 'RECEIVED' && (
            <Popconfirm
              title="Buyurtmani bekor qilish"
              onConfirm={() => handleCancel(record.orderId)}
              okText="Ha"
              cancelText="Yo'q"
            >
              <Button
                danger
                size="small"
                icon={<StopOutlined />}
              >
                Bekor qilish
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns = [
    {
      title: 'Xomashyo',
      dataIndex: ['item', 'name'],
      key: 'item',
    },
    {
      title: 'Buyurtma miqdori',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
    },
    {
      title: 'Qabul qilingan',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
    },
    {
      title: 'Birlik narxi',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `$${price}`,
    },
    {
      title: 'Jami narx',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `$${price}`,
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Xomashyoni o'chirish"
            onConfirm={() => handleRemoveItem(record.orderItemId)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, warehousesData, usersData, itemsData] = await Promise.all([
        orderService.getAll(),
        warehouseService.getAll(),
        userService.getAll(),
        itemService.getAll(),
      ]);
      setOrders(ordersData);
      setWarehouses(warehousesData);
      setUsers(usersData);
      setItems(itemsData);
    } catch (error) {
      message.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOrder(null);
    form.resetFields();
    form.setFieldsValue({ 
      userId: user?.userId,
      orderDate: dayjs(),
      status: 'PENDING'
    });
    setModalVisible(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      ...order,
      orderDate: order.orderDate ? dayjs(order.orderDate) : null,
      receivedDate: order.receivedDate ? dayjs(order.receivedDate) : null,
      warehouseId: order.warehouse?.warehouseId,
      userId: order.user?.userId,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        orderDate: values.orderDate?.toISOString(),
        receivedDate: values.receivedDate?.toISOString(),
        warehouse: { warehouseId: values.warehouseId },
        user: { userId: values.userId },
      };
      
      if (editingOrder) {
        await orderService.update(editingOrder.orderId, payload);
      } else {
        await orderService.create(payload);
      }
      message.success('Muvaffaqiyatli saqlandi');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await orderService.confirm(id);
      message.success('Buyurtma tasdiqlandi');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleReceive = async (id) => {
    try {
      await orderService.receive(id);
      message.success('Buyurtma qabul qilindi va omborga qo\'shildi');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleCancel = async (id) => {
    try {
      await orderService.cancel(id);
      message.success('Buyurtma bekor qilindi');
      fetchData();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleViewItems = async (order) => {
    setSelectedOrder(order);
    try {
      const items = await orderService.getItems(order.orderId);
      setOrderItems(items);
      setItemsModalVisible(true);
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleAddItem = () => {
    itemForm.resetFields();
    itemForm.setFieldsValue({ editing: false });
  };

  const handleEditItem = (item) => {
    itemForm.setFieldsValue({
      ...item,
      itemId: item.item?.itemId,
      editing: true,
      editingId: item.orderItemId,
    });
  };

  const handleItemSubmit = async (values) => {
    try {
      const payload = {
        item: { itemId: values.itemId },
        orderedQuantity: values.orderedQuantity,
        unitPrice: values.unitPrice,
      };

      if (values.editing) {
        await orderService.updateItem(values.editingId, payload);
      } else {
        await orderService.addItem(selectedOrder.orderId, payload);
      }

      message.success('Muvaffaqiyatli saqlandi');
      const updatedItems = await orderService.getItems(selectedOrder.orderId);
      setOrderItems(updatedItems);
      itemForm.resetFields();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await orderService.removeItem(itemId);
      message.success('Xomashyo o\'chirildi');
      const updatedItems = await orderService.getItems(selectedOrder.orderId);
      setOrderItems(updatedItems);
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  // Bulk operations
  const handleBulkAdd = () => {
    setBulkItems([{ itemId: null, orderedQuantity: 0, unitPrice: 0 }]);
    setBulkModalVisible(true);
  };

  const addBulkItem = () => {
    setBulkItems([...bulkItems, { itemId: null, orderedQuantity: 0, unitPrice: 0 }]);
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
        item.itemId && item.orderedQuantity > 0 && item.unitPrice >= 0
      );

      if (validItems.length === 0) {
        message.error('Kamida bitta to\'liq ma\'lumot kiriting');
        return;
      }

      const promises = validItems.map(item => 
        orderService.addItem(selectedOrder.orderId, {
          item: { itemId: item.itemId },
          orderedQuantity: item.orderedQuantity,
          unitPrice: item.unitPrice,
        })
      );

      await Promise.all(promises);
      message.success(`${validItems.length} ta xomashyo muvaffaqiyatli qo'shildi`);
      setBulkModalVisible(false);
      
      // Refresh order items
      const updatedItems = await orderService.getItems(selectedOrder.orderId);
      setOrderItems(updatedItems);
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const getStats = () => {
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
    const receivedCount = orders.filter(o => o.status === 'RECEIVED').length;
    const totalAmount = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

    return { pendingCount, confirmedCount, receivedCount, totalAmount };
  };

  const stats = getStats();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Buyurtmalar</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Yangi buyurtma
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kutilayotgan"
              value={stats.pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tasdiqlangan"
              value={stats.confirmedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Qabul qilingan"
              value={stats.receivedCount}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jami summa"
              value={stats.totalAmount}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="orderId"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          }}
        />
      </Card>

      {/* Order Modal */}
      <Modal
        title={editingOrder ? 'Buyurtmani tahrirlash' : 'Yangi buyurtma'}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Ta'minlovchi"
                rules={[{ required: true, message: 'Ta\'minlovchini kiriting' }]}
              >
                <Input placeholder="Ta'minlovchi nomini kiriting" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warehouseId"
                label="Omborxona"
                rules={[{ required: true, message: 'Omborxonani tanlang' }]}
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="Mas'ul shaxs"
                rules={[{ required: true, message: 'Mas\'ul shaxsni tanlang' }]}
              >
                <Select placeholder="Mas'ul shaxsni tanlang">
                  {users.map(user => (
                    <Option key={user.userId} value={user.userId}>
                      {user.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Holat"
                rules={[{ required: true, message: 'Holatni tanlang' }]}
              >
                <Select>
                  {orderStatuses.map(status => (
                    <Option key={status} value={status}>
                      {status === 'PENDING' ? 'Kutilmoqda' :
                       status === 'CONFIRMED' ? 'Tasdiqlangan' :
                       status === 'RECEIVED' ? 'Qabul qilingan' : 'Bekor qilingan'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderDate"
                label="Buyurtma sanasi"
                rules={[{ required: true, message: 'Sanani tanlang' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receivedDate"
                label="Qabul sanasi"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Izoh"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Saqlash
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Items Modal */}
      <Modal
        title={`Buyurtma xomashyolari - ${selectedOrder?.orderNumber}`}
        open={itemsModalVisible}
        onCancel={() => setItemsModalVisible(false)}
        footer={null}
        width={1200}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Xomashyolar ro'yxati" key="1">
            <div className="mb-4 flex justify-between">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                >
                  Bitta qo'shish
                </Button>
                <Button
                  type="primary"
                  icon={<AppstoreAddOutlined />}
                  onClick={handleBulkAdd}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Ommaviy qo'shish
                </Button>
              </Space>
              <Text type="secondary">
                Jami: {orderItems.length} ta xomashyo
              </Text>
            </div>
            <Table
              columns={itemColumns}
              dataSource={orderItems}
              rowKey="orderItemId"
              pagination={false}
              size="small"
            />
          </TabPane>
          <TabPane tab="Bitta xomashyo qo'shish" key="2">
            <Form
              form={itemForm}
              layout="vertical"
              onFinish={handleItemSubmit}
            >
              <Form.Item name="editing" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="editingId" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="itemId"
                label="Xomashyo"
                rules={[{ required: true, message: 'Xomashyoni tanlang' }]}
              >
                <Select placeholder="Xomashyoni tanlang" showSearch>
                  {items.map(item => (
                    <Option key={item.itemId} value={item.itemId}>
                      {item.name} ({item.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="orderedQuantity"
                    label="Buyurtma miqdori"
                    rules={[{ required: true, message: 'Buyurtma miqdorini kiriting' }]}
                  >
                    <InputNumber min={0.001} step={0.001} className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="unitPrice"
                    label="Birlik narxi"
                    rules={[{ required: true, message: 'Birlik narxini kiriting' }]}
                  >
                    <InputNumber min={0} step={0.01} className="w-full" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Saqlash
                  </Button>
                  <Button onClick={() => itemForm.resetFields()}>
                    Tozalash
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        title="Xomashyolarni ommaviy qo'shish"
        open={bulkModalVisible}
        onCancel={() => setBulkModalVisible(false)}
        footer={null}
        width={1000}
      >
        <div className="mb-4">
          <Text type="secondary">
            Bir vaqtda ko'plab xomashyolarni buyurtmaga qo'shish uchun quyidagi jadvalni to'ldiring
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
                    value={item.orderedQuantity}
                    onChange={(value) => updateBulkItem(index, 'orderedQuantity', value)}
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
                    ${((item.orderedQuantity || 0) * (item.unitPrice || 0)).toFixed(2)}
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
                sum + ((item.orderedQuantity || 0) * (item.unitPrice || 0)), 0
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

export default Orders;