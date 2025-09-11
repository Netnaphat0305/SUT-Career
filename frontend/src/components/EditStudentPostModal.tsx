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
// //import SkillSelect from './SkillSelect';

// const { Title } = Typography;
// const { TextArea } = Input;
// const { Option } = Select;

// interface Attachment {
//   url: string;
//   name: string;
//   type: string;
// }

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

//   // ✅ แก้ไข Upload Props
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
//       // ✅ แก้ไขการส่งข้อมูล skills ให้เป็น array
//       const postData = {
//         title: values.title,
//         job_type: values.jobType,
//         skills: Array.isArray(values.skills) ? values.skills : [values.skills], // ✅ ส่งเป็น array
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
//         <Space>
//           <UserOutlined />
//           <Title level={4} style={{ margin: 0 }}>
//             📝 สร้างโพสต์หางานใหม่
//           </Title>
//         </Space>
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
//         scrollToFirstError
//       >
//         <Row gutter={16}>
//           <Col span={24}>
//             <Form.Item
//               label={<Space><BulbOutlined />หัวข้อโพสต์</Space>}
//               name="title"
//               rules={[{ required: true, message: 'กรุณาใส่หัวข้อโพสต์' }]}
//             >
//               <Input placeholder="เช่น หาคนทำงานพาร์ทไทม์ร้านกาแฟ" />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label={<Space><TagOutlined />ประเภทงาน</Space>}
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
//               label={<Space><ClockCircleOutlined />เวลาที่สะดวก</Space>}
//               name="availability"
//               rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}
//             >
//               <Input placeholder="เช่น จ-ศ 09:00-17:00" />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label={<Space><EnvironmentOutlined />สถานที่ที่สะดวก</Space>}
//               name="preferredLocation"
//               rules={[{ required: true, message: 'กรุณาระบุสถานที่' }]}
//             >
//               <Input placeholder="เช่น ใกล้ มทส. หรือ ออนไลน์" />
//             </Form.Item>
//           </Col>

//           <Col span={12}>
//             <Form.Item
//               label={<Space><DollarOutlined />ค่าตอบแทนที่คาดหวัง</Space>}
//               name="expectedCompensation"
//             >
//               <Input placeholder="เช่น 150 บาท/ชั่วโมง" />
//             </Form.Item>
//           </Col>
//         </Row>

//         {/* ✅ ใช้ SkillSelect แทน Input */}
//         <Form.Item
//           label={<Space><TagOutlined />ทักษะ</Space>}
//           name="skills"
//           rules={[{ required: true, message: 'กรุณาระบุทักษะ' }]}
//         >
//           <SkillSelect />
//         </Form.Item>

//         <Form.Item
//           label={<Space><UserOutlined />รายละเอียด</Space>}
//           name="introduction"
//           rules={[{ required: true, message: 'กรุณาใส่รายละเอียด' }]}
//         >
//           <TextArea
//             rows={4}
//             placeholder="แนะนำตัว, ประสบการณ์, และรายละเอียดที่สำคัญอื่นๆ"
//           />
//         </Form.Item>

//         <Form.Item
//           label={<Space><LinkOutlined />ลิงก์ผลงาน (ถ้ามี)</Space>}
//           name="portfolio_url"
//           rules={[{ type: 'url', message: 'กรุณาใส่ URL ที่ถูกต้อง' }]}
//         >
//           <Input placeholder="https://portfolio.example.com" />
//         </Form.Item>

//         <Form.Item
//           label={<Space><UploadOutlined />ไฟล์แนบ (Resume, CV, Portfolio)</Space>}
//         >
//           <Upload
//             {...handleUpload}
//             fileList={fileList}
//             listType="text"
//           >
//             <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
//               คลิก หรือ ลากไฟล์มาวางที่นี่
//             </Button>
//             <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
//               รองรับ: PDF, DOC, DOCX, JPG, PNG (ไม่เกิน 10MB)
//             </div>
//             <div style={{ fontSize: '12px', color: '#999' }}>
//               เช่น Resume, CV, Portfolio, ใบรับรอง
//             </div>
//           </Upload>
//         </Form.Item>

