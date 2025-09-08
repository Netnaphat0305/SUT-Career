// // src/pages/RequestThreadPage/RequestStatusPage.tsx

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Card, Typography, Spin, Result, Button, Space, Tag } from 'antd';
// // แก้ไขโดยพรศิริ: เพิ่มไอคอน HomeOutlined
// import { UserOutlined, MessageOutlined, ClockCircleOutlined, HomeOutlined } from '@ant-design/icons';
// import type { Question } from '../../types';

// const { Title, Paragraph } = Typography;

// interface RequestStatusPageProps {
//     questions: Question[];
// }

// const RequestStatusPage: React.FC<RequestStatusPageProps> = ({ questions }) => {
//     const { id } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const [request, setRequest] = useState<Question | null>(null);
//     const requestId = parseInt(id as string);

//     useEffect(() => {
//         const storedRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
//         const foundRequest = storedRequests.find((q: Question) => q.id === requestId);
        
//         if (foundRequest) {
//             setRequest(foundRequest);
//         }
//     }, [requestId, questions]); // อัปเดตเมื่อ questions เปลี่ยน

//     if (!request) {
//         return <Result status="404" title="404" subTitle="ไม่พบคำร้องที่ท่านต้องการ" />;
//     }
    
//     const userRequestDetails = request.answers[0]?.text;

//     return (
//         <Card className="request-status-card" style={{ maxWidth: 600, margin: 'auto' }}>
//             <div style={{ textAlign: 'center', marginBottom: 24 }}>
//                 <Title level={3}>คำร้องของคุณถูกส่งแล้ว</Title>
//                 <Spin size="large" />
//                 <Paragraph style={{ marginTop: 16 }}>
//                     <ClockCircleOutlined /> กำลังรอแอดมินตรวจสอบและตอบกลับ...
//                 </Paragraph>
//                 <Tag color="warning" icon={<MessageOutlined />}>รอการตอบกลับ</Tag>
//             </div>
            
//             <Card title="รายละเอียดคำร้องของคุณ">
//                 <Paragraph>
//                     <strong>หัวข้อ:</strong> {request.title}
//                 </Paragraph>
//                 <Paragraph>
//                     <strong>โดย:</strong> <Space><UserOutlined />{request.author}</Space>
//                 </Paragraph>
//                 <Paragraph>
//                     <strong>รายละเอียด:</strong> <br />
//                     <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
//                         {userRequestDetails}
//                     </pre>
//                 </Paragraph>
//             </Card>

//             {/* แก้ไขโดยพรศิริ: เพิ่มปุ่มกลับไปหน้าหลัก */}
//             <div style={{ textAlign: 'center', marginTop: '24px' }}>
//                 <Button 
//                     type="primary" 
//                     icon={<HomeOutlined />} 
//                     size="large"
//                     onClick={() => navigate('/')}
//                 >
//                     กลับไปหน้าหลัก
//                 </Button>
//             </div>
//         </Card>
//     );
// };

// export default RequestStatusPage;

// src/pages/RequestThreadPage/RequestStatusPage.tsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { Card, Typography, Spin, Result, Button, Space, Tag, Avatar, Divider, message } from 'antd';
// import { UserOutlined, MessageOutlined, ClockCircleOutlined, HomeOutlined } from '@ant-design/icons';
// import type { RequestTicket } from '../../types'; // Use the correct type

// const { Title, Paragraph, Text } = Typography;
// const API_URL = 'http://localhost:8080/api';

// const RequestStatusPage: React.FC = () => {
//     const { id } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const [ticket, setTicket] = useState<RequestTicket | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchTicket = async () => {
//             if (!id) {
//                 setLoading(false);
//                 return;
//             }
//             try {
//                 setLoading(true);
//                 const response = await fetch(`${API_URL}/tickets/${id}`);
//                 if (!response.ok) {
//                     throw new Error('Ticket not found or failed to fetch');
//                 }
//                 const data: RequestTicket = await response.json();
//                 setTicket(data);
//             } catch (error) {
//                 console.error(error);
//                 message.error('ไม่สามารถโหลดข้อมูลคำร้องได้');
//                 setTicket(null); // Set ticket to null on error
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTicket();
//     }, [id]);
    
