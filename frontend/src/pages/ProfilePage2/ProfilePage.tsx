// // src/pages/ProfilePage2/ProfilePage.tsx

// import React from 'react';
// import { useParams, Link } from 'react-router-dom';
// import {
//   Avatar, Button, Card, Tabs, List, Rate, Typography, Progress, Divider, Flex, Modal, Form, Input, message, Space, Tag
// } from 'antd';
// import {
//   EditOutlined, UserOutlined, HomeOutlined, BookOutlined, StarOutlined, MessageOutlined, LinkOutlined, CodeOutlined, InfoCircleOutlined
// } from '@ant-design/icons';
// import PostCard from '../../components/QA/PostCard';
// import PostCreator from '../../components/QA/PostCreator';
// import type { Post } from '../../types';
// import './ProfilePage.css';
// import { mockProfileData } from '../profile/index';

// const { Text, Title } = Typography;
// // --- vvvv ไม่ต้อง import TabPane แล้ว vvvv ---
// // const { TabPane } = Tabs;
// // --- ^^^^ สิ้นสุดการแก้ไข ^^^^ ---

// const allUsers = {
//     'johndoe': {
//         name: 'จอมมาร',
//         friendCount: 123,
//         avatarUrl: '',
//         coverUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1950&auto=format&fit=crop',
//         bio: 'Frontend Developer ที่รักในการเรียนรู้เทคโนโลยีใหม่ๆ',
//         location: 'นครราชสีมา',
//         education: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
//         skills: ['React', 'TypeScript', 'Ant Design', 'Node.js', 'Figma'],
//         portfolio: [
//             { title: 'เว็บแอปพลิเคชันสำหรับจัดการสต็อก', url: 'https://github.com' },
//             { title: 'ออกแบบ UI/UX สำหรับแอปมือถือ', url: 'https://behance.net' },
//         ]
//     },
//     'jane': {
//         name: 'สมหญิง ยืนงง',
//         friendCount: 45,
//         avatarUrl: '',
//         coverUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1950&auto=format&fit=crop',
//         bio: 'รักการถ่ายภาพและเดินทาง',
//         location: 'กรุงเทพมหานคร',
//         education: 'มหาวิทยาลัยเกษตรศาสตร์',
//         skills: ['Photography', 'Lightroom', 'Content Writing'],
//         portfolio: []
//     }
// }

// interface ProfilePageProps {
//   posts: Post[];
//   onEdit: (id: number, newContent: string, newSkills: string[]) => void;
//   handleAddPost: (content: string, privacy: Post['privacy'], skills: string[], file?: File, image?: File, location?: { lat: number, lng: number }) => void;
//   handleDeletePost: (id: number) => void;
//   handleLikePost: (id: number) => void;
//   handleAddComment: (postId: number, text: string, image?: File, parentId?: number) => void;
//   onAddReport: (post: Post, reason: string, details: string) => void;
//   onLikeComment: (postId: number, commentId: number) => void;
// }

// const ProfilePage: React.FC<ProfilePageProps> = ({
//   posts,
//   handleAddPost,
//   handleDeletePost,
//   handleLikePost,
//   handleAddComment,
//   onAddReport,
//   onEdit,
//   onLikeComment
// }) => {
//   const { userId } = useParams<{ userId: string }>();
//   const [form] = Form.useForm();
//   const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);

//   const loggedInUserId = 'johndoe';
//   const profileUserId = userId || loggedInUserId;
//   const isMyProfile = profileUserId === loggedInUserId;

//   const [profileData, setProfileData] = React.useState(allUsers[profileUserId as keyof typeof allUsers]);

//   React.useEffect(() => {
//     setProfileData(allUsers[profileUserId as keyof typeof allUsers]);
//   }, [profileUserId]);

//   const userPosts = posts.filter(p => p.authorId === profileUserId);

//   const showEditModal = () => {
//     form.setFieldsValue({
//         bio: profileData.bio,
//         location: profileData.location,
//         education: profileData.education,
//         skills: profileData.skills.join(', '),
//         portfolio_title: profileData.portfolio[0]?.title,
//         portfolio_url: profileData.portfolio[0]?.url,
//     });
//     setIsEditModalVisible(true);
//   };

//   const handleSave = (values: any) => {
//     const newSkills = values.skills ? values.skills.split(',').map((s: string) => s.trim()) : [];
//     const newPortfolio = values.portfolio_title && values.portfolio_url
//         ? [{ title: values.portfolio_title, url: values.portfolio_url }]
//         : [];

