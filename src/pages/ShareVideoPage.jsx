import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, Button, Typography, message } from 'antd';
import { DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;

const ShareVideoPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get(`/api/video/share/${id}`);
        setVideo(response.data.video);
      } catch (error) {
        message.error('Failed to fetch video.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  if (!video) {
    return <div className="flex justify-center items-center h-screen"><Title level={3}>Video not found</Title></div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-2xl shadow-lg">
        <video
          controls
          className="w-full rounded-lg"
          poster={video.thumbnail_url}
          src={video.video_url}
        >
          Your browser does not support the video tag.
        </video>
        <div className="p-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className="text-xs text-gray-400">
            {formatDate(video.created_at)}
          </Text>
          <Text className="text-xs text-gray-400">
            Created with jomvideo.ai
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ShareVideoPage;