//     const formatTime = (ts?: string) => {
//         if (!ts) return '';
//         return new Date(ts).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
//     };

//     if (loading) {
//         return (
//             <div style={{ textAlign: 'center', padding: '50px' }}>
//                 <Spin size="large" />
//             </div>
//         );
//     }

//     if (!ticket) {
//         return (
//             <Result
//                 status="404"
//                 title="404"
//                 subTitle="ขออภัย, ไม่พบคำร้องที่คุณค้นหา"
//                 extra={
//                     <Button type="primary" onClick={() => navigate('/help')}>
//                         กลับไปศูนย์ช่วยเหลือ
//                     </Button>
//                 }
//             />
//         );
//     }

//     return (
//         <Card className="request-status-card" style={{ maxWidth: 700, margin: 'auto' }}>
//             <div style={{ textAlign: 'center', marginBottom: 24 }}>
//                 <Title level={3}>สถานะคำร้องของคุณ</Title>
//                 <Tag color={ticket.status === 'Open' ? 'warning' : 'success'} icon={<MessageOutlined />} style={{ fontSize: 14, padding: '5px 10px' }}>
//                     สถานะ: {ticket.status}
//                 </Tag>
//             </div>
            
//             <Card type="inner" title="รายละเอียดคำร้อง">
//                 <Paragraph>
//                     <strong>หัวข้อ:</strong> {ticket.subject}
//                 </Paragraph>
//                 <Paragraph>
//                     <Space>
//                         <UserOutlined />
//                         <strong>ผู้ส่ง:</strong> 
//                         {ticket.user?.username || 'N/A'}
//                     </Space>
//                 </Paragraph>
//                  <Paragraph>
//                     <Space>
//                         <ClockCircleOutlined />
//                         <strong>เวลาที่ส่ง:</strong> 
//                         {formatTime(ticket.CreatedAt)}
//                     </Space>
//                 </Paragraph>
//                 <Divider />
//                 <Paragraph>
//                     <strong>ข้อความเริ่มต้น:</strong>
//                     <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', fontFamily: 'inherit' }}>
//                         {ticket.initial_message}
//                     </pre>
//                 </Paragraph>
//             </Card>

//             <Divider orientation="left">ประวัติการสนทนา</Divider>
            
//             <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
//                 {ticket.replies && ticket.replies.length > 0 ? (
//                     ticket.replies.map(reply => (
//                          <Card key={reply.ID} type="inner" style={{ marginBottom: 16, background: reply.is_staff_reply ? '#e6f7ff' : '#fff' }}>
//                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                                 <Text strong>{reply.author?.username || 'Unknown'} {reply.is_staff_reply && <Tag color="blue">Staff</Tag>}</Text>
//                                 <Text type="secondary">{formatTime(reply.CreatedAt)}</Text>
//                             </div>
//                             <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
//                                 {reply.message}
//                             </Paragraph>
//                         </Card>
//                     ))
//                 ) : (
//                     <Text type="secondary">ยังไม่มีการตอบกลับ...</Text>
//                 )}
//             </div>

//             <div style={{ textAlign: 'center', marginTop: '24px' }}>
//                 <Space size="large">
//                     <Button 
//                         type="primary" 
//                         icon={<HomeOutlined />} 
//                         size="large"
//                         onClick={() => navigate('/help')}
//                     >
//                         กลับไปศูนย์ช่วยเหลือ
//                     </Button>
//                      <Button 
//                         size="large"
//                         onClick={() => navigate(`/help/request/${ticket.ID}`)} // Assuming this is the chat page
//                     >
//                         ตอบกลับ
//                     </Button>
//                 </Space>
//             </div>
//         </Card>
//     );
// };

