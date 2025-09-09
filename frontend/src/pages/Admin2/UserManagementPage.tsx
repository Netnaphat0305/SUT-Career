import React, { useState } from 'react';
import { Table, Input, Button, Space, Tag, Avatar, Modal, Typography } from 'antd';
import { UserOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registrationDate: string;
  status: 'active' | 'banned';
  jobPosts: number;
}

// Mock Data
const mockUsers: User[] = [
  { id: 'u001', name: 'จอมมาร', email: 'johndoe@example.com', avatar: '', registrationDate: '2025-08-20', status: 'active', jobPosts: 5 },
  { id: 'u002', name: 'สมหญิง ยืนงง', email: 'jane.doe@example.com', avatar: '', registrationDate: '2025-08-21', status: 'active', jobPosts: 2 },
  { id: 'u003', name: 'พนิดา', email: 'panida@example.com', avatar: '', registrationDate: '2025-08-22', status: 'banned', jobPosts: 10 },
];

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchText, setSearchText] = useState('');

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'banned' : 'active' }
        : user
    ));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<User> = [
    {
      title: 'ผู้ใช้งาน',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'วันที่ลงทะเบียน',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      sorter: (a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime(),
    },
    {
        title: 'จำนวนโพสต์',
        dataIndex: 'jobPosts',
        key: 'jobPosts',
        sorter: (a, b) => a.jobPosts - b.jobPosts,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'active' | 'banned') => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? 'ใช้งาน' : 'ถูกระงับ'}
        </Tag>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />}>แก้ไข</Button>
          <Button
            danger={record.status === 'active'}
            icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.status === 'active' ? 'ระงับ' : 'ปลดระงับ'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>จัดการผู้ใช้งาน</Title>
      <Input.Search
        placeholder="ค้นหาชื่อ หรือ อีเมล..."
        allowClear
        enterButton={<SearchOutlined />}
        size="large"
        onSearch={setSearchText}
        style={{ marginBottom: 24, maxWidth: 400 }}
      />
      <Table columns={columns} dataSource={filteredUsers} rowKey="id" />
    </div>
  );
};

export default UserManagementPage;