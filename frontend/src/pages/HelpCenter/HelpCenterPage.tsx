import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Input,
  Typography,
  Button,
  Tabs,
  Tag,
  message,
  Spin,
  Collapse,
  Modal,
  Descriptions,
  Card,
  Divider,
  Alert,
  Space,
  Table,
  Badge,
  Image, // เพิ่ม Image
  Upload, 
} from 'antd';
import type { CollapseProps, TabsProps, TableColumnsType, UploadProps, UploadFile } from 'antd'; 
import {
  QuestionCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  PlusOutlined,
  MinusOutlined,
  EyeOutlined,
  FileSearchOutlined,
  PaperClipOutlined,
  UploadOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import type { FAQ, RequestTicket, TicketAttachment } from '../../interfaces/helpcenter';
import { qnaAPI } from '../../services/https/index';
import './HelpCenterPage.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const AttachmentDisplay: React.FC<{ attachments?: TicketAttachment[] }> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
      <Text strong><PaperClipOutlined /> ไฟล์แนบ:</Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
        <Image.PreviewGroup>
          {attachments.map(att => (
            att.type.startsWith('image/') ? (
              <Image key={att.ID} width={80} height={80} src={att.url} alt={att.name} style={{ objectFit: 'cover', borderRadius: '4px' }}/>
            ) : (
              <Button key={att.ID} href={att.url} target="_blank" icon={<PaperClipOutlined />}>
                {att.name}
              </Button>
            )
          ))}
        </Image.PreviewGroup>
      </div>
    </div>
  );
};


