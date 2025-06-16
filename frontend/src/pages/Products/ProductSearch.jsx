import React from 'react';
import { Input, Select, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const ProductSearch = ({ onSearch, categories, warehouses }) => {
  const handleSearch = (searchText, categoryId, warehouseId) => {
    onSearch(searchText, categoryId, warehouseId);
  };

  return (
    <div className="mb-4">
      <Row gutter={16}>
        <Col xs={24} sm={12} md={10}>
          <Search
            placeholder="Mahsulot nomi yoki kodi bo'yicha qidiring..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={(value) => handleSearch(value, null, null)}
            onChange={(e) => handleSearch(e.target.value, null, null)}
          />
        </Col>
        <Col xs={24} sm={6} md={7}>
          <Select
            placeholder="Kategoriya bo'yicha filtr"
            allowClear
            size="large"
            className="w-full"
            onChange={(value) => handleSearch(null, value, null)}
          >
            {categories.map(category => (
              <Option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={6} md={7}>
          <Select
            placeholder="Omborxona bo'yicha filtr"
            allowClear
            size="large"
            className="w-full"
            onChange={(value) => handleSearch(null, null, value)}
          >
            {warehouses.map(warehouse => (
              <Option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                {warehouse.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default ProductSearch;