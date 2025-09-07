// // src/pages/StudentPost/StudentPostForm.tsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Form,
//   Input,
//   Select,
//   Button,
//   Card,
//   Typography,
//   Space,
//   Row,
//   Col,
//   Divider,
//   message,
//   Result,
// } from 'antd';
// import {
//   UserOutlined,
//   MailOutlined,
//   BookOutlined,
//   LinkOutlined,
//   SolutionOutlined,
//   RocketOutlined,
//   HomeOutlined,
//   PhoneOutlined, // เพิ่มไอคอนโทรศัพท์
// } from '@ant-design/icons';

// const { Title, Text } = Typography;
// const { TextArea } = Input;
// const { Option } = Select;

// interface StudentPostFormProps {
//     onSuccess?: () => void;
// }

// const StudentPostForm: React.FC<StudentPostFormProps> = ({ onSuccess }) => {
//   const [loading, setLoading] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const navigate = useNavigate();

//   const onFinish = async (values: any) => {
//     setLoading(true);
//     const postData = {
//         first_name: values.firstName,
//         last_name: values.lastName,
//         email: values.email,
//         phone: values.phone, // เพิ่มข้อมูลเบอร์โทรศัพท์
//         faculty: values.faculty,
//         year: values.year,
//         introduction: values.introduction,
//         job_type: values.jobType,
//         portfolio_url: values.portfolio || "",
//         skills: values.skills,
//     };
    
//     try {
//         const response = await fetch('http://localhost:8080/api/student-profile-posts', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(postData),
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`Network response was not ok: ${errorText}`);
//         }
        
//         if (onSuccess) {
//             onSuccess();
//         } else {
//             setIsSubmitted(true);
//         }

//     } catch (error) {
//         console.error('Failed to submit the form:', error);
//         message.error('เกิดข้อผิดพลาดในการโพสต์โปรไฟล์');
//     } finally {
//         setLoading(false);
//     }
//   };

//   if (isSubmitted && !onSuccess) {
//     return (
//         <Result
//             status="success"
//             title="โพสต์โปรไฟล์ของคุณสำเร็จแล้ว!"
//             subTitle="ผู้ว่าจ้างที่สนใจจะเห็นโปรไฟล์ของคุณและสามารถติดต่อคุณได้โดยตรง"
//             extra={[
//             <Button
//                 type="primary"
//                 key="console"
//                 icon={<HomeOutlined />}
//                 onClick={() => navigate('/Job/Board')}
//             >
//                 กลับไปหน้าบอร์ด
//             </Button>,
//             ]}
//         />
//     );
//   }

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
//       <Card style={{ width: '100%', maxWidth: '800px', boxShadow: 'none', border: 'none' }}>
//         <div style={{ textAlign: 'center', marginBottom: '24px' }}>
//             <RocketOutlined style={{ fontSize: '32px', color: '#007bff' }} />
//             <Title level={3} style={{ marginTop: '8px' }}>สร้างโปรไฟล์หางานของคุณ</Title>
//             <Text type="secondary">กรอกข้อมูลเพื่อให้ผู้ว่าจ้างรู้จักคุณมากขึ้น</Text>
//         </div>
        
