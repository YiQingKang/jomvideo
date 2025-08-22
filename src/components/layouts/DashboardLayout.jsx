import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
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
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Example breakpoint for mobile
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white shadow-lg"
        width={250}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80} // Collapse to 0 on mobile
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          setCollapsed(broken); // Collapse Sider when breakpoint is met
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 1000 : 'auto', // Overlay on mobile
        }}
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
          onClick={({ key }) => {
            navigate(key);
            if (isMobile) {
              setCollapsed(true); // Close Sider on mobile after click
            }
          }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250) }}>
        <Header 
          className="bg-white shadow-sm px-4 flex items-center justify-between"
          style={{
            position: 'fixed',
            zIndex: 1,
            width: '100%',
            top: 0,
            right: 0,
          }}
        >
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            
            
            {!user?.role === 'admin' && (
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
          )}
            
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
                <div className="hidden md:block" style={{ display: "flex", flexDirection: "column" }}>
                  <Text className="text-sm font-medium">{user?.name}</Text>
                  <Text className="text-xs text-gray-500 block">{user?.email}</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content 
          className="p-6 bg-gray-50"
          style={{ marginTop: 64 }}
          onClick={() => {
            if (isMobile && !collapsed) {
              setCollapsed(true); // Close Sider on content click
            }
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;