// // src/pages/HelpCenter/CreateRequestPage.tsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Card,
//   Form,
//   Input,
//   Button,
//   Typography,
//   Space,
//   message,
//   Steps,
//   Row,
//   Col,
//   Alert
// } from 'antd';
// import {
//   ArrowLeftOutlined,
//   SendOutlined,
//   FileTextOutlined,
//   CheckCircleOutlined
// } from '@ant-design/icons';

// const { Title, Text, Paragraph } = Typography;
// const { TextArea } = Input;

// const API_URL = 'http://localhost:8080/api';

// const CreateRequestPage: React.FC = () => {
//   const navigate = useNavigate();
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);

//   const handleSubmit = async (values: { subject: string; initial_message: string }) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         message.error('กรุณาเข้าสู่ระบบก่อนส่งคำร้อง');
//         navigate('/login');
//         return;
//       }

//       const response = await fetch(`${API_URL}/tickets`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           subject: values.subject,
//           initial_message: values.initial_message
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to create ticket');
//       }

//       const ticketData = await response.json();
      
//       // แสดงขั้นตอนสำเร็จ
//       setCurrentStep(1);
//       message.success('ส่งคำร้องสำเร็จแล้ว! กำลังนำทางไปหน้าศูนย์ช่วยเหลือ...');
      
//       // รอ 2 วินาทีแล้วไปหน้า Help Center พร้อมเปิดแท็บ "คำร้องของฉัน"
//       setTimeout(() => {
//         navigate('/help?tab=2');
//       }, 2000);

//     } catch (error: any) {
//       console.error('Error creating ticket:', error);
//       message.error(error.message || 'เกิดข้อผิดพลาดในการส่งคำร้อง');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const steps = [
//     {
//       title: 'กรอกข้อมูล',
//       icon: <FileTextOutlined />,
//     },
//     {
//       title: 'ส่งสำเร็จ',
//       icon: <CheckCircleOutlined />,
//     },
//   ];

//   if (currentStep === 1) {
//     return (
//       <div style={{ 
//         backgroundColor: '#eff3fb', 
//         minHeight: '100vh',
//         padding: '40px 20px' 
//       }}>
//         <div style={{ maxWidth: '600px', margin: '0 auto' }}>
//           <Card style={{
//             borderRadius: '16px',
//             textAlign: 'center',
//             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
//           }}>
//             <div style={{ padding: '40px 20px' }}>
//               <CheckCircleOutlined 
//                 style={{ 
//                   fontSize: '64px', 
//                   color: '#52c41a', 
//                   marginBottom: '24px' 
//                 }} 
//               />
//               <Title level={2} style={{ color: '#52c41a', marginBottom: '16px' }}>
//                 ส่งคำร้องสำเร็จแล้ว!
//               </Title>
//               <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
//                 เราได้รับคำร้องของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด
//               </Paragraph>
//               <Text type="secondary">
//                 กำลังนำคุณไปยังหน้าศูนย์ช่วยเหลือ...
//               </Text>
//             </div>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ 
//       backgroundColor: '#eff3fb', 
//       minHeight: '100vh',
//       padding: '40px 20px' 
//     }}>
//       <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
//         {/* Header */}
//         <div style={{ marginBottom: '32px' }}>
//           <Button
//             icon={<ArrowLeftOutlined />}
//             onClick={() => navigate('/help')}
//             style={{ marginBottom: '16px' }}
//           >
//             กลับไปศูนย์ช่วยเหลือ
//           </Button>
          
//           <Title level={1} style={{ color: '#1d39c4', marginBottom: '8px' }}>
//             📝 ส่งคำร้องใหม่
//           </Title>
//           <Text style={{ fontSize: '16px', color: '#666' }}>
//             กรอกรายละเอียดปัญหาหรือคำถามของคุณ เราจะตอบกลับโดยเร็วที่สุด
//           </Text>
//         </div>

//         {/* Progress Steps */}
//         <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
//           <Steps current={currentStep} items={steps} />
//         </Card>

//         {/* Main Form */}
//         <Card style={{
//           borderRadius: '16px',
//           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
//         }}>
//           <Row gutter={[24, 24]}>
//             {/* Form Section */}
//             <Col xs={24} lg={16}>
//               <Title level={3} style={{ marginBottom: '24px' }}>
//                 รายละเอียดคำร้อง
//               </Title>
              
//               <Form
//                 form={form}
//                 layout="vertical"
//                 onFinish={handleSubmit}
//                 size="large"
//               >
//                 <Form.Item
//                   name="subject"
//                   label="หัวข้อเรื่อง"
//                   rules={[
//                     { required: true, message: 'กรุณากรอกหัวข้อเรื่อง' },
//                     { min: 5, message: 'หัวข้อควรมีอย่างน้อย 5 ตัวอักษร' },
//                     { max: 100, message: 'หัวข้อไม่ควรเกิน 100 ตัวอักษร' }
//                   ]}
//                 >
//                   <Input 
//                     placeholder="เช่น: ปัญหาการสมัครงาน, คำถามเกี่ยวกับโปรไฟล์"
//                     style={{ borderRadius: '8px' }}
//                   />
//                 </Form.Item>

