import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Tag, 
  Input, 
  Select, 
  Empty,
  Modal,
  Typography,
  Space,
  Tooltip,
  Pagination,
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import api, { getDownloadUrl } from '../utils/api';
import ShareMenu from '../components/ShareMenu';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const VideoHistory = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchVideos = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
      };
      const response = await api.get('/api/video', { params });
      setVideos(response.data.videos);
      setPagination({
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
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchVideos(pagination.current, pagination.pageSize);
  }, [fetchVideos, pagination.current, pagination.pageSize]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

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

  const handleDelete = (video) => {
    Modal.confirm({
      title: 'Delete Video',
      content: `Are you sure you want to delete "${video.title}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/api/video/${video.id}`);
          message.success('Video deleted successfully!');
          fetchVideos(pagination.current, pagination.pageSize); // Re-fetch videos
        } catch (error) {
          message.error('Failed to delete video.');
          console.error('Error deleting video:', error);
        }
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Title level={2} className="!mb-0">
          Video History
        </Title>
        <Text className="text-gray-600">
          {pagination.total} video{pagination.total !== 1 ? 's' : ''}
        </Text>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Search
            placeholder="Search videos by title or prompt..."
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            size="large"
            defaultValue="all"
            onChange={handleFilterChange}
            className="w-full sm:w-48"
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Videos</Option>
            <Option value="completed">Completed</Option>
            <Option value="processing">Processing</Option>
            <Option value="failed">Failed</Option>
          </Select>
        </div>
      </Card>

      {/* Video Grid */}
      {loading ? (
        <Card loading={true} style={{ minHeight: '300px' }} />
      ) : videos?.length === 0 ? (
        <Card>
          <Empty
            description="No videos found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => window.location.href = '/dashboard/generate'}>
              Generate Your First Video
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {videos?.map((video) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={video.id}>
                <Card
                  className="h-full hover:shadow-lg transition-shadow duration-300"
                  cover={
                    <div className="relative">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          type="primary"
                          shape="circle"
                          size="large"
                          icon={<PlayCircleOutlined />}
                          onClick={() => setSelectedVideo(video)}
                        />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        {video.duration}s
                      </div>
                    </div>
                  }
                  actions={[
                    <Tooltip title="Download">
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        disabled={video.status !== 'completed'}
                        onClick={() => handleDownload(video)}
                      />
                    </Tooltip>,
                    <ShareMenu video={video} />,
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(video)}
                      />
                    </Tooltip>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="flex justify-between items-start">
                        <Text className="font-medium" ellipsis>{video.title}</Text>
                        <Tag color={getStatusColor(video.status)} className="ml-2">
                          {video.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-2">
                        <Text className="text-sm text-gray-600" ellipsis={{ rows: 2 }}>
                          {video.prompt}
                        </Text>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{video.resolution} • {video.orientation}</span>
                          <span>{video.credits_used} credits</span>
                        </div>
                        <Text className="text-xs text-gray-400">
                          {formatDate(video.created_at)}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-6">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              onShowSizeChange={handlePageChange}
            />
          </div>
        </>
      )}

      {/* Video Preview Modal */}
      <Modal
        title={selectedVideo?.title}
        open={!!selectedVideo}
        onCancel={() => setSelectedVideo(null)}
        footer={null}
        width={800}
      >
        {selectedVideo && (
          <div className="space-y-4">
            <video
              controls
              className="w-full rounded-lg"
              poster={selectedVideo.thumbnail_url}
            >
              <source src={selectedVideo.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Text className="font-medium">Prompt:</Text>
                <Paragraph className="text-gray-600 mt-1">
                  {selectedVideo.prompt}
                </Paragraph>
              </div>
              <div>
                <Text className="font-medium">Details:</Text>
                <div className="mt-1 space-y-1">
                  <div>Duration: {selectedVideo.duration}s</div>
                  <div>Resolution: {selectedVideo.settings?.resolution}</div>
                  <div>Orientation: {selectedVideo.settings?.orientation}</div>
                  <div>Credits Used: {selectedVideo.credits_used}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoHistory;
