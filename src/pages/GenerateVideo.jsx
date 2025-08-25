import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Slider, 
  Typography, 
  Alert, 
  Progress,
  Space,
  Divider,
  message
} from 'antd';
import { VideoCameraOutlined, SendOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const GenerateVideo = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(1);

  const orientationOptions = [
    { label: 'Landscape (16:9)', value: 'landscape' },
    { label: 'Portrait (9:16)', value: 'portrait' },
    { label: 'Square (1:1)', value: 'square' }
  ];

  const resolutionOptions = [
    { label: 'HD (720p)', value: 'hd', cost: 1 },
    { label: 'Full HD (1080p)', value: 'fhd', cost: 2 },
    { label: '4K (2160p)', value: '4k', cost: 4 }
  ];

  const styleOptions = [
    'Realistic', 'Cartoon', 'Anime', 'Oil Painting', 'Watercolor', 
    'Sketch', 'Digital Art', 'Photographic', 'Cinematic', 'Abstract'
  ];

  const handleValuesChange = (changedValues, allValues) => {
    const resolution = allValues.resolution || 'hd';
    const duration = allValues.duration || 10;
    
    const resolutionCost = resolutionOptions.find(r => r.value === resolution)?.cost || 1;
    const durationMultiplier = Math.ceil(duration / 10);
    
    setEstimatedCost(resolutionCost * durationMultiplier);
  };

  const onFinish = async (values) => {
    if ((user?.credits || 0) < estimatedCost) {
      message.error('Insufficient credits to generate this video.');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const response = await api.post('/api/video/generate', {
        title: values.prompt.substring(0, 30), // Auto-generate title
        prompt: values.prompt,
        negative_prompt: values.negative_prompt,
        settings: {
          orientation: values.orientation,
          resolution: values.resolution,
          duration: values.duration,
          style: values.style,
          seed: values.seed,
        }
      });

      // Simulate generation progress for demo purposes
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setGenerating(false);
            message.success('Video generated successfully!');
            fetchUser(); // Update credits
            navigate('/dashboard/history');
            return 100;
          }
          return prev + Math.random() * 25;
        });
      }, 500);

    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to start video generation.');
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <Title level={2} className="flex items-center justify-center space-x-2">
          <VideoCameraOutlined className="text-blue-500" />
          <span>Generate New Video</span>
        </Title>
        <Paragraph className="text-gray-600">
          Transform your ideas into stunning videos with AI
        </Paragraph>
      </div>

      {user?.credits < estimatedCost && (
        <Alert
          message="Insufficient Credits"
          description={`You need ${estimatedCost} credits to generate this video. You currently have ${user?.credits || 0} credits.`}
          type="warning"
          showIcon
          action={
            <Button type="primary" size="small" onClick={() => navigate('/dashboard/credits')}>
              Buy Credits
            </Button>
          }
        />
      )}

      <Card className="shadow-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          initialValues={{
            orientation: 'landscape',
            resolution: 'hd',
            duration: 10,
            style: 'Realistic'
          }}
        >
          {/* Text Prompt */}
          <Form.Item
            name="prompt"
            label={
              <span className="text-lg font-medium">
                Describe Your Video
              </span>
            }
            rules={[
              { required: true, message: 'Please describe what video you want to create!' },
              { min: 10, message: 'Description must be at least 10 characters!' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="A serene sunset over a mountain lake with gentle waves, golden hour lighting, cinematic composition..."
              className="text-lg"
            />
          </Form.Item>

          <Divider />

          {/* Video Settings */}
          <Title level={4} className="!mb-4">Video Settings</Title>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="orientation"
              label="Orientation"
            >
              <Select size="large">
                {orientationOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="resolution"
              label="Resolution"
            >
              <Select size="large">
                {resolutionOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration (seconds)"
            >
              <Slider
                min={5}
                max={60}
                marks={{
                  5: '5s',
                  15: '15s',
                  30: '30s',
                  60: '60s'
                }}
              />
            </Form.Item>

            <Form.Item
              name="style"
              label="Art Style"
            >
              <Select size="large" placeholder="Select art style">
                {styleOptions.map(style => (
                  <Option key={style} value={style}>
                    {style}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Divider />

          {/* Advanced Settings */}
          <Title level={4} className="!mb-4">Advanced Settings</Title>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="negative_prompt"
              label="Negative Prompt (Optional)"
            >
              <TextArea
                rows={2}
                placeholder="blurry, low quality, distorted..."
              />
            </Form.Item>

            <Form.Item
              name="seed"
              label="Seed (Optional)"
            >
              <Input
                type="number"
                placeholder="Random seed for reproducibility"
              />
            </Form.Item>
          </div>

          {/* Cost Estimation */}
          <Card className="bg-gray-50 border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <Text className="text-lg font-medium">Estimated Cost</Text>
                <div className="flex items-center space-x-2 mt-1">
                  <CreditCardOutlined className="text-blue-500" />
                  <Text className="text-2xl font-bold text-blue-500">
                    {estimatedCost} credits
                  </Text>
                </div>
              </div>
              <div className="text-right">
                <Text className="text-gray-600">Your Balance</Text>
                <div className="text-xl font-semibold">
                  {user?.credits || 0} credits
                </div>
              </div>
            </div>
          </Card>

          {/* Generation Progress */}
          {generating && (
            <Card className="bg-blue-50 border border-blue-200 mt-6">
              <div className="text-center">
                <Title level={4} className="!mb-4">
                  Generating Your Video...
                </Title>
                <Progress 
                  percent={Math.round(progress)} 
                  status="active"
                  className="mb-4"
                />
                <Text className="text-gray-600">
                  This may take a few minutes. Please don't close this page.
                </Text>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Form.Item className="!mt-6 !mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={generating}
              disabled={generating || (user?.credits < estimatedCost)}
              size="large"
              className="w-full h-12 text-lg"
              icon={<SendOutlined />}
            >
              {generating ? 'Generating Video...' : 'Generate Video'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default GenerateVideo;
