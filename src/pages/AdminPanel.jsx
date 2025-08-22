import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Statistic, 
  Row, 
  Col,
  Typography,
  message,
} from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined,
  CreditCardOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import api from '../utils/api';

const { Title } = Typography;

const AdminPanel = () => {
  const [userCount, setUserCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResponse, videosResponse] = await Promise.all([
        api.get('/api/admin/users?limit=1'), // Fetch just one to get total count
        api.get('/api/admin/videos?limit=1'), // Fetch just one to get total count
      ]);
      setUserCount(usersResponse.data.pagination.total);
      setVideoCount(videosResponse.data.pagination.total);
    } catch (error) {
      message.error('Failed to fetch admin stats.');
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const adminStats = [
    {
      title: 'Total Users',
      value: userCount,
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Total Videos',
      value: videoCount,
      icon: <VideoCameraOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Total Revenue',
      value: 0, // This needs to be fetched from backend
      prefix: '$',
      icon: <DollarOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Credits Purchased',
      value: 0, // This needs to be fetched from backend
      icon: <CreditCardOutlined />,
      color: '#fa8c16'
    }
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Admin Panel Dashboard</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        {adminStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card loading={loading}>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color }}
                prefix={
                  <span style={{ color: stat.color }}>
                    {stat.icon}
                    {stat.prefix && <span className="ml-1">{stat.prefix}</span>}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminPanel;
