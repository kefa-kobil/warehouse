import React from 'react';
import { Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Search } = Input;

const CategorySearch = ({ onSearch }) => {
  const { t } = useTranslation();

  const handleSearch = (value) => {
    onSearch(value);
  };

  return (
    <div className="mb-4">
      <Space>
        <Search
          placeholder="Kategoriya nomini qidiring..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </Space>
    </div>
  );
};

export default CategorySearch;