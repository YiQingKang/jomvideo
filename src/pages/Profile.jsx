import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Statistic,
  Divider,
  Upload,
  message
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CameraOutlined,
  VideoCameraOutlined,
  CreditCardOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      message.success('Avatar updated successfully!');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // API call to update profile would go here
      console.log('Updating profile:', values);
      message.success('Profile updated successfully!');
      await fetchUser();
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Videos Generated',
      value: 25,
      icon: <VideoCameraOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Credits Used',
      value: 68,
      icon: <CreditCardOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Member Since',
      value: 'Jan 2024',
      icon: <CalendarOutlined />,
      color: '#722ed1'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Title level={2}>Profile Settings</Title>

      {/* Profile Overview */}
      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6} className="text-center">
            <div className="relative inline-block">
              <Avatar
                size={120}
                src={user?.avatar}
                icon={<UserOutlined />}
                className="mb-4"
              />
              <Upload
                showUploadList={false}
                onChange={handleAvatarChange}
                className="absolute bottom-0 right-0"
              >
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                />
              </Upload>
            </div>
          </Col>
          <Col xs={24} sm={18}>
            <Title level={3} className="!mb-1">{user?.name}</Title>
            <Text className="text-gray-600 text-lg">{user?.email}</Text>
            <div className="mt-4">
              <Text className="text-2xl font-bold text-blue-500">
                {user?.credits || 0}
              </Text>
              <Text className="text-gray-600 ml-2">credits remaining</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Statistics */}
        <Col xs={24} lg={8}>
          <Card title="Statistics">
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <Text className="text-sm text-gray-600">{stat.title}</Text>
                      <div className="font-semibold">{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Profile Information */}
        <Col xs={24} lg={16}>
          <Card title="Profile Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                name: user?.name,
                email: user?.email,
                bio: user?.bio || ''
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: 'Please enter your name!' },
                      { min: 2, message: 'Name must be at least 2 characters!' }
                    ]}
                  >
                    <Input prefix={<UserOutlined />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter your email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="bio"
                label="Bio"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </Form.Item>

              <Divider />

              <Title level={4}>Change Password</Title>
              
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                  >
                    <Input.Password size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      { min: 6, message: 'Password must be at least 6 characters!' }
                    ]}
                  >
                    <Input.Password size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={['newPassword']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="px-8"
                >
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;