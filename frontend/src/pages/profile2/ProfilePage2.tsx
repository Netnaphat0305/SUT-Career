import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Avatar, Button, Card, Rate, Typography, Divider, Spin, Alert, Row,
  Col, Tag, Space, Empty, message, Popconfirm, List,
} from 'antd';
import {
  EditOutlined, UserOutlined, BookOutlined, MailOutlined, PhoneOutlined,
  PlusOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined,
  DeleteOutlined, StarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { studentPostAPI, profileAPI, reviewAPI } from '../../services/https/index';
import type { Student } from '../../interfaces/student';
import type { StudentPost } from '../../interfaces/studentpost';
import type { Review } from '../../interfaces/review';
import CreateStudentPostModal from '../../components/CreateStudentPostModal';
import EditStudentPostModal from '../../components/EditStudentPostModal';

const { Title, Text, Paragraph } = Typography;

// --- REFACTOR: ใช้ Constants เพื่อให้อ่านง่ายและจัดการข้อความได้จากที่เดียว ---
const RENDER_TEXTS = {
  DEFAULT_COMPENSATION: 'ตามตกลง',
  NO_SKILLS: 'ไม่มีทักษะระบุ',
  DEFAULT_REVIEWER_NAME: 'ผู้ว่าจ้าง',
  NO_REVIEWS: 'ยังไม่มีรีวิว',
};

interface ProfileData {
  student: Student;
  posts: StudentPost[];
  reviews: Review[];
  rating: {
    average: number;
    count: number;
  };
}

// --- REFACTOR: แยก Logic ที่ซับซ้อนออกมาเป็น Helper Function ---
// ฟังก์ชันนี้ช่วยให้โค้ดในส่วน JSX สะอาดขึ้นมาก และจัดการกับโครงสร้างข้อมูลที่ซับซ้อนได้ในที่เดียว
const getReviewerName = (review: Review): string => {
  const employer = (review.job_application?.JobPost as any)?.employer;
  return employer?.user?.username || RENDER_TEXTS.DEFAULT_REVIEWER_NAME;
};

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

  const isMyProfile = useMemo(() => {
    if (authLoading || !user || !profileData?.student) return false;
    // ถ้าไม่มี studentId ใน URL หมายความว่าเป็นหน้า /profile ของตัวเอง
    if (!studentId) return true; 
    // ถ้ามี studentId ให้เทียบ user_id
    return profileData.student.user_id === user.id;
  }, [user, studentId, profileData?.student, authLoading]);

  const loadProfileData = useCallback(async () => {
    if (authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let apiResponse;
      
      if (!studentId) {
        if (!user) {
          navigate('/login');
          return;
        }
        apiResponse = await profileAPI.getMyProfile();
      } else {
        apiResponse = await profileAPI.getProfileById(studentId);
      }

      const responseData = (apiResponse as any)?.data as Omit<ProfileData, 'reviews' | 'rating'>;

      if (!responseData || !responseData.student) {
        throw new Error('ไม่ได้รับข้อมูลโปรไฟล์ที่ถูกต้องจาก API');
      }

      // --- Fetch review data (Logic เดิมแข็งแรงดีแล้ว) ---
      let reviews: Review[] = [];
      let rating = { average: 0, count: 0 };

      try {
        const reviewResponse = await reviewAPI.getReviewsByStudentId(responseData.student.ID);
        const reviewData = (reviewResponse as any)?.data as Review[];
        
        if (Array.isArray(reviewData) && reviewData.length > 0) {
          reviews = reviewData;
          const totalScore = reviews.reduce((acc, review) => acc + (review.ratingscore_id || 0), 0);
          
          rating = {
            average: totalScore / reviews.length,
            count: reviews.length,
          };
        }
      } catch (reviewErr) {
        console.warn("Could not fetch reviews for student:", responseData.student.ID, reviewErr);
        // ไม่ใช่ Error ร้ายแรง ให้ทำงานต่อได้แม้จะโหลดรีวิวไม่ได้
      }
      
      const finalProfileData: ProfileData = {
        student: responseData.student,
        posts: responseData.posts || [],
        reviews: reviews,
        rating: rating
      };

      setProfileData(finalProfileData);
    } catch (err: any) {
      console.error("Profile loading error:", err);
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
      await loadProfileData(); // ใช้ await เพื่อให้แน่ใจว่าโหลดข้อมูลใหม่หลังลบ
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการลบโพสต์');
    }
  };

  const handleModalSuccess = useCallback(() => {
    setCreateModalVisible(false);
    setEditModalVisible(false);
    setEditingPost(null);
    loadProfileData();
  }, [loadProfileData]);
  
  const handleCreateSuccess = () => {
    message.success("สร้างโพสต์ใหม่สำเร็จ!");
    handleModalSuccess();
  };

  const handleEditSuccess = () => {
    message.success("แก้ไขโพสต์สำเร็จ!");
    handleModalSuccess();
  };

  if (authLoading || loading) {
    return <Spin size="large" tip="กำลังโหลดข้อมูลโปรไฟล์..." fullscreen />;
  }

  if (error || !profileData) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error || 'ไม่พบข้อมูลโปรไฟล์'}
          type="error"
          showIcon
          action={<Button type="primary" onClick={() => navigate(-1)}>กลับ</Button>}
        />
      </div>
    );
  }

  const { student, posts, reviews, rating } = profileData;
  
  // --- REFACTOR: เตรียมข้อมูล skills ให้พร้อมใช้งาน, ป้องกัน error และ tag ว่าง ---
  const studentSkills = student.skills
    ?.split(',')
    .map(skill => skill.trim())
    .filter(skill => skill) || []; // .filter(skill => skill) จะกรอง string ว่างๆ ออกไป

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', minHeight: "85vh", margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Profile Information Column */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar size={120} src={student.profile_image_url} icon={<UserOutlined />} style={{ marginBottom: '16px' }} />
              <Title level={3} style={{ marginBottom: '8px' }}>{student.first_name} {student.last_name}</Title>
              <div style={{ marginBottom: '16px' }}>
                <Rate disabled allowHalf value={rating.average} />
                <Text type="secondary" style={{ marginLeft: '8px' }}>({rating.count} รีวิว)</Text>
                {rating.count > 0 && (
                  <div style={{ marginTop: '8px' }}><Text strong>คะแนนเฉลี่ย: {rating.average.toFixed(1)} / 5.0</Text>
    </div>
  )}
              </div>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <div><MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> <Text>{student.email}</Text></div>
              <div><PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} /> <Text>{student.phone}</Text></div>
              <div><BookOutlined style={{ marginRight: '8px', color: '#722ed1' }} /> <Text>{student.faculty} (ปี {student.year})</Text></div>
            </Space>

            <Divider>ทักษะ</Divider>
            <div>
              {studentSkills.length > 0 ? (
                studentSkills.map((skill, index) => (
                  <Tag key={index} color="blue" style={{ marginBottom: '8px' }}>{skill}</Tag>
                ))
              ) : (
                <Text type="secondary">{RENDER_TEXTS.NO_SKILLS}</Text>
              )}
            </div>

            {isMyProfile && (
              <Button type="primary" icon={<EditOutlined />} block style={{ marginTop: '24px' }} onClick={() => navigate('/profile/edit')}>
                แก้ไขโปรไฟล์
              </Button>
            )}
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
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
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
                    extra={isMyProfile && (
                      <Space>
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEditPost(post)}>แก้ไข</Button>
                        <Popconfirm
                          title="คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?"
                          onConfirm={() => handleDeletePost(post.ID)}
                          okText="ยืนยัน"
                          cancelText="ยกเลิก"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />}>ลบ</Button>
                        </Popconfirm>
                      </Space>
                    )}
                  >
                    <Paragraph ellipsis={{ rows: 2 }}>{post.introduction}</Paragraph>
                    <Space wrap>
                      <Tag icon={<ClockCircleOutlined />} color="cyan">{post.availability}</Tag>
                      <Tag icon={<EnvironmentOutlined />} color="purple">{post.preferred_location}</Tag>
                      <Tag icon={<DollarOutlined />} color="gold">{post.expected_compensation || RENDER_TEXTS.DEFAULT_COMPENSATION}</Tag>
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
            {reviews.length > 0 ? (
              <List
                dataSource={reviews}
                renderItem={(review) => (
                  <List.Item key={review.ID}> {/* REFACTOR: เพิ่ม key ที่นี่ */}
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Rate disabled allowHalf value={review.ratingscore_id || 0} />
                          <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                             โดย {getReviewerName(review)} {/* REFACTOR: ใช้ Helper function */}
                          </Text>
                        </div>
                      }
                      description={
                        <>
                          <Paragraph style={{ marginBottom: '4px' }}>{review.comment}</Paragraph>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(review.datetime).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={RENDER_TEXTS.NO_REVIEWS} />
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
        onClose={() => { setEditModalVisible(false); setEditingPost(null); }}
        onSuccess={handleEditSuccess}
        post={editingPost}
      />
    </div>
  );
};

export default ProfilePage2;