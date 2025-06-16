import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ShopOutlined,
  BoxPlotOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  SwapOutlined,
  ToolOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('navigation.dashboard'),
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: t('navigation.users'),
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: t('navigation.categories'),
    },
    {
      key: '/units',
      icon: <DatabaseOutlined />,
      label: t('navigation.units'),
    },
    {
      key: '/warehouses',
      icon: <ShopOutlined />,
      label: t('navigation.warehouses'),
    },
    {
      key: '/items',
      icon: <BoxPlotOutlined />,
      label: t('navigation.items'),
    },
    {
      key: '/products',
      icon: <ShoppingCartOutlined />,
      label: t('navigation.products'),
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: 'Buyurtmalar',
    },
    {
      key: '/production',
      icon: <ToolOutlined />,
      label: 'Ishlab chiqarish',
    },
    {
      key: '/clients',
      icon: <TeamOutlined />,
      label: t('navigation.clients'),
    },
    {
      key: '/transactions',
      icon: <SwapOutlined />,
      label: t('navigation.transactions'),
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuVisible(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const languageMenu = {
    items: [
      {
        key: 'uz-Latn',
        label: 'O\'zbekcha (Lotin)',
        onClick: () => changeLanguage('uz-Latn'),
      },
      {
        key: 'uz-Cyrl',
        label: 'Ўзбекча (Кирилл)',
        onClick: () => changeLanguage('uz-Cyrl'),
      },
    ],
  };

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: t('auth.logout'),
        onClick: handleLogout,
      },
    ],
  };

  return (
    <AntLayout className="min-h-screen">
      {/* Mobile overlay */}
      {mobileMenuVisible && (
        <div 
          className="mobile-menu-overlay md:hidden"
          onClick={() => setMobileMenuVisible(false)}
        />
      )}

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={`${mobileMenuVisible ? 'block' : 'hidden'} md:block`}
        breakpoint="md"
        collapsedWidth={window.innerWidth < 768 ? 0 : 80}
      >
        <div className="h-16 flex items-center justify-center bg-primary-600 text-white font-bold text-lg">
          {collapsed ? 'WMS' : 'Warehouse MS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <AntLayout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileMenuVisible(!mobileMenuVisible);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="text-lg"
          />

          <Space>
            <Dropdown menu={languageMenu} placement="bottomRight">
              <Button type="text" icon={<GlobalOutlined />}>
                {i18n.language === 'uz-Cyrl' ? 'Кир' : 'Lat'}
              </Button>
            </Dropdown>

            <Dropdown menu={userMenu} placement="bottomRight">
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <span className="hidden sm:inline">{user?.fullName}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="m-6 p-6 bg-white rounded-lg shadow-sm min-h-[calc(100vh-112px)]">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;