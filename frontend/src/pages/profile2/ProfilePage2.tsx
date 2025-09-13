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
  List,
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
  StarOutlined,
  MessageOutlined, // ======================= edit by book ========================
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { studentPostAPI, profileAPI, chatAPI } from '../../services/https/index';
import type { Student } from '../../interfaces/student';
import type { StudentPost } from '../../interfaces/studentpost';
import type { Review } from '../../interfaces/review';
import CreateStudentPostModal from '../../components/CreateStudentPostModal';
import EditStudentPostModal from '../../components/EditStudentPostModal';

const { Title, Text, Paragraph } = Typography;

interface ProfileData {
  student: Student;
  posts: StudentPost[];
  reviews?: Review[];
  rating?: {
    average: number;
    count: number;
  };
}

const ProfilePage2: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<StudentPost | null>(null);

  // ======================= edit by book ========================
  // ฟังก์ชันสร้างห้องแชท
  const handleCreateChat = async () => {
    if (!profileData?.student?.user_id) return;

    try {
      const room = await chatAPI.createOrGetRoom(
        profileData.student.ID,  // targetId = student user_id
        "student"                     // targetRole = student
      );
      navigate("/Chat", { state: { roomId: room.ID } });
    } catch (err) {
      console.error("Failed to create chat room:", err);
      message.error("ไม่สามารถสร้างห้องแชทได้");
    }
  };
  // ======================= edit by book ========================

  const isMyProfile = useMemo(() => {
    if (authLoading || !user || !profileData?.student) return false;
    if (!studentId) return true;
    return profileData.student.user_id === user.id;
  }, [user, studentId, profileData?.student, authLoading]);

  const loadProfileData = useCallback(async () => {
    if (authLoading) {
      return;
    }

    console.log("=== ProfilePage2 Debug ===");
    console.log("📍 Current params:", { studentId });
    console.log("👤 Current user:", { id: user?.id, role: user?.role });

    setLoading(true);
    setError(null);

    try {
      let apiResponse;

      if (!studentId) {
        if (!user) {
          navigate('/login');
          return; // Stop execution if no user
        }
        console.log("🏠 Loading my profile...");
        apiResponse = await profileAPI.getMyProfile();

      } else {
        console.log(`👥 Loading other profile with studentId: ${studentId}`);
        apiResponse = await profileAPI.getProfileById(studentId);
      }

      console.log("📡 API Response:", apiResponse);

      const responseData = (apiResponse as any)?.data as ProfileData;

      if (!responseData || !responseData.student) {
        throw new Error('ไม่ได้รับข้อมูลโปรไฟล์ที่ถูกต้องจาก API');
      }

      // Mock reviews (can be replaced with actual API call)
      const mockReviews: Review[] = [];
      const mockRating = { average: 0, count: 0 };

      const finalProfileData: ProfileData = {
        student: responseData.student,
        posts: responseData.posts || [],
        reviews: mockReviews,
        rating: mockRating
      };

      setProfileData(finalProfileData);
      console.log("✅ Profile data loaded:", finalProfileData);

    } catch (err: any) {
      console.error("❌ Profile loading error:", err);
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดโปรไฟล์');
    } finally {
      setLoading(false);
    }
  }, [studentId, user, authLoading, navigate]);

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

  if (authLoading || loading) {
    return (
      <Spin size="large" tip="กำลังโหลดข้อมูลโปรไฟล์..." fullscreen />
    );
  }

  if (error || !profileData) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error || 'ไม่พบข้อมูลโปรไฟล์'}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate(-1)}>
              กลับ
            </Button>
          }
        />
      </div>
    );
  }

  const { student, posts, reviews, rating } = profileData;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', minHeight: "85vh", margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Profile Information Column */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar
                size={120}
                src={student.profile_image_url}
                icon={<UserOutlined />}
                style={{ marginBottom: '16px' }}
              />
              <Title level={3} style={{ marginBottom: '8px' }}>
                {student.first_name} {student.last_name}
              </Title>

              <div style={{ marginBottom: '16px' }}>
                <Rate disabled allowHalf value={rating?.average || 0} />
                <Text type="secondary" style={{ marginLeft: '8px' }}>
                  ({rating?.count || 0} รีวิว)
                </Text>
              </div>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <Text>{student.email}</Text>
              </div>
              <div>
                <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                <Text>{student.phone}</Text>
              </div>
              <div>
                <BookOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                <Text>{student.faculty} (ปี {student.year})</Text>
              </div>
            </Space>

            <Divider>ทักษะ</Divider>
            <div>
              {(student.skills?.split(',') || []).map(
                (skill, index) =>
                  skill && (
                    <Tag key={index} color="blue" style={{ marginBottom: '8px' }}>
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
                style={{ marginTop: '24px' }}
                onClick={() => navigate('/profile/edit')}
              >
                แก้ไขโปรไฟล์
              </Button>
            )}
            {/* ======================= edit by book ======================== */}
            {user?.role === "employer" && !isMyProfile && (
              <div>
                <Divider />
                <Button
                  type="primary"
                  icon={<MessageOutlined />}
                  block
                  style={{ marginTop: '12px' }}
                  onClick={handleCreateChat}
                >
                  สร้างห้องแชทคุยกับนักศึกษา
                </Button>
              </div>
            )}
            {/* ======================= edit by book ======================== */}
          </Card>
        </Col>

        {/* Posts and Reviews Column */}
        <Col xs={24} lg={16}>
          {/* Posts Section */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>โพสต์ของฉัน</span>
                {isMyProfile && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                  >
                    สร้างโพสต์ใหม่
                  </Button>
                )}
              </div>
            }
            style={{ marginBottom: '24px' }}
          >
            {posts.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {posts.map((post) => (
                  <Card
                    key={post.ID}
                    size="small"
                    title={post.title}
                    extra={
                      isMyProfile && (
                        <Space>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditPost(post)}
                          >
                            แก้ไข
                          </Button>
                          <Popconfirm
                            title="คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?"
                            onConfirm={() => handleDeletePost(post.ID)}
                            okText="ยืนยัน"
                            cancelText="ยกเลิก"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                            >
                              ลบ
                            </Button>
                          </Popconfirm>
                        </Space>
                      )
                    }
                  >
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {post.introduction}
                    </Paragraph>
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
              <Empty description={isMyProfile ? "คุณยังไม่มีโพสต์" : "นักศึกษายังไม่มีโพสต์"} />
            )}
          </Card>

          {/* Reviews Section */}
          <Card title={<><StarOutlined /> รีวิวจากผู้ใช้งาน</>}>
            {reviews && reviews.length > 0 ? (
              <List
                dataSource={reviews}
                renderItem={(review) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <div>
                          <Rate disabled allowHalf value={review.ratingscore?.score || 0} />
                          <Text type="secondary" style={{ marginLeft: '8px' }}>
                            {new Date(review.datetime).toLocaleDateString('th-TH')}
                          </Text>
                        </div>
                      }
                      description={review.comment}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="ยังไม่มีรีวิว" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Modals */}
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
    </div>
  );
};

export default ProfilePage2;

