import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Statistic, 
  Row, 
  Col,
  Typography,
  message,
  List,
  Avatar,
  Tag
} from 'antd';
import { 
  UserOutlined,
  VideoCameraOutlined,
  CreditCardOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalCreditsUsed: 0,
    totalPayments: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data.stats);
      setRecentVideos(response.data.recentVideos);
      setRecentUsers(response.data.recentUsers);
    } catch (error) {
      message.error('Failed to fetch admin stats.');
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const adminStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Total Videos',
      value: stats.totalVideos,
      icon: <VideoCameraOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Total Revenue',
      value: stats.totalPayments,
      prefix: '$',
      icon: <DollarOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Credits Used',
      value: stats.totalCreditsUsed,
      icon: <CreditCardOutlined />,
      color: '#fa8c16'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      case 'deleted': return 'red';
      default: return 'default';
    }
  };

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

      <Row gutter={[24, 24]}>
        {/* Recent Videos */}
        <Col xs={24} lg={12}>
          <Card title="Recent Videos" loading={loading}>
            <List
              itemLayout="horizontal"
              dataSource={recentVideos}
              renderItem={(video) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={video.thumbnail_url} icon={<VideoCameraOutlined />} />}
                    title={<Text>{video.title}</Text>}
                    description={
                      <>
                        <Text type="secondary">by {video.user?.name || 'N/A'}</Text>
                        <br />
                        <Tag color={getStatusColor(video.status)}>{video.status}</Tag>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Users */}
        <Col xs={24} lg={12}>
          <Card title="Recent Users" loading={loading}>
            <List
              itemLayout="horizontal"
              dataSource={recentUsers}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={<Text>{user.name}</Text>}
                    description={
                      <>
                        <Text type="secondary">{user.email}</Text>
                        <br />
                        <Tag color={user.status === 'active' ? 'green' : 'red'}>{user.status}</Tag>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPanel;
