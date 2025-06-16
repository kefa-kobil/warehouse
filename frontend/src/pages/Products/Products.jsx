import React, { useState, useEffect } from 'react';
import { Typography, Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { warehouseService } from '../../services/warehouseService';
import { unitService } from '../../services/unitService';

import ProductTable from './ProductTable';
import ProductModal from './ProductModal';
import ProductSearch from './ProductSearch';

const { Title } = Typography;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { t } = useTranslation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, warehousesData, unitsData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        warehouseService.getAll(),
        unitService.getAll(),
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
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
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchData();
  };

  const handleSearch = (searchText, categoryId, warehouseId) => {
    let filtered = products;
    
    if (searchText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.code.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (categoryId) {
      filtered = filtered.filter(product => product.category?.categoryId === categoryId);
    }
    
    if (warehouseId) {
      filtered = filtered.filter(product => product.warehouse?.warehouseId === warehouseId);
    }
    
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('products.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('products.addProduct')}
        </Button>
      </div>

      <Card>
        <ProductSearch 
          onSearch={handleSearch}
          categories={categories}
          warehouses={warehouses}
        />
        
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <ProductModal
        visible={modalVisible}
        editingProduct={editingProduct}
        categories={categories}
        warehouses={warehouses}
        units={units}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Products;