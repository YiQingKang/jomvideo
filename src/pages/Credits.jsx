import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography, 
  List, 
  Tag, 
  Table,
  Modal,
  message
} from 'antd';
import { 
  CreditCardOutlined, 
  ShoppingCartOutlined, 
  StarOutlined,
  CheckOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

const Credits = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const creditPackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 10,
      price: 9.99,
      originalPrice: null,
      popular: false,
      features: [
        '10 video generations',
        'HD quality (720p)',
        'Basic templates',
        'Standard support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 50,
      price: 39.99,
      originalPrice: 49.95,
      popular: true,
      features: [
        '50 video generations',
        'Full HD quality (1080p)',
        'Premium templates',
        'Priority support',
        'Advanced settings'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      credits: 100,
      price: 79.99,
      originalPrice: 99.95,
      popular: false,
      features: [
        '100 video generations',
        '4K quality (2160p)',
        'Custom templates',
        'Dedicated support',
        'API access',
        'Bulk generation'
      ]
    }
  ];

  const usageHistory = [
    {
      key: '1',
      date: '2024-01-15',
      description: 'Product Launch Video - 1080p Landscape',
      credits: -2,
      type: 'usage',
      status: 'completed'
    },
    {
      key: '2',
      date: '2024-01-14',
      description: 'Pro Pack Purchase',
      credits: +50,
      type: 'purchase',
      status: 'completed'
    },
    {
      key: '3',
      date: '2024-01-14',
      description: 'Social Media Promo - 720p Portrait',
      credits: -1,
      type: 'usage',
      status: 'completed'
    },
    {
      key: '4',
      date: '2024-01-13',
      description: 'Brand Story Video - 4K Landscape',
      credits: -4,
      type: 'usage',
      status: 'processing'
    },
    {
      key: '5',
      date: '2024-01-12',
      description: 'Tutorial Introduction - 1080p Landscape',
      credits: -2,
      type: 'usage',
      status: 'completed'
    }
  ];

  const usageColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (credits) => (
        <Tag color={credits > 0 ? 'green' : 'red'}>
          {credits > 0 ? '+' : ''}{credits}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'blue'}>
          {status}
        </Tag>
      )
    }
  ];

  const handlePurchase = async (packageInfo) => {
    setLoading(true);
    try {
      // This would integrate with Stripe/PayPal
      console.log('Purchasing package:', packageInfo);
      
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success(`Successfully purchased ${packageInfo.credits} credits!`);
      setSelectedPlan(null);
      
      // Would normally refresh user data here
      
    } catch (error) {
      message.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Title level={2} className="flex items-center justify-center space-x-2">
          <CreditCardOutlined className="text-blue-500" />
          <span>Credits & Billing</span>
        </Title>
        <Paragraph className="text-gray-600">
          Manage your credits and purchase additional video generation credits
        </Paragraph>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <div className="text-center">
          <Title level={1} className="!text-white !mb-2">
            {user?.credits || 0}
          </Title>
          <Text className="text-blue-100 text-lg">Credits Remaining</Text>
          <div className="mt-4">
            <Button 
              type="primary" 
              size="large" 
              className="bg-white text-blue-500 border-white hover:bg-gray-100"
              onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })}
            >
              Buy More Credits
            </Button>
          </div>
        </div>
      </Card>

      {/* Credit Packages */}
      <div id="packages">
        <Title level={3} className="text-center mb-6">Choose Your Credit Package</Title>
        <Row gutter={[24, 24]}>
          {creditPackages.map((pkg) => (
            <Col xs={24} md={8} key={pkg.id}>
              <Card
                className={`h-full text-center hover:shadow-xl transition-all duration-300 ${
                  pkg.popular ? 'border-blue-500 border-2 transform scale-105' : ''
                }`}
                bodyStyle={{ padding: '32px 24px' }}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Tag color="gold" icon={<StarOutlined />} className="px-3 py-1">
                      Most Popular
                    </Tag>
                  </div>
                )}
                
                <div className="mb-6">
                  <Title level={3} className="!mb-2">{pkg.name}</Title>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-4xl font-bold text-blue-500">${pkg.price}</span>
                    {pkg.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        ${pkg.originalPrice}
                      </span>
                    )}
                  </div>
                  <Text className="text-gray-600">{pkg.credits} Credits</Text>
                  <div className="mt-2">
                    <Text className="text-green-600 font-medium">
                      ${(pkg.price / pkg.credits).toFixed(2)} per credit
                    </Text>
                  </div>
                </div>
                
                <List
                  size="small"
                  className="text-left mb-6"
                  dataSource={pkg.features}
                  renderItem={(feature) => (
                    <List.Item className="px-0 border-0">
                      <div className="flex items-center">
                        <CheckOutlined className="text-green-500 mr-2" />
                        <Text>{feature}</Text>
                      </div>
                    </List.Item>
                  )}
                />
                
                <Button
                  type={pkg.popular ? 'primary' : 'default'}
                  size="large"
                  className="w-full h-12"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => setSelectedPlan(pkg)}
                >
                  Purchase Credits
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Usage History */}
      <Card title="Credit Usage History" extra={<TrophyOutlined />}>
        <Table
          columns={usageColumns}
          dataSource={usageHistory}
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      {/* Purchase Modal */}
      <Modal
        title="Complete Your Purchase"
        open={!!selectedPlan}
        onCancel={() => setSelectedPlan(null)}
        footer={null}
        width={500}
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Title level={3} className="!mb-2">{selectedPlan.name}</Title>
              <div className="text-3xl font-bold text-blue-500 mb-2">
                ${selectedPlan.price}
              </div>
              <Text className="text-gray-600">
                {selectedPlan.credits} Credits
              </Text>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text>Package:</Text>
                <Text className="font-medium">{selectedPlan.name}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Credits:</Text>
                <Text className="font-medium">{selectedPlan.credits}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Price per credit:</Text>
                <Text className="font-medium">
                  ${(selectedPlan.price / selectedPlan.credits).toFixed(2)}
                </Text>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <Text>Total:</Text>
                <Text>${selectedPlan.price}</Text>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                type="primary"
                size="large"
                className="w-full h-12"
                loading={loading}
                onClick={() => handlePurchase(selectedPlan)}
              >
                Pay with Stripe
              </Button>
              <Button
                size="large"
                className="w-full h-12"
                loading={loading}
                onClick={() => handlePurchase(selectedPlan)}
              >
                Pay with PayPal
              </Button>
            </div>
            
            <Text className="text-xs text-gray-500 block text-center">
              Secure payment powered by Stripe and PayPal. 
              Your credits will be added instantly after payment.
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Credits;