//                 <Form.Item
//                   name="initial_message"
//                   label="รายละเอียดปัญหา"
//                   rules={[
//                     { required: true, message: 'กรุณากรอกรายละเอียดปัญหา' },
//                     { min: 10, message: 'รายละเอียดควรมีอย่างน้อย 10 ตัวอักษร' },
//                     { max: 1000, message: 'รายละเอียดไม่ควรเกิน 1000 ตัวอักษร' }
//                   ]}
//                 >
//                   <TextArea
//                     rows={6}
//                     placeholder="อธิบายปัญหาหรือคำถามของคุณให้ละเอียด เพื่อให้เราสามารถช่วยเหลือคุณได้อย่างมีประสิทธิภaพ"
//                     style={{ borderRadius: '8px' }}
//                     showCount
//                     maxLength={1000}
//                   />
//                 </Form.Item>

//                 <Form.Item style={{ marginBottom: 0 }}>
//                   <Space size="middle" style={{ width: '100%' }}>
//                     <Button
//                       size="large"
//                       onClick={() => navigate('/help')}
//                       style={{ borderRadius: '8px', minWidth: '120px' }}
//                     >
//                       ยกเลิก
//                     </Button>
                    
//                     <Button
//                       type="primary"
//                       htmlType="submit"
//                       loading={loading}
//                       icon={<SendOutlined />}
//                       size="large"
//                       style={{
//                         borderRadius: '8px',
//                         minWidth: '120px',
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         border: 'none'
//                       }}
//                     >
//                       ส่งคำร้อง
//                     </Button>
//                   </Space>
//                 </Form.Item>
//               </Form>
//             </Col>

//             {/* Info Section */}
//             <Col xs={24} lg={8}>
//               <div style={{ padding: '0 16px' }}>
//                 <Title level={4} style={{ marginBottom: '16px' }}>
//                   💡 คำแนะนำ
//                 </Title>
                
//                 <Alert
//                   message="เพื่อให้เราช่วยเหลือคุณได้ดีที่สุด"
//                   description={
//                     <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
//                       <li>อธิบายปัญหาให้ละเอียดชัดเจน</li>
//                       <li>แนบไฟล์หรือภาพหน้าจอ (หากจำเป็น)</li>
//                       <li>ระบุขั้นตอนที่ทำให้เกิดปัญหา</li>
//                       <li>แจ้งเบราว์เซอร์และอุปกรณ์ที่ใช้</li>
//                     </ul>
//                   }
//                   type="info"
//                   style={{ marginBottom: '16px' }}
//                 />

//                 <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
//                   <Title level={5} style={{ marginBottom: '8px' }}>
//                     📞 ติดต่อด่วน
//                   </Title>
//                   <Text strong>อีเมล:</Text> support@sutcareer.com<br />
//                   <Text strong>โทร:</Text> 02-123-4567<br />
//                   <Text strong>เวลา:</Text> จ-ศ 9:00-17:00
//                 </Card>
//               </div>
//             </Col>
//           </Row>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default CreateRequestPage;
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
// ✨ 1. Import qnaAPI จาก service กลาง
import { qnaAPI } from '../../services/https/index';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// ❌ 2. ลบ API_URL ที่เคยประกาศไว้ตรงนี้
// const API_URL = 'http://localhost:8080/api';

type Attachment = { url: string; name: string; type: string };

const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // ฟังก์ชัน uploadToBackend ยังคงใช้ fetch ชั่วคราว เนื่องจากเป็น logic เฉพาะส่วน
  const uploadToBackend: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      const realFile = file as File;

      if (!realFile.type?.startsWith('image/')) {
        message.error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น');
        onError?.(new Error('invalid file type'));
        return;
      }

      const fd = new FormData();
      fd.append('file', realFile);

      const token = localStorage.getItem('token');
      // ใช้ fetch สำหรับการอัปโหลดไฟล์ที่นี่ไปก่อน
      const res = await fetch(`http://localhost:8080/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'อัปโหลดไม่สำเร็จ');

      setAttachments((prev) => [
        ...prev,
        { url: data.url, name: realFile.name, type: realFile.type || 'image/*' },
      ]);
      onSuccess?.(data as any);
      message.success('อัปโหลดไฟล์สำเร็จ');
    } catch (err: any) {
      message.error(err?.message || 'การอัปโหลดไฟล์ล้มเหลว');
      onError?.(err);
    }
  };

  // ✨ 3. แก้ไข handleSubmit ให้เรียกใช้ qnaAPI.createTicket
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
      {/* ส่วนหัว */}
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

      {/* ขั้นตอน */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Steps current={currentStep} items={steps} style={{ maxWidth: '400px', margin: '0 auto' }} />
      </Card>

      {/* ฟอร์ม */}
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

            {/* แนบรูปภาพ (อัปโหลดไปที่ Supabase ผ่าน Backend) */}
            <Form.Item
              label="แนบรูปภาพ (อัปโหลดเข้าระบบ)"
              extra="รองรับ .jpg, .jpeg, .png, .gif, .webp, .bmp"
            >
              <Upload
                multiple
                accept="image/*"
                listType="picture"
                fileList={fileList}
                customRequest={uploadToBackend}
                beforeUpload={(file) => {
                  if (!file.type?.startsWith('image/')) {
                    message.error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น');
                    return Upload.LIST_IGNORE;
                  }
                  return true;
                }}
                onChange={({ fileList: fl }) => setFileList(fl)}
                onRemove={(file) => {
                  setAttachments((prev) => prev.filter((a) => a.name !== file.name));
                  return true;
                }}
              >
                <Button icon={<PaperClipOutlined />}>แนบรูปภาพ</Button>
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

      {/* ขั้นตอนสำเร็จ */}
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
