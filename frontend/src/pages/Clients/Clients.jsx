import React, { useState, useEffect } from 'react';
import { Typography, Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { clientService } from '../../services/clientService';

import ClientTable from './ClientTable';
import ClientModal from './ClientModal';
import ClientSearch from './ClientSearch';

const { Title } = Typography;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const { t } = useTranslation();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setModalVisible(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await clientService.delete(id);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchClients();
  };

  const handleSearch = (searchText, type) => {
    let filtered = clients;
    
    if (searchText) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchText.toLowerCase()) ||
        client.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (client.phone && client.phone.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    if (type) {
      filtered = filtered.filter(client => client.type === type);
    }
    
    setFilteredClients(filtered);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('clients.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('clients.addClient')}
        </Button>
      </div>

      <Card>
        <ClientSearch onSearch={handleSearch} />
        
        <ClientTable
          clients={filteredClients}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <ClientModal
        visible={modalVisible}
        editingClient={editingClient}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Clients;