//         <Form
//           layout="vertical"
//           onFinish={onFinish}
//           autoComplete="off"
//         >
//           <Divider orientation="left">ข้อมูลส่วนตัวและประวัติการศึกษา</Divider>
//           <Row gutter={24}>
//             <Col xs={24} sm={12}>
//               <Form.Item
//                 name="firstName"
//                 label="ชื่อจริง"
//                 rules={[{ required: true, message: 'กรุณากรอกชื่อจริง' }]}
//               >
//                 <Input prefix={<UserOutlined />} placeholder="เช่น สมชาย" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={12}>
//               <Form.Item
//                 name="lastName"
//                 label="นามสกุล"
//                 rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
//               >
//                 <Input prefix={<UserOutlined />} placeholder="เช่น ใจดี" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={12}>
//                 <Form.Item
//                     name="email"
//                     label="อีเมลติดต่อ"
//                     rules={[{ required: true, type: 'email', message: 'กรุณากรอกอีเมลที่ถูกต้อง' }]}
//                 >
//                     <Input prefix={<MailOutlined />} placeholder="example@email.com" />
//                 </Form.Item>
//             </Col>
//             {/* --- vvvv ส่วนที่เพิ่มเข้ามา vvvv --- */}
//             <Col xs={24} sm={12}>
//               <Form.Item
//                 name="phone"
//                 label="เบอร์โทรศัพท์"
//                 rules={[
//                   { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
//                   { pattern: /^0\d{9}$/, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง (0xxxxxxxxxx)' }
//                 ]}
//               >
//                 <Input prefix={<PhoneOutlined />} placeholder="08xxxxxxxx" />
//               </Form.Item>
//             </Col>
//             {/* --- ^^^^ สิ้นสุดส่วนที่เพิ่มเข้ามา ^^^^ --- */}
//             <Col xs={24} sm={12}>
//               <Form.Item
//                 name="faculty"
//                 label="คณะ/สาขาวิชา"
//                 rules={[{ required: true, message: 'กรุณากรอกคณะหรือสาขาวิชา' }]}
//               >
//                 <Input prefix={<BookOutlined />} placeholder="เช่น สาขาวิศวกรรมคอมพิวเตอร์" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={12}>
//               <Form.Item
//                 name="year"
//                 label="ชั้นปีที่กำลังศึกษา"
//                 rules={[{ required: true, message: 'กรุณาเลือกชั้นปี' }]}
//               >
//                 <Select placeholder="เลือกชั้นปี">
//                   <Option value="ปีที่ 1">ปีที่ 1</Option>
//                   <Option value="ปีที่ 2">ปีที่ 2</Option>
//                   <Option value="ปีที่ 3">ปีที่ 3</Option>
//                   <Option value="ปีที่ 4">ปีที่ 4</Option>
//                   <Option value="สูงกว่าปริญญาตรี">สูงกว่าปริญญาตรี</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>

//           <Divider orientation="left">รายละเอียดเกี่ยวกับงาน</Divider>
//           <Row gutter={24}>
//             <Col xs={24} sm={12}>
//                 <Form.Item
//                     name="jobType"
//                     label="ประเภทงานที่มองหา"
//                     rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}
//                 >
//                     <Select placeholder="เลือกประเภทงาน">
//                     <Option value="พาร์ทไทม์">พาร์ทไทม์</Option>
//                     <Option value="งานประจำ">งานประจำ</Option>
//                     <Option value="ฟรีแลนซ์">ฟรีแลนซ์</Option>
//                     <Option value="ฝึกงาน">ฝึกงาน</Option>
//                     </Select>
//                 </Form.Item>
//             </Col>
//             <Col xs={24} sm={12}>
//                 <Form.Item
//                     name="portfolio"
//                     label="ลิงก์ผลงาน/LinkedIn (ถ้ามี)"
//                 >
//                     <Input prefix={<LinkOutlined />} placeholder="https://linkedin.com/in/yourprofile" />
//                 </Form.Item>
//             </Col>
//           </Row>
          
//           <Form.Item
//             name="introduction"
//             label="แนะนำตัวเองสั้นๆ (เป้าหมาย, สิ่งที่สนใจ)"
//             rules={[{ required: true, message: 'กรุณาแนะนำตัวเอง'}]}
//           >
//             <TextArea rows={4} placeholder="อธิบายเกี่ยวกับตัวคุณและงานที่สนใจ เพื่อให้ผู้ว่าจ้างรู้จักคุณดีขึ้น" />
//           </Form.Item>

//           <Form.Item
//             name="skills"
//             label="ทักษะ หรือ ความสามารถ"
//             rules={[{ required: true, message: 'กรุณาระบุทักษะของคุณ'}]}
//             extra="คั่นแต่ละทักษะด้วยจุลภาค (,) เช่น ทำอาหาร, วาดภาพ, เขียนโปรแกรม"
//           >
//             <TextArea rows={4} placeholder="" />
//           </Form.Item>
          
//           <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
//             <Space>
//                 <Button htmlType="button">
//                     ยกเลิก
//                 </Button>
//                 <Button type="primary" htmlType="submit" icon={<SolutionOutlined />} loading={loading}>
//                     โพสต์โปรไฟล์
//                 </Button>
//             </Space>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// };

