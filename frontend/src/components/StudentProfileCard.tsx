// src/components/StudentProfileCard.tsx
import React from 'react';
import { Card, Avatar, Typography, Tag, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './StudentProfileCard.css';

const { Text } = Typography;
const { Meta } = Card;

interface Student {
    first_name: string;
    last_name: string;
    faculty: string;
    year: string;
}

// 1. แก้ไขชื่อจาก "Student" เป็น "student" (ตัวพิมพ์เล็ก)
interface StudentProfilePost {
    introduction: string;
    skills: string;
    student: Student;
}

interface StudentProfileCardProps {
  post: StudentProfilePost;
  onClick: () => void;
}

const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ post, onClick }) => {
  const skillsArray = post.skills?.split(',').map(s => s.trim()).filter(s => s) || [];

  return (
    <Card
      hoverable
      className="student-grid-card"
      onClick={onClick}
      cover={
        <div className="ant-card-cover">
            <UserOutlined className="placeholder-icon" />
        </div>
      }
    >
      {/* 2. แก้ไขการแสดงผลเป็น post.student */}
      <Meta
        title={`${post.student.first_name} ${post.student.last_name}`}
        description={post.introduction}
      />
      <div className="skills-section-in-card">
        <div className="skills-title">ทักษะ</div>
        <Space size={[4, 8]} wrap>
            {skillsArray.slice(0, 3).map(skill => (
                <Tag key={skill}>{skill}</Tag>
            ))}
            {skillsArray.length > 3 && <Tag>...</Tag>}
        </Space>
      </div>
    </Card>
  );
};

export default StudentProfileCard;