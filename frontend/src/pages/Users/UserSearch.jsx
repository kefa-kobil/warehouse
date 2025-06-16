import React from 'react';
import { Input, Select, Space, Row, Col } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Search } = Input;
const { Option } = Select;

const UserSearch = ({ onSearch }) => {
  const { t } = useTranslation();

  const roles = ['ADMIN', 'MENEJER', 'HR', 'ISHCHI', 'QOROVUL'];

  const handleSearch = (searchText, role) => {
    onSearch(searchText, role);
  };

  return (
    <div className="mb-4">
      <Row gutter={16}>
        <Col xs={24} sm={16} md={18}>
          <Search
            placeholder="Ism, username yoki email bo'yicha qidiring..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={(value) => handleSearch(value, null)}
            onChange={(e) => handleSearch(e.target.value, null)}
          />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            placeholder="Rol bo'yicha filtr"
            allowClear
            size="large"
            className="w-full"
            onChange={(value) => handleSearch(null, value)}
          >
            {roles.map(role => (
              <Option key={role} value={role}>
                {t(`users.roles.${role}`)}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default UserSearch;