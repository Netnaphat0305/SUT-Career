import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin, Card, Avatar, Upload, Select, Row, Col, Typography, Divider, Space } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined, MailOutlined, PhoneOutlined, BookOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, UPLOAD_URL, profileAPI } from '../../services/https/index';
import { useNavigate } from 'react-router-dom';
import type { UploadChangeParam } from 'antd/es/upload';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const faculties = [
    "สำนักวิชาวิศวกรรมศาสตร์",
    "สำนักวิชาวิทยาศาสตร์",
    "สำนักวิชาเทคโนโลยีการเกษตร",
    "สำนักวิชาเทคโนโลยีสังคม",
    "สำนักวิชาแพทยศาสตร์",
    "สำนักวิชาพยาบาลศาสตร์",
    "สำนักวิชาสาธารณสุขศาสตร์",
    "สำนักวิชาทันตแพทยศาสตร์",
    "สำนักวิชาศาสตร์และศิลป์ดิจิทัล"
];

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
          if (response?.data?.data?.student) {
            const studentData = response.data.data.student;
            setStudentId(studentData.ID);

            form.setFieldsValue({
              first_name: studentData.first_name,
              last_name: studentData.last_name,
              email: studentData.email,
              phone: studentData.phone,
              faculty: studentData.faculty,
              year: studentData.year,
              skills: studentData.skills ? studentData.skills.split(',').filter(Boolean) : [],
            });

            setProfileImageUrl(studentData.profile_image_url);
          } else {
            throw new Error("ไม่พบข้อมูลนักศึกษา");
          }
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error);
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
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        faculty: values.faculty,
        year: values.year,
        skills: Array.isArray(values.skills) ? values.skills.join(',') : values.skills,
        profile_image_url: profileImageUrl,
      };

      const response = await studentAPI.update(studentId, payload);

      if (response && response.status < 400) {
        message.success('อัปเดตโปรไฟล์สำเร็จแล้ว!');
        navigate('/profile');
      } else {
        throw new Error('การอัปเดตล้มเหลว');
      }
    } catch (error: any) {
      console.error('เกิดข้อผิดพลาดในการอัปเดต:', error);
      message.error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileImageUpload = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} อัปโหลดสำเร็จ`);
      const url = info.file.response?.url;
      if (url) {
        setProfileImageUrl(url);
      } else {
        message.error('ไม่ได้รับ URL ของรูปภาพที่อัปโหลด');
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} อัปโหลดไม่สำเร็จ`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)', background: '#f0f2f5' }}>
        <Spin size="large" tip="กำลังโหลดข้อมูลโปรไฟล์..." />
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
       <div style={{ maxWidth: '1000px', margin: '0 auto 24px auto', textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>แก้ไขโปรไฟล์</Title>
            <Text type="secondary">อัปเดตข้อมูลของคุณให้เป็นปัจจุบันอยู่เสมอ</Text>
        </div>
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={submitting}>
        
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: '12px', textAlign: 'center' }}>
                 <Avatar size={128} src={profileImageUrl} icon={<UserOutlined />} style={{ marginBottom: '16px', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                 <Title level={4} style={{ marginTop: 0 }}>
                    {form.getFieldValue('first_name') || 'ชื่อ'} {form.getFieldValue('last_name') || 'นามสกุล'}
                 </Title>
                 <Text type="secondary">{form.getFieldValue('email')}</Text>
                  
                  <Form.Item name="profileImage" style={{ marginTop: 24, marginBottom: 0 }}>
                    <Upload
                        name="file"
                        showUploadList={false}
                        action={UPLOAD_URL}
                        headers={{
                            Authorization: `Bearer ${token}`,
                        }}
                        onChange={handleProfileImageUpload}
                        accept="image/png, image/jpeg, image/gif"
                    >
                      <Button icon={<UploadOutlined />}>เปลี่ยนรูปโปรไฟล์</Button>
                    </Upload>
                  </Form.Item>

                  <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: '16px' }}>
                    ไฟล์รูปภาพควรเป็น JPG, PNG หรือ GIF และมีขนาดไม่เกิน 2MB
                  </Paragraph>
              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} md={16}>
              <Card bordered={false} style={{ borderRadius: '12px' }}>
                <Title level={4} style={{marginTop: 0}}>ข้อมูลส่วนตัว</Title>
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                        name="first_name"
                        label="ชื่อ"
                        rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
                    >
                        <Input prefix={<IdcardOutlined />} placeholder="เช่น สมชาย" size="large"/>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        name="last_name"
                        label="นามสกุล"
                        rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
                    >
                        <Input prefix={<IdcardOutlined />} placeholder="เช่น ใจดี" size="large"/>
                    </Form.Item>
                  </Col>
                </Row>

                 <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="อีเมล"
                            rules={[
                                { required: true, message: 'กรุณากรอกอีเมล' },
                                { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="example@sut.ac.th" size="large"/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="เบอร์โทรศัพท์"
                            rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' }]}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="08xxxxxxxx" size="large"/>
                        </Form.Item>
                    </Col>
                 </Row>
                
                <Title level={4} style={{marginTop: '16px'}}>ข้อมูลการศึกษา</Title>
                <Divider />
                 <Row gutter={16}>
                    <Col span={12}>
                         <Form.Item
                            name="faculty"
                            label="คณะ"
                            rules={[{ required: true, message: 'กรุณาเลือกคณะ' }]}
                        >
                            <Select placeholder="เลือกคณะ" size="large" disabled>
                                {faculties.map(faculty => (
                                    <Option key={faculty} value={faculty}>{faculty}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                         <Form.Item
                            name="year"
                            label="ชั้นปี"
                            rules={[{ required: true, message: 'กรุณาเลือกชั้นปี' }]}
                        >
                            <Select placeholder="เลือกชั้นปี" size="large">
                            <Select.Option value={1}>ปีที่ 1</Select.Option>
                            <Select.Option value={2}>ปีที่ 2</Select.Option>
                            <Select.Option value={3}>ปีที่ 3</Select.Option>
                            <Select.Option value={4}>ปีที่ 4</Select.Option>
                            <Select.Option value={5}>ปีที่ 5</Select.Option>
                            <Select.Option value={6}>ปีที่ 6</Select.Option>
                           
                            </Select>
                        </Form.Item>
                    </Col>
                 </Row>
                
                <Title level={4} style={{marginTop: '16px'}}>ทักษะและความสามารถ</Title>
                <Divider />
                 <Form.Item name="skills" label="ทักษะ">
                    <Select
                        mode="tags"
                        placeholder="เพิ่มทักษะ (เช่น React, Python) แล้วกด Enter"
                        tokenSeparators={[',']}
                        size="large"
                    >
                    </Select>
                </Form.Item>
              </Card>
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: '24px' }}>
            <Col>
              <Space size="large">
                <Button size="large" onClick={() => navigate('/profile')} style={{minWidth: '120px'}}>
                    ยกเลิก
                </Button>
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                    icon={<SaveOutlined />}
                    size="large"
                     style={{minWidth: '120px'}}
                >
                    บันทึก
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
};

export default StudentProfileEditPage;

