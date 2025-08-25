import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const result = await register({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    
    if (result.success) {
      message.success('Registration successful. Welcome to JomVideo.');
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
          <Text className="text-gray-600">Create your account and start generating videos</Text>
        </div>

        <Card className="shadow-lg border-0">
          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: 'Please enter your name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Enter your full name"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Enter your email"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Create a password"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                { required: true, message: 'Please agree to the terms and conditions' }
              ]}
            >
              <Checkbox>
                I agree to the <a href="#" className="text-blue-500">Terms of Service</a> and{' '}
                <a href="#" className="text-blue-500">Privacy Policy</a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-lg rounded-lg"
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {/* <Divider>or</Divider>

          <Button
            icon={<GoogleOutlined />}
            className="w-full h-12 text-lg rounded-lg mb-4 border-gray-300"
            onClick={() => message.info('Google registration coming soon')}
          >
            Sign up with Google
          </Button> */}

          <div className="text-center">
            <Text className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
                Sign in
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

export default RegisterPage;