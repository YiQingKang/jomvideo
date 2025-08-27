import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography, 
  List, 
  Tag, 
  Modal,
  message,
  Divider
} from 'antd';
import { 
  CreditCardOutlined, 
  ShoppingCartOutlined, 
  StarOutlined,
  CheckOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api, { prepareGkashPayment } from '../utils/api';
import ResponsiveTable from '../components/ResponsiveTable/ResponsiveTable';

const { Title, Text, Paragraph } = Typography;

const Credits = () => {
  const { user, fetchUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usageHistory, setUsageHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

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
        // 'HD quality (720p)',
        // 'Basic templates',
        // 'Standard support'
      ]
    },
    {
      id: 'bundle',
      name: 'Bundle Pack',
      credits: 50,
      price: 39.99,
      originalPrice: 49.95,
      popular: true,
      features: [
        '50 video generations',
        // 'Full HD quality (1080p)',
        // 'Premium templates',
        // 'Priority support',
        // 'Advanced settings'
      ]
    },
    {
      id: 'bulk',
      name: 'Bulk Pack',
      credits: 100,
      price: 79.99,
      originalPrice: 99.95,
      popular: false,
      features: [
        '100 video generations',
        // '4K quality (2160p)',
        // 'Custom templates',
        // 'Dedicated support',
        // 'API access',
        // 'Bulk generation'
      ]
    }
  ];

  const fetchHistory = async (page = 1, pageSize = 10) => {
    setHistoryLoading(true);
    try {
      const response = await api.get(`/api/credit/transactions?page=${page}&limit=${pageSize}`);
      setUsageHistory(response.data.transactions);
      setPagination({
        current: response.data.pagination.current,
        pageSize: pageSize,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('Failed to fetch usage history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const usageColumns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Tag color={amount > 0 ? 'green' : 'red'}>
          {amount > 0 ? '+' : ''}{amount}
        </Tag>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'purchase' ? 'blue' : 'orange'}>
          {type}
        </Tag>
      )
    }
  ];

  const handlePurchase = async (paymentMethod) => {
    setLoading(true);
    try {
      await api.post('/api/credit/purchase', {
        package_id: selectedPlan.id,
        payment_method: paymentMethod,
      });
      
      message.success(`Successfully purchased ${selectedPlan.credits} credits!`);
      setSelectedPlan(null);
      fetchUser(); // Refresh user data (credits)
      fetchHistory(); // Refresh usage history
      
    } catch (error) {
      message.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGkashPurchase = async () => {
    setLoading(true);
    try {
      const { data } = await prepareGkashPayment(selectedPlan.id);
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.postUrl;
      
      for (const key in data.formData) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data.formData[key];
        form.appendChild(input);
      }
      
      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to initiate Gkash payment.');
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    fetchHistory(pagination.current, pagination.pageSize);
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
        <Title level={3} className="text-center">Choose Your Credit Package</Title>
        <Row gutter={[24, 24]} style={{ marginTop: '48px' }}>
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
        <ResponsiveTable
          columns={usageColumns}
          dataSource={usageHistory}
          loading={historyLoading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="id"
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
                onClick={() => handlePurchase('stripe')}
              >
                Check Out with Stripe
              </Button>
              <Divider>OR</Divider>
              <Button
                size="large"
                className="w-full h-12"
                loading={loading}
                onClick={handleGkashPurchase}
              >
                Pay with Gkash
              </Button>
            </div>
            
            <Text className="text-xs text-gray-500 block text-center">
              Your credits will be added instantly after payment.
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Credits;
