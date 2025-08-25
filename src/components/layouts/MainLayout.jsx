import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Button, Typography } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const MainLayout = ({ children }) => {
  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2" onClick={() => window.location.href = '/'}>
            <PlayCircleOutlined className="text-2xl text-blue-500" />
            <Title level={3} className="!mb-0 text-gray-800">JomVideo</Title>
          </div>
          <div className="flex items-center space-x-4">
            <Button type="text" href="/login">
              Sign In
            </Button>
            <Button type="primary" href="/register">
              Get Started
            </Button>
          </div>
        </div>
      </Header>

      <Content>
        {children}
      </Content>

      <Footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-blue-400 transition-colors duration-300">Terms and Conditions</Link>
            <Link to="/cancellation-policy" className="hover:text-blue-400 transition-colors duration-300">Cancellation Policy</Link>
          </div>
          <Text className="text-gray-400">&copy; {new Date().getFullYear()} JomVideo. All rights reserved.</Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;