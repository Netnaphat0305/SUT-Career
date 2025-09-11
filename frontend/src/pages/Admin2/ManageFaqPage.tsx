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
  Switch,
  Tag,
  Upload,
  Image, // เพิ่มการ import Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FAQ } from '../../interfaces/helpcenter';
import { qnaAPI, UPLOAD_URL } from '../../services/https/index';
import type { UploadFile, UploadProps } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ManageFaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await qnaAPI.getFaqs();
      const faqsData = response?.data?.data || response?.data;
      if (Array.isArray(faqsData)) {
        setFaqs(faqsData);
      } else {
        message.error('Failed to fetch FAQs: Data is not in expected format.');
        setFaqs([]);
      }
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูล FAQ ได้');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const showModal = (faq: FAQ | null = null) => {
    setEditingFaq(faq);
    if (faq) {
      form.setFieldsValue({
        title: faq.title || '',
        content: faq.content || '',
        image_url: faq.image_url || null,
        comments_enabled: faq.comments_enabled || false,
      });
      if (faq.image_url) {
        setFileList([
          {
            uid: '-1',
            name: faq.image_url.split('/').pop() || 'image.png',
            status: 'done',
            url: faq.image_url,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingFaq(null);
    form.resetFields();
    setFileList([]);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        content: values.content,
        image_url: values.image_url || null,
        comments_enabled: values.comments_enabled || false,
      };
      if (editingFaq) {
        await qnaAPI.updateFaq(String(editingFaq.ID), payload);
        message.success('อัปเดต FAQ สำเร็จ');
      } else {
        await qnaAPI.createFaq(payload);
        message.success('สร้าง FAQ ใหม่สำเร็จ');
      }
      handleCancel();
      fetchFaqs();
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await qnaAPI.deleteFaq(String(id));
      message.success('ลบ FAQ สำเร็จ');
      fetchFaqs();
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: UPLOAD_URL,
    listType: 'picture-card',
    fileList: fileList,
    maxCount: 1,
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange(info) {
        setFileList(info.fileList);
        if (info.file.status === 'done') {
            message.success(`${info.file.name} อัปโหลดไฟล์สำเร็จ`);
            form.setFieldsValue({ image_url: info.file.response.url });
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} อัปโหลดไฟล์ไม่สำเร็จ`);
        }
    },
    onRemove() {
        form.setFieldsValue({ image_url: null });
        setFileList([]);
        return true;
    },
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
      title: 'รูปภาพ',
      dataIndex: 'image_url',
      key: 'image',
      width: 120,
      align: 'center',
      render: (url: string) => {
        if (url) {
          return <Image width={80} src={url} style={{ borderRadius: '4px' }} />;
        }
        return <Text type="secondary">ไม่มีรูปภาพ</Text>;
      },
    },
    {
      title: 'เปิดคอมเมนต์',
      dataIndex: 'comments_enabled',
      key: 'comments_enabled',
      width: 150,
      render: (enabled: boolean) => <Tag color={enabled ? 'green' : 'red'}>{enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</Tag>,
       filters: [
        { text: 'เปิดใช้งาน', value: true },
        { text: 'ปิดใช้งาน', value: false },
      ],
      onFilter: (value, record) => record.comments_enabled === value,
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
          <Form.Item
            name="image_url"
            label="รูปภาพประกอบ"
          >
            <Upload {...uploadProps}>
                <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>อัปโหลด</div>
                </div>
            </Upload>
          </Form.Item>
           <Form.Item
            name="comments_enabled"
            label="เปิดใช้งานความคิดเห็น"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageFaqPage;

