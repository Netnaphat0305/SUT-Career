
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
