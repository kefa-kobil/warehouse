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
  Tag,
  Empty,
  Drawer,
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
  EyeOutlined,
  AppstoreOutlined,
  BoxPlotOutlined,
  InfoCircleOutlined,
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
  const [itemsDrawerVisible, setItemsDrawerVisible] = useState(false);
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

  const handleViewItems = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setItemsDrawerVisible(true);
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

    return { totalItems, totalQuantity, totalValue, warehouseItems };
  };

  const getWarehouseItems = (warehouse) => {
    return items.filter(item => 
      item.warehouse?.warehouseId === warehouse.warehouseId
    );
  };

  const itemColumns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (text) => <Text code className="text-xs">{text}</Text>,
    },
    {
      title: 'Nomi',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text className="text-xs font-medium">{text}</Text>,
    },
    {
      title: 'Kategoriya',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 100,
      render: (text) => <Tag color="blue" className="text-xs">{text}</Tag>,
    },
    {
      title: 'O\'lchov',
      dataIndex: ['unit', 'name'],
      key: 'unit',
      width: 80,
      render: (text) => <Tag color="orange" className="text-xs">{text}</Tag>,
    },
    {
      title: 'Miqdor',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity) => (
        <Text className={`text-xs font-medium ${quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>
          {quantity}
        </Text>
      ),
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price) => <Text className="text-xs font-medium">${price}</Text>,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Jami qiymat',
      key: 'totalValue',
      width: 100,
      render: (_, record) => {
        const total = (record.quantity || 0) * (record.price || 0);
        return <Text className="text-xs font-bold text-green-600">${total.toFixed(2)}</Text>;
      },
      sorter: (a, b) => (a.quantity * a.price) - (b.quantity * b.price),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <Title level={2} className="mb-0 text-lg sm:text-xl md:text-2xl">{t('warehouses.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="small"
          className="w-full sm:w-auto"
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
                    icon={<EyeOutlined />}
                    onClick={() => handleViewItems(warehouse)}
                    title="Xomashyolarni ko'rish"
                    className="text-xs"
                  >
                    Ko'rish
                  </Button>,
                  <Button
                    type="text"
                    icon={<InboxOutlined />}
                    onClick={() => handleBulkInbound(warehouse)}
                    title="Ommaviy kirish"
                    className="text-xs"
                  >
                    Kirish
                  </Button>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(warehouse)}
                    title="Tahrirlash"
                    className="text-xs"
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
                      className="text-xs"
                    >
                      O'chirish
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className="text-center mb-4">
                  <Badge count={stats.totalItems} showZero color="#1890ff">
                    <Avatar 
                      size={64} 
                      icon={<ShopOutlined />} 
                      className="bg-blue-500 mb-3"
                    />
                  </Badge>
                  <Title level={4} className="mb-1 text-sm sm:text-base">{warehouse.name}</Title>
                  <Text type="secondary" className="text-xs">{warehouse.location}</Text>
                </div>

                <Divider />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text className="text-xs">Menejer:</Text>
                    <Text strong className="text-xs">{warehouse.manager}</Text>
                  </div>
                  
                  <Row gutter={8}>
                    <Col span={12}>
                      <Statistic
                        title={<span className="text-xs">Xomashyolar</span>}
                        value={stats.totalItems}
                        prefix={<BoxPlotOutlined className="text-sm" />}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={<span className="text-xs">Jami miqdor</span>}
                        value={stats.totalQuantity}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>

                  <Statistic
                    title={<span className="text-xs">Jami qiymat</span>}
                    value={stats.totalValue}
                    prefix="$"
                    precision={2}
                    valueStyle={{ fontSize: '14px', color: '#3f8600' }}
                  />

                  {warehouse.description && (
                    <>
                      <Divider />
                      <Text type="secondary" className="text-xs">
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
        width="95%"
        style={{ maxWidth: 600 }}
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
              <Button type="primary" htmlType="submit" size="small">
                {t('common.save')}
              </Button>
              <Button onClick={() => setModalVisible(false)} size="small">
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
        width="95%"
        style={{ maxWidth: 800 }}
      >
        <div className="mb-4">
          <Text type="secondary" className="text-xs">
            Bir vaqtda ko'plab xomashyolarni omborga qo'shish uchun quyidagi jadvalni to'ldiring
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
                    value={item.quantity}
                    onChange={(value) => updateBulkItem(index, 'quantity', value)}
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
                    ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
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
                sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0
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

      {/* Items Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <ShopOutlined />
            <span>{selectedWarehouse?.name} - Xomashyolar</span>
          </div>
        }
        placement="right"
        onClose={() => setItemsDrawerVisible(false)}
        open={itemsDrawerVisible}
        width="90%"
        style={{ maxWidth: 1200 }}
      >
        {selectedWarehouse && (
          <Tabs defaultActiveKey="1" className="h-full">
            <TabPane 
              tab={
                <span>
                  <AppstoreOutlined />
                  Xomashyolar ro'yxati
                </span>
              } 
              key="1"
            >
              {(() => {
                const warehouseItems = getWarehouseItems(selectedWarehouse);
                const stats = getWarehouseStats(selectedWarehouse);
                
                return (
                  <div className="space-y-4">
                    {/* Statistics */}
                    <Row gutter={[8, 8]}>
                      <Col xs={8} sm={6}>
                        <Card className="text-center">
                          <Statistic
                            title={<span className="text-xs">Jami xomashyolar</span>}
                            value={stats.totalItems}
                            prefix={<BoxPlotOutlined className="text-sm" />}
                            valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={8} sm={6}>
                        <Card className="text-center">
                          <Statistic
                            title={<span className="text-xs">Jami miqdor</span>}
                            value={stats.totalQuantity}
                            valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={8} sm={6}>
                        <Card className="text-center">
                          <Statistic
                            title={<span className="text-xs">Jami qiymat</span>}
                            value={stats.totalValue}
                            prefix="$"
                            precision={2}
                            valueStyle={{ fontSize: '16px', color: '#722ed1' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={6}>
                        <Card className="text-center">
                          <Statistic
                            title={<span className="text-xs">Kam qolgan</span>}
                            value={warehouseItems.filter(item => item.quantity < 10).length}
                            valueStyle={{ fontSize: '16px', color: '#ff4d4f' }}
                            suffix={<span className="text-xs">ta</span>}
                          />
                        </Card>
                      </Col>
                    </Row>

                    {/* Items Table */}
                    {warehouseItems.length > 0 ? (
                      <Table
                        columns={itemColumns}
                        dataSource={warehouseItems}
                        rowKey="itemId"
                        size="small"
                        scroll={{ x: 600 }}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          showTotal: (total, range) => 
                            `${range[0]}-${range[1]} / ${total} ta xomashyo`,
                          responsive: true,
                        }}
                        rowClassName={(record) => 
                          record.quantity < 10 ? 'bg-red-50' : ''
                        }
                      />
                    ) : (
                      <Empty 
                        description="Bu omborxonada hozircha xomashyolar yo'q"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                );
              })()}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <InfoCircleOutlined />
                  Omborxona ma'lumotlari
                </span>
              } 
              key="2"
            >
              <div className="space-y-4">
                <Card title="Asosiy ma'lumotlar">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div className="space-y-2">
                        <Text type="secondary" className="text-xs">Nomi:</Text>
                        <div>
                          <Text strong className="text-sm">{selectedWarehouse.name}</Text>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="space-y-2">
                        <Text type="secondary" className="text-xs">Joylashuv:</Text>
                        <div>
                          <Text className="text-sm">{selectedWarehouse.location}</Text>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="space-y-2">
                        <Text type="secondary" className="text-xs">Menejer:</Text>
                        <div>
                          <Text className="text-sm">{selectedWarehouse.manager}</Text>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="space-y-2">
                        <Text type="secondary" className="text-xs">Yaratilgan sana:</Text>
                        <div>
                          <Text className="text-sm">
                            {new Date(selectedWarehouse.createdAt).toLocaleDateString('uz-UZ')}
                          </Text>
                        </div>
                      </div>
                    </Col>
                    {selectedWarehouse.description && (
                      <Col span={24}>
                        <div className="space-y-2">
                          <Text type="secondary" className="text-xs">Tavsif:</Text>
                          <div>
                            <Text className="text-sm">{selectedWarehouse.description}</Text>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>

                <Card title="Kategoriyalar bo'yicha taqsimot">
                  {(() => {
                    const warehouseItems = getWarehouseItems(selectedWarehouse);
                    const categoryStats = {};
                    
                    warehouseItems.forEach(item => {
                      const categoryName = item.category?.name || 'Kategoriyasiz';
                      if (!categoryStats[categoryName]) {
                        categoryStats[categoryName] = { count: 0, totalQuantity: 0, totalValue: 0 };
                      }
                      categoryStats[categoryName].count++;
                      categoryStats[categoryName].totalQuantity += item.quantity || 0;
                      categoryStats[categoryName].totalValue += (item.quantity || 0) * (item.price || 0);
                    });

                    const categoryData = Object.entries(categoryStats).map(([name, stats]) => ({
                      category: name,
                      ...stats,
                    }));

                    const categoryColumns = [
                      {
                        title: 'Kategoriya',
                        dataIndex: 'category',
                        key: 'category',
                        render: (text) => <Tag color="blue" className="text-xs">{text}</Tag>,
                      },
                      {
                        title: 'Xomashyolar soni',
                        dataIndex: 'count',
                        key: 'count',
                        render: (text) => <Text className="text-xs">{text} ta</Text>,
                      },
                      {
                        title: 'Jami miqdor',
                        dataIndex: 'totalQuantity',
                        key: 'totalQuantity',
                        render: (text) => <Text className="text-xs">{text}</Text>,
                      },
                      {
                        title: 'Jami qiymat',
                        dataIndex: 'totalValue',
                        key: 'totalValue',
                        render: (text) => <Text className="text-xs font-medium">${text.toFixed(2)}</Text>,
                      },
                    ];

                    return categoryData.length > 0 ? (
                      <Table
                        columns={categoryColumns}
                        dataSource={categoryData}
                        rowKey="category"
                        size="small"
                        pagination={false}
                      />
                    ) : (
                      <Empty 
                        description="Ma'lumot yo'q"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    );
                  })()}
                </Card>
              </div>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default Warehouses;