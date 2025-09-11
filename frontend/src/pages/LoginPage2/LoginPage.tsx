// src/pages/LoginPage2/LoginPage.tsx
import React, { useContext } from 'react';
import { Card, Form, Input, Button, Tabs, Typography, Space, message } from 'antd';
import { UserOutlined, SearchOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LoginPage.css';

const { Title, Text } = Typography;

// ✨ 1. สร้าง Component สำหรับฟอร์ม Login เพื่อนำไปใช้ซ้ำ
const LoginForm = ({ onFinishHandler, formName }: { onFinishHandler: (values: any) => void, formName: string }) => (
  <Form name={formName} onFinish={onFinishHandler}>
    <Form.Item
      name="username"
      rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้!' }]}
    >
      <Input prefix={<UserOutlined />} placeholder="ชื่อผู้ใช้" />
    </Form.Item>
    <Form.Item
      name="password"
      rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน!' }]}
    >
      <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" />
    </Form.Item>
    <Form.Item>
      <Link to="#" className="login-form-forgot">
        ลืมรหัสผ่าน
      </Link>
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" className="login-form-button">
        เข้าสู่ระบบ
      </Button>
    </Form.Item>
  </Form>
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const onFinish = async (values: any) => {
    if (!authContext) {
      message.error("Authentication service is not available.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const data = await response.json();

      // ================== เพิ่มบรรทัดนี้เข้าไป ==================
      console.log('Response data from server:', data);
      console.log('Token string from server:', data.token);
      // =======================================================
      
      if (response.ok) {
        message.success('เข้าสู่ระบบสำเร็จ!');
        authContext.login(data.user, data.token);

        if (data.user.role === 'admin') {
            navigate('/admin');
        } else if (data.user.role === 'employer') {
            navigate('/home'); // หรือหน้า dashboard ของนายจ้าง
        } else {
            navigate('/home'); // หน้าของนักศึกษา
        }
      } else {
        message.error(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const items = [
    {
      label: (
        <Space>
          <SearchOutlined />
          หางาน
        </Space>
      ),
      key: 'jobseeker',
      children: (
        <>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
            เข้าสู่ระบบสำหรับนักศึกษา
          </Title>
          {/* ✨ 2. เรียกใช้ LoginForm และกำหนด name ที่ไม่ซ้ำกัน */}
          <LoginForm onFinishHandler={onFinish} formName="student_login" />
          <div className="login-register-link">
            <Text>ยังไม่ได้เป็นสมาชิก? </Text>
            <Link to="/register">สมัครสมาชิก</Link>
          </div>
        </>
      ),
    },
    {
      label: (
        <Space>
          <UserOutlined />
          หาคน
        </Space>
      ),
      key: 'employer',
      children: (
        <>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
            เข้าสู่ระบบสำหรับผู้ประกอบการ
          </Title>
          {/* ✨ 3. เรียกใช้ LoginForm และกำหนด name ที่ไม่ซ้ำกัน */}
          <LoginForm onFinishHandler={onFinish} formName="employer_login" />
          <div className="login-register-link">
            <Text>ยังไม่มีบัญชี? </Text>
            <Link to="/register/employer">สมัครสมาชิก</Link>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="login-page-container">
      <Card className="login-card">
        <Tabs defaultActiveKey="jobseeker" items={items} centered />
      </Card>
    </div>
  );
};

export default LoginPage;