// // src/pages/Admin2/RequestsPage.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { Table, Tag, Button, Typography, Space, Modal, message, Descriptions, Input, Avatar, Card } from 'antd';
// import type { ColumnsType } from 'antd/es/table';
// import { EyeOutlined, MessageOutlined, UserOutlined, ClockCircleOutlined, PictureOutlined } from '@ant-design/icons';
// // 🔄 แก้ไข: เปลี่ยนการ import type จาก Question เป็น FormQuestion
// import type { FormQuestion, Answer } from '../../types';

// const { Title, Paragraph } = Typography;
// const { TextArea } = Input;

// // 🔄 เพิ่ม: กำหนด URL ของ API
// const API_URL = 'http://localhost:8080/api';

// const RequestsPage: React.FC = () => {
//     // 🔄 แก้ไข: เปลี่ยน State ให้รองรับ FormQuestion[]
//     const [requests, setRequests] = useState<FormQuestion[]>([]);
//     const [loading, setLoading] = useState<boolean>(true); // เพิ่ม State สำหรับ Loading
//     const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
//     const [isChatModalVisible, setIsChatModalVisible] = useState(false);
//     // 🔄 แก้ไข: เปลี่ยน State ให้รองรับ FormQuestion | null
//     const [selectedRequest, setSelectedRequest] = useState<FormQuestion | null>(null);
//     const [replyMessage, setReplyMessage] = useState('');
//     const messagesEndRef = useRef<HTMLDivElement>(null);

//     // 🔄 เพิ่ม: ฟังก์ชันสำหรับดึงข้อมูลคำร้องจาก API
//     const fetchRequests = async () => {
//         setLoading(true);
//         try {
//             const response = await fetch(`${API_URL}/requests`);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch requests from server');
//             }
//             const data: FormQuestion[] = await response.json();
//             setRequests(data);
//         } catch (error) {
//             console.error(error);
//             message.error('ไม่สามารถดึงข้อมูลคำร้องได้');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 🔄 แก้ไข: เรียกใช้ fetchRequests เมื่อ component โหลด
//     useEffect(() => {
//         fetchRequests();
//     }, []);


//     useEffect(() => {
//         if (messagesEndRef.current) {
//             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [isChatModalVisible, selectedRequest]);

//     const handleViewDetails = (request: FormQuestion) => {
//         setSelectedRequest(request);
//         setIsDetailModalVisible(true);
//     };

//     const handleOpenChat = (request: FormQuestion) => {
//         setSelectedRequest(request);
//         setIsChatModalVisible(true);
//     };

//     const handleCancelModals = () => {
//         setIsDetailModalVisible(false);
//         setIsChatModalVisible(false);
//         setReplyMessage('');
//         setSelectedRequest(null);
//     };

//     const handleSendReply = () => {
//         // (ส่วนนี้ยังไม่ได้เชื่อมต่อ API จริง)
//         if (!replyMessage.trim() || !selectedRequest) {
//             message.error('กรุณาพิมพ์ข้อความตอบกลับ');
//             return;
//         }
//         message.success(`ตอบกลับคำร้องของคุณ "${selectedRequest.name}" สำเร็จ!`);
//         setReplyMessage('');
//     };

//     const formatTime = (ts?: string) => {
//         if (!ts) return '';
//         return new Date(ts).toLocaleString('th-TH');
//     };

//     // 🔄 แก้ไข: ปรับ Columns ให้ตรงกับข้อมูลจาก FormQuestion
//     const columns: ColumnsType<FormQuestion> = [
//         {
//             title: 'เวลาที่ส่ง',
//             dataIndex: 'CreatedAt',
//             key: 'CreatedAt',
//             render: (text) => formatTime(text),
//             sorter: (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime(),
//             defaultSortOrder: 'ascend',
//         },
//         { title: 'หัวข้อ', dataIndex: 'title', key: 'title', ellipsis: true },
//         {
//             title: 'ผู้ส่ง',
//             key: 'author',
//             render: (_, record) => `${record.name} ${record.lastname}`,
//         },
//         {
//             title: 'สถานะ',
//             dataIndex: 'status',
//             key: 'status',
//             render: (status: string) => (
//                 <Tag color={status === 'pending' ? 'warning' : 'success'}>
//                     {status}
//                 </Tag>
//             )
//         },
//         {
//             title: 'การดำเนินการ',
//             key: 'action',
//             render: (_, record) => (
//                 <Space>
//                     <Button
//                         icon={<EyeOutlined />}
//                         onClick={() => handleViewDetails(record)}
//                     >
//                         ดูรายละเอียด
//                     </Button>
//                     <Button
//                         type="primary"
//                         icon={<MessageOutlined />}
//                         onClick={() => handleOpenChat(record)}
//                     >
//                         แชท
//                     </Button>
//                 </Space>
//             ),
//         },
//     ];

//     return (
//         <div>
//             <Title level={2}>จัดการคำร้อง</Title>
//             <Table
//                 columns={columns}
//                 dataSource={requests}
//                 rowKey="ID"
//                 loading={loading} // เพิ่ม: แสดงสถานะโหลด
//             />

//             {/* Modal สำหรับดูรายละเอียดคำร้อง */}
//             <Modal
//                 title="รายละเอียดคำร้อง"
//                 open={isDetailModalVisible}
//                 onCancel={handleCancelModals}
//                 width={700}
//                 footer={[<Button key="back" onClick={handleCancelModals}>ปิด</Button>]}
//             >
//                 {selectedRequest && (
//                     <Descriptions bordered column={1}>
//                         <Descriptions.Item label="ID คำร้อง">{selectedRequest.ID}</Descriptions.Item>
//                         <Descriptions.Item label="ผู้ส่ง">
//                             <Space>
//                                 <Avatar size="small" icon={<UserOutlined />} />
//                                 {`${selectedRequest.name} ${selectedRequest.lastname}`}
//                             </Space>
//                         </Descriptions.Item>
//                         <Descriptions.Item label="หัวข้อเรื่อง">{selectedRequest.title}</Descriptions.Item>
//                         <Descriptions.Item label="รายละเอียดที่ส่งมา">
//                             <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
//                                 {selectedRequest.details || 'ไม่มีรายละเอียด'}
//                             </Paragraph>
//                         </Descriptions.Item>
//                     </Descriptions>
//                 )}
//             </Modal>
            
//             {/* Modal สำหรับแชท */}
//             <Modal
//                 title={`แชทกับ ${selectedRequest?.name}`}
//                 open={isChatModalVisible}
//                 onCancel={handleCancelModals}
//                 footer={null}
//                 width={700}
//             >
//                 {/* เนื้อหาใน Modal Chat ยังคงเดิม */}
//                 <p>ส่วนการแชทยังอยู่ในระหว่างการพัฒนา</p>
//             </Modal>
//         </div>
//     );
// };

// export default RequestsPage;
// src/pages/Admin2/RequestsPage.tsx
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
                fetchTickets();
                
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

