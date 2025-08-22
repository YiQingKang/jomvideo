import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Typography,
  Input,
  Select,
  Modal,
  message,
  Space,
  Pagination
} from 'antd';
import { 
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [videoSearchTerm, setVideoSearchTerm] = useState('');
  const [videoPagination, setVideoPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchVideos = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(videoSearchTerm && { search: videoSearchTerm }),
      };
      const response = await api.get('/api/admin/videos', { params });
      setVideos(response.data.videos);
      setVideoPagination({
        current: response.data.pagination.current,
        pageSize: limit,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('Failed to fetch videos.');
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }, [videoSearchTerm]);

  useEffect(() => {
    fetchVideos(videoPagination.current, videoPagination.pageSize);
  }, [fetchVideos, videoPagination.current, videoPagination.pageSize]);

  const handleVideoSearch = (value) => {
    setVideoSearchTerm(value);
    setVideoPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleVideoPageChange = (page, pageSize) => {
    setVideoPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await api.delete(`/api/admin/videos/${videoId}`);
      message.success('Video deleted successfully!');
      fetchVideos(videoPagination.current, videoPagination.pageSize);
    } catch (error) {
      message.error('Failed to delete video.');
      console.error('Error deleting video:', error);
    }
  };

  const videoColumns = [
    {
      title: 'Video',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (text, record) => record.user ? record.user.name : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'blue'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Resolution',
      dataIndex: ['settings', 'resolution'],
      key: 'resolution',
      render: (resolution) => resolution || 'N/A'
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration || 0}s`
    },
    {
      title: 'Credits Used',
      dataIndex: 'credits_used',
      key: 'creditsUsed'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Video',
                content: `Are you sure you want to delete "${record.title}"?`,
                onOk: () => handleDeleteVideo(record.id)
              });
            }}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Video Management</Title>
      {/* Videos Management */}
      <Card 
        title="Videos Management"
        extra={
          <Search 
            placeholder="Search videos..." 
            style={{ width: 200 }}
            onSearch={handleVideoSearch}
            onChange={(e) => setVideoSearchTerm(e.target.value)}
          />
        }
      >
        <Table
          columns={videoColumns}
          dataSource={videos}
          loading={loading}
          rowKey="id"
          pagination={{
            current: videoPagination.current,
            pageSize: videoPagination.pageSize,
            total: videoPagination.total,
            onChange: handleVideoPageChange,
            showSizeChanger: true,
            onShowSizeChange: handleVideoPageChange,
          }}
        />
      </Card>
    </div>
  );
};

export default AdminVideoManagement;