

// // src/components/CreateStudentPostModal.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   Form,
//   Input,
//   Select,
//   Button,
//   message,
//   Row,
//   Col,
//   Typography,
//   Upload,
//   Space,
// } from 'antd';
// import {
//   BulbOutlined,
//   ClockCircleOutlined,
//   EnvironmentOutlined,
//   DollarOutlined,
//   TagOutlined,
//   LinkOutlined,
//   UserOutlined,
//   UploadOutlined,
// } from '@ant-design/icons';
// import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
// import { createStudentPost } from '../services/studentPostService';
// import { useAuth } from '../context/AuthContext';
// import StudentPostForm from '../pages/StudentPost/StudentPostForm';
// //import SkillSelect from './SkillSelect';
// import { StudentPostAttachment } from "../interfaces/studentpost";

// const { Title } = Typography;
// const { TextArea } = Input;
// const { Option } = Select;


// interface CreateStudentPostModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }



// const CreateStudentPostModal: React.FC<CreateStudentPostModalProps> = ({
//   visible,
//   onClose,
//   onSuccess,
// }) => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [fileList, setFileList] = useState<UploadFile[]>([]);
//   const [attachments, setAttachments] = useState<Attachment[]>([]);
//   const { user } = useAuth();

//   const jobTypes = [
//     'งานประจำ',
//     'งานพาร์ทไทม์',
//     'ฟรีแลนซ์',
//     'ฝึกงาน',
//     'งานชั่วคราว',
//     'งานโครงการ'
//   ];

//   // Upload Props
//   const handleUpload: UploadProps = {
//     name: 'file',
//     action: 'http://localhost:8080/api/upload',
//     method: 'POST',
//     withCredentials: false,
//     beforeUpload: (file: File) => {
//       console.log('🔍 Before upload:', file.name, file.type, file.size);
//       const isValidType = [
//         'image/',
//         'application/pdf',
//         'application/msword',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//       ].some(type => file.type.startsWith(type) || file.type.includes(type));

//       if (!isValidType) {
//         message.error('รองรับเฉพาะไฟล์ประเภท: รูปภาพ, PDF, DOC, DOCX');
//         return false;
//       }

//       const isLt10M = file.size / 1024 / 1024 < 10;
//       if (!isLt10M) {
//         message.error('ขนาดไฟล์ต้องไม่เกิน 10MB');
//         return false;
//       }

//       return true;
//     },
//     onChange: (info: any) => {
//       console.log('📤 Upload info:', info);
//       setFileList([...info.fileList]);
      
//       if (info.file.status === 'uploading') {
//         console.log('⏳ Uploading...');
//       }

//       if (info.file.status === 'done') {
//         const response = info.file.response;
//         console.log('✅ Upload response:', response);
//         if (response && response.url) {
//           const newAttachment: Attachment = {
//             url: response.url,
//             name: info.file.name,
//             type: info.file.type || 'application/octet-stream',
//           };
//           setAttachments(prev => [...prev, newAttachment]);
//           message.success(`${info.file.name} อัปโหลดสำเร็จ`);
//         } else {
//           message.error('เกิดข้อผิดพลาดในการอัปโหลด: ' + (response?.error || 'Unknown error'));
//         }
//       } else if (info.file.status === 'error') {
//         console.error('❌ Upload error:', info.file.error);
//         message.error(`${info.file.name} อัปโหลดล้มเหลว: ${info.file.error?.message || 'Unknown error'}`);
//       }
//     },
//     onError: (error: any) => {
//       console.error('❌ Upload error:', error);
//       message.error('เกิดข้อผิดพลาดในการอัปโหลด');
//     },
//     onRemove: (file: UploadFile) => {
//       setAttachments(prev => prev.filter(att => att.name !== file.name));
//     },
//   };

//   useEffect(() => {
//     console.log('🔧 Modal mounted');
//     console.log('🌐 Backend URL:', 'http://localhost:8080/api/upload');
//   }, []);

//   const handleSubmit = async (values: any) => {
//     if (!user) {
//       message.error('กรุณาเข้าสู่ระบบก่อนสร้างโพสต์');
//       return;
//     }

