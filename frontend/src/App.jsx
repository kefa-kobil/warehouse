import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useTranslation } from 'react-i18next';
import uzUZ from 'antd/locale/uz_UZ';
import enUS from 'antd/locale/en_US';
import ruRU from 'antd/locale/ru_RU';

import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Categories from './pages/Categories/Categories';
import Units from './pages/Units/Units';
import Warehouses from './pages/Warehouses/Warehouses';
import Items from './pages/Items/Items';
import Products from './pages/Products/Products';
import Clients from './pages/Clients/Clients';
import { useAuthStore } from './store/authStore';

const App = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const getAntdLocale = () => {
    switch (i18n.language) {
      case 'uz-Latn':
      case 'uz-Cyrl':
        return uzUZ;
      case 'ru':
        return ruRU;
      default:
        return enUS;
    }
  };

  const theme = {
    token: {
      colorPrimary: '#0ea5e9',
      borderRadius: 8,
    },
  };

  if (!isAuthenticated) {
    return (
      <ConfigProvider locale={getAntdLocale()} theme={theme}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={getAntdLocale()} theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/units" element={<Units />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/items" element={<Items />} />
            <Route path="/products" element={<Products />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;