import React, { useState, useEffect } from 'react';
import {
  Modal,
  Typography,
  Spin,
  message
} from 'antd';
import api from '../utils/api';

const { Text, Paragraph } = Typography;

const VideoPreviewModal = ({ video, visible, onCancel }) => {
  const [videoDetails, setVideoDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (video) {
      const fetchVideoDetails = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/api/video/${video.id}`);
          setVideoDetails(response.data?.video);
        } catch (error) {
          message.error('Failed to fetch video details.');
          console.error('Error fetching video details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchVideoDetails();
    }
  }, [video]);

  const handleCancel = () => {
    setVideoDetails(null);
    onCancel();
  }

  return (
    <Modal
      title={videoDetails?.title || video?.title}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      {loading ? (
        <div className="text-center p-8">
          <Spin size="large" />
        </div>
      ) : videoDetails && (
        <div className="space-y-4">
          <video
            controls
            className="w-full rounded-lg"
            poster={videoDetails.thumbnail_url}
            src={videoDetails.video_url}
          >
            <source src={videoDetails.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Text className="font-medium">Prompt:</Text>
              <Paragraph className="text-gray-600 mt-1">
                {videoDetails.prompt}
              </Paragraph>
            </div>
            <div>
              <Text className="font-medium">Details:</Text>
              <div className="mt-1 space-y-1">
                <div>Duration: {videoDetails.duration}s</div>
                <div>Resolution: {videoDetails.settings?.resolution}</div>
                <div>Orientation: {videoDetails.settings?.orientation}</div>
                <div>Credits Used: {videoDetails.credits_used}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VideoPreviewModal;