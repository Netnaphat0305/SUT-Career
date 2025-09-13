import React from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space } from 'antd';
import {
  QuestionCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  MoneyCollectFilled
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../pages/Admin2/Admin.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const location = useLocation();

  // ✅ เพิ่มเมนู "จัดการ FAQ" เข้าไปในรายการ
  const menuItems = [
    { key: '/admin', icon: <QuestionCircleOutlined />, label: <Link to="/admin">จัดการคำร้อง</Link> },
    { key: '/admin/manage-faq', icon: <BookOutlined />, label: <Link to="/admin/manage-faq">จัดการ FAQ</Link> },
    { key: '/admin/finance/summary', icon: <MoneyCollectFilled/>, label: <Link to="/admin/finance/summary">สรุปยอด</Link>}
  ];
  
  const profileMenuItems = [
      { key: 'settings', label: 'ตั้งค่า', icon: <SettingOutlined /> },
      { type: 'divider' as const },
      { key: 'logout', label: <Link to="/login">ออกจากระบบ</Link>, icon: <LogoutOutlined /> }
  ];

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" width={250}>
        <div className="logo">SUT Career Admin</div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header>
          <div />
          <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <Text strong>ผู้ดูแลระบบ</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
