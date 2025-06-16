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
  PlayCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  FactoryOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { productionService } from '../../services/productionService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import { userService } from '../../services/userService';
import { itemService } from '../../services/itemService';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Production = () => {
  const [productions, setProductions] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemsModalVisible, setItemsModalVisible] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [productionItems, setProductionItems] = useState([]);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const productionStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'];

  const columns = [
    {
      title: 'Raqam',
      dataIndex: 'productionNumber',
      key: 'productionNumber',
      width: 120,
    },
    {
      title: 'Mahsulot',
      dataIndex: ['product', 'name'],
      key: 'product',
      width: 150,
    },
    {
      title: 'Omborxona',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      width: 120,
    },
    {
      title: 'Rejali miqdor',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 100,
    },
    {
      title: 'Ishlab chiqarilgan',
      dataIndex: 'producedQuantity',
      key: 'producedQuantity',
      width: 120,
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          PLANNED: 'blue',
          IN_PROGRESS: 'orange',
          COMPLETED: 'green',
          CANCELLED: 'red',
          ON_HOLD: 'purple'
        };
        const labels = {
          PLANNED: 'Rejalashtirilgan',
          IN_PROGRESS: 'Jarayonda',
          COMPLETED: 'Tugallangan',
          CANCELLED: 'Bekor qilingan',
          ON_HOLD: 'To\'xtatilgan'
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Rejalashtirilgan sana',
      dataIndex: 'plannedDate',
      key: 'plannedDate',
      width: 140,
      render: (date) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Jami xarajat',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 100,
      render: (cost) => `$${cost || 0}`,
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'PLANNED' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record.productionId)}
            >
              Boshlash
            </Button>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record.productionId)}
            >
              Tugatish
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
          {record.status !== 'COMPLETED' && (
            <Popconfirm
              title="Ishlab chiqarishni bekor qilish"
              onConfirm={() => handleCancel(record.productionId)}
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
      title: 'Kerakli miqdor',
      dataIndex: 'requiredQuantity',
      key: 'requiredQuantity',
    },
    {
      title: 'Ishlatilgan miqdor',
      dataIndex: 'usedQuantity',
      key: 'usedQuantity',
    },
    {
      title: 'Birlik narxi',
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost) => `$${cost}`,
    },
    {
      title: 'Jami narx',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => `$${cost}`,
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
            onConfirm={() => handleRemoveItem(record.productionItemId)}
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
      const [productionsData, productsData, warehousesData, usersData, itemsData] = await Promise.all([
        productionService.getAll(),
        productService.getAll(),
        warehouseService.getAll(),
        userService.getAll(),
        itemService.getAll(),
      ]);
      setProductions(productionsData);
      setProducts(productsData);
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
    setEditingProduction(null);
    form.resetFields();
    form.setFieldsValue({ 
      userId: user?.userId,
      plannedDate: dayjs(),
      status: 'PLANNED'
    });
    setModalVisible(true);
  };

  const handleEdit = (production) => {
    setEditingProduction(production);
    form.setFieldsValue({
      ...production,
      plannedDate: production.plannedDate ? dayjs(production.plannedDate) : null,
      productId: production.product?.productId,
      warehouseId: production.warehouse?.warehouseId,
      userId: production.user?.userId,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        plannedDate: values.plannedDate?.toISOString(),
        product: { productId: values.productId },
        warehouse: { warehouseId: values.warehouseId },
        user: { userId: values.userId },
      };
      
      if (editingProduction) {
        await productionService.update(editingProduction.productionId, payload);
      } else {
        await productionService.create(payload);
      }
      message.success('Muvaffaqiyatli saqlandi');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleStart = async (id) => {
    try {
      await productionService.start(id);
      message.success('Ishlab chiqarish boshlandi');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleComplete = async (id) => {
    try {
      await productionService.complete(id);
      message.success('Ishlab chiqarish tugallandi');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleCancel = async (id) => {
    try {
      await productionService.cancel(id);
      message.success('Ishlab chiqarish bekor qilindi');
      fetchData();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleViewItems = async (production) => {
    setSelectedProduction(production);
    try {
      const items = await productionService.getItems(production.productionId);
      setProductionItems(items);
      setItemsModalVisible(true);
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleAddItem = () => {
    itemForm.resetFields();
    itemForm.setFieldsValue({ editing: false });
    // Show item form
  };

  const handleEditItem = (item) => {
    itemForm.setFieldsValue({
      ...item,
      itemId: item.item?.itemId,
      editing: true,
      editingId: item.productionItemId,
    });
    // Show item form
  };

  const handleItemSubmit = async (values) => {
    try {
      const payload = {
        item: { itemId: values.itemId },
        requiredQuantity: values.requiredQuantity,
        unitCost: values.unitCost,
      };

      if (values.editing) {
        await productionService.updateItem(values.editingId, payload);
      } else {
        await productionService.addItem(selectedProduction.productionId, payload);
      }

      message.success('Muvaffaqiyatli saqlandi');
      const updatedItems = await productionService.getItems(selectedProduction.productionId);
      setProductionItems(updatedItems);
      itemForm.resetFields();
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await productionService.removeItem(itemId);
      message.success('Xomashyo o\'chirildi');
      const updatedItems = await productionService.getItems(selectedProduction.productionId);
      setProductionItems(updatedItems);
    } catch (error) {
      message.error('Xatolik yuz berdi');
    }
  };

  const getStats = () => {
    const plannedCount = productions.filter(p => p.status === 'PLANNED').length;
    const inProgressCount = productions.filter(p => p.status === 'IN_PROGRESS').length;
    const completedCount = productions.filter(p => p.status === 'COMPLETED').length;
    const totalCost = productions.reduce((sum, p) => sum + (parseFloat(p.totalCost) || 0), 0);

    return { plannedCount, inProgressCount, completedCount, totalCost };
  };

  const stats = getStats();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Ishlab chiqarish</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Yangi ishlab chiqarish
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Rejalashtirilgan"
              value={stats.plannedCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jarayonda"
              value={stats.inProgressCount}
              prefix={<FactoryOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tugallangan"
              value={stats.completedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jami xarajat"
              value={stats.totalCost}
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
          dataSource={productions}
          loading={loading}
          rowKey="productionId"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          }}
        />
      </Card>

      {/* Production Modal */}
      <Modal
        title={editingProduction ? 'Ishlab chiqarishni tahrirlash' : 'Yangi ishlab chiqarish'}
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
                name="productId"
                label="Mahsulot"
                rules={[{ required: true, message: 'Mahsulotni tanlang' }]}
              >
                <Select placeholder="Mahsulotni tanlang">
                  {products.map(product => (
                    <Option key={product.productId} value={product.productId}>
                      {product.name} ({product.code})
                    </Option>
                  ))}
                </Select>
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
                name="plannedQuantity"
                label="Rejali miqdor"
                rules={[{ required: true, message: 'Rejali miqdorni kiriting' }]}
              >
                <InputNumber min={0.001} step={0.001} className="w-full" />
              </Form.Item>
            </Col>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plannedDate"
                label="Rejalashtirilgan sana"
                rules={[{ required: true, message: 'Sanani tanlang' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Holat"
                rules={[{ required: true, message: 'Holatni tanlang' }]}
              >
                <Select>
                  {productionStatuses.map(status => (
                    <Option key={status} value={status}>
                      {status === 'PLANNED' ? 'Rejalashtirilgan' :
                       status === 'IN_PROGRESS' ? 'Jarayonda' :
                       status === 'COMPLETED' ? 'Tugallangan' :
                       status === 'CANCELLED' ? 'Bekor qilingan' : 'To\'xtatilgan'}
                    </Option>
                  ))}
                </Select>
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

      {/* Production Items Modal */}
      <Modal
        title={`Ishlab chiqarish xomashyolari - ${selectedProduction?.productionNumber}`}
        open={itemsModalVisible}
        onCancel={() => setItemsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Xomashyolar ro'yxati" key="1">
            <div className="mb-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddItem}
              >
                Xomashyo qo'shish
              </Button>
            </div>
            <Table
              columns={itemColumns}
              dataSource={productionItems}
              rowKey="productionItemId"
              pagination={false}
              size="small"
            />
          </TabPane>
          <TabPane tab="Xomashyo qo'shish" key="2">
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
                      {item.name} ({item.code}) - Mavjud: {item.quantity}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="requiredQuantity"
                    label="Kerakli miqdor"
                    rules={[{ required: true, message: 'Kerakli miqdorni kiriting' }]}
                  >
                    <InputNumber min={0.001} step={0.001} className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="unitCost"
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
    </div>
  );
};

export default Production;