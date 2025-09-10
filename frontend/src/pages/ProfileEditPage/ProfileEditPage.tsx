import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin, Card, Avatar, Upload, Select, Row, Col, Typography } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined, MailOutlined, PhoneOutlined, BookOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, UPLOAD_URL, profileAPI } from '../../services/https/index';
import { useNavigate } from 'react-router-dom';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title } = Typography;
const { TextArea } = Input;

const StudentProfileEditPage: React.FC = () => {
  const [form] = Form.useForm();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>();
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const fetchStudentData = async () => {
        setLoading(true);
        try {
          const response = await profileAPI.getMyProfile();
          if (response && response.data && response.data.data.student) {
            const studentData = response.data.data.student;
            setStudentId(studentData.ID);

            // 🔧 แก้ไข: ตั้งค่า form fields อย่างถูกต้อง
            form.setFieldsValue({
              first_name: studentData.first_name,
              last_name: studentData.last_name,
              email: studentData.email,
              phone: studentData.phone,
              faculty: studentData.faculty,
              year: studentData.year,
              skills: studentData.skills ? studentData.skills.split(',') : [],
            });

            // 🔧 แก้ไข: ตั้งค่ารูปโปรไฟล์
            setProfileImageUrl(studentData.profile_image_url);
          } else {
            throw new Error("Student data not found");
          }
        } catch (error) {
          console.error('Profile fetch error:', error);
          message.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
          navigate('/profile');
        } finally {
          setLoading(false);
        }
      };

      fetchStudentData();
    } else {
      navigate('/login');
    }
  }, [user, form, navigate]);

  const onFinish = async (values: any) => {
    if (!studentId) {
      message.error("ไม่พบข้อมูลนักศึกษา, ไม่สามารถอัปเดตได้");
      return;
    }

    setSubmitting(true);
    try {
      // 🔧 แก้ไข: payload mapping ที่ถูกต้อง
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        faculty: values.faculty,
        year: values.year,
        skills: Array.isArray(values.skills) ? values.skills.join(',') : values.skills,
        profile_image_url: profileImageUrl, // 🔧 field name ถูกต้องแล้ว
      };

      console.log('Updating student with payload:', payload);
      console.log('Student ID:', studentId);

      const response = await studentAPI.update(studentId, payload);

      if (response && response.status < 400) {
        message.success('อัปเดตโปรไฟล์สำเร็จแล้ว!');
        navigate('/profile');
      } else {
        throw new Error('Update failed');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      if (error.response?.status === 404) {
        message.error('ไม่พบข้อมูลนักศึกษา - ตรวจสอบ routing ใน backend');
      } else {
        message.error('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileImageUpload = (info: UploadChangeParam) => {
    console.log('Upload info:', info.file);

    if (info.file.status === 'uploading') {
      console.log('Uploading...');
      return;
    }

    if (info.file.status === 'done') {
      message.success(`${info.file.name} อัปโหลดสำเร็จ`);
      const url = info.file.response?.url;
      if (url) {
        setProfileImageUrl(url);
        console.log('Profile image URL set:', url);
      } else {
        message.error('ไม่ได้รับ URL ของรูปที่อัปโหลด');
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} อัปโหลดไม่สำเร็จ`);
      console.error('Upload error:', info.file.error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>กำลังโหลดข้อมูลโปรไฟล์...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/profile')}
        >
          กลับไปหน้าโปรไฟล์
        </Button>
        <Title level={2}>แก้ไขโปรไฟล์</Title>
        <div>{/* For alignment */}</div>
      </Row>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={submitting}
        >
          {/* Profile Image Upload */}
          <Form.Item label="รูปโปรไฟล์" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '16px' }}>
              {profileImageUrl ? (
                <Avatar size={120} src={profileImageUrl} />
              ) : (
                <Avatar size={120} icon={<UserOutlined />} />
              )}
            </div>
            <Upload
              name="file"
              showUploadList={false}
              action={UPLOAD_URL}
              headers={{
                Authorization: `Bearer ${token}`,
              }}
              onChange={handleProfileImageUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>อัปโหลดรูป</Button>
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="ชื่อ"
                rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="เช่น สมชาย" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="นามสกุล"
                rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="เช่น ใจดี" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@sut.ac.th" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="เบอร์โทรศัพท์"
            rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="08xxxxxxxx" />
          </Form.Item>

          <Form.Item
            name="faculty"
            label="คณะ"
            rules={[{ required: true, message: 'กรุณากรอกคณะ' }]}
          >
            <Input prefix={<BookOutlined />} />
          </Form.Item>

          <Form.Item
            name="year"
            label="ชั้นปี"
            rules={[{ required: true, message: 'กรุณาเลือกชั้นปี' }]}
          >
            <Select placeholder="เลือกชั้นปี">
              <Select.Option value={1}>ปีที่ 1</Select.Option>
              <Select.Option value={2}>ปีที่ 2</Select.Option>
              <Select.Option value={3}>ปีที่ 3</Select.Option>
              <Select.Option value={4}>ปีที่ 4</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="skills" label="ทักษะ">
            <Select
              mode="tags"
              placeholder="เพิ่มทักษะ"
              tokenSeparators={[',']}
            >
              {/* Can add predefined options here if needed */}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              icon={<SaveOutlined />}
              size="large"
              block
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default StudentProfileEditPage;
