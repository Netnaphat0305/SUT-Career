// src/pages/RegisterPage/RegisterPageAdmin.tsx
import React from 'react';
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

const { Title, Text } = Typography;

const RegisterPageAdmin: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const response = await fetch('https://sut-career-backend.onrender.com/api/register/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
        }),
      });

      if (response.ok) {
        message.success('สมัครสมาชิกแอดมินสำเร็จ! กรุณาเข้าสู่ระบบ');
        navigate('/login');
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
          สมัครสมาชิกสำหรับผู้ดูแลระบบ
        </Title>
        <Form name="register_admin" onFinish={onFinish} layout="vertical" scrollToFirstError>
          <Form.Item name="firstName" label="ชื่อจริง" rules={[{ required: true, message: 'กรุณากรอกชื่อจริง!' }]}>
            <Input prefix={<UserOutlined />} placeholder="ชื่อจริง" />
          </Form.Item>
          <Form.Item name="lastName" label="นามสกุล" rules={[{ required: true, message: 'กรุณากรอกนามสกุล!' }]}>
            <Input prefix={<UserOutlined />} placeholder="นามสกุล" />
          </Form.Item>
          <Form.Item name="email" label="อีเมล" rules={[{ required: true, message: 'กรุณากรอกอีเมล!', type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="อีเมล" />
          </Form.Item>
          <Form.Item name="phone" label="เบอร์โทรศัพท์" rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์!' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="เบอร์โทรศัพท์" />
          </Form.Item>

          <Divider>ข้อมูลสำหรับเข้าสู่ระบบ</Divider>

          <Form.Item name="username" label="ชื่อผู้ใช้ (Username)" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้!' }]}>
            <Input prefix={<UserOutlined />} placeholder="ใช้สำหรับเข้าสู่ระบบ" />
          </Form.Item>
          <Form.Item name="password" label="รหัสผ่าน" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน!' }]} hasFeedback>
            <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" />
          </Form.Item>
          <Form.Item name="confirm" label="ยืนยันรหัสผ่าน" dependencies={['password']} hasFeedback rules={[{ required: true, message: 'กรุณายืนยันรหัสผ่าน!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน!')); }, }),]}>
            <Input.Password prefix={<LockOutlined />} placeholder="ยืนยันรหัสผ่านอีกครั้ง" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="register-form-button">
              สมัครสมาชิกแอดมิน
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

export default RegisterPageAdmin;