import React, { useState, useEffect, useCallback } from 'react';
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
  Space,
  Pagination
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
import api from '../utils/api';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm] = Form.useForm();

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  const [userPagination, setUserPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(userSearchTerm && { search: userSearchTerm }),
        ...(userFilterStatus !== 'all' && { status: userFilterStatus }),
        role: 'user', // Only fetch non-admin users
      };
      const response = await api.get('/api/admin/users', { params });
      setUsers(response.data.users);
      setUserPagination({
        current: response.data.pagination.current,
        pageSize: limit,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('Failed to fetch users.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [userSearchTerm, userFilterStatus]);

  useEffect(() => {
    fetchUsers(userPagination.current, userPagination.pageSize);
  }, [fetchUsers, userPagination.current, userPagination.pageSize]);

  const handleUserSearch = (value) => {
    setUserSearchTerm(value);
    setUserPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleUserFilterChange = (value) => {
    setUserFilterStatus(value);
    setUserPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleUserPageChange = (page, pageSize) => {
    setUserPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  const handleUserStatusChange = async (userId, status) => {
    try {
      await api.put(`/api/admin/users/${userId}/status`, { status });
      message.success('User status updated successfully!');
      fetchUsers(userPagination.current, userPagination.pageSize);
    } catch (error) {
      message.error('Failed to update user status.');
      console.error('Error updating user status:', error);
    }
  };

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
      render: (amount) => `$${amount ? parseFloat(amount ?? 0).toFixed(2) : '0.00'}`
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
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleUserStatusChange(record.id, value)}
          style={{ width: 100 }}
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
          <Option value="banned">Banned</Option>
        </Select>
      )
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
          {/* <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => message.info('Edit user functionality')}
          /> */}
          {/* <Button 
            type="text" 
            danger
            icon={<StopOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Ban User',
                content: `Are you sure you want to ban ${record.name}?`,
                onOk: () => handleUserStatusChange(record.id, 'banned')
              });
            }}
          /> */}
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>User Management</Title>

      {/* Users Management */}
      <Card 
        title="Users Management" 
        extra={
          <Space>
            <Search 
              placeholder="Search users..." 
              style={{ width: 200 }}
              onSearch={handleUserSearch}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
            <Select 
              defaultValue="all" 
              style={{ width: 120 }}
              onChange={handleUserFilterChange}
            >
              <Option value="all">All Users</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="banned">Banned</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={userColumns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            current: userPagination.current,
            pageSize: userPagination.pageSize,
            total: userPagination.total,
            onChange: handleUserPageChange,
            showSizeChanger: true,
            onShowSizeChange: handleUserPageChange,
          }}
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
              {/* <Avatar size={64} icon={<UserOutlined />} /> */}
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
                Joined: {new Date(selectedUser.created_at).toLocaleDateString()}
              </Text>
              <br />
              <Text className="text-gray-600">
                Last Active: {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'N/A'}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUserManagement;