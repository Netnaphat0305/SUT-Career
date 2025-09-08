// src/pages/Admin2/RequestsPage.tsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Space, Modal, message, Descriptions, Input, Avatar, Card, Divider, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, UserOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import type { RequestTicket } from '../../interfaces/helpcenter';
// ✨ 1. Import qnaAPI จาก service กลาง
import { qnaAPI } from '../../services/https/index';
import '../Admin2/RequestsPage.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RequestsPage: React.FC = () => {
    const [tickets, setTickets] = useState<RequestTicket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<RequestTicket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            // ✨ 2. เรียกใช้ API ผ่าน service ที่สร้างไว้สำหรับ Admin
            const response = await qnaAPI.getAllTicketsForAdmin();
            if (response && response.data) {
                const data: RequestTicket[] = response.data;
                const sortedData = data.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
                setTickets(sortedData);
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
        // ✨ 3. เรียก API เพื่อดึงข้อมูลล่าสุดของ Ticket นั้นๆ
        try {
            const response = await qnaAPI.getTicketById(String(ticket.ID));
            if(response && response.data) {
                setSelectedTicket(response.data);
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
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedTicket) {
            message.error('กรุณาพิมพ์ข้อความตอบกลับ');
            return;
        }
        try {
            // ✨ 4. เรียกใช้ API ผ่าน service เพื่อส่ง Reply
            const response = await qnaAPI.createTicketReply(String(selectedTicket.ID), {
                message: replyMessage,
                is_staff_reply: true // Admin ตอบกลับเสมอ
            });

            if (response && response.status >= 200 && response.status < 300) {
                message.success(`ตอบกลับคำร้อง "${selectedTicket.subject}" สำเร็จ!`);
                setReplyMessage('');
                fetchTickets();
                
                // รีเฟรชข้อมูลใน Modal
                const updatedTicketResponse = await qnaAPI.getTicketById(String(selectedTicket.ID));
                if (updatedTicketResponse && updatedTicketResponse.data) {
                    setSelectedTicket(updatedTicketResponse.data);
                }
            } else {
                 throw new Error(response?.data?.error || 'Failed to send reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            message.error('เกิดข้อผิดพลาดในการส่งข้อความตอบกลับ');
        }
    };
    
    // ✨ 5. เพิ่มฟังก์ชันสำหรับอัปเดตสถานะ
    const handleUpdateStatus = async (status: RequestTicket['status']) => {
        if (!selectedTicket) return;
        try {
            const response = await qnaAPI.updateTicketStatus(String(selectedTicket.ID), status);
            if (response && response.status >= 200 && response.status < 300) {
                message.success(`อัปเดตสถานะเป็น "${getStatusText(status)}" สำเร็จ`);
                setSelectedTicket(response.data); // อัปเดตข้อมูลใน Modal
                fetchTickets(); // รีเฟรชตารางหลัก
            } else {
                throw new Error(response?.data?.error || 'Failed to update status');
            }
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };
    
    const formatTime = (ts?: string) => ts ? new Date(ts).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '';

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
            )
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
                                        {/* ✨ 6. เพิ่ม Select สำหรับเปลี่ยนสถานะ */}
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
                            <div key={`initial-${selectedTicket.ID}`} className="history-entry user-reply">
                                <div className="entry-header">
                                    <Text strong>{selectedTicket.user?.username || 'Unknown'}</Text>
                                    <Text type="secondary" className="entry-timestamp">{formatTime(selectedTicket.CreatedAt)}</Text>
                                </div>
                                <div className="entry-body">
                                    <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedTicket.initial_message}</Paragraph>
                                </div>
                            </div>
                            {(selectedTicket.replies || []).map((msg: any) => (
                                <div key={msg.ID} className={`history-entry ${msg.is_staff_reply ? 'staff-reply' : 'user-reply'}`}>
                                    <div className="entry-header">
                                        <Text strong>{msg.author?.username || 'Unknown'}</Text>
                                        {msg.is_staff_reply && <Tag color="blue">เจ้าหน้าที่</Tag>}
                                        <Text type="secondary" className="entry-timestamp">{formatTime(msg.CreatedAt)}</Text>
                                    </div>
                                    <div className="entry-body">
                                        <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.message}</Paragraph>
                                    </div>
                                </div>
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
                            <Button
                                type="primary"
                                onClick={handleSendReply}
                                style={{ marginTop: '12px' }}
                                icon={<SendOutlined />}
                            >
                                ส่งตอบกลับ
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RequestsPage;
