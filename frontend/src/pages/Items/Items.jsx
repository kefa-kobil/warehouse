import React, { useState, useEffect } from 'react';
import { Typography, Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { itemService } from '../../services/itemService';
import { categoryService } from '../../services/categoryService';
import { warehouseService } from '../../services/warehouseService';
import { unitService } from '../../services/unitService';

import ItemTable from './ItemTable';
import ItemModal from './ItemModal';
import ItemSearch from './ItemSearch';

const { Title } = Typography;

const Items = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { t } = useTranslation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData, warehousesData, unitsData] = await Promise.all([
        itemService.getAll(),
        categoryService.getAll(),
        warehouseService.getAll(),
        unitService.getAll(),
      ]);
      setItems(itemsData);
      setFilteredItems(itemsData);
      setCategories(categoriesData);
      setWarehouses(warehousesData);
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await itemService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchData();
  };

  const handleSearch = (searchText, categoryId, warehouseId) => {
    let filtered = items;
    
    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (categoryId) {
      filtered = filtered.filter(item => item.category?.categoryId === categoryId);
    }
    
    if (warehouseId) {
      filtered = filtered.filter(item => item.warehouse?.warehouseId === warehouseId);
    }
    
    setFilteredItems(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('items.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('items.addItem')}
        </Button>
      </div>

      <Card>
        <ItemSearch 
          onSearch={handleSearch}
          categories={categories}
          warehouses={warehouses}
        />
        
        <ItemTable
          items={filteredItems}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <ItemModal
        visible={modalVisible}
        editingItem={editingItem}
        categories={categories}
        warehouses={warehouses}
        units={units}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Items;