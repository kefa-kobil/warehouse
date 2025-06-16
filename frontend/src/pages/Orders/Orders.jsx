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
      width: 120,
      render: (text) => <span className="text-xs font-medium">{text}</span>,
    },
    {
      title: 'Ta\'minlovchi',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: 'Omborxona',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      width: 100,
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 100,
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
        return <Tag color={colors[status]} className="text-xs">{labels[status]}</Tag>;
      },
    },
    {
      title: 'Buyurtma sanasi',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 100,
      render: (date) => <span className="text-xs">{dayjs(date).format('DD.MM.YYYY')}</span>,
    },
    {
      title: 'Qabul sanasi',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 100,
      render: (date) => <span className="text-xs">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>,
    },
    {
      title: 'Jami summa',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 80,
      render: (amount) => <span className="text-xs font-medium">${amount || 0}</span>,
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {record.status === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirm(record.orderId)}
              className="text-xs"
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
              className="text-xs"
            >
              Qabul qilish
            </Button>
          )}
          <Button
            size="small"
            onClick={() => handleViewItems(record)}
            className="text-xs"
          >
            Xomashyolar
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-xs"
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
                className="text-xs"
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
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: 'Buyurtma miqdori',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: 'Qabul qilingan',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: 'Birlik narxi',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => <span className="text-xs">${price}</span>,
    },
    {
      title: 'Jami narx',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => <span className="text-xs font-medium">${price}</span>,
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
            className="text-xs"
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
              className="text-xs"
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
      console.error('Ma\'lumotlarni yuklashda xatolik:', error);
      message.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
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
        message.success('Buyurtma muvaffaqiyatli yangilandi');
      } else {
        await orderService.create(payload);
        message.success('Buyurtma muvaffaqiyatli yaratildi');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Buyurtmani saqlashda xatolik:', error);
      message.error('Buyurtmani saqlashda xatolik yuz berdi');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await orderService.confirm(id);
      message.success('Buyurtma tasdiqlandi');
      fetchData();
    } catch (error) {
      console.error('Buyurtmani tasdiqlashda xatolik:', error);
      message.error(error.response?.data?.message || 'Buyurtmani tasdiqlashda xatolik yuz berdi');
    }
  };

  const handleReceive = async (id) => {
    try {
      await orderService.receive(id);
      message.success('Buyurtma qabul qilindi va omborga qo\'shildi');
      fetchData();
    } catch (error) {
      console.error('Buyurtmani qabul qilishda xatolik:', error);
      message.error(error.response?.data?.message || 'Buyurtmani qabul qilishda xatolik yuz berdi');
    }
  };

  const handleCancel = async (id) => {
    try {
      await orderService.cancel(id);
      message.success('Buyurtma bekor qilindi');
      fetchData();
    } catch (error) {
      console.error('Buyurtmani bekor qilishda xatolik:', error);
      message.error('Buyurtmani bekor qilishda xatolik yuz berdi');
    }
  };

  const handleViewItems = async (order) => {
    setSelectedOrder(order);
    try {
      const items = await orderService.getItems(order.orderId);
      setOrderItems(items);
      setItemsModalVisible(true);
    } catch (error) {
      console.error('Buyurtma xomashyolarini yuklashda xatolik:', error);
      message.error('Buyurtma xomashyolarini yuklashda xatolik yuz berdi');
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
        message.success('Xomashyo muvaffaqiyatli yangilandi');
      } else {
        await orderService.addItem(selectedOrder.orderId, payload);
        message.success('Xomashyo muvaffaqiyatli qo\'shildi');
      }

      const updatedItems = await orderService.getItems(selectedOrder.orderId);
      setOrderItems(updatedItems);
      itemForm.resetFields();
    } catch (error) {
      console.error('Xomashyoni saqlashda xatolik:', error);
      message.error('Xomashyoni saqlashda xatolik yuz berdi');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await orderService.removeItem(itemId);
      message.success('Xomashyo o\'chirildi');
      const updatedItems = await orderService.getItems(selectedOrder.orderId);
      setOrderItems(updatedItems);
    } catch (error) {
      console.error('Xomashyoni o\'chirishda xatolik:', error);
      message.error('Xomashyoni o\'chirishda xatolik yuz berdi');
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
      console.error('Ommaviy qo\'shishda xatolik:', error);
      message.error('Ommaviy qo\'shishda xatolik yuz berdi');
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <Title level={2} className="mb-0 text-lg sm:text-xl md:text-2xl">Buyurtmalar</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="small"
          className="w-full sm:w-auto"
        >
          Yangi buyurtma
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[8, 8]} className="mb-4 sm:mb-6">
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs">Kutilayotgan</span>}
              value={stats.pendingCount}
              prefix={<ClockCircleOutlined className="text-sm" />}
              valueStyle={{ color: '#fa8c16', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs">Tasdiqlangan</span>}
              value={stats.confirmedCount}
              prefix={<CheckCircleOutlined className="text-sm" />}
              valueStyle={{ color: '#1890ff', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs">Qabul qilingan</span>}
              value={stats.receivedCount}
              prefix={<InboxOutlined className="text-sm" />}
              valueStyle={{ color: '#52c41a', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs">Jami summa</span>}
              value={stats.totalAmount}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#722ed1', fontSize: '16px' }}
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
          scroll={{ x: 800 }}
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            responsive: true,
          }}
        />
      </Card>

      {/* Order Modal */}
      <Modal
        title={editingOrder ? 'Buyurtmani tahrirlash' : 'Yangi buyurtma'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="95%"
        style={{ maxWidth: 700 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={[8, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="supplier"
                label="Ta'minlovchi"
                rules={[{ required: true, message: 'Ta\'minlovchini kiriting' }]}
              >
                <Input placeholder="Ta'minlovchi nomini kiriting" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
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

          <Row gutter={[8, 0]}>
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
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

          <Row gutter={[8, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="orderDate"
                label="Buyurtma sanasi"
                rules={[{ required: true, message: 'Sanani tanlang' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
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
        width="95%"
        style={{ maxWidth: 1200 }}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Xomashyolar ro'yxati" key="1">
            <div className="mb-4 flex flex-col sm:flex-row justify-between gap-2">
              <Space wrap>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  size="small"
                >
                  Bitta qo'shish
                </Button>
                <Button
                  type="primary"
                  icon={<AppstoreAddOutlined />}
                  onClick={handleBulkAdd}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  size="small"
                >
                  Ommaviy qo'shish
                </Button>
              </Space>
              <Text type="secondary" className="text-xs">
                Jami: {orderItems.length} ta xomashyo
              </Text>
            </div>
            <Table
              columns={itemColumns}
              dataSource={orderItems}
              rowKey="orderItemId"
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
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

              <Row gutter={[8, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="orderedQuantity"
                    label="Buyurtma miqdori"
                    rules={[{ required: true, message: 'Buyurtma miqdorini kiriting' }]}
                  >
                    <InputNumber min={0.001} step={0.001} className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
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
        width="95%"
        style={{ maxWidth: 1000 }}
      >
        <div className="mb-4">
          <Text type="secondary" className="text-xs">
            Bir vaqtda ko'plab xomashyolarni buyurtmaga qo'shish uchun quyidagi jadvalni to'ldiring
          </Text>
        </div>

        <div className="space-y-4">
          {bulkItems.map((item, index) => (
            <Card key={index} size="small" className="border-dashed">
              <Row gutter={[8, 8]} align="middle">
                <Col xs={24} sm={10}>
                  <Select
                    placeholder="Xomashyoni tanlang"
                    value={item.itemId}
                    onChange={(value) => updateBulkItem(index, 'itemId', value)}
                    className="w-full"
                    showSearch
                    size="small"
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
                <Col xs={12} sm={4}>
                  <InputNumber
                    placeholder="Miqdor"
                    value={item.orderedQuantity}
                    onChange={(value) => updateBulkItem(index, 'orderedQuantity', value)}
                    min={0.001}
                    step={0.001}
                    className="w-full"
                    size="small"
                  />
                </Col>
                <Col xs={12} sm={4}>
                  <InputNumber
                    placeholder="Birlik narxi"
                    value={item.unitPrice}
                    onChange={(value) => updateBulkItem(index, 'unitPrice', value)}
                    min={0}
                    step={0.01}
                    className="w-full"
                    size="small"
                  />
                </Col>
                <Col xs={12} sm={4}>
                  <Text strong className="text-xs">
                    ${((item.orderedQuantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                  </Text>
                </Col>
                <Col xs={12} sm={2}>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeBulkItem(index)}
                    disabled={bulkItems.length === 1}
                    size="small"
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <Button
            type="dashed"
            icon={<PlusCircleOutlined />}
            onClick={addBulkItem}
            size="small"
          >
            Xomashyo qo'shish
          </Button>

          <div>
            <Text strong className="text-sm">
              Jami: ${bulkItems.reduce((sum, item) => 
                sum + ((item.orderedQuantity || 0) * (item.unitPrice || 0)), 0
              ).toFixed(2)}
            </Text>
          </div>
        </div>

        <Divider />

        <div className="flex justify-end space-x-2">
          <Button onClick={() => setBulkModalVisible(false)} size="small">
            Bekor qilish
          </Button>
          <Button type="primary" onClick={handleBulkSubmit} size="small">
            Barchasini saqlash
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;