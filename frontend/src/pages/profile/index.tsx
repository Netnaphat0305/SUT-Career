// src/pages/profile/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Avatar, Button, Card, Rate, Typography, Divider, Spin, Alert, Row, Col, Tag, Space, Empty, message
} from 'antd';
import {
  EditOutlined, UserOutlined, BookOutlined, MailOutlined, PhoneOutlined, PlusOutlined,
  EnvironmentOutlined, DollarOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { profileAPI, studentPostAPI } from '../../services/https/index';
import type { Student } from '../../interfaces/student';
import type { StudentPost } from '../../interfaces/studentpost';

const { Title, Text, Paragraph } = Typography;

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [posts, setPosts] = useState<StudentPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMyProfile = !userId || (user && user.id === parseInt(userId, 10));

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // โค้ดส่วนดึงข้อมูลโปรไฟล์และโพสต์
      // (ละไว้เพื่อความกระชับ สามารถดูโค้ดเต็มได้จากไฟล์ src/pages/profile/index.tsx)
    } catch (err: any) {
      setError(err.message || 'ไม่พบโปรไฟล์ที่ค้นหาหรือเกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [isMyProfile, userId, user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleDeletePost = async (postId: number) => {
    // โค้ดส่วนลบโพสต์
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Alert message="เกิดข้อผิดพลาด" description={error || "ไม่พบข้อมูลโปรไฟล์"} type="error" />
      </div>
    );
  }

  return (
    <Row gutter={[24, 24]} style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ส่วนแสดงข้อมูลส่วนตัว */}
      <Col xs={24} md={8}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Avatar size={120} icon={<UserOutlined />} />
            <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
              {student.first_name} {student.last_name}
            </Title>
            <Divider />
            <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }} size="middle">
              <Text><MailOutlined /> {student.email}</Text>
              <Text><PhoneOutlined /> {student.phone}</Text>
              <Text><BookOutlined /> {student.faculty} (ปี {student.year})</Text>
            </Space>
            <Divider />
            <div style={{ textAlign: 'left' }}>
              <Text strong>ทักษะ</Text>
              <div style={{ marginTop: 8 }}>
                {(student.skills?.split(',') || []).map((skill, index) =>
                  skill && <Tag key={index}>{skill.trim()}</Tag>
                )}
              </div>
            </div>
            {isMyProfile && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                block
                style={{ marginTop: 24 }}
                onClick={() => navigate('/profile/edit')}
              >
                แก้ไขโปรไฟล์
              </Button>
            )}
          </div>
        </Card>
      </Col>

      {/* ส่วนแสดงโพสต์ */}
      <Col xs={24} md={16}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4}>โพสต์ของฉัน ({posts.length})</Title>
            {isMyProfile && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/feed')} // หรือหน้าที่ใช้สร้างโพสต์
              >
                สร้างโพสต์ใหม่
              </Button>
            )}
          </div>
          {posts.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {posts.map((post) => (
                <Card key={post.ID} size="small">
                  <Title level={5}>{post.title}</Title>
                  <Paragraph>{post.introduction}</Paragraph>
                  <Space wrap>
                    <Tag icon={<ClockCircleOutlined />} color="cyan">{post.availability}</Tag>
                    <Tag icon={<EnvironmentOutlined />} color="purple">{post.preferred_location}</Tag>
                    <Tag icon={<DollarOutlined />} color="gold">{post.expected_compensation || 'ตามตกลง'}</Tag>
                  </Space>
                  {isMyProfile && (
                    <div style={{ marginTop: 12 }}>
                      <Space>
                        <Button size="small">แก้ไข</Button>
                        <Button size="small" danger onClick={() => handleDeletePost(post.ID)}>ลบ</Button>
                      </Space>
                    </div>
                  )}
                </Card>
              ))}
            </Space>
          ) : (
            <Empty description="ยังไม่มีการสร้างโพสต์" />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;