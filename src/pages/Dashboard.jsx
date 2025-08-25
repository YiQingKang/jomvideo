import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, List, Avatar, Tag, Progress, message } from 'antd';
import {
  VideoCameraOutlined,
  PlayCircleOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  PlusOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getDownloadUrl } from '../utils/api';
import ShareMenu from '../components/ShareMenu';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentVideos, setRecentVideos] = useState([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    creditsUsed: 0,
    totalDownloads: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, videosResponse] = await Promise.all([
          api.get('/api/user/stats'),
          api.get('/api/video?limit=5')
        ]);

        const { totalVideos, totalCreditsUsed, completedVideos } = statsResponse.data;
        const successRate = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

        setStats({
          totalVideos,
          creditsUsed: totalCreditsUsed,
          totalDownloads: 0, // This needs to be calculated differently
          successRate: Math.round(successRate)
        });

        setRecentVideos(videosResponse.data.videos);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDownload = async (video) => {
    try {
      const response = await getDownloadUrl(video.id);
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `${video.title}.mp4`;
      link.click();
    } catch (error) {
      message.error('Failed to get download link.');
    }
  };

  const quickActions = [
    {
      title: 'Generate New Video',
      description: 'Create a new AI-generated video',
      icon: <VideoCameraOutlined className="text-2xl text-blue-500" />,
      action: () => navigate('/dashboard/generate')
    },
    {
      title: 'Buy Credits',
      description: 'Purchase more credits',
      icon: <CreditCardOutlined className="text-2xl text-green-500" />,
      action: () => navigate('/dashboard/credits')
    },
    {
      title: 'View History',
      description: 'Browse all your videos',
      icon: <PlayCircleOutlined className="text-2xl text-purple-500" />,
      action: () => navigate('/dashboard/history')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <Title level={2} className="!text-white !mb-2">
          Welcome back, {user?.name}! 🎬
        </Title>
        <Text className="text-blue-100">
          Ready to create some amazing videos today?
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Videos"
              value={stats.totalVideos}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Credits Remaining"
              value={user?.credits || 0}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Credits Used"
              value={stats.creditsUsed}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Success Rate"
              value={stats.successRate}
              prefix={<TrophyOutlined />}
              suffix="%"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card title="Quick Actions" className="h-full">
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  size="small"
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={action.action}
                >
                  <div className="flex items-center space-x-3">
                    {action.icon}
                    <div>
                      <Text className="font-medium block">{action.title}</Text>
                      <Text className="text-gray-500 text-sm">{action.description}</Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Col>

        {/* Recent Videos */}
        <Col xs={24} lg={16}>
          <Card 
            title="Recent Videos" 
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/dashboard/generate')}>
                Create New
              </Button>
            }
            className="h-full"
            loading={loading}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentVideos}
              renderItem={(video) => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<DownloadOutlined />} key="download" disabled={video.status !== 'completed'} onClick={() => handleDownload(video)}>
                      Download
                    </Button>,
                    <ShareMenu video={video} />
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={video.thumbnail_url} 
                        shape="square" 
                        size={64}
                        icon={<VideoCameraOutlined />}
                      />
                    }
                    title={
                      <div className="flex items-center space-x-2">
                        <Text className="font-medium">{video.title}</Text>
                        <Tag color={video.status === 'completed' ? 'green' : (video.status === 'failed' ? 'red' : 'default')}>
                          {video.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <Text className="text-gray-500">Duration: {video.duration || 'N/A'}s</Text>
                        <Text className="text-gray-500">Created: {new Date(video.created_at).toLocaleDateString()}</Text>
                        {video.status === 'processing' && (
                          <Progress percent={50} size="small" status="active" />
                        )}
                      </div>
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

export default Dashboard;
