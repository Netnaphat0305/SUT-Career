import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown, Badge, Button, List, Avatar, Typography, message, Card, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import type { Notification } from '../interfaces/notification';
import { notificationAPI } from '../services/https/index';

dayjs.extend(relativeTime);
dayjs.locale('th');

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับดึงข้อมูลการแจ้งเตือนจาก Backend
  const fetchNotifications = useCallback(async () => {
    try {
      // ไม่ต้อง setLoading(true) ทุกครั้งเพื่อให้ refresh แบบเงียบๆ
      const res = await notificationAPI.getMyNotifications();
      // ✨ ปรับแก้การเข้าถึงข้อมูลให้ถูกต้องตามโครงสร้างที่ Backend ส่งมา
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error("Received non-array data for notifications:", data);
        setNotifications([]);
      }
    } catch (e) {
      console.error("Could not fetch notifications", e);
      // message.error("ไม่สามารถโหลดการแจ้งเตือนได้");
    } finally {
      setLoading(false);
    }
  }, []);

  // เรียกใช้ fetchNotifications เมื่อ component โหลด และตั้งเวลาดึงข้อมูลใหม่ทุก 30 วินาที
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);


  const handleNotificationClick = async (notification: Notification) => {
    setOpen(false); // ปิด Dropdown ทันที
    
    // Mark as read first if unread
    if (!notification.read) {
        try {
            await notificationAPI.markAsRead(notification.ID);
            // Update state immediately for better UX
            setNotifications(prev =>
                prev.map(n =>
                    n.ID === notification.ID ? { ...n, read: true } : n
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read", error);
            // Even if it fails, proceed to navigate
        }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      message.success('ตั้งค่าการแจ้งเตือนทั้งหมดเป็นอ่านแล้ว');
    } catch (error) {
       message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationList = (
    <Card 
      title="การแจ้งเตือน" 
      extra={<Button type="link" onClick={markAllAsRead} disabled={unreadCount === 0}>อ่านทั้งหมด</Button>}
      style={{ width: 350, border: 'none' }}
      styles={{ body: { padding: 0, maxHeight: 400, overflowY: 'auto' } }}
    >
      {loading && notifications.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}><Spin /></div>
      ) : (
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
              }}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: '#1890ff' }} icon={<BellOutlined />} />}
                title={<Typography.Text strong={!item.read}>{item.message}</Typography.Text>}
                description={dayjs(item.CreatedAt).fromNow()}
              />
            </List.Item>
          )}
          locale={{ emptyText: <div style={{padding: '20px', textAlign: 'center'}}>ไม่มีการแจ้งเตือน</div> }}
        />
      )}
    </Card>
  );

  return (
    <Dropdown
      popupRender={() => notificationList}
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