// export default StudentPostForm;



// src/pages/StudentPost/StudentPostForm.tsx
// src/pages/StudentPost/StudentPostForm.tsx
import React from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Typography,
  Row,
  Col,
  Divider,
  Upload,
} from 'antd';
import { 
  RocketOutlined, 
  SolutionOutlined, 
  UploadOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { createStudentProfilePost } from '../../services/studentPostService';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface StudentPostFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const StudentPostForm: React.FC<StudentPostFormProps> = ({ onSuccess, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const { user, token } = useAuth();

  const onFinish = async (values: any) => {
    if (!user) {
      message.error('กรุณาเข้าสู่ระบบก่อนสร้างโพสต์');
      return;
    }

    setLoading(true);
    try {
      await createStudentProfilePost({
        ...values,
        portfolio_url: values.portfolio_url || "",
        file_url: values.file_url || "", 
      });
      message.success('สร้างโพสต์ของคุณสำเร็จแล้ว!');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      message.error(error.message || 'เกิดข้อผิดพลาดในการสร้างโพสต์');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: 'http://localhost:8080/api/upload',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    maxCount: 1,
    fileList,
    onChange(info) {
      setFileList(info.fileList);
      if (info.file.status === 'done') {
        message.success(`${info.file.name} อัปโหลดสำเร็จ`);
        form.setFieldsValue({ file_url: info.file.response.url }); 
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} อัปโหลดไม่สำเร็จ`);
      }
    },
    onRemove() {
        form.setFieldsValue({ file_url: null });
        setFileList([]);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} size="large">
      <Title level={4} style={{ textAlign: 'center' }}>
        <RocketOutlined /> สร้างโพสต์หางานใหม่
      </Title>
      <Divider />
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="title" label="หัวข้อโพสต์" rules={[{ required: true, message: 'กรุณากรอกหัวข้อโพสต์' }]}>
            <Input placeholder="เช่น: 'นักพัฒนา React ตามหางาน Part-time'" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="job_type" label="ประเภทงานที่มองหา" rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}>
            <Select placeholder="เลือกประเภทงาน">
              <Option value="งานประจำ">งานประจำ</Option>
              <Option value="งานพาร์ทไทม์">งานพาร์ทไทม์</Option>
              <Option value="ฟรีแลนซ์">ฟรีแลนซ์</Option>
              <Option value="ฝึกงาน">ฝึกงาน</Option>
              <Option value="งานชั่วคราว">งานชั่วคราว</Option>
              <Option value="งานโครงการ">งานโครงการ</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="year" label="ชั้นปี">
            <Input placeholder="เช่น ปีที่ 3" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="introduction" label="แนะนำตัวเองสั้นๆ">
            <TextArea rows={3} placeholder="แนะนำตัว, เป้าหมาย, หรือสิ่งที่น่าสนใจเกี่ยวกับคุณ" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="skills" label="ทักษะ (คั่นด้วยเครื่องหมาย ,)" rules={[{ required: true, message: 'กรุณาระบุทักษะของคุณ' }]}>
            <Input placeholder="เช่น React, TypeScript, Figma, Go" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
            <Form.Item name="portfolio_url" label="แนบลิงก์ผลงาน (ถ้ามี)">
                <Input prefix={<LinkOutlined />} placeholder="URL ของ GitHub, LinkedIn, Behance" />
            </Form.Item>
        </Col>
        <Col xs={24} md={12}>
            <Form.Item label="อัปโหลดไฟล์ (ถ้ามี)">
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} style={{width: '100%'}}>เลือกไฟล์ (Resume, CV, etc.)</Button>
                </Upload>
            </Form.Item>
            <Form.Item name="file_url" hidden>
                <Input />
            </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Form.Item style={{ textAlign: 'right' }}>
        <Button onClick={onClose} style={{ marginRight: 8 }}>
          ยกเลิก
        </Button>
        <Button type="primary" htmlType="submit" loading={loading} icon={<SolutionOutlined />}>
          สร้างโพสต์
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StudentPostForm;