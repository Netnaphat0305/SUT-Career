import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Space,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FAQ } from '../../interfaces/helpcenter';
import { qnaAPI } from '../../services/https/index';

const { Title } = Typography;
const { TextArea } = Input;

const ManageFaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form] = Form.useForm();

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await qnaAPI.getFaqs();
      // ✅ แก้ไข: จัดการกับการเข้าถึงข้อมูลให้ปลอดภัยและถูกต้อง
      const faqsData = response?.data?.data || response?.data;
      if (Array.isArray(faqsData)) {
        setFaqs(faqsData);
      } else {
        message.error('Failed to fetch FAQs: Data is not in expected format.');
        setFaqs([]); // ตั้งค่าเป็น Array ว่างเพื่อป้องกัน Error .map
      }
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูล FAQ ได้');
      setFaqs([]); // ตั้งค่าเป็น Array ว่างเมื่อเกิด Error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const showModal = (faq: FAQ | null = null) => {
    setEditingFaq(faq);
    form.setFieldsValue(
      faq || {
        title: '',
        content: '',
      }
    );
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingFaq(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingFaq) {
        // Update
        await qnaAPI.updateFaq(String(editingFaq.ID), values);
        message.success('อัปเดต FAQ สำเร็จ');
      } else {
        // Create
        await qnaAPI.createFaq(values);
        message.success('สร้าง FAQ ใหม่สำเร็จ');
      }
      handleCancel();
      fetchFaqs(); // Refresh data
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await qnaAPI.deleteFaq(String(id));
      message.success('ลบ FAQ สำเร็จ');
      fetchFaqs(); // Refresh data
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const columns: ColumnsType<FAQ> = [
    {
      title: 'หัวข้อ',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'เนื้อหา',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="ยืนยันการลบ?"
            onConfirm={() => handleDelete(record.ID)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>จัดการคำถามที่พบบ่อย (FAQ)</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          เพิ่ม FAQ
        </Button>
      </div>
      <Table columns={columns} dataSource={faqs} rowKey="ID" loading={loading} />

      <Modal
        title={editingFaq ? 'แก้ไข FAQ' : 'สร้าง FAQ ใหม่'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical" name="faq_form">
          <Form.Item
            name="title"
            label="หัวข้อ"
            rules={[{ required: true, message: 'กรุณากรอกหัวข้อ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="เนื้อหา"
            rules={[{ required: true, message: 'กรุณากรอกเนื้อหา' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageFaqPage;