//     setProfileData(prev => ({
//         ...prev,
//         bio: values.bio,
//         location: values.location,
//         education: values.education,
//         skills: newSkills,
//         portfolio: newPortfolio,
//     }));
//     message.success('บันทึกข้อมูลโปรไฟล์สำเร็จ!');
//     setIsEditModalVisible(false);
//   };

//   const handleCancel = () => setIsEditModalVisible(false);

//   const AboutTab = () => (
//     <Card variant="borderless">
//         <p><HomeOutlined /> อาศัยอยู่ที่ <strong>{profileData.location}</strong></p>
//         <p><BookOutlined /> กำลังศึกษาที่ <strong>{profileData.education}</strong></p>
//         <Divider />
//         <Title level={5}>ทักษะ</Title>
//         <div className="skills-container">
//             {profileData.skills.map(skill => <Tag color="blue" key={skill}>{skill}</Tag>)}
//         </div>
//     </Card>
//   );

//   const ReviewsTab = () => (
//     <List
//       itemLayout="horizontal"
//       dataSource={mockProfileData.reviews.sort((a, b) => b.id - a.id)}
//       renderItem={(item) => (
//         <List.Item>
//           <List.Item.Meta
//             avatar={<Avatar shape="square" icon={<UserOutlined />} />}
//             title={
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div>
//                   <Text style={{ fontSize: "14px" }}>{item.reviewer}</Text>
//                   <Text type="secondary" style={{ fontSize: "12px", marginLeft: '8px' }}>{item.date}</Text>
//                 </div>
//                 <Rate disabled allowHalf defaultValue={item.rating} />
//               </div>
//             }
//             description={ item.comment ? <Text>{item.comment}</Text> : null }
//           />
//         </List.Item>
//       )}
//     />
//   );

//   const PortfolioTab = () => (
//       profileData.portfolio.length > 0 ? (
//         <List
//             dataSource={profileData.portfolio}
//             renderItem={item => (
//                 <List.Item>
//                     <List.Item.Meta
//                         avatar={<LinkOutlined />}
//                         title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>}
//                         description={item.url}
//                     />
//                 </List.Item>
//             )}
//         />
//       ) : <Text type="secondary">ยังไม่มีผลงานที่แสดง</Text>
//   );
  
//   // --- vvvv สร้าง items array สำหรับ Tabs vvvv ---
//   const tabItems = [
//     {
//       key: '1',
//       label: <span><InfoCircleOutlined /> เกี่ยวกับ</span>,
//       children: <AboutTab />,
//     },
//     {
//       key: '2',
//       label: 'โพสต์',
//       children: (
//         <>
//           {isMyProfile && <PostCreator onAddPost={handleAddPost} />}
//           <Space direction="vertical" size="large" style={{ display: 'flex', marginTop: '24px' }}>
//               {userPosts.length > 0 ? (
//                   userPosts.map((post) => (
//                       <PostCard key={post.id} post={post} onDelete={handleDeletePost} onLike={handleLikePost} onAddComment={handleAddComment} onAddReport={onAddReport} onEdit={onEdit} onLikeComment={onLikeComment} />
//                   ))
//               ) : (
//                   <Card><p>ยังไม่มีโพสต์...</p></Card>
//               )}
//           </Space>
//         </>
//       ),
//     },
//     {
//       key: '3',
//       label: <span><CodeOutlined /> ผลงาน</span>,
//       children: <PortfolioTab />,
//     },
//     {
//       key: '4',
//       label: <span><StarOutlined /> รีวิว</span>,
//       children: <ReviewsTab />,
//     },
//   ];
//   // --- ^^^^ สิ้นสุดการสร้าง items array ^^^^ ---

//   if (!profileData) {
//       return <Card>กำลังโหลดข้อมูลโปรไฟล์...</Card>
//   }

//   return (
//     <>
//       <div className="profile-page">
//         <div className="profile-header">
//           <div
//             className="cover-photo"
//             style={{ backgroundImage: `url(${profileData.coverUrl})` }}
//           ></div>
//           <div className="profile-info-bar">
//             <div className="profile-avatar-container">
//                 <Avatar
//                     shape="square"
//                     size={168}
//                     icon={<UserOutlined />}
//                     src={profileData.avatarUrl}
//                     className="profile-avatar"
//                 />
//             </div>
//             <div className="profile-name-bio">
//               <h2>{profileData.name}</h2>
//               <p>{profileData.friendCount} เพื่อน</p>
//               <Text type="secondary">{profileData.bio}</Text>
              
//               <div className="profile-rating-bar">
//                   <Progress percent={(mockProfileData.rating / 5) * 100} showInfo={false} strokeColor="#0088FF" size="small" />
//                   <Flex justify="space-between">
//                       <Text strong>ระดับคะแนน: {mockProfileData.rating.toFixed(1)}/5.0</Text>
//                       <Text type="secondary">จาก {mockProfileData.reviews.length} รีวิว</Text>
//                   </Flex>
//               </div>

//             </div>
//             <div className="profile-actions">
//               <Space>
//                 {isMyProfile ? (
//                   <Button type="primary" icon={<EditOutlined />} onClick={showEditModal}>แก้ไขโปรไฟล์</Button>
//                 ) : (
//                   <Link to="/chat">
//                     <Button type="primary" icon={<MessageOutlined />}>แชท</Button>
//                   </Link>
//                 )}
//               </Space>
//             </div>
//           </div>
//         </div>

//         <div className="profile-content-single-column">
//             <Card>
//                 {/* --- vvvv แก้ไข Tabs ให้ใช้ items prop vvvv --- */}
//                 <Tabs defaultActiveKey="1" items={tabItems} />
//                 {/* --- ^^^^ สิ้นสุดการแก้ไข ^^^^ --- */}
//             </Card>
//         </div>
//       </div>

//       <Modal
//         title="แก้ไขโปรไฟล์"
//         open={isEditModalVisible}
//         onCancel={handleCancel}
//         footer={[
//           <Button key="back" onClick={handleCancel}>ยกเลิก</Button>,
//           <Button key="submit" type="primary" onClick={() => form.submit()}>บันทึก</Button>,
//         ]}
//       >
//         <Form form={form} layout="vertical" onFinish={handleSave}>
//           <Form.Item name="bio" label="คำอธิบายตัวตน">
//             <Input.TextArea rows={3} placeholder="บอกเล่าเกี่ยวกับตัวคุณ..." />
//           </Form.Item>
//           <Form.Item name="location" label="อาศัยอยู่ที่">
//             <Input placeholder="เช่น นครราชสีมา" />
//           </Form.Item>
//           <Form.Item name="education" label="กำลังศึกษาที่">
//             <Input placeholder="เช่น มหาวิทยาลัยเทคโนโลยีสุรนารี" />
//           </Form.Item>
//           <Divider />
//           <Form.Item name="skills" label="ทักษะ" extra="ใส่ทักษะโดยคั่นด้วยเครื่องหมายจุลภาค (comma), เช่น React, Figma">
//             <Input placeholder="React, Figma, Content Writing" />
//           </Form.Item>
//           <Title level={5}>ผลงาน (แสดง 1 ชิ้น)</Title>
//           <Form.Item name="portfolio_title" label="ชื่อผลงาน">
//             <Input placeholder="เช่น เว็บไซต์ E-commerce" />
//           </Form.Item>
//           <Form.Item name="portfolio_url" label="ลิงก์ผลงาน (URL)">
//             <Input placeholder="https://github.com/your-repo" />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   );
// };

// export default ProfilePage;


