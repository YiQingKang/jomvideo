import React, { useState, useEffect } from 'react';
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
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const VideoHistory = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    // Mock video data
    const mockVideos = [
      {
        id: 1,
        title: 'Product Launch Video',
        prompt: 'A sleek product showcase with dynamic lighting and smooth transitions',
        thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: 'https://example.com/video1.mp4',
        status: 'completed',
        duration: '00:30',
        resolution: '1080p',
        orientation: 'landscape',
        createdAt: '2024-01-15T10:30:00Z',
        creditsUsed: 2
      },
      {
        id: 2,
        title: 'Social Media Promo',
        prompt: 'Vibrant colors, fast-paced editing, modern typography for social media',
        thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: 'https://example.com/video2.mp4',
        status: 'completed',
        duration: '00:15',
        resolution: '720p',
        orientation: 'portrait',
        createdAt: '2024-01-14T14:22:00Z',
        creditsUsed: 1
      },
      {
        id: 3,
        title: 'Brand Story Video',
        prompt: 'Emotional storytelling with warm colors and gentle transitions',
        thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: null,
        status: 'processing',
        duration: '01:00',
        resolution: '4K',
        orientation: 'landscape',
        createdAt: '2024-01-13T09:15:00Z',
        creditsUsed: 4
      },
      {
        id: 4,
        title: 'Tutorial Introduction',
        prompt: 'Clean, professional look with step-by-step visual guide',
        thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: 'https://example.com/video4.mp4',
        status: 'completed',
        duration: '00:45',
        resolution: '1080p',
        orientation: 'landscape',
        createdAt: '2024-01-12T16:45:00Z',
        creditsUsed: 2
      },
      {
        id: 5,
        title: 'Event Highlight',
        prompt: 'Dynamic event coverage with energetic music and quick cuts',
        thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: null,
        status: 'failed',
        duration: '00:20',
        resolution: '1080p',
        orientation: 'square',
        createdAt: '2024-01-11T11:20:00Z',
        creditsUsed: 2
      },
    ];

    setVideos(mockVideos);
    setFilteredVideos(mockVideos);
  }, []);

  useEffect(() => {
    let filtered = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(video => video.status === filterStatus);
    }

    setFilteredVideos(filtered);
  }, [searchTerm, filterStatus, videos]);

  const handleShare = (video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Check out this AI-generated video: ${video.title}`,
        url: video.videoUrl
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(video.videoUrl);
      Modal.success({
        title: 'Link Copied!',
        content: 'Video link has been copied to clipboard.',
      });
    }
  };

  const handleDelete = (video) => {
    Modal.confirm({
      title: 'Delete Video',
      content: `Are you sure you want to delete "${video.title}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setVideos(prev => prev.filter(v => v.id !== video.id));
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
          {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
        </Text>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Search
            placeholder="Search videos by title or prompt..."
            enterButton={<SearchOutlined />}
            size="large"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            size="large"
            defaultValue="all"
            onChange={setFilterStatus}
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
      {filteredVideos.length === 0 ? (
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
        <Row gutter={[16, 16]}>
          {filteredVideos.map((video) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={video.id}>
              <Card
                className="h-full hover:shadow-lg transition-shadow duration-300"
                cover={
                  <div className="relative">
                    <img
                      src={video.thumbnail}
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
                      {video.duration}
                    </div>
                  </div>
                }
                actions={[
                  <Tooltip title="Download">
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      disabled={video.status !== 'completed'}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = video.videoUrl;
                        link.download = `${video.title}.mp4`;
                        link.click();
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="Share">
                    <Button
                      type="text"
                      icon={<ShareAltOutlined />}
                      disabled={video.status !== 'completed'}
                      onClick={() => handleShare(video)}
                    />
                  </Tooltip>,
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
                        <span>{video.creditsUsed} credits</span>
                      </div>
                      <Text className="text-xs text-gray-400">
                        {formatDate(video.createdAt)}
                      </Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
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
              poster={selectedVideo.thumbnail}
            >
              <source src={selectedVideo.videoUrl} type="video/mp4" />
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
                  <div>Duration: {selectedVideo.duration}</div>
                  <div>Resolution: {selectedVideo.resolution}</div>
                  <div>Orientation: {selectedVideo.orientation}</div>
                  <div>Credits Used: {selectedVideo.creditsUsed}</div>
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