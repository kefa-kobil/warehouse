import React from 'react';
import { Input, Select, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Search } = Input;
const { Option } = Select;

const ClientSearch = ({ onSearch }) => {
  const { t } = useTranslation();

  const clientTypes = ['CORPORATE', 'RETAIL'];

  const handleSearch = (searchText, type) => {
    onSearch(searchText, type);
  };

  return (
    <div className="mb-4">
      <Row gutter={16}>
        <Col xs={24} sm={16} md={18}>
          <Search
            placeholder="Mijoz nomi, email yoki telefon bo'yicha qidiring..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={(value) => handleSearch(value, null)}
            onChange={(e) => handleSearch(e.target.value, null)}
          />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            placeholder="Tur bo'yicha filtr"
            allowClear
            size="large"
            className="w-full"
            onChange={(value) => handleSearch(null, value)}
          >
            {clientTypes.map(type => (
              <Option key={type} value={type}>
                {t(`clients.types.${type}`)}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default ClientSearch;