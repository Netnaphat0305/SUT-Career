import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin, Card, Avatar, Upload, Select, Row, Col, Typography } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined, MailOutlined, PhoneOutlined, BookOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, UPLOAD_URL } from '../../services/https/index';
import { useNavigate } from 'react-router-dom';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';


const { Title, Text } = Typography;
const { TextArea } = Input;

const StudentProfileSetupPage: React.FC = () => {
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
                    // สมมติว่า studentAPI.getById(user.id) สามารถดึงข้อมูลนักศึกษาได้
                    // ในระบบจริงอาจจะต้องใช้ endpoint เฉพาะสำหรับดึงโปรไฟล์ของตัวเอง
                    const response = await studentAPI.getById(user.id); 
                    if (response && response.data) {
                        const studentData = response.data;
                        setStudentId(studentData.ID);
                        form.setFieldsValue({
                            ...studentData,
                            // แปลง skills ที่เป็น string กลับมาเป็น array สำหรับ Select component
                            skills: studentData.skills ? studentData.skills.split(',') : [],
                        });
                        setProfileImageUrl(studentData.profile_image_url);
                    } else {
                       throw new Error("Student data not found");
                    }
                } catch (error) {
                    message.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
                } finally {
                    setLoading(false);
                }
            };
            fetchStudentData();
        } else {
            // หากยังไม่ login ให้ redirect
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
                ...values,
                // แปลง skills ที่เป็น array กลับไปเป็น string คั่นด้วย comma
                skills: Array.isArray(values.skills) ? values.skills.join(',') : values.skills,
                profile_image_url: profileImageUrl,
            };
            
            await studentAPI.update(studentId, payload);
            message.success('อัปเดตโปรไฟล์สำเร็จแล้ว!');
            navigate('/profile'); // กลับไปหน้าโปรไฟล์หลังอัปเดต
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
        } finally {
            setSubmitting(false);
        }
    };

    const handleProfileImageUpload = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} อัปโหลดสำเร็จ`);
            const url = info.file.response?.url;
            setProfileImageUrl(url);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} อัปโหลดไม่สำเร็จ`);
        }
    };

    if (loading) {
        return <div className="loading-container"><Spin size="large" /></div>;
    }

    return (
        <div className="profile-setup-container">
            <Card className="profile-setup-card">
                <div className="profile-setup-header">
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/profile')}
                    >
                        กลับไปหน้าโปรไฟล์
                    </Button>
                    <Title level={3} style={{ margin: 0 }}>แก้ไขโปรไฟล์นักศึกษา</Title>
                    <div style={{width: 130}}></div> {/* For alignment */}
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <div className="profile-picture-uploader">
                        <Upload
                            name="file"
                            listType="picture-circle"
                            className="avatar-uploader"
                            showUploadList={false}
                            action={UPLOAD_URL}
                            headers={{ Authorization: `Bearer ${token}` }}
                            onChange={handleProfileImageUpload}
                        >
                            {profileImageUrl ? <Avatar size={128} src={profileImageUrl} /> : 
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>อัปโหลดรูป</div>
                                </div>
                            }
                        </Upload>
                    </div>

                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="first_name" label="ชื่อจริง" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="เช่น สมชาย" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="last_name" label="นามสกุล" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="เช่น ใจดี" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                             <Form.Item name="email" label="อีเมล" rules={[{ required: true, type: 'email' }]}>
                                <Input prefix={<MailOutlined />} placeholder="example@sut.ac.th" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="phone" label="เบอร์โทรศัพท์" rules={[{ required: true }]}>
                                <Input prefix={<PhoneOutlined />} placeholder="08xxxxxxxx" />
                            </Form.Item>
                        </Col>
                         <Col xs={24} sm={12}>
                            <Form.Item name="faculty" label="คณะ/สาขาวิชา" rules={[{ required: true }]}>
                                <Input prefix={<BookOutlined />} />
                            </Form.Item>
                        </Col>
                         <Col xs={24} sm={12}>
                             <Form.Item name="year" label="ชั้นปี" rules={[{ required: true }]}>
                                <Select placeholder="เลือกชั้นปี">
                                    <Select.Option value={1}>ปีที่ 1</Select.Option>
                                    <Select.Option value={2}>ปีที่ 2</Select.Option>
                                    <Select.Option value={3}>ปีที่ 3</Select.Option>
                                    <Select.Option value={4}>ปีที่ 4</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item name="introduction" label="แนะนำตัวเองสั้นๆ (Bio)">
                        <TextArea rows={4} placeholder="เล่าเกี่ยวกับตัวคุณ, ความสนใจ, หรือเป้าหมายในการทำงาน..." />
                    </Form.Item>

                    <Form.Item name="skills" label="ทักษะ" extra="เพิ่มทักษะโดยการพิมพ์แล้วกด Enter หรือเลือกจากรายการ">
                        <Select mode="tags" style={{ width: '100%' }} placeholder="เช่น React, Figma, Go" tokenSeparators={[',']}>
                            {/* สามารถเพิ่ม Option ทักษะที่พบบ่อยได้ที่นี่ */}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} size="large">
                            บันทึกการเปลี่ยนแปลง
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default StudentProfileSetupPage;
