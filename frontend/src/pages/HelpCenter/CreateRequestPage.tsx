import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Steps,
  Row,
  Col,
  Alert,
  Upload,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
  ArrowLeftOutlined,
  SendOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { qnaAPI } from '../../services/https/index';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

type Attachment = { url: string; name: string; type: string };

const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // ✨ แก้ไข: อัปเดตฟังก์ชันอัปโหลดให้รองรับไฟล์เอกสาร
  const uploadToBackend: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const realFile = file as File;

    // ✨ 1. กำหนดประเภทไฟล์ที่อนุญาต
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // ✨ 2. ตรวจสอบประเภทไฟล์
    if (!allowedTypes.includes(realFile.type)) {
      message.error('รองรับไฟล์ประเภท: รูปภาพ, PDF, DOC, DOCX เท่านั้น');
      onError?.(new Error('Invalid file type'));
      return;
    }

    try {
      const fd = new FormData();
      fd.append('file', realFile);

      const token = localStorage.getItem('token');
      const res = await fetch(`https://sut-career-backend.onrender.com/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'อัปโหลดไม่สำเร็จ');

      setAttachments((prev) => [
        ...prev,
        { url: data.url, name: realFile.name, type: realFile.type || 'file' },
      ]);
      onSuccess?.(data as any);
      message.success('อัปโหลดไฟล์สำเร็จ');
    } catch (err: any) {
      message.error(err?.message || 'การอัปโหลดไฟล์ล้มเหลว');
      onError?.(err);
    }
  };

  const handleSubmit = async (values: { subject: string; initial_message: string }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('กรุณาเข้าสู่ระบบก่อนส่งคำร้อง');
        navigate('/login');
        setLoading(false);
        return;
      }

      const response = await qnaAPI.createTicket({
        subject: values.subject,
        initial_message: values.initial_message,
        attachments,
      });

      if (response && response.status >= 200 && response.status < 300) {
        setCurrentStep(1);
        message.success('ส่งคำร้องสำเร็จ! กำลังเปลี่ยนเส้นทางไปยังศูนย์ช่วยเหลือ...');
        setTimeout(() => navigate('/help?tab=2'), 2000);
      } else {
        throw new Error(response?.data?.error || 'สร้าง Ticket ไม่สำเร็จ');
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      message.error(error.message || 'เกิดข้อผิดพลาดขณะส่งคำร้อง');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'กรอกข้อมูล', icon: <FileTextOutlined /> },
    { title: 'สำเร็จ', icon: <CheckCircleOutlined /> },
  ];

  return (
    <div className="help-center-container">
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/help')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
              }}
            >
              กลับไปที่ศูนย์ช่วยเหลือ
            </Button>
          </Col>
        </Row>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Title level={2} style={{ color: 'white', margin: '0 0 8px 0' }}>
            ส่งคำร้องขอความช่วยเหลือ
          </Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontSize: '16px' }}>
            กรุณาให้รายละเอียดเกี่ยวกับปัญหาของคุณ แล้วเราจะติดต่อกลับโดยเร็วที่สุด
          </Paragraph>
        </div>
      </Card>

      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Steps current={currentStep} items={steps} style={{ maxWidth: '400px', margin: '0 auto' }} />
      </Card>

      {currentStep === 0 && (
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <span>รายละเอียดคำร้อง</span>
            </Space>
          }
          style={{ borderRadius: '12px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: '800px', margin: '0 auto' }}
            size="large"
          >
            <Form.Item
              label="หัวข้อ"
              name="subject"
              rules={[
                { required: true, message: 'กรุณากรอกหัวข้อ' },
                { min: 5, message: 'หัวข้อต้องมีความยาวอย่างน้อย 5 ตัวอักษร' },
              ]}
            >
              <Input
                placeholder="เช่น ปัญหาการเข้าสู่ระบบ, คำถามเกี่ยวกับการใช้งาน"
                style={{ borderRadius: '8px', height: '48px' }}
              />
            </Form.Item>

            <Form.Item
              label="รายละเอียดปัญหา"
              name="initial_message"
              rules={[
                { required: true, message: 'กรุณากรอกรายละเอียดปัญหา' },
                { min: 20, message: 'รายละเอียดต้องมีความยาวอย่างน้อย 20 ตัวอักษร' },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="กรุณาอธิบายปัญหาของคุณให้ละเอียดที่สุด เพื่อให้เราสามารถช่วยเหลือได้อย่างถูกต้อง"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
            
            {/* ✨ 3. อัปเดตส่วนแสดงผล Upload */}
            <Form.Item
              label="แนบไฟล์ (รูปภาพ, PDF, DOCX)"
              extra="รองรับ .jpg, .png, .pdf, .doc, .docx (ขนาดไม่เกิน 5MB)"
            >
              <Upload
                multiple
                accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                listType="picture"
                fileList={fileList}
                customRequest={uploadToBackend}
                onChange={({ fileList: fl }) => setFileList(fl)}
                onRemove={(file) => {
                  setAttachments((prev) => prev.filter((a) => a.name !== file.name));
                  return true;
                }}
              >
                <Button icon={<PaperClipOutlined />}>เลือกไฟล์</Button>
              </Upload>
            </Form.Item>

            <Alert
              message="ข้อมูลเพิ่มเติม"
              description="ปัญหาของคุณจะได้รับการดูแลภายใน 24 ชั่วโมง ให้บริการตลอด 24 ชั่วโมง"
              type="info"
              showIcon
              style={{ marginBottom: '24px', borderRadius: '8px' }}
            />

            <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
              <Space size="large">
                <Button
                  size="large"
                  onClick={() => navigate('/help')}
                  style={{ borderRadius: '8px', minWidth: '120px' }}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={<SendOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    minWidth: '120px',
                  }}
                >
                  ส่งคำร้อง
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      {currentStep === 1 && (
        <Card
          style={{
            borderRadius: '12px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <div className="success-icon">
            <CheckCircleOutlined style={{ fontSize: '64px', color: 'white', marginBottom: '16px' }} />
          </div>
          <Title level={2} style={{ color: 'white', margin: '0 0 16px 0' }}>
            ส่งคำร้องสำเร็จ!
          </Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
            เราได้รับคำร้องของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด
            <br />
            คุณสามารถติดตามสถานะได้ที่แท็บ "คำร้องของฉัน"
          </Paragraph>
        </Card>
      )}
    </div>
  );
};

export default CreateRequestPage;
