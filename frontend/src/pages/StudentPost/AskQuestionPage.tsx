// // src/pages/StudentPost/AskQuestionPage.tsx
// import React, { useState } from 'react';
// import { Form, Input, Button, Radio, Typography, Card, Row, Col } from 'antd';

// const { Title } = Typography;
// const { TextArea } = Input;

// interface AskQuestionPageProps {
//     onFormSubmit: (values: any) => Promise<void>; // <-- แก้ไข: ให้ onFormSubmit คืนค่าเป็น Promise
// }

// const AskQuestionPage: React.FC<AskQuestionPageProps> = ({ onFormSubmit }) => {
//   const [isSubmitting, setIsSubmitting] = useState(false); // <-- เพิ่ม: State สำหรับการโหลด

//   const handleFinish = async (values: any) => {
//     setIsSubmitting(true); // <-- เพิ่ม: เริ่มการโหลด
//     try {
//       await onFormSubmit(values);
//       // การ redirect จะถูกจัดการใน onFormSubmit
//     } catch (error) {
//       // หากเกิดข้อผิดพลาด, หยุดการโหลด
//       setIsSubmitting(false);
//     }
//   };


//   return (
//     <Card>
//         <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>แบบฟอร์มรับคำร้อง</Title>
//         <Form
//             layout="vertical"
//             onFinish={handleFinish} // <-- แก้ไข: เรียกใช้ handleFinish
//             style={{ maxWidth: 800, margin: 'auto' }}
//         >
//             <Row gutter={16}>
//                 <Col xs={24} sm={12}>
//                     <Form.Item label="ชื่อ" name="name" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
//                         <Input placeholder="เช่น สมชาย" />
//                     </Form.Item>
//                 </Col>
//                 <Col xs={24} sm={12}>
//                     <Form.Item label="นามสกุล" name="lastname" rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}>
//                         <Input placeholder="ใจดี" />
//                     </Form.Item>
//                 </Col>
//             </Row>
//             <Row gutter={16}>
//                 <Col xs={24} sm={12}>
//                     <Form.Item
//                       label="เบอร์โทร"
//                       name="phone"
//                       rules={[
//                         { required: true, message: 'กรุณากรอกเบอร์โทร' },
//                         { pattern: /^0\d{9}$/, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 10 หลัก)' }
//                       ]}
//                     >
//                         <Input placeholder="08xxxxxxxx" />
//                     </Form.Item>
//                 </Col>
//                 <Col xs={24} sm={12}>
//                     <Form.Item label="อีเมล" name="email" rules={[{ required: true, message: 'กรุณากรอกอีเมล' }, { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง'}]}>
//                         <Input placeholder="example@mail.com" />
//                     </Form.Item>
//                 </Col>
//             </Row>
//             <Row gutter={16}>
//                 <Col xs={24} sm={12}>
//                     <Form.Item label="ติดต่อในนามของ" name="contact_type" rules={[{ required: true, message: 'กรุณาเลือกประเภท' }]}>
//                         <Radio.Group>
//                             <Radio value="ผู้ถูกจ้าง">ผู้ถูกจ้าง</Radio>
//                             <Radio value="ผู้ว่าจ้าง">ผู้ว่าจ้าง</Radio>
//                         </Radio.Group>
//                     </Form.Item>
//                 </Col>
//             </Row>

//             <Form.Item label="หัวข้อเรื่อง" name="title" rules={[{ required: true, message: 'กรุณาระบุหัวข้อ' }]}>
//                 <Input placeholder="ระบุหัวข้อที่ต้องการติดต่อ" />
//             </Form.Item>

//             <Form.Item label="รายละเอียด" name="details" rules={[{ required: true, message: 'กรุณาอธิบายรายละเอียด' }]}>
//                 <TextArea rows={4} placeholder="อธิบายปัญหาหรือคำถามของคุณอย่างละเอียด..." />
//             </Form.Item>

//             <Form.Item style={{ textAlign: 'center' }}>
//                 <Button
//                   type="primary"
//                   htmlType="submit"
//                   size="large"
//                   loading={isSubmitting} // <-- เพิ่ม: แสดงสถานะโหลด
//                 >
//                     {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำร้อง'}
//                 </Button>
//             </Form.Item>
//         </Form>
//     </Card>
//   );
// };

// export default AskQuestionPage;

//src/pages/StudentPost/AskQuestionPage.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../../services/qnaService'; // ✨ 1. Import service

const { Title } = Typography;
const { TextArea } = Input;

const AskQuestionPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (values: { title: string; details: string }) => {
    const ticketData = {
        subject: values.title,
        initial_message: values.details
    };
    setIsSubmitting(true);
    try {
      await createTicket(ticketData); // ✨ 2. เรียกใช้ฟังก์ชันจาก service
      navigate('/help/request-sent');
    } catch (error) {
      console.error(error);
      message.error(String(error));
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Card style={{ maxWidth: 800, margin: 'auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>แบบฟอร์มส่งคำร้อง</Title>
        <Form layout="vertical" onFinish={handleFinish}>
            <Form.Item label="หัวข้อเรื่อง (Subject)" name="title" rules={[{ required: true, message: 'กรุณาระบุหัวข้อเรื่อง' }]}>
                <Input placeholder="ระบุหัวข้อที่ต้องการติดต่อ..." />
            </Form.Item>

            <Form.Item label="รายละเอียด" name="details" rules={[{ required: true, message: 'กรุณาอธิบายรายละเอียด' }]}>
                <TextArea rows={6} placeholder="อธิบายปัญหาหรือคำถามของคุณอย่างละเอียด..." />
            </Form.Item>

            <Form.Item style={{ textAlign: 'center' }}>
                <Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>
                    {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำร้อง'}
                </Button>
            </Form.Item>
        </Form>
    </Card>
  );
};

export default AskQuestionPage;