const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // States
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [myRequests, setMyRequests] = useState<RequestTicket[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<RequestTicket | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  
  const [replyFileList, setReplyFileList] = useState<UploadFile[]>([]);
  const [replyAttachments, setReplyAttachments] = useState<Omit<TicketAttachment, 'ID'>[]>([]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
      if (tabFromUrl === '2') {
        setTimeout(() => {
          fetchMyRequests();
        }, 500);
      }
    }
  }, [searchParams]);

  const fetchFaqs = async () => {
    setLoadingFaqs(true);
    try {
      const response = await qnaAPI.getFaqs();
      const potentialArray = response?.data;
      const faqsData = (potentialArray as any)?.data || potentialArray;

      if (Array.isArray(faqsData)) {
        setFaqs(faqsData);
      } else {
        setFaqs([]);
        message.error('โครงสร้างข้อมูล FAQ ที่ได้รับไม่ถูกต้อง');
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
      message.error('ไม่สามารถดึงข้อมูล FAQ ได้');
      setFaqs([]); 
    } finally {
      setLoadingFaqs(false);
    }
  };
  

  useEffect(() => {
    fetchFaqs();
  }, []);

  // ✨ START: เพิ่ม useEffect สำหรับ Polling ฝั่งผู้ใช้งาน
  useEffect(() => {
    // ทำงานเมื่อ Modal เปิด และมี Ticket ที่เลือกไว้
    if (isModalVisible && selectedTicket) {
      const intervalId = setInterval(async () => {
        console.log(`Polling for user updates on ticket #${selectedTicket.ID}...`);
        try {
          const response = await qnaAPI.getTicketById(String(selectedTicket.ID));
          const updatedTicketData = response?.data?.data || response?.data;
          
          if (updatedTicketData) {
            // อัปเดต state เพื่อให้ข้อมูลใน Modal เป็นข้อมูลล่าสุด
            setSelectedTicket(updatedTicketData);
          }
        } catch (error) {
          console.error("Polling for user ticket updates failed:", error);
        }
      }, 5000); // ดึงข้อมูลใหม่ทุก 5 วินาที

      // Cleanup: หยุดการดึงข้อมูลเมื่อ Modal ปิด
      return () => {
        console.log(`Stopping user polling for ticket #${selectedTicket.ID}.`);
        clearInterval(intervalId);
      };
    }
  }, [isModalVisible, selectedTicket]);
  // ✨ END: เพิ่ม useEffect สำหรับ Polling

  const filteredFaqs = useMemo(() => {
    if (!searchTerm) {
      return Array.isArray(faqs) ? faqs : [];
    }
    return Array.isArray(faqs) ? faqs.filter(faq =>
      faq.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.content?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
  }, [searchTerm, faqs]);

  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await qnaAPI.getMyTickets();
      const data: RequestTicket[] = response?.data?.data || response?.data || [];
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) => 
          new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );
        setMyRequests(sortedData);
        if (searchParams.get('tab') === '2' && sortedData.length > 0) {
          message.success(`พบคำร้องของคุณ ${sortedData.length} รายการ`);
        }
      } else {
        throw new Error('User requests data is not an array');
      }
    } catch (error) {
      console.error(error);
      message.error("ไม่สามารถดึงข้อมูลคำร้องของคุณได้");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleTabClick = (key: string) => {
    setActiveTab(key);
    if (key === '2') {
      fetchMyRequests();
    }
  };

  const getStatusColor = (status: RequestTicket['status']) => {
    switch (status) {
      case 'Open': return 'orange';
      case 'In Progress': return 'processing';
      case 'Awaiting Confirmation': return 'blue';
      case 'Resolved': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: RequestTicket['status']) => {
    switch (status) {
      case 'Open': return 'รอการตอบกลับ';
      case 'In Progress': return 'กำลังดำเนินการ';
      case 'Awaiting Confirmation': return 'รอยืนยัน';
      case 'Resolved': return 'แก้ไขแล้ว';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const handleRequestClick = async (request: RequestTicket) => {
    setLoadingModal(true);
    setIsModalVisible(true);
    try {
      const response = await qnaAPI.getTicketById(String(request.ID));
      const ticketData = response?.data?.data || response?.data || null;
      if (ticketData) {
        setSelectedTicket(ticketData);
      } else {
        throw new Error('Failed to fetch ticket details');
      }
    } catch (error) {
      message.error("ไม่สามารถโหลดรายละเอียดคำร้องได้");
      setIsModalVisible(false);
    } finally {
      setLoadingModal(false);
    }
  };
  

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setSelectedTicket(null);
    setReplyMessage('');
    setReplyFileList([]);
    setReplyAttachments([]);
  };

  const handleSendReply = async () => {
    if ((!replyMessage || !replyMessage.trim()) && replyAttachments.length === 0) {
      message.error('กรุณาพิมพ์ข้อความหรือแนบไฟล์');
      return;
    }
    if (!selectedTicket) return;

    try {
      const response = await qnaAPI.createTicketReply(String(selectedTicket.ID), {
        message: replyMessage,
        is_staff_reply: false,
        attachments: replyAttachments,
      });

      if (response && response.status >= 200 && response.status < 300) {
        message.success(`ส่งข้อความตอบกลับสำเร็จ!`);
        setReplyMessage('');
        setReplyFileList([]);
        setReplyAttachments([]);

        // ดึงข้อมูลล่าสุดมาแสดงทันที
        const updatedTicketResponse = await qnaAPI.getTicketById(String(selectedTicket.ID));
        if (updatedTicketResponse && updatedTicketResponse.data) {
          const updatedTicketData = updatedTicketResponse?.data?.data || updatedTicketResponse?.data || null;
          setSelectedTicket(updatedTicketData);
        }
      } else {
        throw new Error(response?.data?.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      message.error('เกิดข้อผิดพลาดในการส่งข้อความตอบกลับ');
    }
  };

  const handleUpdateStatus = async (status: RequestTicket['status']) => {
    if (!selectedTicket) return;
    try {
      const response = await qnaAPI.updateTicketStatus(String(selectedTicket.ID), status);
      
      if (response && response.status >= 200 && response.status < 300) {
        message.success(`อัปเดตสถานะคำร้องสำเร็จ`);
        fetchMyRequests();
        const updatedTicketData = response?.data?.data || response?.data || null;
        setSelectedTicket(updatedTicketData);
        if (status === 'Resolved') {
          setIsModalVisible(false);
        }
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const replyUploadProps: UploadProps = {
    name: 'file',
    action: 'http://localhost:8080/api/upload',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    fileList: replyFileList,
    onChange(info) {
      setReplyFileList(info.fileList);
      if (info.file.status === 'done') {
        message.success(`${info.file.name} อัปโหลดสำเร็จ`);
        const response = info.file.response;
        if (response && response.url) {
          const newAttachment: Omit<TicketAttachment, 'ID'> = {
            url: response.url,
            name: info.file.name,
            type: info.file.type || 'application/octet-stream',
          };
          setReplyAttachments(prev => [...prev, newAttachment]);
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} อัปโหลดไม่สำเร็จ`);
      }
    },
    onRemove(file) {
      const newAttachments = replyAttachments.filter(att => att.name !== file.name);
      setReplyAttachments(newAttachments);
    }
  };

  const formatTime = (ts?: string) => ts ? new Date(ts).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '';
  const formatDate = (ts?: string) => ts ? new Date(ts).toLocaleString('th-TH', { dateStyle: 'medium' }) : '';

  const faqItems: CollapseProps['items'] = filteredFaqs.map(q => ({
    key: q.ID,
    label: <Text strong>{q.title}</Text>,
    children: (
        <div>
            {q.image_url && (
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Image 
                        width={250} 
                        src={q.image_url} 
                        alt={q.title} 
                        style={{ borderRadius: 8 }}
                    />
                </div>
            )}
            <Text>{q.content || 'ยังไม่มีคำตอบ'}</Text>
            {q.comments_enabled && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                    <Button
                        icon={<CommentOutlined />}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent collapse from toggling
                            navigate(`/help/faq/${q.ID}`);
                        }}
                    >
                        ดูความคิดเห็น ({q.comment_count || 0})
                    </Button>
                </div>
            )}
        </div>
    ),
  }));

  const requestColumns: TableColumnsType<RequestTicket> = [
    {
      title: 'คำร้องที่',
      dataIndex: 'ID',
      key: 'id',
      width: 100,
      align: 'center',
      render: (id) => <Text strong>#{String(id).padStart(4, '0')}</Text>,
    },
    {
      title: 'วันที่',
      dataIndex: 'CreatedAt',
      key: 'date',
      width: 140,
      render: (date) => <Text>{formatDate(date)}</Text>,
    },
    {
      title: 'หัวข้อ',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      render: (subject, record) => (
        <div>
          <Text strong>{subject}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.initial_message?.substring(0, 80)}
            {(record.initial_message?.length || 0) > 80 ? '...' : ''}
          </Text>
        </div>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleRequestClick(record)}
          style={{ borderRadius: '8px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          ตรวจสอบ
        </Button>
      ),
    },
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: <Space><QuestionCircleOutlined />คำถามที่พบบ่อย</Space>,
      children: loadingFaqs ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
      ) : filteredFaqs.length > 0 ? (
        <Collapse items={faqItems} expandIcon={({ isActive }) => isActive ? <MinusOutlined /> : <PlusOutlined />} />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">{searchTerm ? 'ไม่พบคำถามที่ตรงกับคำค้นหาของคุณ' : 'ยังไม่มีคำถามที่พบบ่อย'}</Text>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <Space>
          <FileTextOutlined />
          คำร้องของฉัน
          {myRequests.length > 0 && <Badge count={myRequests.length} size="small" />}
        </Space>
      ),
      children: loadingRequests ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
      ) : myRequests.length > 0 ? (
        <Table
          columns={requestColumns}
          dataSource={myRequests}
          rowKey="ID"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} คำร้อง`, pageSizeOptions: ['5', '10', '20', '50'] }}
          scroll={{ x: 800 }}
          style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}
          className="custom-request-table"
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FileSearchOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <Title level={4} type="secondary">คุณยังไม่มีคำร้องที่เคยส่ง</Title>
          <Paragraph type="secondary">เมื่อคุณส่งคำร้องขอความช่วยเหลือ จะแสดงรายการที่นี่</Paragraph>
          <Button type="primary" icon={<SendOutlined />} onClick={() => navigate('/help/ask')} style={{ borderRadius: '8px', height: '44px', fontSize: '15px', fontWeight: '500' }}>
            ส่งคำร้องแรกของคุณ
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="new-request-button-container">
        <Button
          type="primary"
          icon={<SendOutlined />}
          size="large"
          onClick={() => navigate('/help/request')}
          style={{ borderRadius: '12px', height: '48px', fontSize: '15px', fontWeight: '500', boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)' }}
        >
          ส่งคำร้องใหม่
        </Button>
      </div>

      <div className="help-center-container">
        <div className="help-center-header">
          <Title level={1} style={{ color: '#1d39c4', marginBottom: '16px' }}>🔍 ศูนย์ช่วยเหลือ SUT Career</Title>
          <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: 0 }}>
            เราพร้อมช่วยเหลือคุณเสมอ! ค้นหาคำตอบจากคำถามที่พบบ่อย หรือส่งคำร้องหาเราโดยตรง
          </Paragraph>
        </div>

        <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Title level={4} style={{ marginBottom: '16px' }}>🔍 ค้นหาคำตอบที่คุณต้องการ</Title>
            <Input.Search
              placeholder="ค้นหาคำถาม FAQ..."
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              style={{ fontSize: '15px' }}
            />
            {searchTerm && (
              <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#f0f5ff', borderRadius: '8px' }}>
                <Text type="secondary">ค้นหา: "{searchTerm}"</Text>
                <Divider type="vertical" />
                <Text type="secondary">พบ {filteredFaqs.length} ผลลัพธ์</Text>
              </div>
            )}
          </div>
          <Tabs activeKey={activeTab} onTabClick={handleTabClick} items={tabItems} style={{ minHeight: '400px' }} />
        </Card>
      </div>

      <Modal title="รายละเอียดคำร้อง" open={isModalVisible} onCancel={handleCancelModal} footer={null} width={700} centered>
        {loadingModal || !selectedTicket ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
        ) : (
          <>
            {selectedTicket.status === 'Awaiting Confirmation' && (
              <Alert
                message="คำร้องนี้รอการยืนยันจากคุณ"
                description={<Space><Button size="small" onClick={() => handleUpdateStatus('Resolved')}>ปิดคำร้อง</Button><Button size="small" onClick={() => handleUpdateStatus('In Progress')}>ยังต้องการความช่วยเหลือ</Button></Space>}
                type="info"
                style={{ marginBottom: '16px' }}
              />
            )}
            <Descriptions bordered size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="หัวข้อ" span={3}><Text strong>{selectedTicket.subject}</Text></Descriptions.Item>
              <Descriptions.Item label="ผู้ส่ง">{selectedTicket.user?.username || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="สถานะ"><Tag color={getStatusColor(selectedTicket.status)}>{getStatusText(selectedTicket.status)}</Tag></Descriptions.Item>
              <Descriptions.Item label="วันที่ส่ง">{formatTime(selectedTicket.CreatedAt)}</Descriptions.Item>
            </Descriptions>
            <Title level={5}>ข้อความเริ่มต้น</Title>
            <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#fafafa' }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong>{selectedTicket.user?.username || 'Unknown'}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>{formatTime(selectedTicket.CreatedAt)}</Text>
                <Text>{selectedTicket.initial_message}</Text>
                <AttachmentDisplay attachments={selectedTicket.attachments} />
              </Space>
            </Card>
            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
              <>
                <Divider />
                <Title level={5}>ประวัติการสนทนา</Title>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {(selectedTicket.replies || []).map((reply, index) => (
                    <Card key={index} size="small" style={{ marginBottom: '8px', background: reply.is_staff_reply ? '#e6f7ff' : '#fff' }}>
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Space>
                          <Text strong>{reply.author?.username || 'Unknown'}</Text>
                          {reply.is_staff_reply && <Tag color="blue" >เจ้าหน้าที่</Tag>}
                          <Text type="secondary" style={{ fontSize: '12px', marginLeft: 'auto' }}>{formatTime(reply.CreatedAt)}</Text>
                        </Space>
                        <Text>{reply.message}</Text>
                        <AttachmentDisplay attachments={reply.attachments} />
                      </Space>
                    </Card>
                  ))}
                </div>
              </>
            )}
            {(selectedTicket.status === 'Open' || selectedTicket.status === 'In Progress') ? (
              <>
                <Divider />
                <Title level={5}>ตอบกลับ</Title>
                <TextArea rows={3} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="พิมพ์ข้อความตอบกลับของคุณ..." style={{ marginBottom: '12px' }} />
                
                <Upload {...replyUploadProps} >
                  <Button icon={<UploadOutlined />}>แนบไฟล์</Button>
                </Upload>
                
                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                  <Button type="primary" icon={<SendOutlined />} onClick={handleSendReply} disabled={!replyMessage.trim() && replyAttachments.length === 0}>ส่งข้อความ</Button>
                </div>
              </>
            ) : (
              <Alert message={`คำร้องนี้ได้ ${getStatusText(selectedTicket.status)} แล้ว`} type="info" style={{ marginTop: '16px' }} />
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default HelpCenterPage;
