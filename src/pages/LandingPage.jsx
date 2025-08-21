import React from 'react';
import { Button, Card, Typography, Row, Col, Statistic } from 'antd';
import { 
  PlayCircleOutlined, 
  RocketOutlined, 
  StarOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PlayCircleOutlined className="text-4xl text-blue-500" />,
      title: 'AI-Powered Generation',
      description: 'Transform your text into stunning videos using advanced AI technology'
    },
    {
      icon: <RocketOutlined className="text-4xl text-green-500" />,
      title: 'Lightning Fast',
      description: 'Generate professional videos in minutes, not hours'
    },
    {
      icon: <StarOutlined className="text-4xl text-purple-500" />,
      title: 'Multiple Formats',
      description: 'Create videos for TikTok, Instagram, YouTube, and more'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      credits: 10,
      price: '$9.99',
      features: ['10 video generations', 'HD quality', 'Basic templates']
    },
    {
      name: 'Pro',
      credits: 50,
      price: '$39.99',
      features: ['50 video generations', '4K quality', 'Premium templates', 'Priority support']
    },
    {
      name: 'Enterprise',
      credits: 100,
      price: '$79.99',
      features: ['100 video generations', '8K quality', 'Custom templates', 'Dedicated support']
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PlayCircleOutlined className="text-2xl text-blue-500" />
            <Title level={3} className="!mb-0 text-gray-800">VideoAI</Title>
          </div>
          <div className="flex items-center space-x-4">
            <Button type="text" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Title level={1} className="!text-5xl !mb-6 text-gray-800">
            Turn Your Ideas Into
            <span className="text-blue-500 block">Stunning Videos</span>
          </Title>
          <Paragraph className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create professional-quality videos from simple text prompts using our cutting-edge AI technology. 
            Perfect for social media, marketing, and creative projects.
          </Paragraph>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              type="primary" 
              size="large" 
              className="h-12 px-8 text-lg"
              onClick={() => navigate('/register')}
              icon={<ArrowRightOutlined />}
            >
              Start Creating for Free
            </Button>
            <Button 
              size="large" 
              className="h-12 px-8 text-lg"
              icon={<PlayCircleOutlined />}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} sm={8} lg={6}>
              <Statistic
                title="Videos Generated"
                value={125000}
                prefix={<PlayCircleOutlined />}
                className="text-center"
              />
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Statistic
                title="Happy Users"
                value={15000}
                prefix={<StarOutlined />}
                className="text-center"
              />
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Statistic
                title="Hours Saved"
                value={250000}
                prefix={<RocketOutlined />}
                className="text-center"
              />
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Statistic
                title="Success Rate"
                value={99}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                className="text-center"
              />
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Title level={2} className="!text-4xl !mb-4">
              Why Choose VideoAI?
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of video creation with our advanced AI platform
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  className="h-full text-center hover:shadow-lg transition-shadow duration-300"
                  bodyStyle={{ padding: '32px 24px' }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <Title level={4} className="!mb-3">{feature.title}</Title>
                  <Paragraph className="text-gray-600">{feature.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Title level={2} className="!text-4xl !mb-4">
              Simple, Transparent Pricing
            </Title>
            <Paragraph className="text-lg text-gray-600">
              Choose the plan that works best for your needs
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]} justify="center">
            {pricingPlans.map((plan, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  className={`h-full text-center hover:shadow-xl transition-all duration-300 ${
                    index === 1 ? 'border-blue-500 border-2 transform scale-105' : ''
                  }`}
                  bodyStyle={{ padding: '32px 24px' }}
                >
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <Title level={3} className="!mb-2">{plan.name}</Title>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-blue-500">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/ {plan.credits} credits</span>
                  </div>
                  
                  <ul className="text-left mb-8 space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    type={index === 1 ? 'primary' : 'default'}
                    size="large"
                    className="w-full h-12"
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <Title level={2} className="!text-white !text-4xl !mb-6">
            Ready to Create Amazing Videos?
          </Title>
          <Paragraph className="text-xl text-blue-100 mb-8">
            Join thousands of creators who are already transforming their ideas into stunning videos
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            className="h-12 px-8 text-lg bg-white text-blue-500 border-white hover:bg-gray-100"
            onClick={() => navigate('/register')}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <PlayCircleOutlined className="text-2xl text-blue-400" />
            <Title level={3} className="!text-white !mb-0">VideoAI</Title>
          </div>
          <Paragraph className="text-gray-400 mb-0">
            © 2025 VideoAI. All rights reserved.
          </Paragraph>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;