// export default RequestStatusPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Spin, Result, Button, Space, Tag, Avatar, Divider, message } from 'antd';
import { UserOutlined, MessageOutlined, ClockCircleOutlined, HomeOutlined } from '@ant-design/icons';
import type { RequestTicket } from '../../interfaces/helpcenter';
// ✨ 1. Import qnaAPI จาก service กลาง
import { qnaAPI } from '../../services/https/index';

const { Title, Paragraph, Text } = Typography;
// ❌ 2. ลบ API_URL ที่ไม่จำเป็นต้องใช้ออก
// const API_URL = 'http://localhost:8080/api';

const RequestStatusPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<RequestTicket | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // ✨ 3. แก้ไขการเรียก API มาใช้ qnaAPI.getTicketById
                const response = await qnaAPI.getTicketById(id);

                // ตรวจสอบว่ามี response และข้อมูล (data) ที่ถูกต้อง
                if (response && response.data) {
                    setTicket(response.data);
                } else {
                    throw new Error('Ticket not found or failed to fetch');
                }
            } catch (error) {
                console.error(error);
                message.error('ไม่สามารถโหลดข้อมูลคำร้องได้');
                setTicket(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);
    
    const formatTime = (ts?: string) => {
        if (!ts) return '';
        return new Date(ts).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <Result
                status="404"
                title="404"
                subTitle="ขออภัย, ไม่พบคำร้องที่คุณค้นหา"
                extra={
                    <Button type="primary" onClick={() => navigate('/help')}>
                        กลับไปศูนย์ช่วยเหลือ
                    </Button>
                }
            />
        );
    }

    return (
        <Card className="request-status-card" style={{ maxWidth: 700, margin: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3}>สถานะคำร้องของคุณ</Title>
                <Tag color={ticket.status === 'Open' ? 'warning' : 'success'} icon={<MessageOutlined />} style={{ fontSize: 14, padding: '5px 10px' }}>
                    สถานะ: {ticket.status}
                </Tag>
            </div>
            
            <Card type="inner" title="รายละเอียดคำร้อง">
                <Paragraph>
                    <strong>หัวข้อ:</strong> {ticket.subject}
                </Paragraph>
                <Paragraph>
                    <Space>
                        <UserOutlined />
                        <strong>ผู้ส่ง:</strong> 
                        {ticket.user?.username || 'N/A'}
                    </Space>
                </Paragraph>
                 <Paragraph>
                    <Space>
                        <ClockCircleOutlined />
                        <strong>เวลาที่ส่ง:</strong> 
                        {formatTime(ticket.CreatedAt)}
                    </Space>
                </Paragraph>
                <Divider />
                <Paragraph>
                    <strong>ข้อความเริ่มต้น:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', fontFamily: 'inherit' }}>
                        {ticket.initial_message}
                    </pre>
                </Paragraph>
            </Card>

            <Divider orientation="left">ประวัติการสนทนา</Divider>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
                {ticket.replies && ticket.replies.length > 0 ? (
                    ticket.replies.map(reply => (
                         <Card key={reply.ID} type="inner" style={{ marginBottom: 16, background: reply.is_staff_reply ? '#e6f7ff' : '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <Text strong>{reply.author?.username || 'Unknown'} {reply.is_staff_reply && <Tag color="blue">Staff</Tag>}</Text>
                                <Text type="secondary">{formatTime(reply.CreatedAt)}</Text>
                            </div>
                            <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                {reply.message}
                            </Paragraph>
                        </Card>
                    ))
                ) : (
                    <Text type="secondary">ยังไม่มีการตอบกลับ...</Text>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Space size="large">
                    <Button 
                        type="primary" 
                        icon={<HomeOutlined />} 
                        size="large"
                        onClick={() => navigate('/help')}
                    >
                        กลับไปศูนย์ช่วยเหลือ
                    </Button>
                     <Button 
                        size="large"
                        onClick={() => navigate(`/help/request/${ticket.ID}`)} // Assuming this is the chat page
                    >
                        ตอบกลับ
                    </Button>
                </Space>
            </div>
        </Card>
    );
};

export default RequestStatusPage;
