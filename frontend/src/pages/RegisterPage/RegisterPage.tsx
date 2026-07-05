// src/pages/RegisterPage/RegisterPage.tsx
import React from 'react';
import { Card, Form, Input, Button, Typography, message, Select, Row, Col, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      // 1. ตรวจสอบว่า Endpoint ถูกต้อง
      const response = await fetch('https://sut-career-backend.onrender.com/api/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 2. ตรวจสอบว่าข้อมูลที่ส่ง (Payload) ตรงกับที่ Backend ต้องการ
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
          faculty: values.faculty,
          year: parseInt(values.year, 10), // แปลงชั้นปีเป็นตัวเลข
        }),
      });

      if (response.ok) {
        message.success('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        navigate('/login'); // กลับไปหน้า login หลังจากสมัครสำเร็จ
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'การสมัครสมาชิกผิดพลาด');
      }
    } catch (error) {
      message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="register-page-container">
      <Card className="register-card-expanded">
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          สมัครสมาชิกสำหรับนักศึกษา
        </Title>
        <Form name="register" onFinish={onFinish} layout="vertical" scrollToFirstError>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="ชื่อจริง"
                rules={[{ required: true, message: 'กรุณากรอกชื่อจริง!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="เช่น สมชาย" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="นามสกุล"
                rules={[{ required: true, message: 'กรุณากรอกนามสกุล!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="เช่น ใจดี" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="อีเมล"
                rules={[{ required: true, message: 'กรุณากรอกอีเมล!', type: 'email' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="example@sut.ac.th" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="เบอร์โทรศัพท์"
                rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์!' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="08xxxxxxxx" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
             <Col xs={24} sm={12}>
               <Form.Item
                name="faculty"
                label="คณะ/สาขาวิชา"
                rules={[{ required: true, message: 'กรุณากรอกคณะหรือสาขาวิชา' }]}
              >
                <Input prefix={<BookOutlined />} placeholder="เช่น สาขาวิศวกรรมคอมพิวเตอร์" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="year"
                label="ชั้นปี"
                rules={[{ required: true, message: 'กรุณาเลือกชั้นปี!' }]}
              >
                <Select placeholder="เลือกชั้นปี">
                  <Option value="1">ปีที่ 1</Option>
                  <Option value="2">ปีที่ 2</Option>
                  <Option value="3">ปีที่ 3</Option>
                  <Option value="4">ปีที่ 4</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider>ข้อมูลสำหรับเข้าสู่ระบบ</Divider>

          <Form.Item
            name="username"
            label="ชื่อผู้ใช้ (Username)"
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้!', whitespace: true }]}
          >
            <Input prefix={<UserOutlined />} placeholder="ใช้สำหรับเข้าสู่ระบบ" />
          </Form.Item>

          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน!' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="ยืนยันรหัสผ่าน"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'กรุณายืนยันรหัสผ่าน!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="ยืนยันรหัสผ่านอีกครั้ง" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="register-form-button">
              สมัครสมาชิก
            </Button>
          </Form.Item>
        </Form>
        <div className="register-login-link">
          <Text>มีบัญชีอยู่แล้ว? </Text>
          <Link to="/login">เข้าสู่ระบบ</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;