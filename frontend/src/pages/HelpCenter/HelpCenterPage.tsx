// // src/pages/HelpCenter/HelpCenterPage-Connected.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   Card,
//   Col,
//   Row,
//   Typography,
//   Button,
//   Input,
//   Space,
//   Modal,
//   message,
//   Form,
//   Badge,
//   Collapse,
//   List,
//   Tag,
//   Steps,
//   Divider,
//   Spin,
//   Empty
// } from 'antd';
// import {
//   QuestionCircleOutlined,
//   MessageOutlined,
//   SearchOutlined,
//   SendOutlined,
//   CustomerServiceOutlined,
//   BulbOutlined,
//   PhoneOutlined,
//   MailOutlined,
//   ClockCircleOutlined,
//   CheckCircleOutlined,
//   ExclamationCircleOutlined,
//   TrophyOutlined,
//   RocketOutlined,
//   UserOutlined
// } from '@ant-design/icons';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// // Import services และ types
// import {
//   getFAQs,
//   createTicket,
//   getMyTickets,
//   getTicketById,
//   createTicketReply
// } from '../../services/helpCenterService';
// import type{ FAQ, RequestTicket, CreateTicketRequest, CreateReplyRequest } from '../../type/helpCenter';

// const { Title, Text, Paragraph } = Typography;
// const { Search, TextArea } = Input;
// const { Panel } = Collapse;
// const { Step } = Steps;

// const HelpCenterPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [form] = Form.useForm();
  
//   // FAQ State
//   const [faqs, setFaqs] = useState<FAQ[]>([]);
//   const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);
//   const [faqsLoading, setFaqsLoading] = useState(true);
  
//   // Tickets State
//   const [userTickets, setUserTickets] = useState<RequestTicket[]>([]);
//   const [ticketsLoading, setTicketsLoading] = useState(false);
  
//   // Modal State
//   const [selectedTicket, setSelectedTicket] = useState<RequestTicket | null>(null);
//   const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
//   const [replyMessage, setReplyMessage] = useState('');
//   const [replyLoading, setReplyLoading] = useState(false);

//   // ดึงข้อมูล FAQs
//   useEffect(() => {
//     const fetchFAQs = async () => {
//       try {
//         setFaqsLoading(true);
//         const response = await getFAQs();
//         const faqsData = Array.isArray(response) ? response : response?.data || [];
//         setFaqs(faqsData);
//         setFilteredFAQs(faqsData);
//       } catch (error) {
//         console.error('Error fetching FAQs:', error);
//         message.error('ไม่สามารถโหลด FAQ ได้');
//       } finally {
//         setFaqsLoading(false);
//       }
//     };

//     fetchFAQs();
//   }, []);

//   // ดึงข้อมูล User Tickets
//   const fetchUserTickets = async () => {
//     if (!user) {
//       message.warning('กรุณาเข้าสู่ระบบเพื่อดูคำร้องของคุณ');
//       return;
//     }

//     try {
//       setTicketsLoading(true);
//       const response = await getMyTickets();
//       const ticketsData = Array.isArray(response) ? response : response?.data || [];
//       setUserTickets(ticketsData);
//     } catch (error) {
//       console.error('Error fetching user tickets:', error);
//       message.error('ไม่สามารถโหลดคำร้องของคุณได้');
//     } finally {
//       setTicketsLoading(false);
//     }
//   };

//   // ฟังก์ชันค้นหา FAQ
//   const handleSearch = (value: string) => {
//     setSearchTerm(value);
//     if (!value.trim()) {
//       setFilteredFAQs(faqs);
//       return;
//     }

//     const searchLower = value.toLowerCase();
//     const filtered = faqs.filter(faq =>
//       faq.title.toLowerCase().includes(searchLower) ||
//       faq.content.toLowerCase().includes(searchLower)
//     );
//     setFilteredFAQs(filtered);
//   };

//   // ส่งคำร้องใหม่
//   const handleSubmitRequest = async (values: any) => {
//     if (!user) {
//       message.error('กรุณาเข้าสู่ระบบก่อนส่งคำร้อง');
//       return;
//     }

//     setLoading(true);
//     try {
//       const ticketData: CreateTicketRequest = {
//         subject: values.subject,
//         initial_message: values.message
//       };

//       await createTicket(ticketData);
//       message.success('ส่งคำร้องสำเร็จแล้ว! เราจะติดต่อกลับโดยเร็วที่สุด');
//       form.resetFields();
//       setIsRequestModalVisible(false);
//       fetchUserTickets(); // รีเฟรชรายการคำร้อง
//     } catch (error: any) {
//       console.error('Error creating ticket:', error);
//       message.error(error.message || 'เกิดข้อผิดพลาดในการส่งคำร้อง');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ดูรายละเอียดคำร้อง
//   const showTicketDetail = async (ticket: RequestTicket) => {
//     try {
//       const fullTicket = await getTicketById(ticket.ID.toString());
//       setSelectedTicket(fullTicket);
//       setIsDetailModalVisible(true);
//     } catch (error: any) {
//       console.error('Error fetching ticket details:', error);
//       message.error('ไม่สามารถโหลดรายละเอียดคำร้องได้');
//     }
//   };

//   // ส่งคำตอบในคำร้อง
//   const handleSendReply = async () => {
//     if (!selectedTicket || !replyMessage.trim()) {
//       message.error('กรุณาพิมพ์ข้อความ');
//       return;
//     }

//     setReplyLoading(true);
//     try {
//       const replyData: CreateReplyRequest = {
//         message: replyMessage,
//         is_staff_reply: false
//       };

//       await createTicketReply(selectedTicket.ID.toString(), replyData);
//       message.success('ส่งคำตอบสำเร็จแล้ว');
//       setReplyMessage('');

//       // รีเฟรชข้อมูลคำร้อง
//       const updatedTicket = await getTicketById(selectedTicket.ID.toString());
//       setSelectedTicket(updatedTicket);
//     } catch (error: any) {
//       console.error('Error sending reply:', error);
//       message.error(error.message || 'เกิดข้อผิดพลาดในการส่งคำตอบ');
//     } finally {
//       setReplyLoading(false);
//     }
//   };

//   // ฟังก์ชันช่วยเหลือ
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Open': return '#faad14';
//       case 'In Progress': return '#1890ff';
//       case 'Awaiting Confirmation': return '#722ed1';
//       case 'Resolved': return '#52c41a';
//       case 'Closed': return '#8c8c8c';
//       default: return '#faad14';
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'Open': return 'รอการตอบกลับ';
//       case 'In Progress': return 'กำลังดำเนินการ';
//       case 'Awaiting Confirmation': return 'รอการยืนยัน';
//       case 'Resolved': return 'เสร็จสิ้น';
//       case 'Closed': return 'ปิด';
//       default: return 'ไม่ทราบสถานะ';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'Open': return <ClockCircleOutlined />;
//       case 'In Progress': return <ExclamationCircleOutlined />;
//       case 'Awaiting Confirmation': return <QuestionCircleOutlined />;
//       case 'Resolved': return <CheckCircleOutlined />;
//       case 'Closed': return <CheckCircleOutlined />;
//       default: return <ClockCircleOutlined />;
//     }
//   };

//   const formatTime = (timeString: string) => {
//     return new Date(timeString).toLocaleDateString('th-TH', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div style={{ 
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//       position: 'relative'
//     }}>
//       {/* Background decorative elements */}
//       <div style={{
//         position: 'absolute',
//         top: '15%',
//         right: '8%',
//         width: '180px',
//         height: '180px',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         borderRadius: '50%',
//         opacity: 0.1,
//         zIndex: 0
//       }} />
//       <div style={{
//         position: 'absolute',
//         bottom: '25%',
//         left: '3%',
//         width: '120px',
//         height: '120px',
//         background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
//         borderRadius: '50%',
//         opacity: 0.1,
//         zIndex: 0
//       }} />

//       <div style={{ 
//         padding: '40px 24px',
//         position: 'relative',
//         zIndex: 1
//       }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
//           {/* Header */}
//           <div style={{ 
//             marginBottom: '40px',
//             textAlign: 'center'
//           }}>
//             <div style={{
//               background: 'rgba(255, 255, 255, 0.95)',
//               backdropFilter: 'blur(20px)',
//               borderRadius: '24px',
//               padding: '40px',
//               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//               border: '1px solid rgba(255, 255, 255, 0.2)'
//             }}>
//               <Space direction="vertical" size="large" style={{ width: '100%' }}>
//                 <div style={{
//                   fontSize: '4rem',
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                   WebkitBackgroundClip: 'text',
//                   WebkitTextFillColor: 'transparent',
//                   backgroundClip: 'text'
//                 }}>
//                   🎯
//                 </div>
//                 <Title level={1} style={{ 
//                   margin: 0, 
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                   WebkitBackgroundClip: 'text',
//                   WebkitTextFillColor: 'transparent',
//                   backgroundClip: 'text',
//                   fontSize: '3rem',
//                   fontWeight: 'bold'
//                 }}>
//                   <CustomerServiceOutlined style={{ marginRight: '20px' }} />
//                   ศูนย์ช่วยเหลือ SUT Career
//                 </Title>
//                 <Paragraph style={{ 
//                   fontSize: '20px', 
//                   color: '#666',
//                   margin: 0,
//                   maxWidth: '600px',
//                   marginX: 'auto'
//                 }}>
//                   เราพร้อมช่วยเหลือคุณเสมอ! ค้นหาคำตอบจากคำถามที่พบบ่อย หรือส่งคำร้องหาเราโดยตรง
//                 </Paragraph>
//               </Space>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
//             <Col xs={24} md={8}>
//               <Card
//                 hoverable
//                 style={{
//                   borderRadius: '20px',
//                   border: 'none',
//                   background: 'rgba(255, 255, 255, 0.95)',
//                   backdropFilter: 'blur(20px)',
//                   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
//                   transition: 'all 0.3s ease',
//                   height: '100%'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'translateY(-8px)';
//                   e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'translateY(0px)';
//                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
//                 }}
//               >
//                 <div style={{ textAlign: 'center', padding: '20px' }}>
//                   <div style={{
//                     width: '80px',
//                     height: '80px',
//                     borderRadius: '50%',
//                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0 auto 20px',
//                     fontSize: '32px'
//                   }}>
//                     <QuestionCircleOutlined style={{ color: 'white' }} />
//                   </div>
//                   <Title level={4} style={{ color: '#333', marginBottom: '12px' }}>
//                     คำถามที่พบบ่อย
//                   </Title>
//                   <Text style={{ color: '#666', fontSize: '15px' }}>
//                     ค้นหาคำตอบสำหรับคำถามที่พบบ่อยได้ที่นี่
//                   </Text>
//                 </div>
//               </Card>
//             </Col>

//             <Col xs={24} md={8}>
//               <Card
//                 hoverable
//                 onClick={() => user ? setIsRequestModalVisible(true) : message.warning('กรุณาเข้าสู่ระบบก่อนส่งคำร้อง')}
//                 style={{
//                   borderRadius: '20px',
//                   border: 'none',
//                   background: 'rgba(255, 255, 255, 0.95)',
//                   backdropFilter: 'blur(20px)',
//                   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
//                   transition: 'all 0.3s ease',
//                   height: '100%',
//                   cursor: 'pointer'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'translateY(-8px)';
//                   e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'translateY(0px)';
//                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
//                 }}
//               >
//                 <div style={{ textAlign: 'center', padding: '20px' }}>
//                   <div style={{
//                     width: '80px',
//                     height: '80px',
//                     borderRadius: '50%',
//                     background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0 auto 20px',
//                     fontSize: '32px'
//                   }}>
//                     <MessageOutlined style={{ color: 'white' }} />
//                   </div>
//                   <Title level={4} style={{ color: '#333', marginBottom: '12px' }}>
//                     ส่งคำร้องใหม่
//                   </Title>
//                   <Text style={{ color: '#666', fontSize: '15px' }}>
//                     ไม่พบคำตอบ? ส่งคำร้องมาหาเราได้เลย
//                   </Text>
//                 </div>
//               </Card>
//             </Col>

//             <Col xs={24} md={8}>
//               <Card
//                 hoverable
//                 onClick={() => user && fetchUserTickets()}
//                 style={{
//                   borderRadius: '20px',
//                   border: 'none',
//                   background: 'rgba(255, 255, 255, 0.95)',
//                   backdropFilter: 'blur(20px)',
//                   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
//                   transition: 'all 0.3s ease',
//                   height: '100%',
//                   cursor: user ? 'pointer' : 'default'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'translateY(-8px)';
//                   e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'translateY(0px)';
//                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
//                 }}
//               >
//                 <div style={{ textAlign: 'center', padding: '20px' }}>
//                   <div style={{
//                     width: '80px',
//                     height: '80px',
//                     borderRadius: '50%',
//                     background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0 auto 20px',
//                     fontSize: '32px'
//                   }}>
//                     <ClockCircleOutlined style={{ color: 'white' }} />
//                   </div>
//                   <Title level={4} style={{ color: '#333', marginBottom: '12px' }}>
//                     สถานะคำร้อง
//                   </Title>
//                   <Text style={{ color: '#666', fontSize: '15px' }}>
//                     ตรวจสอบสถานะคำร้องของคุณ
//                   </Text>
//                 </div>
//               </Card>
//             </Col>
//           </Row>

//           {/* Search Bar */}
//           <Card style={{ 
//             marginBottom: '40px',
//             borderRadius: '20px',
//             border: 'none',
//             boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
//             background: 'rgba(255, 255, 255, 0.95)',
//             backdropFilter: 'blur(20px)'
//           }}>
//             <div style={{ textAlign: 'center' }}>
//               <Title level={3} style={{ 
//                 color: '#333', 
//                 marginBottom: '24px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '12px'
//               }}>
//                 <SearchOutlined />
//                 ค้นหาคำตอบที่คุณต้องการ
//               </Title>
//               <Search
//                 placeholder="🔍 พิมพ์คำถามหรือคำค้นหา..."
//                 allowClear
//                 enterButton={
//                   <Button 
//                     icon={<SearchOutlined />}
//                     style={{
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       border: 'none',
//                       borderRadius: '0 12px 12px 0'
//                     }}
//                   />
//                 }
//                 size="large"
//                 onSearch={handleSearch}
//                 onChange={(e) => !e.target.value && handleSearch('')}
//                 style={{ 
//                   maxWidth: '600px',
//                   borderRadius: '12px',
//                   overflow: 'hidden'
//                 }}
//               />
              
//               {searchTerm && (
//                 <div style={{ marginTop: '16px' }}>
//                   <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '20px' }}>
//                     ค้นหา: "{searchTerm}"
//                   </Tag>
//                   <Badge 
//                     count={filteredFAQs.length} 
//                     showZero 
//                     style={{ backgroundColor: '#52c41a', marginLeft: '12px' }}
//                   >
//                     <Text style={{ color: '#666' }}>ผลการค้นหา</Text>
//                   </Badge>
//                 </div>
//               )}
//             </div>
//           </Card>

//           <Row gutter={[24, 24]}>
//             {/* FAQ Section */}
//             <Col xs={24} lg={16}>
//               <Card
//                 title={
//                   <Space>
//                     <BulbOutlined style={{ color: '#faad14' }} />
//                     <span>คำถามที่พบบ่อย (FAQ)</span>
//                     <Badge count={filteredFAQs.length} showZero style={{ backgroundColor: '#1890ff' }} />
//                   </Space>
//                 }
//                 style={{
//                   borderRadius: '20px',
//                   border: 'none',
//                   background: 'rgba(255, 255, 255, 0.95)',
//                   backdropFilter: 'blur(20px)',
//                   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
//                 }}
//                 headStyle={{
//                   background: 'transparent',
//                   borderBottom: '2px solid #f0f0f0',
//                   borderRadius: '20px 20px 0 0'
//                 }}
//               >
//                 {faqsLoading ? (
//                   <div style={{ textAlign: 'center', padding: '40px' }}>
//                     <Spin size="large" />
//                     <Text style={{ display: 'block', marginTop: '16px', color: '#666' }}>
//                       กำลังโหลด FAQ...
//                     </Text>
//                   </div>
//                 ) : filteredFAQs.length > 0 ? (
//                   <Collapse 
//                     ghost 
//                     style={{ background: 'transparent' }}
//                     expandIconPosition="end"
//                   >
//                     {filteredFAQs.map(faq => (
//                       <Panel
//                         key={faq.ID}
//                         header={
//                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                             <div style={{
//                               width: '32px',
//                               height: '32px',
//                               borderRadius: '50%',
//                               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                               display: 'flex',
//                               alignItems: 'center',
//                               justifyContent: 'center',
//                               fontSize: '14px',
//                               color: 'white',
//                               fontWeight: 'bold'
//                             }}>
//                               Q
//                             </div>
//                             <Text strong style={{ fontSize: '16px', color: '#333' }}>
//                               {faq.title}
//                             </Text>
//                           </div>
//                         }
//                         style={{
//                           background: 'rgba(248, 249, 250, 0.5)',
//                           borderRadius: '12px',
//                           border: '1px solid rgba(0, 0, 0, 0.06)',
//                           marginBottom: '12px'
//                         }}
//                       >
//                         <div style={{ paddingLeft: '44px' }}>
//                           <Paragraph style={{ 
//                             color: '#666', 
//                             fontSize: '15px',
//                             lineHeight: '1.6',
//                             marginBottom: '16px'
//                           }}>
//                             {faq.content}
//                           </Paragraph>
//                           <div style={{ textAlign: 'right' }}>
//                             <Text type="secondary" style={{ fontSize: '12px' }}>
//                               อัปเดตเมื่อ: {formatTime(faq.UpdatedAt)}
//                             </Text>
//                           </div>
//                         </div>
//                       </Panel>
//                     ))}
//                   </Collapse>
//                 ) : (
//                   <div style={{ textAlign: 'center', padding: '40px' }}>
//                     <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
//                     <Text style={{ fontSize: '16px', color: '#666' }}>
//                       {searchTerm ? 
//                         `ไม่พบคำตอบที่ตรงกับการค้นหา "${searchTerm}"` :
//                         'ยังไม่มี FAQ ในระบบ'
//                       }
//                     </Text>
//                     <div style={{ marginTop: '16px' }}>
//                       <Button 
//                         type="primary" 
//                         icon={<MessageOutlined />}
//                         onClick={() => user ? setIsRequestModalVisible(true) : message.warning('กรุณาเข้าสู่ระบบก่อนส่งคำร้อง')}
//                         style={{
//                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                           border: 'none',
//                           borderRadius: '12px'
//                         }}
//                       >
//                         ส่งคำร้องใหม่
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </Card>
//             </Col>

//             {/* Right Sidebar */}
//             <Col xs={24} lg={8}>
//               <Space direction="vertical" size="large" style={{ width: '100%' }}>
//                 {/* Contact Info */}
//                 <Card
//                   title={
//                     <Space>
//                       <PhoneOutlined style={{ color: '#52c41a' }} />
//                       <span>ติดต่อเรา</span>
//                     </Space>
//                   }
//                   style={{
//                     borderRadius: '20px',
//                     border: 'none',
//                     background: 'rgba(255, 255, 255, 0.95)',
//                     backdropFilter: 'blur(20px)',
//                     boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
//                   }}
//                   headStyle={{
//                     background: 'transparent',
//                     borderBottom: '2px solid #f0f0f0'
//                   }}
//                 >
//                   <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//                     <div style={{
//                       background: '#f8f9fa',
//                       padding: '16px',
//                       borderRadius: '12px',
//                       textAlign: 'center'
//                     }}>
//                       <MailOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
//                       <div>
//                         <Text strong>อีเมล</Text>
//                         <br />
//                         <Text copyable style={{ color: '#666' }}>support@sutcareer.com</Text>
//                       </div>
//                     </div>
                    
//                     <div style={{
//                       background: '#f8f9fa',
//                       padding: '16px',
//                       borderRadius: '12px',
//                       textAlign: 'center'
//                     }}>
//                       <PhoneOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
//                       <div>
//                         <Text strong>โทรศัพท์</Text>
//                         <br />
//                         <Text copyable style={{ color: '#666' }}>02-123-4567</Text>
//                       </div>
//                     </div>

//                     <div style={{
//                       background: '#f8f9fa',
//                       padding: '16px',
//                       borderRadius: '12px',
//                       textAlign: 'center'
//                     }}>
//                       <ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
//                       <div>
//                         <Text strong>เวลาทำการ</Text>
//                         <br />
//                         <Text style={{ color: '#666' }}>จันทร์-ศุกร์ 9:00-17:00</Text>
//                       </div>
//                     </div>
//                   </Space>
//                 </Card>

//                 {/* User Tickets Status */}
//                 {user && userTickets.length > 0 && (
//                   <Card
//                     title={
//                       <Space>
//                         <MessageOutlined style={{ color: '#1890ff' }} />
//                         <span>คำร้องของคุณ</span>
//                         <Badge count={userTickets.length} style={{ backgroundColor: '#faad14' }} />
//                       </Space>
//                     }
//                     style={{
//                       borderRadius: '20px',
//                       border: 'none',
//                       background: 'rgba(255, 255, 255, 0.95)',
//                       backdropFilter: 'blur(20px)',
//                       boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
//                     }}
//                     headStyle={{
//                       background: 'transparent',
//                       borderBottom: '2px solid #f0f0f0'
//                     }}
//                   >
//                     {ticketsLoading ? (
//                       <Spin />
//                     ) : (
//                       <List
//                         dataSource={userTickets}
//                         renderItem={ticket => (
//                           <List.Item
//                             style={{
//                               background: '#f8f9fa',
//                               borderRadius: '12px',
//                               padding: '16px',
//                               marginBottom: '12px',
//                               border: 'none',
//                               cursor: 'pointer'
//                             }}
//                             onClick={() => showTicketDetail(ticket)}
//                           >
//                             <div style={{ width: '100%' }}>
//                               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
//                                 <Text strong style={{ color: '#333' }}>
//                                   {ticket.subject}
//                                 </Text>
//                                 <Tag 
//                                   color={getStatusColor(ticket.status)}
//                                   icon={getStatusIcon(ticket.status)}
//                                   style={{ borderRadius: '12px' }}
//                                 >
//                                   {getStatusText(ticket.status)}
//                                 </Tag>
//                               </div>
//                               <Text type="secondary" style={{ fontSize: '12px' }}>
//                                 ส่งเมื่อ: {formatTime(ticket.CreatedAt)}
//                               </Text>
//                             </div>
//                           </List.Item>
//                         )}
//                       />
//                     )}
//                   </Card>
//                 )}

//                 {/* Help Steps */}
//                 <Card
//                   title={
//                     <Space>
//                       <RocketOutlined style={{ color: '#722ed1' }} />
//                       <span>วิธีการใช้งาน</span>
//                     </Space>
//                   }
//                   style={{
//                     borderRadius: '20px',
//                     border: 'none',
//                     background: 'rgba(255, 255, 255, 0.95)',
//                     backdropFilter: 'blur(20px)',
//                     boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
//                   }}
//                   headStyle={{
//                     background: 'transparent',
//                     borderBottom: '2px solid #f0f0f0'
//                   }}
//                 >
//                   <Steps direction="vertical" size="small">
//                     <Step
//                       status="finish"
//                       title="ค้นหาคำตอบ"
//                       description="เริ่มจากการค้นหาใน FAQ"
//                       icon={<SearchOutlined />}
//                     />
//                     <Step
//                       status="finish"
//                       title="ส่งคำร้อง"
//                       description="หากไม่พบคำตอบ ส่งคำร้องมาหาเรา"
//                       icon={<MessageOutlined />}
//                     />
//                     <Step
//                       status="finish"
//                       title="ติดตามสถานะ"
//                       description="ตรวจสอบความคืบหน้าได้ที่นี่"
//                       icon={<ClockCircleOutlined />}
//                     />
//                     <Step
//                       status="wait"
//                       title="รับคำตอบ"
//                       description="เราจะติดต่อกลับโดยเร็วที่สุด"
//                       icon={<CheckCircleOutlined />}
//                     />
//                   </Steps>
//                 </Card>
//               </Space>
//             </Col>
//           </Row>

//           {/* Request Modal */}
//           <Modal
//             title={null}
//             open={isRequestModalVisible}
//             onCancel={() => setIsRequestModalVisible(false)}
//             footer={null}
//             width={600}
//             centered
//             style={{ borderRadius: '20px' }}
//           >
//             <div style={{
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               padding: '24px',
//               borderRadius: '20px 20px 0 0',
//               marginTop: '-24px',
//               marginX: '-24px',
//               marginBottom: '24px',
//               textAlign: 'center',
//               color: 'white'
//             }}>
//               <MessageOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
//               <Title level={3} style={{ color: 'white', margin: 0 }}>
//                 ส่งคำร้องใหม่
//               </Title>
//               <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
//                 กรุณากรอกรายละเอียดคำร้องของคุณ
//               </Text>
//             </div>

//             <Form
//               form={form}
//               onFinish={handleSubmitRequest}
//               layout="vertical"
//               style={{ padding: '0 24px 24px' }}
//             >
//               <Form.Item
//                 name="subject"
//                 label="หัวข้อเรื่อง"
//                 rules={[{ required: true, message: 'กรุณากรอกหัวข้อเรื่อง' }]}
//               >
//                 <Input 
//                   placeholder="ระบุหัวข้อเรื่องที่ต้องการสอบถาม"
//                   style={{ borderRadius: '8px' }}
//                 />
//               </Form.Item>

//               <Form.Item
//                 name="message"
//                 label="รายละเอียด"
//                 rules={[{ required: true, message: 'กรุณากรอกรายละเอียด' }]}
//               >
//                 <TextArea
//                   rows={6}
//                   placeholder="กรุณาอธิบายปัญหาหรือคำถามของคุณให้ละเอียดที่สุด..."
//                   style={{ borderRadius: '8px' }}
//                 />
//               </Form.Item>

//               <div style={{ textAlign: 'center', marginTop: '24px' }}>
//                 <Space size="middle">
//                   <Button
//                     size="large"
//                     onClick={() => setIsRequestModalVisible(false)}
//                     style={{ borderRadius: '8px', minWidth: '100px' }}
//                   >
//                     ยกเลิก
//                   </Button>
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     loading={loading}
//                     icon={<SendOutlined />}
//                     size="large"
//                     style={{
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       border: 'none',
//                       borderRadius: '8px',
//                       minWidth: '120px'
//                     }}
//                   >
//                     ส่งคำร้อง
//                   </Button>
//                 </Space>
//               </div>
//             </Form>
//           </Modal>

//           {/* Detail Modal */}
//           <Modal
//             title={null}
//             open={isDetailModalVisible}
//             onCancel={() => setIsDetailModalVisible(false)}
//             footer={null}
//             width={700}
//             centered
//             style={{ borderRadius: '20px' }}
//           >
//             {selectedTicket && (
//               <div>
//                 {/* Modal Header */}
//                 <div style={{
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                   padding: '24px',
//                   borderRadius: '20px 20px 0 0',
//                   marginTop: '-24px',
//                   marginX: '-24px',
//                   marginBottom: '24px',
//                   textAlign: 'center',
//                   color: 'white'
//                 }}>
//                   <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
//                     รายละเอียดคำร้อง
//                   </Title>
//                   <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
//                     {selectedTicket.subject}
//                   </Text>
//                   <div style={{ marginTop: '12px' }}>
//                     <Tag 
//                       color="rgba(255, 255, 255, 0.9)"
//                       style={{ 
//                         color: '#333',
//                         fontWeight: '600',
//                         borderRadius: '20px',
//                         padding: '4px 12px',
//                         border: 'none'
//                       }}
//                     >
//                       {getStatusText(selectedTicket.status)}
//                     </Tag>
//                   </div>
//                 </div>

//                 {/* Modal Content */}
//                 <div style={{ padding: '0 24px 24px' }}>
//                   {/* Initial Message */}
//                   <div style={{ marginBottom: '24px' }}>
//                     <Title level={5} style={{ color: '#333', marginBottom: '12px' }}>
//                       💭 ข้อความเริ่มต้น
//                     </Title>
//                     <div style={{ 
//                       background: '#f8f9fa', 
//                       padding: '16px', 
//                       borderRadius: '12px',
//                       border: '1px solid #e9ecef'
//                     }}>
//                       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//                         <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
//                         <Text strong>{selectedTicket.User?.username || 'ผู้ใช้'}</Text>
//                         <Text type="secondary" style={{ marginLeft: 'auto', fontSize: '12px' }}>
//                           {formatTime(selectedTicket.CreatedAt)}
//                         </Text>
//                       </div>
//                       <Paragraph style={{ 
//                         margin: 0,
//                         fontSize: '15px',
//                         lineHeight: '1.6',
//                         color: '#555'
//                       }}>
//                         {selectedTicket.initial_message}
//                       </Paragraph>
//                     </div>
//                   </div>

//                   {/* Conversation History */}
//                   {selectedTicket.replies && selectedTicket.replies.length > 0 && (
//                     <div style={{ marginBottom: '24px' }}>
//                       <Title level={5} style={{ color: '#333', marginBottom: '12px' }}>
//                         💬 ประวัติการสนทนา
//                       </Title>
//                       <div style={{
//                         maxHeight: '300px',
//                         overflowY: 'auto',
//                         padding: '8px',
//                         background: '#f8f9fa',
//                         borderRadius: '12px'
//                       }}>
//                         {selectedTicket.replies.map((reply: any, index: number) => (
//                           <div key={reply.ID || index} style={{
//                             background: reply.is_staff_reply ? '#e6f7ff' : '#f6ffed',
//                             border: `1px solid ${reply.is_staff_reply ? '#91d5ff' : '#b7eb8f'}`,
//                             borderRadius: '8px',
//                             padding: '12px',
//                             marginBottom: '8px'
//                           }}>
//                             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//                               <UserOutlined style={{ marginRight: '8px', color: reply.is_staff_reply ? '#1890ff' : '#52c41a' }} />
//                               <Text strong>{reply.Author?.username || 'ไม่ระบุ'}</Text>
//                               {reply.is_staff_reply && (
//                                 <Tag color="blue" size="small" style={{ marginLeft: '8px' }}>
//                                   เจ้าหน้าที่
//                                 </Tag>
//                               )}
//                               <Text type="secondary" style={{ marginLeft: 'auto', fontSize: '11px' }}>
//                                 {formatTime(reply.CreatedAt)}
//                               </Text>
//                             </div>
//                             <Text style={{ fontSize: '14px' }}>
//                               {reply.message}
//                             </Text>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Reply Section */}
//                   {selectedTicket.status === 'Open' || selectedTicket.status === 'In Progress' ? (
//                     <div>
//                       <Title level={5} style={{ color: '#333', marginBottom: '12px' }}>
//                         ✉️ ตอบกลับ
//                       </Title>
//                       <TextArea
//                         rows={4}
//                         value={replyMessage}
//                         onChange={(e) => setReplyMessage(e.target.value)}
//                         placeholder="พิมพ์ข้อความตอบกลับของคุณ..."
//                         style={{ marginBottom: '12px' }}
//                       />
//                       <div style={{ textAlign: 'right' }}>
//                         <Button
//                           type="primary"
//                           icon={<SendOutlined />}
//                           loading={replyLoading}
//                           onClick={handleSendReply}
//                           style={{
//                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                             border: 'none',
//                             borderRadius: '8px'
//                           }}
//                         >
//                           ส่งข้อความ
//                         </Button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div style={{
//                       textAlign: 'center',
//                       padding: '20px',
//                       background: '#f0f0f0',
//                       borderRadius: '12px'
//                     }}>
//                       <Text type="secondary">
//                         คำร้องนี้ได้ {getStatusText(selectedTicket.status)} แล้ว
//                       </Text>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </Modal>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HelpCenterPage;
// src/pages/HelpCenter/HelpCenterPage.tsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Input, Typography, Button, Tabs, List, Tag, message, Spin, Collapse, Modal, Descriptions, Card, Divider, Alert, Space } from 'antd';
// import type { CollapseProps, TabsProps } from 'antd';
// import { QuestionCircleOutlined, SendOutlined, FileTextOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
// import type { FAQ, RequestTicket } from '../../types';
// import './HelpCenterPage.css';

// const { Title, Paragraph, Text } = Typography;
// const { TextArea } = Input;

// const API_URL = 'http://localhost:8080/api';

// const HelpCenterPage: React.FC = () => {
//   const [faqs, setFaqs] = useState([]);
//   const [loadingFaqs, setLoadingFaqs] = useState(true);
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [myRequests, setMyRequests] = useState([]);
//   const [loadingRequests, setLoadingRequests] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [loadingModal, setLoadingModal] = useState(false);
//   const [replyMessage, setReplyMessage] = useState('');

//   const fetchFaqs = async () => {
//     setLoadingFaqs(true);
//     try {
//       const response = await fetch(`${API_URL}/faqs`);
//       if (!response.ok) throw new Error('Failed to fetch FAQs');
//       const data: FAQ[] = await response.json();
//       setFaqs(data);
//     } catch (error) {
//       console.error("Failed to fetch FAQs:", error);
//       message.error('ไม่สามารถดึงข้อมูล FAQ ได้');
//     } finally {
//       setLoadingFaqs(false);
//     }
//   };

//   useEffect(() => {
//     fetchFaqs();
//   }, []);

//   const filteredFaqs = useMemo(() => {
//     if (!searchTerm) {
//       return faqs;
//     }
//     return faqs.filter(faq =>
//       faq.title.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [searchTerm, faqs]);

//   const fetchMyRequests = async () => {
//     setLoadingRequests(true);
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         message.error('กรุณาเข้าสู่ระบบเพื่อดูคำร้องของคุณ');
//         setLoadingRequests(false);
//         return;
//       }

//       // URL นี้ถูกต้องแล้ว เพราะเราเพิ่งสร้างใน Backend
//       const response = await fetch(`${API_URL}/tickets`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       if (!response.ok) throw new Error('Failed to fetch user requests');
//       const data: RequestTicket[] = await response.json();
//       const sortedData = data.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
//       setMyRequests(sortedData);
//     } catch (error) {
//       console.error(error);
//       message.error("ไม่สามารถดึงข้อมูลคำร้องของคุณได้");
//     } finally {
//       setLoadingRequests(false);
//     }
//   };

//   const handleTabClick = (key: string) => {
//     if (key === '2') {
//       fetchMyRequests();
//     }
//   };

//   // ... โค้ดส่วนที่เหลือของไฟล์เหมือนเดิมทุกประการ ...

//   const getStatusColor = (status: RequestTicket['status']) => {
//     switch (status) {
//       case 'Open': return 'orange';
//       case 'In Progress': return 'processing';
//       case 'Awaiting Confirmation': return 'blue';
//       case 'Resolved': return 'green';
//       default: return 'default';
//     }
//   };

//   const getStatusText = (status: RequestTicket['status']) => {
//     switch (status) {
//       case 'Open': return 'รอการตอบกลับ';
//       case 'In Progress': return 'กำลังดำเนินการ';
//       case 'Awaiting Confirmation': return 'รอยืนยัน';
//       case 'Resolved': return 'แก้ไขแล้ว';
//       default: return 'ไม่ทราบสถานะ';
//     }
//   };

//   const handleRequestClick = async (request: RequestTicket) => {
//     setLoadingModal(true);
//     setIsModalVisible(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_URL}/tickets/${request.ID}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (!response.ok) throw new Error('Failed to fetch ticket details');
//       const data: RequestTicket = await response.json();
//       setSelectedTicket(data);
//     } catch (error) {
//       message.error("ไม่สามารถโหลดรายละเอียดคำร้องได้");
//       setIsModalVisible(false);
//     } finally {
//       setLoadingModal(false);
//     }
//   };

//   const handleCancelModal = () => {
//     setIsModalVisible(false);
//     setSelectedTicket(null);
//   };

//   const handleSendReply = async () => {
//     if (!replyMessage.trim() || !selectedTicket) {
//       message.error('กรุณาพิมพ์ข้อความตอบกลับ');
//       return;
//     }
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_URL}/tickets/${selectedTicket.ID}/replies`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ message: replyMessage, is_staff_reply: false }),
//       });
//       if (!response.ok) throw new Error((await response.json()).error || 'Failed to send reply');
//       message.success(`ส่งข้อความตอบกลับสำเร็จ!`);
//       setReplyMessage('');

//       const updatedTicketResponse = await fetch(`${API_URL}/tickets/${selectedTicket.ID}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (!updatedTicketResponse.ok) throw new Error('Failed to re-fetch ticket details');
//       const updatedTicketData = await updatedTicketResponse.json();
//       setSelectedTicket(updatedTicketData);
//     } catch (error) {
//       console.error('Error sending reply:', error);
//       message.error('เกิดข้อผิดพลาดในการส่งข้อความตอบกลับ');
//     }
//   };

//   const handleUpdateStatus = async (status: RequestTicket['status']) => {
//     if (!selectedTicket) return;
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_URL}/admin/tickets/${selectedTicket.ID}/status`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ status }),
//       });
//       if (!response.ok) throw new Error('Failed to update status');
//       message.success(`อัปเดตสถานะคำร้องสำเร็จ`);
//       fetchMyRequests(); // Re-fetch list to update tag
//       const updatedTicketData = await response.json();
//       setSelectedTicket(updatedTicketData);
//       if (status === 'Resolved') {
//         setIsModalVisible(false);
//       }
//     } catch (error) {
//       message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
//     }
//   };

//   const formatTime = (ts?: string) => ts ? new Date(ts).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '';

//   const faqItems: CollapseProps['items'] = filteredFaqs.map(q => ({
//     key: q.ID,
//     label: <span style={{ fontWeight: '600' }}>{q.title}</span>,
//     children: <div>{q.content || 'ยังไม่มีคำตอบ'}</div>,
//   }));

//   const tabItems: TabsProps['items'] = [
//     {
//       key: '1',
//       label: (
//         <span>
//           <QuestionCircleOutlined />
//           คำถามที่พบบ่อย
//         </span>
//       ),
//       children: loadingFaqs ? (
//         <div style={{ textAlign: 'center', padding: '40px' }}>
//           <Spin size="large" />
//         </div>
//       ) : filteredFaqs.length > 0 ? (
//         <Collapse
//           className="faq-collapse"
//           expandIcon={({ isActive }) => <PlusOutlined rotate={isActive ? 45 : 0} />}
//           items={faqItems}
//         />
//       ) : (
//         <div style={{ textAlign: 'center', padding: '40px' }}>
//           <Text style={{ fontSize: '16px', color: '#666' }}>
//             ไม่พบคำถามที่ตรงกับคำค้นหาของคุณ
//           </Text>
//         </div>
//       ),
//     },
//     {
//       key: '2',
//       label: (
//         <span>
//           <FileTextOutlined />
//           คำร้องของฉัน
//         </span>
//       ),
//       children: loadingRequests ? (
//         <div style={{ textAlign: 'center', padding: '40px' }}>
//           <Spin size="large" />
//         </div>
//       ) : (
//         <List
//           dataSource={myRequests}
//           renderItem={(item: RequestTicket) => (
//             <List.Item
//               onClick={() => handleRequestClick(item)}
//               actions={[
//                 <Tag 
//                   color={getStatusColor(item.status)}
//                   key="status"
//                 >
//                   {getStatusText(item.status)}
//                 </Tag>
//               ]}
//               style={{ cursor: 'pointer' }}
//             >
//               <List.Item.Meta
//                 title={
//                   <span style={{ color: '#1890ff', fontWeight: '500' }}>
//                     {item.subject}
//                   </span>
//                 }
//                 description={`ส่งเมื่อ: ${formatTime(item.CreatedAt)}`}
//               />
//             </List.Item>
//           )}
//           locale={{ emptyText: "คุณยังไม่มีคำร้องที่เคยส่ง" }}
//         />
//       ),
//     },
//   ];

//   return (
//     <>
//       <div className="help-center-wrapper">
//         <div className="new-request-button-container">
//           <Button
//             type="primary"
//             icon={<SendOutlined />}
//             size="large"
//             onClick={() => navigate('/help/ask')}
//           >
//             ส่งคำร้องใหม่
//           </Button>
//         </div>

//         <div className="help-center-container">
//           <div className="help-center-header">
//             <Title level={1} style={{ color: '#1d39c4', marginBottom: '16px' }}>
//               <QuestionCircleOutlined style={{ marginRight: '12px' }} />
//               ศูนย์ช่วยเหลือ
//             </Title>
//             <Paragraph style={{ fontSize: '18px', margin: 0 }}>
//               เราพร้อมช่วยเหลือคุณเสมอ! ค้นหาคำตอบจากคำถามที่พบบ่อย หรือส่งคำร้องหาเราโดยตรง
//             </Paragraph>
//           </div>

//           <div className="help-center-search">
//             <Input.Search
//               placeholder="🔍 ค้นหาคำถาม FAQ..."
//               allowClear
//               enterButton="ค้นหา"
//               size="large"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               onSearch={(value) => setSearchTerm(value)}
//             />
//           </div>

//           <div className="help-center-tabs">
//             <Tabs 
//               defaultActiveKey="1" 
//               items={tabItems}
//               onTabClick={handleTabClick}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Modal รายละเอียดคำร้อง */}
//       <Modal
//         title="รายละเอียดคำร้อง"
//         open={isModalVisible}
//         onCancel={handleCancelModal}
//         footer={null}
//         width={700}
//         style={{ top: 20 }}
//         className="comment-modal"
//       >
//         {loadingModal || !selectedTicket ? (
//           <div style={{ textAlign: 'center', padding: '40px' }}>
//             <Spin size="large" />
//           </div>
//         ) : (
//           <>
//             {/* แสดงสถานะพิเศษ */}
//             {selectedTicket.status === 'Awaiting Confirmation' && (
//               <Alert
//                 message="คำร้องกำลังรอการยืนยันจากคุณ"
//                 description="กรุณาตรวจสอบการแก้ไขและยืนยันหรือขอความช่วยเหลือเพิ่มเติม"
//                 type="info"
//                 showIcon
//                 style={{ marginBottom: '16px' }}
//                 action={
//                   <Space>
//                     <Button size="small" type="text" onClick={() => handleUpdateStatus('Resolved')}>
//                       ปิดคำร้อง
//                     </Button>
//                     <Button size="small" type="primary" ghost onClick={() => handleUpdateStatus('In Progress')}>
//                       ยังต้องการความช่วยเหลือ
//                     </Button>
//                   </Space>
//                 }
//               />
//             )}

//             {/* ข้อมูลคำร้อง */}
//             <Descriptions bordered column={2} style={{ marginBottom: '20px' }}>
//               <Descriptions.Item label="หัวข้อ" span={2}>
//                 {selectedTicket.subject}
//               </Descriptions.Item>
//               <Descriptions.Item label="ผู้ส่ง">
//                 {selectedTicket.user?.username || 'N/A'}
//               </Descriptions.Item>
//               <Descriptions.Item label="สถานะ">
//                 <Tag color={getStatusColor(selectedTicket.status)}>
//                   {getStatusText(selectedTicket.status)}
//                 </Tag>
//               </Descriptions.Item>
//               <Descriptions.Item label="วันที่ส่ง" span={2}>
//                 {formatTime(selectedTicket.CreatedAt)}
//               </Descriptions.Item>
//             </Descriptions>

//             {/* ข้อความเริ่มต้น */}
//             <Title level={5}>ข้อความเริ่มต้น</Title>
//             <div className="initial-message-box">
//               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//                 <span style={{ fontWeight: 'bold' }}>
//                   {selectedTicket.user?.username || 'Unknown'}
//                 </span>
//                 <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
//                   {formatTime(selectedTicket.CreatedAt)}
//                 </span>
//               </div>
//               <div>{selectedTicket.initial_message}</div>
//             </div>

//             <Divider />

//             {/* ประวัติการสนทนา */}
//             <Title level={5}>ประวัติการสนทนา</Title>
//             <div className="conversation-history">
//               {(selectedTicket.replies || []).map((reply: any) => (
//                 <div 
//                   key={reply.ID}
//                   className={`history-entry ${reply.is_staff_reply ? 'staff-reply' : 'user-reply'}`}
//                 >
//                   <div className="entry-header">
//                     <span style={{ fontWeight: 'bold' }}>
//                       {reply.author?.username || 'Unknown'}
//                     </span>
//                     {reply.is_staff_reply && (
//                       <Tag color="blue" size="small" style={{ marginLeft: '8px' }}>
//                         เจ้าหน้าที่
//                       </Tag>
//                     )}
//                     <span className="entry-timestamp">
//                       {formatTime(reply.CreatedAt)}
//                     </span>
//                   </div>
//                   <div className="entry-body">
//                     {reply.message}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* ส่วนตอบกลับ */}
//             <div className="reply-section">
//               <Title level={5}>ตอบกลับ</Title>
//               <TextArea
//                 rows={4}
//                 value={replyMessage}
//                 onChange={(e) => setReplyMessage(e.target.value)}
//                 placeholder="พิมพ์ข้อความตอบกลับของคุณ..."
//                 disabled={selectedTicket.status !== 'Open' && selectedTicket.status !== 'In Progress'}
//               />
//               <div style={{ marginTop: '12px', textAlign: 'right' }}>
//                 <Button
//                   type="primary"
//                   icon={<SendOutlined />}
//                   onClick={handleSendReply}
//                 >
//                   ส่งข้อความ
//                 </Button>
//               </div>
//             </div>
//           </>
//         )}
//       </Modal>
//     </>
//   );
// };

// export default HelpCenterPage;
// src/pages/HelpCenter/HelpCenterPage.tsx
// src/pages/HelpCenter/HelpCenterPage.tsx
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
  Image,
  Upload, // 1. Import Upload component
} from 'antd';
import type { CollapseProps, TabsProps, TableColumnsType, UploadProps, UploadFile } from 'antd'; // 2. Import Upload types
import {
  QuestionCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  PlusOutlined,
  MinusOutlined,
  EyeOutlined,
  FileSearchOutlined,
  PaperClipOutlined,
  UploadOutlined, // 3. Import UploadOutlined icon
} from '@ant-design/icons';
import type { FAQ, RequestTicket, TicketAttachment } from '../../interfaces/helpcenter';
import { qnaAPI } from '../../services/https/index';
import './HelpCenterPage.css';

const { Title, Paragraph, Text, Link } = Typography;
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
  
  // 4. State for reply attachments
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
      // ✅ แก้ไข: จัดการกับการเข้าถึงข้อมูลให้ปลอดภัยและถูกต้อง
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
      setFaqs([]); // Ensure faqs is an array on error
    } finally {
      setLoadingFaqs(false);
    }
  };
  

  useEffect(() => {
    fetchFaqs();
  }, []);

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

  // 5. Upload properties for reply attachments
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
    children: <Text>{q.content || 'ยังไม่มีคำตอบ'}</Text>,
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
          onClick={() => navigate('/help/ask')}
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
                
                {/* 6. Add Upload component to the reply section */}
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

