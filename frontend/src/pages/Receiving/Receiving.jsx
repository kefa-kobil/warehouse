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
  Badge,
  Avatar,
  Drawer,
  Empty,
  Alert,
  Spin,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  EyeOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  AppstoreAddOutlined,
  WarningOutlined,
  DollarOutlined,
  CalendarOutlined,
  ReloadOutlined,
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

const Receiving = () => {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemsDrawerVisible, setItemsDrawerVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [bulkItems, setBulkItems] = useState([{ itemId: null, orderedQuantity: 0, unitPrice: 0 }]);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const columns = [
    {
      title: 'Buyurtma raqami',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      render: (text) => <Text code className="text-xs font-medium">{text || 'N/A'}</Text>,
    },
    {
      title: 'Ta\'minlovchi',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
      render: (text) => <Text className="text-xs">{text || 'Noma\'lum'}</Text>,
    },
    {
      title: 'Omborxona',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      width: 120,
      render: (text) => <Tag color="blue" className="text-xs">{text || 'N/A'}</Tag>,
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
        return <Tag color={colors[status]} className="text-xs">{labels[status] || status}</Tag>;
      },
    },
    {
      title: 'Buyurtma sanasi',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date) => (
        <Text className="text-xs">
          {date ? dayjs(date).format('DD.MM.YYYY') : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Qabul sanasi',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 120,
      render: (date) => (
        <Text className="text-xs">
          {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-'}
        </Text>
      ),
    },
    {
      title: 'Jami summa',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount) => (
        <Text className="text-xs font-medium text-green-600">
          {amount ? `${Number(amount).toLocaleString()} so'm` : '0 so\'m'}
        </Text>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewItems(record)}
            className="text-xs"
          >
            Ko'rish
          </Button>
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
              className="text-xs bg-green-500 border-green-500"
            >
              Qabul qilish
            </Button>
          )}
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-xs"
          >
            Tahrirlash
          </Button>
        </Space>
      ),
    },
  ];

  const itemColumns = [
    {
      title: 'Xomashyo',
      dataIndex: ['item', 'name'],
      key: 'item',
      render: (text, record) => (
        <div>
          <Text strong className="text-xs">{text || 'N/A'}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            Kod: {record.item?.code || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Buyurtma miqdori',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      width: 120,
      render: (text, record) => (
        <div className="text-center">
          <Text className="text-xs font-medium">{text || 0}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.item?.unit?.name || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Qabul qilingan',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      width: 120,
      render: (text, record) => (
        <div className="text-center">
          <Text className={`text-xs font-medium ${text > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {text || 0}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.item?.unit?.name || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Birlik narxi',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price) => (
        <Text className="text-xs font-medium">
          {price ? `${Number(price).toLocaleString()} so'm` : '0 so\'m'}
        </Text>
      ),
    },
    {
      title: 'Jami narx',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (price) => (
        <Text className="text-xs font-bold text-green-600">
          {price ? `${Number(price).toLocaleString()} so'm` : '0 so\'m'}
        </Text>
      ),
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
    setDataLoading(true);
    try {
      console.log('Fetching data...');
      
      const [ordersData, warehousesData, usersData, itemsData] = await Promise.all([
        orderService.getAll().catch(err => {
          console.error('Orders fetch error:', err);
          return [];
        }),
        warehouseService.getAll().catch(err => {
          console.error('Warehouses fetch error:', err);
          return [];
        }),
        userService.getAll().catch(err => {
          console.error('Users fetch error:', err);
          return [];
        }),
        itemService.getAll().catch(err => {
          console.error('Items fetch error:', err);
          return [];
        }),
      ]);
      
      console.log('Data fetched:', {
        orders: ordersData.length,
        warehouses: warehousesData.length,
        users: usersData.length,
        items: itemsData.length
      });
      
      setOrders(ordersData);
      setWarehouses(warehousesData);
      setUsers(usersData);
      setItems(itemsData);
      
      // Show warnings if data is empty
      if (warehousesData.length === 0) {
        message.warning('Omborxonalar ro\'yxati bo\'sh. Avval omborxona yarating.');
      }
      if (usersData.length === 0) {
        message.warning('Foydalanuvchilar ro\'yxati bo\'sh. Avval foydalanuvchi yarating.');
      }
      if (itemsData.length === 0) {
        message.warning('Xomashyolar ro\'yxati bo\'sh. Avval xomashyo yarating.');
      }
      
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error);
      message.error('Ma\'lumotlarni yuklashda xatolik yuz berdi: ' + error.message);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleAdd = () => {
    if (warehouses.length === 0) {
      message.error('Avval omborxona yarating!');
      return;
    }
    if (users.length === 0) {
      message.error('Avval foydalanuvchi yarating!');
      return;
    }
    
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
    setLoading(true);
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
      message.error('Buyurtmani saqlashda xatolik yuz berdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    setLoading(true);
    try {
      await orderService.confirm(id);
      message.success('Buyurtma tasdiqlandi');
      fetchData();
    } catch (error) {
      console.error('Buyurtmani tasdiqlashda xatolik:', error);
      message.error('Buyurtmani tasdiqlashda xatolik yuz berdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (id) => {
    setLoading(true);
    try {
      await orderService.receive(id);
      message.success('Buyurtma qabul qilindi va omborga qo\'shildi');
      fetchData();
    } catch (error) {
      console.error('Buyurtmani qabul qilishda xatolik:', error);
      message.error('Buyurtmani qabul qilishda xatolik yuz berdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewItems = async (order) => {
    setSelectedOrder(order);
    setLoading(true);
    try {
      const items = await orderService.getItems(order.orderId);
      setOrderItems(items);
      setItemsDrawerVisible(true);
    } catch (error) {
      console.error('Buyurtma xomashyolarini yuklashda xatolik:', error);
      message.error('Buyurtma xomashyolarini yuklashda xatolik yuz berdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (items.length === 0) {
      message.error('Avval xomashyo yarating!');
      return;
    }
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
    setLoading(true);
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
      message.error('Xomashyoni saqlashda xatolik yuz berdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setLoading(true);
    try {
      await orderService.removeItem(itemId);
      message.success('Xomashyo o\'chirildi');
      const updatedItems = await orderService.getItems(selectedOrder.orderId);
      setOrderItems(updatedItems);
    } catch (error) {
      console.error('Xomashyoni o\'chirishda xatolik:', error);
      message.error('Xomashyoni o\'chirishda xatolik yuz berdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const handleBulkAdd = () => {
    if (items.length === 0) {
      message.error('Avval xomashyo yarating!');
      return;
    }
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
    setLoading(true);
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
      message.error('Ommaviy qo\'shishda xatolik yuz berdi: ' + error.message);
    } finally {
      setLoading(false);
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

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" tip="Ma'lumotlar yuklanmoqda..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <Title level={2} className="mb-0 text-lg sm:text-xl md:text-2xl">
          <InboxOutlined className="mr-2" />
          Qabul qilish
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            size="small"
            loading={loading}
          >
            Yangilash
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="small"
            className="w-full sm:w-auto"
          >
            Yangi buyurtma
          </Button>
        </Space>
      </div>

      {/* Data Status Alerts */}
      {warehouses.length === 0 && (
        <Alert
          message="Omborxonalar yo'q"
          description="Buyurtma yaratish uchun avval omborxona yarating."
          type="warning"
          showIcon
          className="mb-4"
        />
      )}
      
      {users.length === 0 && (
        <Alert
          message="Foydalanuvchilar yo'q"
          description="Buyurtma yaratish uchun avval foydalanuvchi yarating."
          type="warning"
          showIcon
          className="mb-4"
        />
      )}
      
      {items.length === 0 && (
        <Alert
          message="Xomashyolar yo'q"
          description="Buyurtmaga xomashyo qo'shish uchun avval xomashyo yarating."
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

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
              suffix="so'm"
              precision={0}
              valueStyle={{ color: '#722ed1', fontSize: '16px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {orders.length === 0 ? (
          <Empty 
            description="Hozircha buyurtmalar yo'q"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
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
            rowClassName={(record) => {
              if (record.status === 'PENDING') return 'bg-orange-50';
              if (record.status === 'CONFIRMED') return 'bg-blue-50';
              if (record.status === 'RECEIVED') return 'bg-green-50';
              return '';
            }}
          />
        )}
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
                name="orderDate"
                label="Buyurtma sanasi"
                rules={[{ required: true, message: 'Sanani tanlang' }]}
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
              <Button type="primary" htmlType="submit" size="small" loading={loading}>
                Saqlash
              </Button>
              <Button onClick={() => setModalVisible(false)} size="small">
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Items Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <ShoppingOutlined />
            <span className="text-sm">
              {selectedOrder?.orderNumber || 'N/A'} - {selectedOrder?.supplier || 'N/A'}
            </span>
            <Tag color={
              selectedOrder?.status === 'PENDING' ? 'orange' :
              selectedOrder?.status === 'CONFIRMED' ? 'blue' :
              selectedOrder?.status === 'RECEIVED' ? 'green' : 'red'
            } className="text-xs">
              {selectedOrder?.status === 'PENDING' ? 'Kutilmoqda' :
               selectedOrder?.status === 'CONFIRMED' ? 'Tasdiqlangan' :
               selectedOrder?.status === 'RECEIVED' ? 'Qabul qilingan' : 'Bekor qilingan'}
            </Tag>
          </div>
        }
        placement="right"
        onClose={() => setItemsDrawerVisible(false)}
        open={itemsDrawerVisible}
        width="90%"
        style={{ maxWidth: 1200 }}
      >
        {selectedOrder && (
          <Tabs defaultActiveKey="1" className="h-full">
            <TabPane 
              tab={
                <span>
                  <AppstoreAddOutlined />
                  Xomashyolar ro'yxati
                </span>
              } 
              key="1"
            >
              <div className="space-y-4">
                {/* Order Info */}
                <Card size="small">
                  <Row gutter={[16, 8]}>
                    <Col xs={12} sm={6}>
                      <Text type="secondary" className="text-xs">Buyurtma raqami:</Text>
                      <div><Text strong className="text-sm">{selectedOrder.orderNumber || 'N/A'}</Text></div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Text type="secondary" className="text-xs">Ta'minlovchi:</Text>
                      <div><Text className="text-sm">{selectedOrder.supplier || 'N/A'}</Text></div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Text type="secondary" className="text-xs">Buyurtma sanasi:</Text>
                      <div>
                        <Text className="text-sm">
                          {selectedOrder.orderDate ? dayjs(selectedOrder.orderDate).format('DD.MM.YYYY') : 'N/A'}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Text type="secondary" className="text-xs">Jami summa:</Text>
                      <div>
                        <Text strong className="text-sm text-green-600">
                          {selectedOrder.totalAmount ? `${Number(selectedOrder.totalAmount).toLocaleString()} so'm` : '0 so\'m'}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* Action Buttons */}
                <div className="mb-4 flex flex-col sm:flex-row justify-between gap-2">
                  <Space wrap>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                      size="small"
                      disabled={items.length === 0}
                    >
                      Bitta qo'shish
                    </Button>
                    <Button
                      type="primary"
                      icon={<AppstoreAddOutlined />}
                      onClick={handleBulkAdd}
                      style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                      size="small"
                      disabled={items.length === 0}
                    >
                      Ommaviy qo'shish
                    </Button>
                    {selectedOrder.status === 'PENDING' && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleConfirm(selectedOrder.orderId)}
                        size="small"
                        loading={loading}
                      >
                        Tasdiqlash
                      </Button>
                    )}
                    {selectedOrder.status === 'CONFIRMED' && (
                      <Button
                        type="primary"
                        icon={<InboxOutlined />}
                        onClick={() => handleReceive(selectedOrder.orderId)}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        size="small"
                        loading={loading}
                      >
                        Qabul qilish
                      </Button>
                    )}
                  </Space>
                  <Text type="secondary" className="text-xs">
                    Jami: {orderItems.length} ta xomashyo
                  </Text>
                </div>

                {/* Items Table */}
                {orderItems.length > 0 ? (
                  <Table
                    columns={itemColumns}
                    dataSource={orderItems}
                    rowKey="orderItemId"
                    pagination={false}
                    size="small"
                    scroll={{ x: 600 }}
                    loading={loading}
                    summary={(pageData) => {
                      const totalAmount = pageData.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
                      const totalQuantity = pageData.reduce((sum, item) => sum + (Number(item.orderedQuantity) || 0), 0);
                      
                      return (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0}>
                            <Text strong className="text-xs">Jami:</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            <Text strong className="text-xs">{totalQuantity}</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>-</Table.Summary.Cell>
                          <Table.Summary.Cell index={4}>
                            <Text strong className="text-xs text-green-600">
                              {totalAmount.toLocaleString()} so'm
                            </Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={5}>-</Table.Summary.Cell>
                        </Table.Summary.Row>
                      );
                    }}
                  />
                ) : (
                  <Empty 
                    description="Bu buyurtmada hozircha xomashyolar yo'q"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <PlusOutlined />
                  Bitta xomashyo qo'shish
                </span>
              } 
              key="2"
            >
              {items.length === 0 ? (
                <Alert
                  message="Xomashyolar yo'q"
                  description="Buyurtmaga xomashyo qo'shish uchun avval xomashyo yarating."
                  type="warning"
                  showIcon
                />
              ) : (
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
                          <div>
                            <Text strong>{item.name}</Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              Kod: {item.code} | Mavjud: {item.quantity} {item.unit?.name}
                            </Text>
                          </div>
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
                        <InputNumber 
                          min={0.001} 
                          step={0.001} 
                          className="w-full" 
                          placeholder="Miqdor"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="unitPrice"
                        label="Birlik narxi (so'm)"
                        rules={[{ required: true, message: 'Birlik narxini kiriting' }]}
                      >
                        <InputNumber 
                          min={0} 
                          step={100} 
                          className="w-full" 
                          placeholder="Narx"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" size="small" loading={loading}>
                        Saqlash
                      </Button>
                      <Button onClick={() => itemForm.resetFields()} size="small">
                        Tozalash
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              )}
            </TabPane>
          </Tabs>
        )}
      </Drawer>

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
          <Alert
            message="Maslahat"
            description="Bir vaqtda ko'plab xomashyolarni buyurtmaga qo'shish uchun quyidagi jadvalni to'ldiring. Masalan: Temir 10 kg, kg 500 so'm"
            type="info"
            showIcon
            className="mb-4"
          />
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
                    step={100}
                    className="w-full"
                    size="small"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Col>
                <Col xs={12} sm={4}>
                  <Text strong className="text-xs">
                    {((item.orderedQuantity || 0) * (item.unitPrice || 0)).toLocaleString()} so'm
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
              Jami: {bulkItems.reduce((sum, item) => 
                sum + ((item.orderedQuantity || 0) * (item.unitPrice || 0)), 0
              ).toLocaleString()} so'm
            </Text>
          </div>
        </div>

        <Divider />

        <div className="flex justify-end space-x-2">
          <Button onClick={() => setBulkModalVisible(false)} size="small">
            Bekor qilish
          </Button>
          <Button type="primary" onClick={handleBulkSubmit} size="small" loading={loading}>
            Barchasini saqlash
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Receiving;