//     setLoading(true);
//     try {
//       const postData = {
//         title: values.title,
//         job_type: values.jobType,
//         skills: values.skills || [], // ✅ ส่งเป็น array โดยตรง
//         availability: values.availability,
//         preferred_location: values.preferredLocation,
//         expected_compensation: values.expectedCompensation,
//         introduction: values.introduction,
//         portfolio_url: values.portfolio_url || '',
//         // ✅ เพิ่มข้อมูลไฟล์แนบ
//         attachment_url: attachments.length > 0 ? attachments[0].url : '',
//         attachment_name: attachments.length > 0 ? attachments[0].name : '',
//         attachment_type: attachments.length > 0 ? attachments[0].type : '',
//       };

//       console.log('📝 Creating post with data:', postData);
//       await createStudentPost(postData);
//       message.success('สร้างโพสต์ของคุณสำเร็จแล้ว!');
//       form.resetFields();
//       setFileList([]);
//       setAttachments([]);
//       onSuccess();
//     } catch (error: any) {
//       console.error('❌ Failed to create post:', error);
//       message.error(error.message || 'เกิดข้อผิดพลาดในการสร้างโพสต์');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     form.resetFields();
//     setFileList([]);
//     setAttachments([]);
//     onClose();
//   };

//   return (
//     <Modal
//       title={
//         <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//           <BulbOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
//           <Title level={3} style={{ margin: 0, display: 'inline-block' }}>
//             📝 สร้างโพสต์หางานใหม่
//           </Title>
//         </div>
//       }
//       open={visible}
//       onCancel={handleCancel}
//       footer={null}
//       width={800}
//       centered
//       destroyOnClose={true}
//     >
//       <Form
//         form={form}
//         layout="vertical"
//         onFinish={handleSubmit}
//         style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}
//       >
//         <Row gutter={16}>
//           <Col span={24}>
//             <Form.Item
//               label={<span><BulbOutlined /> หัวข้อโพสต์</span>}
//               name="title"
//               rules={[{ required: true, message: 'กรุณาใส่หัวข้อโพสต์' }]}
//             >
//               <Input placeholder="เช่น มองหางานพาร์ทไทม์ร้านกาแฟ" />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label={<span><TagOutlined /> ประเภทงาน</span>}
//               name="jobType"
//               rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}
//             >
//               <Select placeholder="เลือกประเภทงาน">
//                 {jobTypes.map(type => (
//                   <Option key={type} value={type}>
//                     {type}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           </Col>

//           <Col span={12}>
//             <Form.Item
//               label={<span><ClockCircleOutlined /> เวลาที่สะดวก</span>}
//               name="availability"
//               rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}
//             >
//               <Input placeholder="เช่น จันทร์-ศุกร์ 9:00-17:00" />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label={<span><EnvironmentOutlined /> สถานที่ที่สะดวก</span>}
//               name="preferredLocation"
//               rules={[{ required: true, message: 'กรุณาระบุสถานที่' }]}
//             >
//               <Input placeholder="เช่น ใกล้มหาวิทยาลัย, Online" />
//             </Form.Item>
//           </Col>

//           <Col span={12}>
//             <Form.Item
//               label={<span><DollarOutlined /> ค่าตอบแทนที่คาดหวัง</span>}
//               name="expectedCompensation"
//             >
//               <Input placeholder="เช่น 15,000-25,000 บาท/เดือน" />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16}>
//           <Col span={24}>
//             {/* ✅ ใช้ SkillSelect แทน Input */}
//             <Form.Item
//               label={<span><TagOutlined /> ทักษะ</span>}
//               name="skills"
//               rules={[{ required: true, message: 'กรุณาระบุทักษะ' }]}
//             >
//               <SkillSelect />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16}>
//           <Col span={24}>
//             <Form.Item
//               label={<span><UserOutlined /> รายละเอียด</span>}
//               name="introduction"
//               rules={[{ required: true, message: 'กรุณาใส่รายละเอียด' }]}
//             >
//               <TextArea
//                 rows={4}
//                 placeholder="แนะนำตัวเอง ประสบการณ์ และสิ่งที่สนใจ"
//               />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16}>
//           <Col span={24}>
//             <Form.Item
//               label={<span><LinkOutlined /> ลิงก์ผลงาน (ถ้ามี)</span>}
//               name="portfolio_url"
//               rules={[{ type: 'url', message: 'กรุณาใส่ URL ที่ถูกต้อง' }]}
//             >
//               <Input placeholder="https://github.com/yourusername" />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16}>
//           <Col span={24}>
//             <Form.Item
//               label={<span><UploadOutlined /> ไฟล์แนบ (Resume, CV, Portfolio)</span>}
//             >
//               <Upload.Dragger {...handleUpload} style={{ width: '100%' }}>
//                 <p className="ant-upload-drag-icon">
//                   <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
//                 </p>
//                 <p className="ant-upload-text">คลิก หรือ ลากไฟล์มาวางที่นี่</p>
//                 <p className="ant-upload-hint">
//                   รองรับ: PDF, DOC, DOCX, JPG, PNG (ไม่เกิน 10MB)
//                   <br />
//                   เช่น Resume, CV, Portfolio, ใบรับรอง
//                 </p>
//               </Upload.Dragger>
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16} style={{ marginTop: '20px' }}>
//           <Col span={12}>
//             <Button block onClick={handleCancel} size="large">
//               ยกเลิก
//             </Button>
//           </Col>
//           <Col span={12}>
//             <Button 
//               type="primary" 
//               htmlType="submit" 
//               block 
//               loading={loading} 
//               size="large"
//             >
//               สร้างโพสต์
//             </Button>
//           </Col>
//         </Row>
//       </Form>
//     </Modal>
//   );
// };

