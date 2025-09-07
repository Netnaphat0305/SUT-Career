

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
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  Typography,
  Upload,
  Space,
} from 'antd';
import {
  BulbOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TagOutlined,
  LinkOutlined,
  UserOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { createStudentPost } from '../services/studentPostService';
import { useAuth } from '../context/AuthContext';
// import SkillSelect from './SkillSelect'; // This component does not exist, so it's commented out.

// ✅ 1. Import interfaces จากไฟล์ภายนอก
import type { CreateStudentPostModalProps, StudentPostAttachment as Attachment } from "../interfaces/studentpost";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ✅ 2. ลบ interface ที่เคยประกาศไว้ตรงนี้ออก

const CreateStudentPostModal: React.FC<CreateStudentPostModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { user } = useAuth();

  const jobTypes = [
    'งานประจำ',
    'งานพาร์ทไทม์',
    'ฟรีแลนซ์',
    'ฝึกงาน',
    'งานชั่วคราว',
    'งานโครงการ'
  ];

  // Upload Props
  const handleUpload: UploadProps = {
    name: 'file',
    action: 'http://localhost:8080/api/upload',
    method: 'POST',
    withCredentials: false,
    beforeUpload: (file: File) => {
      console.log('🔍 Before upload:', file.name, file.type, file.size);
      const isValidType = [
        'image/',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].some(type => file.type.startsWith(type) || file.type.includes(type));

      if (!isValidType) {
        message.error('รองรับเฉพาะไฟล์ประเภท: รูปภาพ, PDF, DOC, DOCX');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('ขนาดไฟล์ต้องไม่เกิน 10MB');
        return false;
      }

      return true;
    },
    onChange: (info: any) => {
      console.log('📤 Upload info:', info);
      setFileList([...info.fileList]);
      
      if (info.file.status === 'uploading') {
        console.log('⏳ Uploading...');
      }

      if (info.file.status === 'done') {
        const response = info.file.response;
        console.log('✅ Upload response:', response);
        if (response && response.url) {
          const newAttachment: Attachment = {
            url: response.url,
            name: info.file.name,
            type: info.file.type || 'application/octet-stream',
          };
          setAttachments(prev => [...prev, newAttachment]);
          message.success(`${info.file.name} อัปโหลดสำเร็จ`);
        } else {
          message.error('เกิดข้อผิดพลาดในการอัปโหลด: ' + (response?.error || 'Unknown error'));
        }
      } else if (info.file.status === 'error') {
        console.error('❌ Upload error:', info.file.error);
        message.error(`${info.file.name} อัปโหลดล้มเหลว: ${info.file.error?.message || 'Unknown error'}`);
      }
    },
    onRemove: (file: UploadFile) => {
      setAttachments(prev => prev.filter(att => att.name !== file.name));
    },
  };

  useEffect(() => {
    console.log('🔧 Modal mounted');
    console.log('🌐 Backend URL:', 'http://localhost:8080/api/upload');
  }, []);

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.error('กรุณาเข้าสู่ระบบก่อนสร้างโพสต์');
      return;
    }

    setLoading(true);
    try {
      const postData = {
        title: values.title,
        job_type: values.jobType,
        skills: values.skills || [], // ✅ ส่งเป็น array โดยตรง
        availability: values.availability,
        preferred_location: values.preferredLocation,
        expected_compensation: values.expectedCompensation,
        introduction: values.introduction,
        portfolio_url: values.portfolio_url || '',
        // ✅ เพิ่มข้อมูลไฟล์แนบ
        attachment_url: attachments.length > 0 ? attachments[0].url : '',
        attachment_name: attachments.length > 0 ? attachments[0].name : '',
        attachment_type: attachments.length > 0 ? attachments[0].type : '',
      };

      console.log('📝 Creating post with data:', postData);
      await createStudentPost(postData);
      message.success('สร้างโพสต์ของคุณสำเร็จแล้ว!');
      form.resetFields();
      setFileList([]);
      setAttachments([]);
      onSuccess();
    } catch (error: any) {
      console.error('❌ Failed to create post:', error);
      message.error(error.message || 'เกิดข้อผิดพลาดในการสร้างโพสต์');
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
      title={
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <BulbOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
          <Title level={3} style={{ margin: 0, display: 'inline-block' }}>
            📝 สร้างโพสต์หางานใหม่
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={<span><BulbOutlined /> หัวข้อโพสต์</span>}
              name="title"
              rules={[{ required: true, message: 'กรุณาใส่หัวข้อโพสต์' }]}
            >
              <Input placeholder="เช่น มองหางานพาร์ทไทม์ร้านกาแฟ" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span><TagOutlined /> ประเภทงาน</span>}
              name="jobType"
              rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}
            >
              <Select placeholder="เลือกประเภทงาน">
                {jobTypes.map(type => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span><ClockCircleOutlined /> เวลาที่สะดวก</span>}
              name="availability"
              rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}
            >
              <Input placeholder="เช่น จันทร์-ศุกร์ 9:00-17:00" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span><EnvironmentOutlined /> สถานที่ที่สะดวก</span>}
              name="preferredLocation"
              rules={[{ required: true, message: 'กรุณาระบุสถานที่' }]}
            >
              <Input placeholder="เช่น ใกล้มหาวิทยาลัย, Online" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span><DollarOutlined /> ค่าตอบแทนที่คาดหวัง</span>}
              name="expectedCompensation"
            >
              <Input placeholder="เช่น 15,000-25,000 บาท/เดือน" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={<span><TagOutlined /> ทักษะ</span>}
              name="skills"
              rules={[{ required: true, message: 'กรุณาระบุทักษะ' }]}
            >
              {/* <SkillSelect /> */}
              <Input placeholder="e.g., React, Node.js, Figma" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={<span><UserOutlined /> รายละเอียด</span>}
              name="introduction"
              rules={[{ required: true, message: 'กรุณาใส่รายละเอียด' }]}
            >
              <TextArea
                rows={4}
                placeholder="แนะนำตัวเอง ประสบการณ์ และสิ่งที่สนใจ"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={<span><LinkOutlined /> ลิงก์ผลงาน (ถ้ามี)</span>}
              name="portfolio_url"
              rules={[{ type: 'url', message: 'กรุณาใส่ URL ที่ถูกต้อง' }]}
            >
              <Input placeholder="https://github.com/yourusername" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={<span><UploadOutlined /> ไฟล์แนบ (Resume, CV, Portfolio)</span>}
            >
              <Upload.Dragger {...handleUpload} style={{ width: '100%' }}>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">คลิก หรือ ลากไฟล์มาวางที่นี่</p>
                <p className="ant-upload-hint">
                  รองรับ: PDF, DOC, DOCX, JPG, PNG (ไม่เกิน 10MB)
                  <br />
                  เช่น Resume, CV, Portfolio, ใบรับรอง
                </p>
              </Upload.Dragger>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={12}>
            <Button block onClick={handleCancel} size="large">
              ยกเลิก
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading} 
              size="large"
            >
              สร้างโพสต์
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateStudentPostModal;