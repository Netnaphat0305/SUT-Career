import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, message, List, Avatar, Form, Input, Button, Empty, Image } from 'antd';
import { UserOutlined, ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { qnaAPI } from '../../services/https/index';
import type { FAQ, FAQComment } from '../../interfaces/helpcenter';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import { useAuth } from '../../context/AuthContext'; // 1. Import useAuth

dayjs.extend(relativeTime);
dayjs.locale('th');


const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const FaqDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // 2. Get authentication status
    const [faq, setFaq] = useState<FAQ | null>(null);
    const [comments, setComments] = useState<FAQComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        if (!id) return;

        const fetchFaqData = async () => {
            try {
                setLoading(true);
                const [faqRes, commentsRes] = await Promise.all([
                    qnaAPI.getFaqById(id),
                    qnaAPI.getFaqComments(id)
                ]);

                setFaq(faqRes.data.data);
                setComments(commentsRes.data.data || []);

            } catch (error) {
                message.error('ไม่สามารถโหลดข้อมูล FAQ ได้');
            } finally {
                setLoading(false);
            }
        };

        fetchFaqData();
    }, [id]);

    const handleSendComment = async (values: { content: string }) => {
        if (!id) return;
        try {
            const response = await qnaAPI.createFaqComment(id, values);
            if (response.data.data) {
                setComments(prev => [...prev, response.data.data]);
                form.resetFields();
                message.success('ส่งความคิดเห็นสำเร็จ');
            }
        } catch (error: any) {
            message.error(error.response?.data?.error || 'ไม่สามารถส่งความคิดเห็นได้');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!faq) {
        return <Empty description="ไม่พบ FAQ ที่คุณต้องการ" />;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '24px auto' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/help')} style={{ marginBottom: '16px' }}>
                กลับไปหน้าศูนย์ช่วยเหลือ
            </Button>
            <Card>
                <Title level={2}>{faq.title}</Title>
                 {faq.image_url && (
                    <div style={{ margin: '16px 0', textAlign: 'center' }}>
                        <Image 
                            width={300} 
                            src={faq.image_url} 
                            alt={faq.title} 
                            style={{ borderRadius: 8 }}
                        />
                    </div>
                )}
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{faq.content}</Paragraph>
            </Card>

            {faq.comments_enabled ? (
                <Card title="ความคิดเห็น" style={{ marginTop: '24px' }}>
                    <List
                        dataSource={comments}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined />} />}
                                    title={<Text strong>{item.author?.username || 'ผู้ใช้'}</Text>}
                                    description={
                                        <>
                                            <Paragraph>{item.content}</Paragraph>
                                            <Text type="secondary">{dayjs(item.CreatedAt).fromNow()}</Text>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: "ยังไม่มีความคิดเห็น" }}
                    />
                    
                    {/* 3. Check authentication before showing the form */}
                    {isAuthenticated ? (
                        <Form form={form} onFinish={handleSendComment} layout="inline" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                            <Form.Item name="content" style={{ flex: 1 }} rules={[{ required: true, message: 'กรุณาพิมพ์ข้อความ' }]}>
                                <TextArea rows={2} placeholder="แสดงความคิดเห็นของคุณ..." />
                            </Form.Item>
                            <Form.Item>
                                <Button htmlType="submit" type="primary" icon={<SendOutlined />}>ส่ง</Button>
                            </Form.Item>
                        </Form>
                    ) : (
                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                            <Text type="secondary">กรุณา <a onClick={() => navigate('/login')}>เข้าสู่ระบบ</a> เพื่อแสดงความคิดเห็น</Text>
                        </div>
                    )}
                </Card>
            ) : (
                <Card style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Text type="secondary">FAQ นี้ปิดการแสดงความคิดเห็น</Text>
                </Card>
            )}
        </div>
    );
};

export default FaqDetailPage;

