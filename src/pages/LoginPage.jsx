import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.email, values.password);
    
    if (result.success) {
      message.success('Login successful!');
      console.log("testyq result.user.role", result)
      if (result.user.role === 'admin')
        navigate('/admin/dashboard');
      else
        navigate('/dashboard');
    } else {
      message.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <VideoCameraOutlined className="text-4xl text-blue-500" />
            <Title level={2} className="!mb-0 text-gray-800">JomVideo</Title>
          </div>
          <Text className="text-gray-600">Welcome back! Sign in to your account</Text>
        </div>

        <Card className="shadow-lg border-0">
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Enter your email"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                className="rounded-lg"
              />
            </Form.Item>

            {/* <Form.Item className="mb-2"> //TODO: add forgot password feature
              <div className="flex justify-between items-center">
                <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600">
                  Forgot password?
                </Link>
              </div>
            </Form.Item> */}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-lg rounded-lg"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* <Divider>or</Divider>

          <Button
            icon={<GoogleOutlined />}
            className="w-full h-12 text-lg rounded-lg mb-4 border-gray-300"
            onClick={() => message.info('Google login coming soon!')}
          >
            Continue with Google
          </Button> */}

          <div className="text-center">
            <Text className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">
                Sign up
              </Link>
            </Text>
          </div>
        </Card>

        <div className="text-center mt-8">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;