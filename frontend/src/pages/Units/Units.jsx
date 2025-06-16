import React, { useState, useEffect } from 'react';
import { Typography, Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { unitService } from '../../services/unitService';

import UnitTable from './UnitTable';
import UnitModal from './UnitModal';
import UnitSearch from './UnitSearch';

const { Title } = Typography;

const Units = () => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const { t } = useTranslation();

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await unitService.getAll();
      setUnits(data);
      setFilteredUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUnit(null);
    setModalVisible(true);
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await unitService.delete(id);
      fetchUnits();
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchUnits();
  };

  const handleSearch = (searchText) => {
    if (!searchText) {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(unit =>
        unit.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredUnits(filtered);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('units.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('units.addUnit')}
        </Button>
      </div>

      <Card>
        <UnitSearch onSearch={handleSearch} />
        
        <UnitTable
          units={filteredUnits}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <UnitModal
        visible={modalVisible}
        editingUnit={editingUnit}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Units;