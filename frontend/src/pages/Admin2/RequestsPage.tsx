// src/pages/Admin2/RequestsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Button, Typography, Space, Modal, message, Descriptions, Input, Avatar, Card, Divider, Select, Upload, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps, UploadFile } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { EyeOutlined, UserOutlined, CheckCircleOutlined, SendOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import type { RequestTicket, TicketAttachment } from '../../interfaces/helpcenter';
import { qnaAPI, UPLOAD_URL } from '../../services/https/index';
import '../Admin2/RequestsPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

const RequestsPage: React.FC = () => {
    const [tickets, setTickets] = useState<RequestTicket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<RequestTicket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replyFileList, setReplyFileList] = useState<UploadFile[]>([]);
    const [replyAttachments, setReplyAttachments] = useState<Omit<TicketAttachment, 'ID'>[]>([]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await qnaAPI.getAllTicketsForAdmin();
            if (response && response.data) {
                // ✅ แก้ไข: จัดการกับการเข้าถึงข้อมูลให้ปลอดภัยและถูกต้อง
                const data: RequestTicket[] = response.data.data || response.data;
                if (Array.isArray(data)) {
                    const sortedData = data.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
                    setTickets(sortedData);
                } else {
                    throw new Error('Fetched data is not an array');
                }
            } else {
                 throw new Error('Failed to fetch tickets');
            }
        } catch (error) {
            console.error(error);
            message.error('ไม่สามารถดึงข้อมูลคำร้องได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // ✨ START: เพิ่ม useEffect สำหรับ Polling เมื่อ Modal เปิด
    // ส่วนนี้จะทำงานเมื่อ Modal แสดง และมี Ticket ที่ถูกเลือก
    useEffect(() => {
        if (isModalVisible && selectedTicket) {
            // ตั้งค่าให้ดึงข้อมูลใหม่ทุกๆ 5 วินาที
            const intervalId = setInterval(async () => {
                console.log(`Polling for updates on ticket #${selectedTicket.ID}...`);
                try {
                    // ดึงข้อมูลล่าสุดของ Ticket ที่เปิดอยู่
                    const response = await qnaAPI.getTicketById(String(selectedTicket.ID));
                    const updatedTicketData = response?.data?.data || response?.data;
                    
                    if (updatedTicketData) {
                        // อัปเดต state เพื่อ re-render หน้าแชทให้เป็นข้อมูลล่าสุด
                        setSelectedTicket(updatedTicketData);
                    }
                } catch (error) {
                    // ไม่ต้องแสดง message.error ทุกครั้งที่ polling ล้มเหลว อาจจะรบกวนผู้ใช้
                    console.error("Polling for ticket updates failed:", error);
                }
            }, 5000); // ดึงข้อมูลใหม่ทุกๆ 5 วินาที

            // Cleanup function: จะถูกเรียกเมื่อ modal ปิด หรือ component unmount
            // เพื่อหยุดการดึงข้อมูลเมื่อไม่จำเป็นแล้ว
            return () => {
                console.log(`Stopping polling for ticket #${selectedTicket.ID}.`);
                clearInterval(intervalId);
            };
        }
    }, [isModalVisible, selectedTicket]); // dependency array: ให้ effect นี้ทำงานใหม่ทุกครั้งที่ isModalVisible หรือ selectedTicket เปลี่ยน
    // ✨ END: เพิ่ม useEffect สำหรับ Polling

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

    const handleViewDetails = async (ticket: RequestTicket) => {
        try {
            const response = await qnaAPI.getTicketById(String(ticket.ID));
            const ticketData = response?.data?.data || response?.data;
            if(ticketData) {
                setSelectedTicket(ticketData);
                setIsModalVisible(true);
            } else {
                throw new Error('Could not fetch ticket details');
            }
        } catch(error) {
            message.error("ไม่สามารถโหลดรายละเอียดคำร้องได้");
        }
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setReplyMessage('');
        setSelectedTicket(null);
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
                is_staff_reply: true, // Admin ตอบกลับเสมอ
                attachments: replyAttachments,
            });

            if (response && response.status >= 200 && response.status < 300) {
                message.success(`ตอบกลับคำร้อง "${selectedTicket.subject}" สำเร็จ!`);
                setReplyMessage('');
                setReplyFileList([]);
                setReplyAttachments([]);
                fetchTickets(); // อัปเดตตารางหลัก
                
                // ดึงข้อมูลล่าสุดมาแสดงใน modal ทันทีหลังส่ง ไม่ต้องรอรอบ polling ถัดไป
                const updatedTicketResponse = await qnaAPI.getTicketById(String(selectedTicket.ID));
                if (updatedTicketResponse && updatedTicketResponse.data) {
                    const updatedTicketData = updatedTicketResponse.data.data || updatedTicketResponse.data;
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
                const updatedTicketData = response.data.data || response.data;
                message.success(`อัปเดตสถานะเป็น "${getStatusText(status)}" สำเร็จ`);
                setSelectedTicket(updatedTicketData); // อัปเดตข้อมูลใน Modal
                fetchTickets(); // รีเฟรชตารางหลัก
            } else {
                throw new Error(response?.data?.error || 'Failed to update status');
            }
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };
    
    const formatTime = (ts?: string) => ts ? new Date(ts).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '';

    const replyUploadProps: UploadProps = {
        name: 'file',
        action: UPLOAD_URL,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        fileList: replyFileList,
        onChange(info: UploadChangeParam<UploadFile>) {
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
        onRemove(file: UploadFile) {
          const newAttachments = replyAttachments.filter(att => att.name !== file.name);
          setReplyAttachments(newAttachments);
        }
      };

    const columns: ColumnsType<RequestTicket> = [
        { title: 'เวลาที่ส่ง', dataIndex: 'CreatedAt', key: 'CreatedAt', render: formatTime, sorter: (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime(), defaultSortOrder: 'ascend' },
        { title: 'หัวข้อเรื่อง', dataIndex: 'subject', key: 'subject', ellipsis: true },
        { title: 'ผู้ส่ง', key: 'author', render: (_, record) => <Space><Avatar size="small" icon={<UserOutlined />} />{record.user?.username || 'N/A'}</Space> },
        { 
            title: 'สถานะ', 
            dataIndex: 'status', 
            key: 'status', 
            render: (status: RequestTicket['status']) => (
                <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
            ),
            filters: [
                { text: 'รอการตอบกลับ', value: 'Open' },
                { text: 'กำลังดำเนินการ', value: 'In Progress' },
                { text: 'รอยืนยัน', value: 'Awaiting Confirmation' },
                { text: 'แก้ไขแล้ว', value: 'Resolved' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        { title: 'การดำเนินการ', key: 'action', render: (_, record) => <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>ตรวจสอบ</Button> },
    ];

    return (
        <div>
            <Title level={2}>จัดการคำร้อง</Title>
            <Table columns={columns} dataSource={tickets} rowKey="ID" loading={loading} />

            <Modal
                title={`สอบถามเรื่อง: ${selectedTicket?.subject}`}
                open={isModalVisible}
                onCancel={handleCancelModal}
                width={800}
                footer={null}
                className="ticket-modal"
            >
                {selectedTicket && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '75vh' }}>
                        <div style={{ flexShrink: 0 }}>
                            <Card>
                                <Descriptions column={1} size="small" layout="horizontal" bordered>
                                    <Descriptions.Item label="ผู้ส่งคำร้อง">{selectedTicket.user?.username || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="สถานะ">
                                        <Select
                                            value={selectedTicket.status}
                                            onChange={handleUpdateStatus}
                                            style={{ width: 180 }}
                                            size="small"
                                        >
                                            <Option value="Open">รอการตอบกลับ</Option>
                                            <Option value="In Progress">กำลังดำเนินการ</Option>
                                            <Option value="Awaiting Confirmation">รอยืนยัน</Option>
                                            <Option value="Resolved">แก้ไขแล้ว</Option>
                                        </Select>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="วันที่ส่ง">{formatTime(selectedTicket.CreatedAt)}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                            
                            <Title level={5} style={{ marginTop: '16px', marginBottom: '8px' }}>ประวัติการสนทนา</Title>
                        </div>

                        <div className="conversation-history" style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
                            <Card size="small" style={{ marginBottom: '8px', background: '#fff' }}>
                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    <Space>
                                        <Text strong>{selectedTicket.user?.username || 'Unknown'}</Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>{formatTime(selectedTicket.CreatedAt)}</Text>
                                    </Space>
                                    <Text>{selectedTicket.initial_message}</Text>
                                    <AttachmentDisplay attachments={selectedTicket.attachments} />
                                </Space>
                            </Card>

                            {(selectedTicket.replies || []).map((reply: any, index: number) => (
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
                        
                        <div style={{ flexShrink: 0, paddingTop: '16px' }}>
                             <Divider style={{ margin: '0 0 16px 0' }}/>
                             <Title level={5} style={{ marginBottom: '8px' }}>ตอบกลับ</Title>
                             <TextArea
                                rows={2}
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="พิมพ์คำตอบในฐานะเจ้าหน้าที่..."
                            />
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px'}}>
                                <Upload {...replyUploadProps}>
                                    <Button icon={<UploadOutlined />}>แนบไฟล์</Button>
                                </Upload>
                                <Button
                                    type="primary"
                                    onClick={handleSendReply}
                                    icon={<SendOutlined />}
                                    disabled={!replyMessage.trim() && replyAttachments.length === 0}
                                >
                                    ส่งตอบกลับ
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RequestsPage;
