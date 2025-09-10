import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  Rate,
  Typography,
  Divider,
  Spin,
  Alert,
  Row,
  Col,
  Tag,
  Space,
  Empty,
  message,
  Popconfirm,
} from 'antd';
import {
  EditOutlined,
  UserOutlined,
  BookOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { studentPostAPI, profileAPI } from '../../services/https/index';
import type { Student } from '../../interfaces/student';
import type { StudentPost } from '../../interfaces/studentpost';
import CreateStudentPostModal from '../../components/CreateStudentPostModal';
import EditStudentPostModal from '../../components/EditStudentPostModal';

const { Title, Text, Paragraph } = Typography;

const mockReviews = {
  rating: 4.8,
  count: 4,
};

const ProfilePage2: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [posts, setPosts] = useState<StudentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<StudentPost | null>(null);

  const isMyProfile = !userId || (user && user.id === parseInt(userId, 10));

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let studentData: Student | null = null;
      let studentPosts: StudentPost[] = [];

      if (isMyProfile && user) {
        const response = await profileAPI.getMyProfile();
        if (response && response.data && response.data.data) {
          const data = response.data.data;
          studentData = data.student;
          studentPosts = data.posts || [];
        } else {
          throw new Error('รูปแบบข้อมูลโปรไฟล์ไม่ถูกต้อง');
        }
      } else if (userId) {
        const targetStudentId = Number(userId);
        const studentRes = await profileAPI.getProfileById(userId);
        if (studentRes && studentRes.data) {
          const data = studentRes.data.data;
          studentData = data.student;
          studentPosts = data.posts || [];
        } else {
          throw new Error(`ไม่พบข้อมูลนักศึกษาสำหรับ ID: ${targetStudentId}`);
        }
      } else {
        throw new Error('ไม่สามารถระบุโปรไฟล์ที่ต้องการได้');
      }

      setStudent(studentData);
      setPosts(studentPosts);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดโปรไฟล์');
    } finally {
      setLoading(false);
    }
  }, [isMyProfile, userId, user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleEditPost = (post: StudentPost) => {
    setEditingPost(post);
    setEditModalVisible(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await studentPostAPI.deleteStudentPost(postId);
      message.success('ลบโพสต์สำเร็จแล้ว');
      loadProfileData(); // Refresh data
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการลบโพสต์');
    }
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    loadProfileData();
    message.success("สร้างโพสต์ใหม่สำเร็จ!");
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditingPost(null);
    loadProfileData();
    message.success("แก้ไขโพสต์สำเร็จ!");
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>กำลังโหลดข้อมูลโปรไฟล์...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error}
          type="error"
          style={{ margin: '24px' }}
        />
        <Button onClick={() => navigate(-1)}>กลับ</Button>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
          {/* Profile Information Column */}
          <Col xs={24} lg={8}>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  src={student.profile_image_url} // 🔧 แสดงรูปโปรไฟล์อย่างถูกต้อง
                />
                <Title level={3} style={{ marginTop: '16px', marginBottom: '8px' }}>
                  {student.first_name} {student.last_name}
                </Title>
                <div>
                  <Rate disabled defaultValue={mockReviews.rating} />
                  <Text type="secondary"> ({mockReviews.count} รีวิว)</Text>
                </div>
              </div>

              <Divider />

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <MailOutlined /> {student.email}
                </div>
                <div>
                  <PhoneOutlined /> {student.phone}
                </div>
                <div>
                  <BookOutlined /> {student.faculty} (ปี {student.year})
                </div>
              </Space>

              <Divider />

              <div>
                <Title level={5}>ทักษะ</Title>
                {(student.skills?.split(',') || []).map(
                  (skill, index) =>
                    skill && (
                      <Tag key={index} style={{ marginBottom: '8px' }}>
                        {skill.trim()}
                      </Tag>
                    )
                )}
                {!student.skills && <Text type="secondary">ไม่มีทักษะระบุ</Text>}
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
            </Card>
          </Col>

          {/* Posts Column */}
          <Col xs={24} lg={16}>
            <Card
              title={`โพสต์หางาน (${posts.length})`}
              extra={
                isMyProfile && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                  >
                    สร้างโพสต์ใหม่
                  </Button>
                )
              }
            >
              {posts.length > 0 ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {posts.map((post) => (
                    <Card
                      key={post.ID}
                      size="small"
                      actions={
                        isMyProfile ? [
                          <Button
                            key="edit"
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditPost(post)}
                          >
                            แก้ไข
                          </Button>,
                          <Popconfirm
                            key="delete"
                            title="คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?"
                            onConfirm={() => handleDeletePost(post.ID)}
                            okText="ยืนยัน"
                            cancelText="ยกเลิก"
                          >
                            <Button type="link" danger icon={<DeleteOutlined />}>
                              ลบ
                            </Button>
                          </Popconfirm>,
                        ] : undefined
                      }
                    >
                      <Title level={5}>{post.title}</Title>
                      <Paragraph>{post.introduction}</Paragraph>
                      <Space wrap>
                        <Tag icon={<ClockCircleOutlined />} color="cyan">
                          {post.availability}
                        </Tag>
                        <Tag icon={<EnvironmentOutlined />} color="purple">
                          {post.preferred_location}
                        </Tag>
                        <Tag icon={<DollarOutlined />} color="gold">
                          {post.expected_compensation || 'ตามตกลง'}
                        </Tag>
                      </Space>
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty description="ยังไม่มีโพสต์หางาน" />
              )}
            </Card>
          </Col>
        </Row>
      </div>

      <CreateStudentPostModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditStudentPostModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        post={editingPost}
      />
    </>
  );
};

export default ProfilePage2;
