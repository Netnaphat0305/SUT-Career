import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [posts, setPosts] = useState<StudentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<StudentPost | null>(null);

  // ⭐ แก้ไข: คำนวณ isMyProfile หลังจากที่ student โหลดเสร็จแล้ว
  const isMyProfile = useMemo(() => {
    if (!user) return false;
    if (!studentId) return true; // ถ้าไม่มี studentId หมายถึงดูโปรไฟล์ตัวเอง
    if (!student) return false; // ถ้า student ยังไม่โหลด
    return student.user_id === user.id;
  }, [user, studentId, student]);

  // ⭐ แก้ไข: ลบ student?.user_id ออกจาก dependency เพื่อป้องกัน infinite loop
  const loadProfileData = useCallback(async () => {
    console.log("=== ProfilePage2 Debug ===");
    console.log("📍 Current params:", { studentId });
    console.log("👤 Current user:", { userId: user?.id, role: user?.role });
    
    setLoading(true);
    setError(null);
    
    try {
      let studentData: Student | null = null;
      let studentPosts: StudentPost[] = [];

      if (!studentId && user) {
        // ดูโปรไฟล์ของตัวเอง
        console.log("🏠 Loading my profile...");
        const response = await profileAPI.getMyProfile();
        if (response?.data?.data) {
          const data = response.data.data;
          studentData = data.student;
          studentPosts = data.posts || [];
          console.log("✅ My profile loaded:", { 
            student: studentData, 
            postsCount: studentPosts.length,
            studentUserId: studentData?.user_id,
            currentUserId: user?.id 
          });
        } else {
          throw new Error('รูปแบบข้อมูลโปรไฟล์ไม่ถูกต้อง');
        }
      } else if (studentId) {
        // ดูโปรไฟล์ของคนอื่น
        console.log("👥 Loading other profile with studentId:", studentId);
        const studentRes = await profileAPI.getProfileById(studentId);
        if (studentRes?.data?.data) {
          const data = studentRes.data.data;
          studentData = data.student;
          studentPosts = data.posts || [];
          console.log("✅ Other profile loaded:", { 
            student: studentData, 
            postsCount: studentPosts.length,
            studentUserId: studentData?.user_id,
            currentUserId: user?.id 
          });
        } else {
          throw new Error(`ไม่พบข้อมูลนักศึกษาสำหรับ ID: ${studentId}`);
        }
      } else {
        throw new Error('ไม่สามารถระบุโปรไฟล์ที่ต้องการได้');
      }

      setStudent(studentData);
      setPosts(studentPosts);
      
    } catch (err: any) {
      console.error("❌ Profile loading error:", err);
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดโปรไฟล์');
    } finally {
      setLoading(false);
    }
  }, [studentId, user]); // ⭐ ลบ student?.user_id ออก

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // ⭐ แก้ไข: เพิ่ม useEffect เพื่อ debug isMyProfile หลังจาก student โหลดเสร็จ
  useEffect(() => {
    if (student && user) {
      console.log("🎯 isMyProfile calculation:", { 
        noStudentId: !studentId, 
        hasUser: !!user, 
        hasStudent: !!student,
        studentUserId: student?.user_id,
        currentUserId: user?.id,
        isMyProfile,
        comparison: student.user_id === user.id
      });
    }
  }, [student, user, studentId, isMyProfile]);

  const handleEditPost = (post: StudentPost) => {
    setEditingPost(post);
    setEditModalVisible(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await studentPostAPI.deleteStudentPost(postId);
      message.success('ลบโพสต์สำเร็จแล้ว');
      loadProfileData();
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
      <Alert
        message="เกิดข้อผิดพลาด"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => navigate(-1)}>
            กลับ
          </Button>
        }
      />
    );
  }

  console.log("🔧 Render Check:", { 
    isMyProfile, 
    studentUserId: student?.user_id, 
    currentUserId: user?.id,
    willShowCreateButton: isMyProfile 
  });

  return (
    <>
      <Row gutter={[24, 24]} style={{ padding: '20px' }}>
        {/* Profile Information Column */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={student.profile_image_url}
              />
              <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                {student.first_name} {student.last_name}
              </Title>
              <Rate disabled defaultValue={mockReviews.rating} />
              <Text type="secondary">({mockReviews.count} รีวิว)</Text>
            </div>

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              <div><MailOutlined /> {student.email}</div>
              <div><PhoneOutlined /> {student.phone}</div>
              <div><BookOutlined /> {student.faculty} (ปี {student.year})</div>
            </Space>

            <Divider />
            <Title level={5}>ทักษะ</Title>
            <div>
              {(student.skills?.split(',') || []).map(
                (skill, index) =>
                  skill && (
                    <Tag key={index} style={{ marginBottom: 4 }}>
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
        <Col xs={24} md={16}>
          <Card
            title="โพสต์หางาน"
            extra={
              isMyProfile && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    console.log("🚀 Create Post Button Clicked");
                    setCreateModalVisible(true);
                  }}
                >
                  สร้างโพสต์ใหม่
                </Button>
              )
            }
          >
            {posts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {posts.map((post) => (
                  <Card
                    key={post.ID}
                    size="small"
                    actions={
                      isMyProfile
                        ? [
                            <Button
                              key="edit"
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEditPost(post)}
                            >
                              แก้ไข
                            </Button>,
                            <Popconfirm
                              key="delete"
                              title="ต้องการลบโพสต์นี้?"
                              onConfirm={() => handleDeletePost(post.ID)}
                              okText="ยืนยัน"
                              cancelText="ยกเลิก"
                            >
                              <Button type="text" danger icon={<DeleteOutlined />}>
                                ลบ
                              </Button>
                            </Popconfirm>,
                          ]
                        : undefined
                    }
                  >
                    <Card.Meta
                      title={post.title}
                      description={post.introduction}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Tag icon={<ClockCircleOutlined />} color="cyan">
                        {post.availability}
                      </Tag>
                      <Tag icon={<EnvironmentOutlined />} color="purple">
                        {post.preferred_location}
                      </Tag>
                      <Tag icon={<DollarOutlined />} color="gold">
                        {post.expected_compensation || 'ตามตกลง'}
                      </Tag>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="ยังไม่มีโพสต์หางาน" />
            )}
          </Card>
        </Col>
      </Row>

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