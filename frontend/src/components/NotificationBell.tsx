import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Button, List, Avatar, Typography, message, Card } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import type { Notification } from '../types';

dayjs.extend(relativeTime);
dayjs.locale('th');

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      setNotifications(storedNotifications);
    } catch (e) {
      console.error("Could not parse notifications from localStorage", e);
      setNotifications([]);
    }
  }, []);

  // Simulate receiving new notifications for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now(),
        message: `มีการสมัครงานใหม่ในโพสต์ "พนักงานร้านกาแฟ"`,
        read: false,
        link: '/my-jobs', // Example link
        timestamp: Date.now(),
      };
      
      setNotifications(prev => {
          const updated = [newNotification, ...prev];
          localStorage.setItem('notifications', JSON.stringify(updated));
          return updated;
      });
      message.info('คุณมีการแจ้งเตือนใหม่!', 2);

    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, []);


  const handleNotificationClick = (notification: Notification) => {
    const updated = notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    message.success('ตั้งค่าการแจ้งเตือนทั้งหมดเป็นอ่านแล้ว');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationList = (
    <Card 
      title="การแจ้งเตือน" 
      extra={<Button type="link" onClick={markAllAsRead} disabled={unreadCount === 0}>อ่านทั้งหมด</Button>}
      style={{ width: 350, border: 'none' }}
      bodyStyle={{ padding: 0, maxHeight: 400, overflowY: 'auto' }}
    >
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={item => (
          <List.Item
            onClick={() => handleNotificationClick(item)}
            style={{ 
                padding: '12px 16px', 
                cursor: 'pointer',
                backgroundColor: item.read ? 'white' : '#e6f7ff',
                borderLeft: item.read ? 'none' : '4px solid #1890ff'
            }}
          >
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#1890ff' }} icon={<BellOutlined />} />}
              title={<Typography.Text strong={!item.read}>{item.message}</Typography.Text>}
              description={dayjs(item.timestamp).fromNow()}
            />
          </List.Item>
        )}
        locale={{ emptyText: <div style={{padding: '20px', textAlign: 'center'}}>ไม่มีการแจ้งเตือน</div> }}
      />
    </Card>
  );

  return (
    <Dropdown
      dropdownRender={() => notificationList}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount}>
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined style={{ fontSize: '20px' }} />}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;

