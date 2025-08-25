import React, { useState, useEffect } from 'react';
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
import api from '../utils/api';

const { Title, Text } = Typography;

const Profile = ({ isAdmin = false }) => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isAdmin) {
      const getStats = async () => {
        try {
          const response = await api.get('/api/user/stats');
          setStats(response.data);
        } catch (error) {
          console.error('Failed to fetch stats', error);
        }
      };
      getStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        bio: user.bio || ''
      });
    }
  }, [user, form]);

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      message.success('Avatar updated successfully!');
      fetchUser();
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { name, email, bio, currentPassword, newPassword } = values;

      // Update profile info
      if (name !== user.name || email !== user.email || bio !== user.bio) {
        await api.put('/api/user/profile', { name, email, bio });
      }

      // Change password
      if (newPassword && currentPassword) {
        await api.put('/api/user/password', { currentPassword, newPassword });
        form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      } else if (newPassword && !currentPassword) {
        message.error('Please enter your current password to set a new one.');
        setLoading(false);
        return;
      }

      message.success('Profile updated successfully!');
      await fetchUser();

    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const commonStats = [
    {
      title: 'Member Since',
      value: user ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
      icon: <CalendarOutlined />,
      color: '#722ed1'
    }
  ];

  const userSpecificStats = [
    {
      title: 'Videos Generated',
      value: stats?.totalVideos || 0,
      icon: <VideoCameraOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Credits Used',
      value: stats?.totalCreditsUsed || 0,
      icon: <CreditCardOutlined />,
      color: '#52c41a'
    },
  ];

  const adminSpecificStats = [
    {
      title: 'Role',
      value: user?.role || 'N/A',
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Last Login',
      value: user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A',
      icon: <MailOutlined />,
      color: '#52c41a'
    },
  ];

  const displayedStats = isAdmin 
    ? [...commonStats, ...adminSpecificStats] 
    : [...commonStats, ...userSpecificStats];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Title level={2}>{isAdmin ? 'Admin Profile' : 'Profile Settings'}</Title>

      {/* Profile Overview */}
      <Card>
        <Row gutter={[24, 24]} align="middle">
          {/* <Col xs={24} sm={6} className="text-center">  //TODO: add upload profile picture feature
            <div className="relative inline-block">
              <Avatar
                size={120}
                src={user?.avatar}
                icon={<UserOutlined />}
                className="mb-4"
              />
              {!isAdmin && (
                <Upload
                  name="avatar"
                  action="/api/user/avatar" // Assuming this endpoint exists
                  headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
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
              )}
            </div> 
          </Col>*/}
          <Col xs={24} sm={18}>
            <Title level={3} className="!mb-1">{user?.name}</Title>
            <Text className="text-gray-600 text-lg">{user?.email}</Text>
            {!isAdmin && (
              <div className="mt-4">
                <Text className="text-2xl font-bold text-blue-500">
                  {user?.credits || 0}
                </Text>
                <Text className="text-gray-600 ml-2">credits remaining</Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Statistics */}
        <Col xs={24} lg={8}>
          <Card title="Statistics">
            <div className="space-y-4">
              {displayedStats.map((stat, index) => (
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
              validateMessages={{
                required: '${label} is required!',
                types: {
                  email: '${label} is not a valid email!',
                },
                string: {
                  min: '${label} must be at least ${min} characters',
                },
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true }, { min: 2 }]}
                  >
                    <Input prefix={<UserOutlined />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[{ required: true }, { type: 'email' }]}
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
                    <Input.Password size="large" placeholder="Current Password" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[{ min: 6 }]}
                  >
                    <Input.Password size="large" placeholder="New Password" />
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
                      <Input.Password size="large" placeholder="Confirm Password" />
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