//         <Row>
//           <Col span={24} style={{ textAlign: 'right' }}>
//             <Space>
//               <Button onClick={handleCancel}>
//                 ยกเลิก
//               </Button>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 loading={loading}
//                 icon={<UserOutlined />}
//               >
//                 สร้างโพสต์
//               </Button>
//             </Space>
//           </Col>
//         </Row>
//       </Form>
//     </Modal>
//   );
// };
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Row, Col, Typography, Upload } from 'antd';
import { BulbOutlined, ClockCircleOutlined, EnvironmentOutlined, DollarOutlined, TagOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { studentPostAPI, skillAPI, employmentTypeAPI, UPLOAD_URL } from '../services/https/index.tsx';
import type { Skill } from '../interfaces/skill';
import type { EmploymentType } from '../interfaces/employment_type';
import type { EditStudentPostModalProps, StudentPostAttachment } from "../interfaces/studentpost";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditStudentPostModal: React.FC<EditStudentPostModalProps> = ({ visible, onClose, onSuccess, post }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachments, setAttachments] = useState<StudentPostAttachment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);

  useEffect(() => {
    if (visible) {
      const fetchInitialData = async () => {
        try {
          const skillsResponse = await skillAPI.getAllSkills();
          setSkills(skillsResponse.data || []);

          const employmentTypesResponse = await employmentTypeAPI.getAll();
          const typesData = employmentTypesResponse?.data?.data || employmentTypesResponse?.data || [];
          if (Array.isArray(typesData)) {
            setEmploymentTypes(typesData);
          } else {
            message.error('โครงสร้างข้อมูลประเภทงานไม่ถูกต้อง');
          }
        } catch (error) {
          message.error('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
        }
      };
      fetchInitialData();

      if (post) {
        form.setFieldsValue({
          title: post.title,
          employment_type_id: post.employment_type?.ID,
          availability: post.availability,
          preferredLocation: post.preferred_location,
          expectedCompensation: post.expected_compensation,
          introduction: post.introduction,
          portfolio_url: post.portfolio_url,
          skills: post.skills ? post.skills.map(skill => skill.ID.toString()) : [],
        });

        const existingAttachments = post.attachments?.map((att, index) => ({
          uid: `${-index}`,
          name: att.name,
          status: 'done' as const,
          url: att.url,
        })) || [];

        setFileList(existingAttachments);
        setAttachments(post.attachments || []);
      }
    } else {
      form.resetFields();
      setFileList([]);
      setAttachments([]);
    }
  }, [visible, post, form]);
  
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
          const newAttachment: StudentPostAttachment = { url: response.url, name: info.file.name, type: info.file.type || '' };
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
      if(file.url) {
        setAttachments(prev => prev.filter(att => att.url !== file.url));
      } else {
        setAttachments(prev => prev.filter(att => att.name !== file.name));
      }
    },
  };

  const handleSubmit = async (values: any) => {
    if (!post) return;

    setLoading(true);
    try {
      const skill_ids: number[] = [];
      const new_skills: string[] = [];
      if (values.skills && Array.isArray(values.skills)) {
        values.skills.forEach((skillValue: string) => {
          const id = Number(skillValue);
          if (!isNaN(id)) skill_ids.push(id);
          else new_skills.push(skillValue);
        });
      }

      const postData = {
        title: values.title,
        employment_type_id: values.employment_type_id,
        availability: values.availability,
        preferred_location: values.preferredLocation,
        expected_compensation: values.expectedCompensation,
        introduction: values.introduction,
        portfolio_url: values.portfolio_url || '',
        skill_ids,
        new_skills,
        attachments,
      };
      
      await studentPostAPI.updateStudentPost(post.ID, postData);
      message.success('แก้ไขโพสต์สำเร็จแล้ว!');
      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error.message || 'เกิดข้อผิดพลาดในการแก้ไขโพสต์';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={3} style={{ textAlign: 'center' }}>✏️ แก้ไขโพสต์หางาน</Title>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnClose={true}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '16px' }}
      >
        <Row gutter={16}>
          <Col span={24}><Form.Item label="หัวข้อโพสต์" name="title" rules={[{ required: true, message: 'กรุณาใส่หัวข้อโพสต์' }]}><Input prefix={<BulbOutlined />} /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="ประเภทงาน" name="employment_type_id" rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}>
              <Select placeholder="เลือกประเภทงาน" loading={employmentTypes.length === 0}>
                {employmentTypes.map(type => <Option key={type.ID} value={type.ID}>{type.employment_type_name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}><Form.Item label="เวลาที่สะดวก" name="availability" rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}><Input prefix={<ClockCircleOutlined />} /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}><Form.Item label="สถานที่ที่สะดวก" name="preferredLocation" rules={[{ required: true, message: 'กรุณาระบุสถานที่' }]}><Input prefix={<EnvironmentOutlined />} /></Form.Item></Col>
          <Col span={12}><Form.Item label="ค่าตอบแทนที่คาดหวัง" name="expectedCompensation"><Input prefix={<DollarOutlined />} /></Form.Item></Col>
        </Row>
        <Form.Item label="ทักษะ" name="skills" rules={[{ required: true, message: 'กรุณาระบุหรือเลือกทักษะอย่างน้อย 1 อย่าง' }]}>
          <Select mode="tags" allowClear style={{ width: '100%' }} placeholder="เลือกหรือเพิ่มทักษะใหม่" loading={skills.length === 0} tokenSeparators={[',']}>
            {skills.map(skill => <Option key={skill.ID} value={skill.ID.toString()}>{skill.skill_name}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item label="รายละเอียด" name="introduction" rules={[{ required: true, message: 'กรุณาใส่รายละเอียด' }]}>
            <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="ลิงก์ผลงาน (ถ้ามี)" name="portfolio_url" rules={[{ type: 'url', message: 'กรุณาใส่ URL ที่ถูกต้อง' }]}>
            <Input prefix={<LinkOutlined />} />
        </Form.Item>
        <Form.Item label="ไฟล์แนบ (Resume, CV, Portfolio)">
          <Upload.Dragger {...handleUpload} fileList={fileList}>
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p>คลิก หรือ ลากไฟล์มาวางที่นี่</p>
          </Upload.Dragger>
        </Form.Item>
        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={12}><Button block onClick={onClose} size="large">ยกเลิก</Button></Col>
          <Col span={12}><Button type="primary" htmlType="submit" block loading={loading} size="large">บันทึกการเปลี่ยนแปลง</Button></Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditStudentPostModal;