// src/pages/ProfilePage2/ProfilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Avatar, Button, Card, Rate, Typography, Divider, Modal, Form, Input, message, Space, Tag, Row, Col, Spin, Alert
} from 'antd';
import {
  EditOutlined, UserOutlined, BookOutlined, MailOutlined, PhoneOutlined, PlusOutlined
} from '@ant-design/icons';
import './ProfilePage.css';
// ✨ 1. เปลี่ยนการ import มาใช้ APIกลาง
import { profileAPI, studentAPI } from '../../services/https/index';
import type { ProfileResponse, StudentProfilePost } from '../../types';
//import StudentPostForm from '../StudentPost/StudentPostForm';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // ✨ 2. เรียกใช้ profileAPI.getMyProfile
      const response = await profileAPI.getMyProfile();
      if (response && response.data) {
        setProfile(response.data);
      } else {
        throw new Error("Could not get a valid response from the server.");
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const showEditModal = () => {
    if (profile) {
      form.setFieldsValue({
          skills: profile.student.skills,
      });
      setIsEditModalVisible(true);
    }
  };
  
  // ✨ 3. แก้ไขฟังก์ชัน handleSaveEdit ให้เรียก API จริง
  const handleSaveEdit = async (values: any) => {
    if (!profile?.student?.id) {
        message.error("ไม่พบข้อมูลนักศึกษาสำหรับอัปเดต");
        return;
    }
    try {
        const response = await studentAPI.update(profile.student.ID, { skills: values.skills });
        if (response && response.data) {
            message.success('บันทึกข้อมูลโปรไฟล์สำเร็จ!');
            setIsEditModalVisible(false);
            loadProfile(); // โหลดข้อมูลโปรไฟล์ใหม่
        } else {
            throw new Error(response?.data?.error || "Failed to save profile.");
        }
    } catch (err: any) {
        message.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };
  const handleCancelEdit = () => setIsEditModalVisible(false);

  const showPostModal = () => setIsPostModalVisible(true);
  const handleCancelPostModal = () => setIsPostModalVisible(false);
  const handlePostSuccess = () => {
    setIsPostModalVisible(false);
    message.success('สร้างโพสต์ใหม่สำเร็จ!');
    loadProfile();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message="เกิดข้อผิดพลาด" description={error} type="error" showIcon />;
  }

  if (!profile) {
    return <Alert message="ไม่พบข้อมูล" description="ไม่พบข้อมูลโปรไฟล์สำหรับผู้ใช้นี้" type="warning" showIcon />;
  }
  
  const { student, posts } = profile;

  return (
    <>
      <div className="profile-page-v2">
        <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className="profile-sidebar-card">
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <Avatar size={128} icon={<UserOutlined />} />
                      <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                        {student.first_name} {student.last_name}
                      </Title>
                      <Rate disabled defaultValue={4.5} style={{ fontSize: 16 }}/>
                  </div>
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                      <Text><MailOutlined /> {student.email}</Text>
                      <Text><PhoneOutlined /> {student.phone}</Text>
                      <Text><BookOutlined /> {student.faculty} (ปี {student.year})</Text>
                  </Space>
                  <Divider />
                  <Title level={5}>ทักษะ</Title>
                  <div className="skills-container">
                      {(student.skills?.split(',') || []).map(skill => <Tag key={skill}>{skill.trim()}</Tag>)}
                  </div>
                  <Button type="primary" icon={<EditOutlined />} block style={{marginTop: 24}} onClick={showEditModal}>
                      แก้ไขโปรไฟล์
                  </Button>
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                  <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <Title level={4} style={{ margin: 0 }}>โพสต์ของฉัน ({posts.length})</Title>
                          <Button type="primary" icon={<PlusOutlined />} onClick={showPostModal}>
                              สร้างโพสต์ใหม่
                          </Button>
                      </div>
                      {posts.length > 0 ? (
                        posts.map((post: StudentProfilePost) => (
                          <Card key={post.ID} style={{ marginBottom: 16 }}>
                            <p><strong>ประเภทงาน:</strong> <Tag color="blue">{post.job_type}</Tag></p>
                            <p><strong>แนะนำตัว:</strong> {post.introduction}</p>
                            <p><strong>ทักษะ:</strong> {post.skills}</p>
                          </Card>
                        ))
                      ) : (
                        <Card><Text type="secondary">คุณยังไม่มีโพสต์...</Text></Card>
                      )}
                  </div>
                  
                  <Divider />
                  <div>
                      <Title level={4}>รีวิวจากผู้ว่าจ้าง</Title>
                      <Card><Text type="secondary">ยังไม่มีรีวิว...</Text></Card>
                  </div>

              </Space>
            </Col>
        </Row>
      </div>

      <Modal
        title="แก้ไขโปรไฟล์"
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="back" onClick={handleCancelEdit}>ยกเลิก</Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>บันทึก</Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
          <Form.Item name="skills" label="ทักษะ" extra="คั่นด้วยเครื่องหมายจุลภาค (,)">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="สร้างโพสต์หางานใหม่"
        open={isPostModalVisible}
        onCancel={handleCancelPostModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        {/* ✨ 4. เพิ่ม prop onClose ที่จำเป็น */}
        <StudentPostForm onSuccess={handlePostSuccess} onClose={handleCancelPostModal} />
      </Modal>
    </>
  );
};

export default ProfilePage;
