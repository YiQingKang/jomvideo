import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Badge,
  Typography,
} from 'antd';
import {
  DashboardOutlined,
  VideoCameraOutlined,
  HistoryOutlined,
  UserOutlined,
  CreditCardOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userDashboardMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/dashboard/generate',
      icon: <VideoCameraOutlined />,
      label: 'Generate Video',
    },
    {
      key: '/dashboard/history',
      icon: <HistoryOutlined />,
      label: 'Video History',
    },
    {
      key: '/dashboard/credits',
      icon: <CreditCardOutlined />,
      label: 'Credits',
    },
    {
      key: '/dashboard/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
  ];

  const adminDashboardMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Admin Dashboard',
    },
    {
      key: '/admin/dashboard/users',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: '/admin/dashboard/videos',
      icon: <VideoCameraOutlined />,
      label: 'Video Management',
    },
    {
      key: '/admin/dashboard/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
  ];

  const currentMenuItems = location.pathname.startsWith('/admin') 
    ? adminDashboardMenuItems 
    : userDashboardMenuItems;

  const userProfileMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/dashboard/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white shadow-lg"
        width={250}
      >
        <div className="p-4 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <VideoCameraOutlined className="text-2xl text-blue-500" />
            {!collapsed && (
              <Text className="text-xl font-bold text-gray-800">VideoAI</Text>
            )}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={currentMenuItems}
          className="border-none"
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-lg"
              />
            </Badge>
            
            <div className="flex items-center space-x-2">
              <Text className="text-sm text-gray-600">
                {user?.credits || 0} credits
              </Text>
              <Button
                size="small"
                type="primary"
                onClick={() => navigate('/dashboard/credits')}
              >
                Buy Credits
              </Button>
            </div>
            
            <Dropdown
              menu={{ items: userProfileMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1">
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  size={32}
                />
                <div className="hidden md:block">
                  <Text className="text-sm font-medium">{user?.name}</Text>
                  <Text className="text-xs text-gray-500 block">{user?.email}</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="p-6 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
