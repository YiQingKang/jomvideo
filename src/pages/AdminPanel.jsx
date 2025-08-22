import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Statistic, 
  Row, 
  Col,
  Typography,
  Input,
  Select,
  Modal,
  Form,
  message,
  Avatar,
  Space
} from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  CreditCardOutlined,
  DollarOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    
    // Mock admin data
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        credits: 25,
        totalVideos: 12,
        totalSpent: 59.97,
        status: 'active',
        joinDate: '2024-01-10',
        lastActive: '2024-01-15'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        credits: 8,
        totalVideos: 23,
        totalSpent: 119.94,
        status: 'active',
        joinDate: '2024-01-05',
        lastActive: '2024-01-14'
      },
      {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob@example.com',
        credits: 0,
        totalVideos: 5,
        totalSpent: 9.99,
        status: 'inactive',
        joinDate: '2024-01-12',
        lastActive: '2024-01-13'
      }
    ];

    const mockVideos = [
      {
        id: 1,
        title: 'Product Launch Video',
        user: 'John Doe',
        status: 'completed',
        createdAt: '2024-01-15',
        resolution: '1080p',
        duration: '0:30',
        creditsUsed: 2
      },
      {
        id: 2,
        title: 'Social Media Promo',
        user: 'Jane Smith',
        status: 'completed',
        createdAt: '2024-01-14',
        resolution: '720p',
        duration: '0:15',
        creditsUsed: 1
      }
    ];

    setUsers(mockUsers);
    setVideos(mockVideos);
    setLoading(false);
  };

  const adminStats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Total Videos',
      value: videos.length,
      icon: <VideoCameraOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Total Revenue',
      value: 189.90,
      prefix: '$',
      icon: <DollarOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Credits Purchased',
      value: 160,
      icon: <CreditCardOutlined />,
      color: '#fa8c16'
    }
  ];

  const userColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center space-x-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text className="font-medium">{name}</Text>
            <br />
            <Text className="text-gray-500 text-sm">{record.email}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      sorter: (a, b) => a.credits - b.credits,
      render: (credits) => (
        <Tag color={credits > 10 ? 'green' : credits > 0 ? 'orange' : 'red'}>
          {credits} credits
        </Tag>
      )
    },
    {
      title: 'Videos',
      dataIndex: 'totalVideos',
      key: 'totalVideos',
      sorter: (a, b) => a.totalVideos - b.totalVideos
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Banned', value: 'banned' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' : 
          status === 'inactive' ? 'orange' : 'red'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a, b) => new Date(a.joinDate) - new Date(b.joinDate),
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setUserModalVisible(true);
            }}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => message.info('Edit user functionality')}
          />
          <Button 
            type="text" 
            danger
            icon={<StopOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Ban User',
                content: `Are you sure you want to ban ${record.name}?`,
                onOk: () => message.success(`${record.name} has been banned`)
              });
            }}
          />
        </Space>
      )
    }
  ];

  const videoColumns = [
    {
      title: 'Video',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
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
    },
    {
      title: 'Resolution',
      dataIndex: 'resolution',
      key: 'resolution'
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Credits Used',
      dataIndex: 'creditsUsed',
      key: 'creditsUsed'
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Video',
                content: `Are you sure you want to delete "${record.title}"?`,
                onOk: () => message.success('Video deleted successfully')
              });
            }}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Admin Panel</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        {adminStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                // prefix={stat.prefix}
                valueStyle={{ color: stat.color }}
                prefix={
                  <span style={{ color: stat.color }}>
                    {stat.icon}
                    {stat.prefix && <span className="ml-1">{stat.prefix}</span>}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Users Management */}
      <Card 
        title="Users Management" 
        extra={
          <Space>
            <Search 
              placeholder="Search users..." 
              style={{ width: 200 }}
            />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Option value="all">All Users</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={userColumns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Videos Management */}
      <Card 
        title="Videos Management"
        extra={
          <Search 
            placeholder="Search videos..." 
            style={{ width: 200 }}
          />
        }
      >
        <Table
          columns={videoColumns}
          dataSource={videos}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* User Detail Modal */}
      <Modal
        title="User Details"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <Title level={4} className="!mb-1">{selectedUser.name}</Title>
                <Text className="text-gray-600">{selectedUser.email}</Text>
              </div>
            </div>
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="Credits Remaining" value={selectedUser.credits} />
              </Col>
              <Col span={12}>
                <Statistic title="Total Videos" value={selectedUser.totalVideos} />
              </Col>
              <Col span={12}>
                <Statistic title="Total Spent" value={selectedUser.totalSpent} prefix="$" />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Status" 
                  value={selectedUser.status}
                  valueRender={() => (
                    <Tag color={selectedUser.status === 'active' ? 'green' : 'orange'}>
                      {selectedUser.status}
                    </Tag>
                  )}
                />
              </Col>
            </Row>
            
            <div>
              <Text className="text-gray-600">
                Joined: {new Date(selectedUser.joinDate).toLocaleDateString()}
              </Text>
              <br />
              <Text className="text-gray-600">
                Last Active: {new Date(selectedUser.lastActive).toLocaleDateString()}
              </Text>
            </div>
            
            <Space>
              <Button type="primary">Add Credits</Button>
              <Button>Send Message</Button>
              <Button danger>Ban User</Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPanel;