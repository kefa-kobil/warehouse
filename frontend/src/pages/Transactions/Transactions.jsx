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
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  InboxOutlined, 
  SendOutlined,
  SearchOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { transactionService } from '../../services/transactionService';
import { itemService } from '../../services/itemService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [quickModalVisible, setQuickModalVisible] = useState(false);
  const [quickModalType, setQuickModalType] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [form] = Form.useForm();
  const [quickForm] = Form.useForm();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const transactionTypes = ['INBOUND', 'OUTBOUND', 'PRODUCTION', 'TRANSFER', 'ADJUSTMENT'];
  const entityTypes = ['ITEMS', 'PRODUCTS'];
  const transactionStatuses = ['COMPLETED', 'PENDING', 'CANCELLED', 'RETURNED'];

  const columns = [
    {
      title: 'Raqam',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 120,
    },
    {
      title: 'Turi',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 100,
      render: (type) => (
        <Tag color={type === 'INBOUND' ? 'green' : type === 'OUTBOUND' ? 'red' : 'blue'}>
          {type === 'INBOUND' ? 'Kirish' : type === 'OUTBOUND' ? 'Chiqish' : type}
        </Tag>
      ),
    },
    {
      title: 'Obyekt turi',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 100,
      render: (type) => (
        <Tag color={type === 'ITEMS' ? 'orange' : 'purple'}>
          {type === 'ITEMS' ? 'Xomashyo' : 'Mahsulot'}
        </Tag>
      ),
    },
    {
      title: 'Nomi',
      key: 'entityName',
      width: 150,
      render: (_, record) => {
        if (record.entityType === 'ITEMS' && record.item) {
          return record.item.name;
        } else if (record.entityType === 'PRODUCTS' && record.product) {
          return record.product.name;
        }
        return '-';
      },
    },
    {
      title: 'Omborxona',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      width: 120,
    },
    {
      title: 'Foydalanuvchi',
      dataIndex: ['user', 'fullName'],
      key: 'user',
      width: 120,
    },
    {
      title: 'Miqdor',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'Birlik narxi',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price) => `$${price}`,
    },
    {
      title: 'Jami narx',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      render: (price) => `$${price}`,
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = {
          COMPLETED: 'green',
          PENDING: 'orange',
          CANCELLED: 'red',
          RETURNED: 'purple'
        };
        const labels = {
          COMPLETED: 'Tugallangan',
          PENDING: 'Kutilmoqda',
          CANCELLED: 'Bekor qilingan',
          RETURNED: 'Qaytarilgan'
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Sana',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 120,
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Tranzaksiyani o'chirish"
            onConfirm={() => handleDelete(record.transactionId)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button
              type="primary"
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
      const [transactionsData, itemsData, productsData, warehousesData, usersData] = await Promise.all([
        transactionService.getAll(),
        itemService.getAll(),
        productService.getAll(),
        warehouseService.getAll(),
        userService.getAll(),
      ]);
      setTransactions(transactionsData);
      setItems(itemsData);
      setProducts(productsData);
      setWarehouses(warehousesData);
      setUsers(usersData);
    } catch (error) {
      message.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleQuickAction = (type) => {
    setQuickModalType(type);
    quickForm.resetFields();
    quickForm.setFieldsValue({ userId: user?.userId });
    setQuickModalVisible(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    form.setFieldsValue({
      ...transaction,
      transactionDate: dayjs(transaction.transactionDate),
      itemId: transaction.item?.itemId,
      productId: transaction.product?.productId,
      warehouseId: transaction.warehouse?.warehouseId,
      userId: transaction.user?.userId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await transactionService.delete(id);
      message.success('Muvaffaqiyatli o\'chirildi');
      fetchData();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        transactionDate: values.transactionDate.toISOString(),
        item: values.itemId ? { itemId: values.itemId } : null,
        product: values.productId ? { productId: values.productId } : null,
        warehouse: { warehouseId: values.warehouseId },
        user: { userId: values.userId },
      };
      
      if (editingTransaction) {
        await transactionService.update(editingTransaction.transactionId, payload);
      } else {
        await transactionService.create(payload);
      }
      message.success('Muvaffaqiyatli saqlandi');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleQuickSubmit = async (values) => {
    try {
      let response;
      switch (quickModalType) {
        case 'item-inbound':
          response = await transactionService.createItemInbound(values);
          break;
        case 'item-outbound':
          response = await transactionService.createItemOutbound(values);
          break;
        case 'product-inbound':
          response = await transactionService.createProductInbound(values);
          break;
        case 'product-outbound':
          response = await transactionService.createProductOutbound(values);
          break;
        default:
          throw new Error('Noto\'g\'ri amal turi');
      }
      message.success('Tranzaksiya muvaffaqiyatli yaratildi');
      setQuickModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const getStats = () => {
    const inboundCount = transactions.filter(t => t.transactionType === 'INBOUND').length;
    const outboundCount = transactions.filter(t => t.transactionType === 'OUTBOUND').length;
    const totalValue = transactions.reduce((sum, t) => sum + (parseFloat(t.totalPrice) || 0), 0);
    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

    return { inboundCount, outboundCount, totalValue, pendingCount };
  };

  const stats = getStats();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Tranzaksiyalar</Title>
        <Space>
          <Button
            type="primary"
            icon={<InboxOutlined />}
            onClick={() => handleQuickAction('item-inbound')}
          >
            Xomashyo kirishi
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleQuickAction('item-outbound')}
          >
            Xomashyo chiqishi
          </Button>
          <Button
            type="primary"
            icon={<InboxOutlined />}
            onClick={() => handleQuickAction('product-inbound')}
          >
            Mahsulot kirishi
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleQuickAction('product-outbound')}
          >
            Mahsulot chiqishi
          </Button>
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Qo'lda qo'shish
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kirish tranzaksiyalari"
              value={stats.inboundCount}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chiqish tranzaksiyalari"
              value={stats.outboundCount}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jami qiymat"
              value={stats.totalValue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kutilayotgan"
              value={stats.pendingCount}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          rowKey="transactionId"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          }}
        />
      </Card>

      {/* Quick Action Modal */}
      <Modal
        title={
          quickModalType === 'item-inbound' ? 'Xomashyo kirishi' :
          quickModalType === 'item-outbound' ? 'Xomashyo chiqishi' :
          quickModalType === 'product-inbound' ? 'Mahsulot kirishi' :
          'Mahsulot chiqishi'
        }
        open={quickModalVisible}
        onCancel={() => setQuickModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={quickForm}
          layout="vertical"
          onFinish={handleQuickSubmit}
        >
          {quickModalType?.includes('item') ? (
            <Form.Item
              name="itemId"
              label="Xomashyo"
              rules={[{ required: true, message: 'Xomashyoni tanlang' }]}
            >
              <Select showSearch placeholder="Xomashyoni tanlang">
                {items.map(item => (
                  <Option key={item.itemId} value={item.itemId}>
                    {item.name} ({item.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="productId"
              label="Mahsulot"
              rules={[{ required: true, message: 'Mahsulotni tanlang' }]}
            >
              <Select showSearch placeholder="Mahsulotni tanlang">
                {products.map(product => (
                  <Option key={product.productId} value={product.productId}>
                    {product.name} ({product.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

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

          <Form.Item
            name="userId"
            label="Foydalanuvchi"
            rules={[{ required: true, message: 'Foydalanuvchini tanlang' }]}
          >
            <Select placeholder="Foydalanuvchini tanlang">
              {users.map(user => (
                <Option key={user.userId} value={user.userId}>
                  {user.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Miqdor"
            rules={[{ required: true, message: 'Miqdorni kiriting' }]}
          >
            <InputNumber min={0.001} step={0.001} className="w-full" placeholder="Miqdor" />
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="Birlik narxi"
            rules={[{ required: true, message: 'Birlik narxini kiriting' }]}
          >
            <InputNumber min={0} step={0.01} className="w-full" placeholder="Birlik narxi" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Izoh"
          >
            <Input.TextArea rows={3} placeholder="Izoh (ixtiyoriy)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Saqlash
              </Button>
              <Button onClick={() => setQuickModalVisible(false)}>
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Full Transaction Modal */}
      <Modal
        title={editingTransaction ? 'Tranzaksiyani tahrirlash' : 'Yangi tranzaksiya'}
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
                name="transactionType"
                label="Tranzaksiya turi"
                rules={[{ required: true, message: 'Tranzaksiya turini tanlang' }]}
              >
                <Select>
                  {transactionTypes.map(type => (
                    <Option key={type} value={type}>
                      {type === 'INBOUND' ? 'Kirish' : 
                       type === 'OUTBOUND' ? 'Chiqish' : 
                       type === 'PRODUCTION' ? 'Ishlab chiqarish' :
                       type === 'TRANSFER' ? 'Ko\'chirish' : 'Tuzatish'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="entityType"
                label="Obyekt turi"
                rules={[{ required: true, message: 'Obyekt turini tanlang' }]}
              >
                <Select>
                  {entityTypes.map(type => (
                    <Option key={type} value={type}>
                      {type === 'ITEMS' ? 'Xomashyo' : 'Mahsulot'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.entityType !== currentValues.entityType
            }
          >
            {({ getFieldValue }) => {
              const entityType = getFieldValue('entityType');
              if (entityType === 'ITEMS') {
                return (
                  <Form.Item
                    name="itemId"
                    label="Xomashyo"
                    rules={[{ required: true, message: 'Xomashyoni tanlang' }]}
                  >
                    <Select showSearch placeholder="Xomashyoni tanlang">
                      {items.map(item => (
                        <Option key={item.itemId} value={item.itemId}>
                          {item.name} ({item.code})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              } else if (entityType === 'PRODUCTS') {
                return (
                  <Form.Item
                    name="productId"
                    label="Mahsulot"
                    rules={[{ required: true, message: 'Mahsulotni tanlang' }]}
                  >
                    <Select showSearch placeholder="Mahsulotni tanlang">
                      {products.map(product => (
                        <Option key={product.productId} value={product.productId}>
                          {product.name} ({product.code})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                name="userId"
                label="Foydalanuvchi"
                rules={[{ required: true, message: 'Foydalanuvchini tanlang' }]}
              >
                <Select placeholder="Foydalanuvchini tanlang">
                  {users.map(user => (
                    <Option key={user.userId} value={user.userId}>
                      {user.fullName}
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
                label="Miqdor"
                rules={[{ required: true, message: 'Miqdorni kiriting' }]}
              >
                <InputNumber min={0.001} step={0.001} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unitPrice"
                label="Birlik narxi"
                rules={[{ required: true, message: 'Birlik narxini kiriting' }]}
              >
                <InputNumber min={0} step={0.01} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Holat"
                rules={[{ required: true, message: 'Holatni tanlang' }]}
              >
                <Select>
                  {transactionStatuses.map(status => (
                    <Option key={status} value={status}>
                      {status === 'COMPLETED' ? 'Tugallangan' :
                       status === 'PENDING' ? 'Kutilmoqda' :
                       status === 'CANCELLED' ? 'Bekor qilingan' : 'Qaytarilgan'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="transactionDate"
            label="Tranzaksiya sanasi"
            rules={[{ required: true, message: 'Sanani tanlang' }]}
          >
            <DatePicker 
              showTime 
              className="w-full" 
              format="DD.MM.YYYY HH:mm"
            />
          </Form.Item>

          <Form.Item
            name="referenceNumber"
            label="Raqam"
          >
            <Input placeholder="Avtomatik yaratiladi" />
          </Form.Item>

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
    </div>
  );
};

export default Transactions;