// export default CreateStudentPostModal;
// src/components/CreateStudentPostModal.tsx
// src/components/CreateStudentPostModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, Select, Button, message, Row, Col, Typography, Upload,
} from 'antd';
import {
  BulbOutlined, ClockCircleOutlined, EnvironmentOutlined, DollarOutlined, TagOutlined, LinkOutlined, UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useAuth } from '../context/AuthContext';
// ✨ 1. import `employmentTypeAPI` เพิ่ม
import { studentPostAPI, skillAPI, employmentTypeAPI, UPLOAD_URL } from '../services/https/index';
import type { Skill } from '../interfaces/skill';
import type { CreateStudentPostModalProps, StudentPostAttachment } from "../interfaces/studentpost";
import type { EmploymentType } from '../interfaces/employment_type'; // ✨ 2. Import type เข้ามา

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateStudentPostModal: React.FC<CreateStudentPostModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachments, setAttachments] = useState<StudentPostAttachment[]>([]);
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  
  // ✨ 3. สร้าง State สำหรับเก็บข้อมูลประเภทงาน
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);

  // ❌ ลบ jobTypes ที่ hardcode ไว้ออก
  // const jobTypes = [ ... ];

  useEffect(() => {
    if (visible) {
      const fetchInitialData = async () => {
        try {
          // ✨ 4. เรียก API ทั้งสองส่วนพร้อมกัน
          const [skillsResponse, employmentTypesResponse] = await Promise.all([
            skillAPI.getAllSkills(),
            employmentTypeAPI.getAll()
          ]);
          
          setSkills(skillsResponse.data);
          
          // ตรวจสอบข้อมูลที่ได้จาก employmentTypeAPI
          const empData = employmentTypesResponse?.data?.data || employmentTypesResponse?.data || [];
          setEmploymentTypes(empData);
          
        } catch (error) {
          message.error('ไม่สามารถโหลดข้อมูลเริ่มต้น (Skills, Job Types) ได้');
        }
      };
      fetchInitialData();
    }
  }, [visible]);

  const handleUpload: UploadProps = {
    name: 'file',
    action: UPLOAD_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    method: 'POST',
    onChange: (info) => {
      setFileList([...info.fileList]);
      if (info.file.status === 'done') {
        const response = info.file.response;
        if (response && response.url) {
          const newAttachment: StudentPostAttachment = {
            url: response.url,
            name: info.file.name,
            type: info.file.type || 'application/octet-stream',
          };
          setAttachments(prev => [...prev, newAttachment]);
          message.success(`${info.file.name} อัปโหลดสำเร็จ`);
        } else {
          message.error(`อัปโหลดล้มเหลว: ${response?.error || 'Unknown error'}`);
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} อัปโหลดล้มเหลว`);
      }
    },
    onRemove: (file) => {
      setAttachments(prev => prev.filter(att => att.name !== file.name));
    },
  };

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.error('กรุณาเข้าสู่ระบบก่อนสร้างโพสต์');
      return;
    }
    setLoading(true);
    try {
      const skill_ids: number[] = [];
      const new_skills: string[] = [];

      if (values.skills && Array.isArray(values.skills)) {
        values.skills.forEach((skillValue: string) => {
          const id = Number(skillValue);
          if (!isNaN(id)) {
            skill_ids.push(id);
          } else {
            new_skills.push(skillValue);
          }
        });
      }

      const postData = {
        title: values.title,
        employment_type_id: values.employmentTypeId, // ✨ 5. เปลี่ยน field ที่ส่ง
        availability: values.availability,
        preferred_location: values.preferredLocation,
        expected_compensation: values.expectedCompensation,
        introduction: values.introduction,
        portfolio_url: values.portfolio_url || '',
        skill_ids: skill_ids,
        new_skills: new_skills,
        attachments: attachments,
      };

      await studentPostAPI.createStudentPost(postData);
      message.success('สร้างโพสต์ของคุณสำเร็จแล้ว!');
      form.resetFields();
      setFileList([]);
      setAttachments([]);
      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error.message || 'เกิดข้อผิดพลาดในการสร้างโพสต์';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setAttachments([]);
    onClose();
  };

  return (
    <Modal
      title={<Title level={3} style={{ textAlign: 'center' }}>📝 สร้างโพสต์หางานใหม่</Title>}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={24}><Form.Item label="หัวข้อโพสต์" name="title" rules={[{ required: true, message: 'กรุณาใส่หัวข้อโพสต์' }]}><Input prefix={<BulbOutlined />} placeholder="เช่น มองหางานพาร์ทไทม์ร้านกาแฟ" /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          {/* ✨ 6. แก้ไข ส่วนแสดงผล Dropdown ประเภทงาน */}
          <Col span={12}>
            <Form.Item label="ประเภทงาน" name="employmentTypeId" rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}>
              <Select placeholder="เลือกประเภทงาน" loading={employmentTypes.length === 0}>
                {employmentTypes.map(type => 
                  <Option key={type.id} value={type.id}>
                    {type.employment_type_name}
                  </Option>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}><Form.Item label="เวลาที่สะดวก" name="availability" rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}><Input prefix={<ClockCircleOutlined />} placeholder="เช่น จันทร์-ศุกร์ 9:00-17:00" /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}><Form.Item label="สถานที่ที่สะดวก" name="preferredLocation" rules={[{ required: true, message: 'กรุณาระบุสถานที่' }]}><Input prefix={<EnvironmentOutlined />} placeholder="เช่น ใกล้มหาวิทยาลัย, Online" /></Form.Item></Col>
          <Col span={12}><Form.Item label="ค่าตอบแทนที่คาดหวัง" name="expectedCompensation"><Input prefix={<DollarOutlined />} placeholder="เช่น 15,000-25,000 บาท/เดือน" /></Form.Item></Col>
        </Row>
        <Form.Item label="ทักษะ" name="skills" rules={[{ required: true, message: 'กรุณาระบุหรือเลือกทักษะอย่างน้อย 1 อย่าง' }]}>
          <Select
            mode="tags"
            allowClear
            style={{ width: '100%' }}
            placeholder="เลือกทักษะที่มีอยู่ หรือพิมพ์เพื่อเพิ่มทักษะใหม่"
            loading={skills.length === 0}
            tokenSeparators={[',']}
          >
            {skills.map(skill => (
              <Option key={skill.ID} value={skill.ID.toString()}>
                {skill.skill_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="รายละเอียด" name="introduction" rules={[{ required: true, message: 'กรุณาใส่รายละเอียด' }]}>
            <TextArea rows={4} placeholder="แนะนำตัวเอง ประสบการณ์ และสิ่งที่สนใจ" />
        </Form.Item>
        <Form.Item label="ลิงก์ผลงาน (ถ้ามี)" name="portfolio_url" rules={[{ type: 'url', message: 'กรุณาใส่ URL ที่ถูกต้อง' }]}>
            <Input prefix={<LinkOutlined />} placeholder="https://github.com/yourusername" />
        </Form.Item>
        <Form.Item label="ไฟล์แนบ (Resume, CV, Portfolio)">
          <Upload.Dragger {...handleUpload}>
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">คลิก หรือ ลากไฟล์มาวางที่นี่</p>
            <p className="ant-upload-hint">รองรับ: PDF, DOC, DOCX, JPG, PNG (ไม่เกิน 10MB)</p>
          </Upload.Dragger>
        </Form.Item>
        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={12}><Button block onClick={handleCancel} size="large">ยกเลิก</Button></Col>
          <Col span={12}><Button type="primary" htmlType="submit" block loading={loading} size="large">สร้างโพสต์</Button></Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateStudentPostModal;