
import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, Select, Button, message, Row, Col, Typography, Upload,
} from 'antd';
import {
  BulbOutlined, ClockCircleOutlined, EnvironmentOutlined, DollarOutlined, TagOutlined, LinkOutlined, UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useAuth } from '../context/AuthContext';
// ✅ 1. Import service เพิ่มเติมสำหรับ EmploymentType
import { studentPostAPI, skillAPI, employmentTypeAPI, UPLOAD_URL } from '../services/https/index';
import type { Skill } from '../interfaces/skill';
import type { EmploymentType } from '../interfaces/employment_type'; // ✅ Import interface
import type { CreateStudentPostModalProps, StudentPostAttachment } from "../interfaces/studentpost";

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
  // ✅ 2. สร้าง state สำหรับเก็บข้อมูลประเภทงาน
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);

  useEffect(() => {
    if (visible) {
      const fetchInitialData = async () => {
        try {
          // Fetch Skills
          const skillsResponse = await skillAPI.getAllSkills();
          setSkills(skillsResponse.data);

          // ✅ 3. Fetch Employment Types
          const employmentTypesResponse = await employmentTypeAPI.getAll();
          // ตรวจสอบโครงสร้างข้อมูลที่ได้รับกลับมา
          const typesData = employmentTypesResponse?.data?.data || employmentTypesResponse?.data || [];
          if (Array.isArray(typesData)) {
            setEmploymentTypes(typesData);
          } else {
             message.error('โครงสร้างข้อมูลประเภทงานไม่ถูกต้อง');
          }

        } catch (error) {
          message.error('ไม่สามารถโหลดข้อมูลเริ่มต้น (สกิล/ประเภทงาน) ได้');
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
        // ✅ 4. เปลี่ยน key จาก job_type เป็น employment_type_id และส่งค่าเป็น ID
        employment_type_id: values.employment_type_id,
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
      title={<Title level={3} style={{ textAlign: 'center' }}>  สร้างโพสต์หางานใหม่</Title>}
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
        style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '16px' }}
      >
        <Row gutter={16}>
          <Col span={24}><Form.Item label="หัวข้อโพสต์" name="title" rules={[{ required: true, message: 'กรุณาใส่หัวข้อโพสต์' }]}><Input prefix={<BulbOutlined />} placeholder="เช่น มองหางานพาร์ทไทม์ร้านกาแฟ" /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          {/* ✅ 5. แก้ไขส่วนของ Form สำหรับ EmploymentType */}
          <Col span={12}>
            <Form.Item label="ประเภทงาน" name="employment_type_id" rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}>
              <Select placeholder="เลือกประเภทงาน" loading={employmentTypes.length === 0}>
                {employmentTypes.map(type => (
                  <Option key={type.ID} value={type.ID}>
                    {type.employment_type_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}><Form.Item label="เวลาที่สะดวก" name="availability" rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}><Input prefix={<ClockCircleOutlined />} placeholder="เช่น จันทร์-ศุกร์ 9:00-17:00" /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}><Form.Item label="สถานที่ที่สะดวก" name="preferredLocation" rules={[{ required: true, message: 'กรุณาระบุสถานที่' }]}><Input prefix={<EnvironmentOutlined />} placeholder="เช่น ใกล้มหาวิทยาลัย, Online" /></Form.Item></Col>
          <Col span={12}><Form.Item label="ค่าตอบแทนที่คาดหวัง" name="expectedCompensation"><Input prefix={<DollarOutlined />} placeholder="เช่น ชั่วโมงละ 50 บาท" /></Form.Item></Col>
        </Row>
        <Form.Item label="ทักษะ" name="skills" rules={[{ required: true, message: 'กรุณาระบุหรือเลือกทักษะอย่างน้อย 1 อย่าง' }]}>
          <Select
            mode="tags"
            allowClear
            style={{ width: '100%' }}
            placeholder="เลือกทักษะที่มีอยู่"
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
