
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Tag,
  Avatar,
  Button,
  Input,
  Modal,
  Spin,
  message,
  Empty,
  Pagination,
  Popconfirm,
  Image,
  Divider,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentPostAPI } from "../../services/https/index";
import CreateStudentPostModal from "../../components/CreateStudentPostModal";
import EditStudentPostModal from "../../components/EditStudentPostModal";

import type{ StudentPost, StudentPostAttachment } from "../../interfaces/studentpost";
import type{ Skill } from "../../interfaces/skill";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const AttachmentDisplay: React.FC<{ attachments?: StudentPostAttachment[] }> = ({ attachments }) => {
    if (!attachments || attachments.length === 0) {
      return null;
    }
  
    return (
      <div style={{ marginTop: '16px' }}>
        <Text strong>ผลงานแนบ:</Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
            <Image.PreviewGroup>
            {attachments.map((att, index) => (
                att.type.startsWith('image/') ? (
                <Image key={att.ID || index} width={80} height={80} src={att.url} alt={att.name} style={{ objectFit: 'cover', borderRadius: '4px' }}/>
                ) : (
                <Button key={att.ID || index} href={att.url} target="_blank" icon={<PaperClipOutlined />}>
                    {att.name}
                </Button>
                )
            ))}
            </Image.PreviewGroup>
        </div>
      </div>
    );
};

const StudentFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<StudentPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<StudentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedPost, setSelectedPost] = useState<StudentPost | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<StudentPost | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const isStudent = 
    user?.role && 
    (user.role.toLowerCase() === "student" || user.role.toLowerCase() === "stu");

  const jobTypeOptions = [
    { label: "Full-Time", value: "FullTime" },
    { label: "Part-Time", value: "PartTime" },
    { label: "Freelance", value: "Freelance" },
    { label: "Contract", value: "Contract" },
  ];
  
  const isOwnPost = (post: StudentPost): boolean => {
    if (!user || !post.student) return false;
    const userId = user.id;
    const studentUserId = post.student.user_id;
    return userId === studentUserId;
  };

  const getSkillNames = (skills: Skill[]): string[] => {
    if (!Array.isArray(skills)) return [];
    return skills.map(skill => skill.skill_name || '').filter(Boolean);
  };

  const getSkillsAsArray = (skills: any): string[] => {
    if (Array.isArray(skills)) {
      return getSkillNames(skills);
    } else if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentPostAPI.getStudentPosts();
      const postsData = response?.data?.data || response?.data || [];
      if (Array.isArray(postsData)) {
        setPosts(postsData);
        setFilteredPosts(postsData);
      } else {
        setPosts([]);
        setFilteredPosts([]);
      }
    } catch (error) {
      console.error("Error fetching student posts:", error);
      message.error("ไม่สามารถโหลดข้อมูลโพสต์ได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const applyFilters = useCallback(() => {
    let filtered = posts;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((post) => {
        const studentName = post.student
          ? `${post.student.first_name || ""} ${post.student.last_name || ""}`.toLowerCase()
          : "";
        const title = post.title?.toLowerCase() || "";
        const skillsText = getSkillsAsArray(post.skills).join(' ').toLowerCase();
        const introduction = post.introduction?.toLowerCase() || "";
        const jobType = post.employment_type?.employment_type_name?.toLowerCase() || ""; 
        
        return (
          studentName.includes(searchLower) ||
          title.includes(searchLower) ||
          skillsText.includes(searchLower) ||
          introduction.includes(searchLower) ||
          jobType.includes(searchLower)
        );
      });
    }

    if (selectedJobType) {
      filtered = filtered.filter((post) =>
        post.employment_type?.employment_type_name?.toLowerCase().includes(selectedJobType.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [posts, searchTerm, selectedJobType]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = (value: string) => setSearchTerm(value);
  const handleJobTypeClick = (jobType: string) => setSelectedJobType(prev => (prev === jobType ? "" : jobType));
  const showAllPosts = () => {
    setSearchTerm("");
    setSelectedJobType("");
  };

  const showPostDetail = (post: StudentPost) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };
  const closeModal = () => setIsModalVisible(false);
  
  const goToProfile = (studentId?: number) => {
    if (studentId && studentId > 0) {
      navigate(`/profile/${studentId}`);
    } else {
      message.warning("ไม่พบข้อมูลโปรไฟล์ของนักศึกษาท่านนี้");
    }
  };

  const openCreatePostModal = () => setIsCreatePostModalVisible(true);
  const closeCreatePostModal = () => setIsCreatePostModalVisible(false);
  const handleCreatePostSuccess = () => {
    fetchPosts();
    setIsCreatePostModalVisible(false);
  };

  const handleEditPost = (post: StudentPost) => {
    setEditingPost(post);
    setEditModalVisible(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await studentPostAPI.deleteStudentPost(postId);
      message.success("ลบโพสต์สำเร็จ!");
      fetchPosts();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบโพสต์");
    }
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditingPost(null);
    fetchPosts();
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>กำลังโหลดข้อมูลโพสต์...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <Title level={1} style={{ marginBottom: "8px" }}>โพสต์หางานของนักศึกษา</Title>
        <Paragraph style={{ fontSize: "16px", color: "#666" }}>
          ค้นหานักศึกษาที่เหมาะสมสำหรับงานของคุณ
        </Paragraph>
        {isStudent && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreatePostModal}>
            สร้างโพสต์หางาน
          </Button>
        )}
      </header>

      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <Search
          prefix={<SearchOutlined />}
          size="large"
          value={searchTerm}
          onSearch={handleSearch}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "500px", margin: "0 auto" }}
          placeholder="ค้นหาโดยชื่อ, ทักษะ, ประเภทงาน..."
        />
      </div>

      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
        {jobTypeOptions.map((option) => (
          <Button
            key={option.value}
            onClick={() => handleJobTypeClick(option.value)}
            type={selectedJobType === option.value ? "primary" : "default"}
            style={{ borderRadius: "20px" }}
          >
            {option.label}
          </Button>
        ))}
        <Button
          icon={<AppstoreOutlined />}
          onClick={showAllPosts}
          type={!selectedJobType && !searchTerm ? "primary" : "default"}
          style={{ borderRadius: "20px" }}
        >
          ทั้งหมด
        </Button>
      </div>

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <Text type="secondary">
          พบ <Text strong style={{ color: "#1890ff" }}>{filteredPosts.length}</Text> โพสต์
        </Text>
      </div>

      {currentPosts.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {currentPosts.map((post) => {
              const studentName = post.student ? `${post.student.first_name} ${post.student.last_name}`.trim() : "ไม่ระบุชื่อ";
              const skillsArray = getSkillsAsArray(post.skills);
              const isOwn = isOwnPost(post);

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={post.ID}>
                  <Card
                    style={{ borderRadius: "12px", overflow: "hidden", height: "100%", display: 'flex', flexDirection: 'column' }}
                    bodyStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}
                    cover={
                      <div style={{ padding: "16px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", textAlign: "center" }}>
                        <Avatar src={post.student?.profile_image_url} icon={<UserOutlined />} size={64} style={{ border: "3px solid white" }} />
                        <Title level={5} style={{ color: 'white', marginTop: '8px' }}>{studentName}</Title>
                        <Tag color="rgba(255,255,255,0.3)">{post.employment_type?.employment_type_name || 'ไม่ระบุ'}</Tag>
                      </div>
                    }
                    actions={
                        isOwn ? [
                            // Actions for own post are now at the top right, so we can have other default actions here if needed, or leave it empty
                            <Button key="view" type="text" icon={<EyeOutlined />} onClick={() => showPostDetail(post)}>ดูรายละเอียด</Button>,
                        ] : [
                            <Button key="view" type="text" icon={<EyeOutlined />} onClick={() => showPostDetail(post)}>ดูรายละเอียด</Button>,
                            <Button key="profile" type="text" icon={<UserOutlined />} onClick={() => goToProfile(post.student?.ID)}>ดูโปรไฟล์</Button>,
                        ]
                    }
                  >
                    {isOwn && (
                        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
                            <Button icon={<EditOutlined />} size="small" onClick={(e) => { e.stopPropagation(); handleEditPost(post); }} />
                            <Popconfirm
                                title="ลบโพสต์นี้?"
                                description="คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?"
                                onConfirm={(e) => { e?.stopPropagation(); handleDeletePost(post.ID); }}
                                onCancel={(e) => e?.stopPropagation()}
                                okText="ใช่, ลบ"
                                cancelText="ยกเลิก"
                            >
                                <Button danger icon={<DeleteOutlined />} size="small" onClick={(e) => e.stopPropagation()} />
                            </Popconfirm>
                        </div>
                    )}
                    <div style={{ flexGrow: 1, paddingTop: isOwn ? '24px' : '0' }}>
                      <Card.Meta
                        title={<Text ellipsis>{post.title || "ไม่มีหัวข้อ"}</Text>}
                        description={<Paragraph ellipsis={{ rows: 2 }}>{post.introduction || "ไม่มีรายละเอียด"}</Paragraph>}
                      />
                    </div>
                    <div>
                      <Text strong>ทักษะ:</Text>
                      <div style={{ marginTop: '4px' }}>
                        {skillsArray.slice(0, 3).map((skill, i) => <Tag key={i} color="blue">{skill}</Tag>)}
                        {skillsArray.length > 3 && <Tag>+{skillsArray.length - 3}</Tag>}
                        {skillsArray.length === 0 && <Text type="secondary">ไม่มีทักษะระบุ</Text>}
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
          <Pagination
            current={currentPage}
            total={filteredPosts.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            style={{ textAlign: 'center', marginTop: '40px' }}
          />
        </>
      ) : (
        <Empty description={<span>ไม่พบโพสต์ที่ตรงเงื่อนไข</span>}>
          {isStudent && <Button type="primary" icon={<PlusOutlined />} onClick={openCreatePostModal}>สร้างโพสต์ของคุณ</Button>}
        </Empty>
      )}

      <Modal
        title="รายละเอียดโพสต์หางาน"
        open={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="profile" type="primary" onClick={() => goToProfile(selectedPost?.student?.ID)}>ดูโปรไฟล์เต็ม</Button>,
          <Button key="close" onClick={closeModal}>ปิด</Button>,
        ]}
        centered
      >
        {selectedPost && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Avatar src={selectedPost.student?.profile_image_url} icon={<UserOutlined />} size={80} />
              <Title level={4} style={{marginTop: '12px'}}>{`${selectedPost.student?.first_name} ${selectedPost.student?.last_name}`}</Title>
              <Text type="secondary">
                {selectedPost.student?.faculty} • ชั้นปีที่ {selectedPost.student?.year || "N/A"}
              </Text>
            </div>
            <Divider />
            <p><Text strong>หัวข้อ:</Text> {selectedPost.title}</p>
            <p><Text strong>ประเภทงาน:</Text> <Tag color="blue">{selectedPost.employment_type?.employment_type_name || 'ไม่ระบุ'}</Tag></p>
            <p><Text strong>เวลาที่สะดวก:</Text> {selectedPost.availability}</p>
            <p><Text strong>สถานที่:</Text> {selectedPost.preferred_location}</p>
            <p><Text strong>ค่าตอบแทนที่คาดหวัง:</Text> {selectedPost.expected_compensation || 'ตามตกลง'}</p>
            <p><Text strong>รายละเอียด:</Text></p>
            <Paragraph>{selectedPost.introduction}</Paragraph>
            <p><Text strong>ทักษะ:</Text></p>
            <div>{getSkillsAsArray(selectedPost.skills).map((skill, i) => <Tag key={i} color="processing">{skill}</Tag>)}</div>
            {selectedPost.portfolio_url && <p style={{marginTop: '16px'}}><Text strong>ผลงาน (ลิงก์):</Text> <a href={selectedPost.portfolio_url} target="_blank" rel="noopener noreferrer">{selectedPost.portfolio_url}</a></p>}
            
            <AttachmentDisplay attachments={selectedPost.attachments} />

            <Divider />
            <Text strong>ข้อมูลติดต่อ:</Text>
            {selectedPost.student?.email && <div><MailOutlined /> {selectedPost.student.email}</div>}
            {selectedPost.student?.phone && <div><PhoneOutlined /> {selectedPost.student.phone}</div>}
          </div>
        )}
      </Modal>

      <CreateStudentPostModal
        visible={isCreatePostModalVisible}
        onClose={closeCreatePostModal}
        onSuccess={handleCreatePostSuccess}
      />

      <EditStudentPostModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        post={editingPost} 
      />
    </div>
  );
};

export default StudentFeedPage;

