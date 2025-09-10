import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Result, Typography, Card, Tag, Descriptions, Button, Flex } from "antd";
import { reviewAPI } from "../../services/https";
import type { Review } from "../../interfaces/review";
import './review.css';

const { Title, Text, Paragraph } = Typography;

const ReviewDetailPage: React.FC = () => {
  useEffect(() => {
      document.body.classList.add("kanit-font");
      return () => document.body.classList.remove("kanit-font");
    }, []);

  const { id } = useParams<{ id: string }>();

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    if (!id) {
      setError("ไม่พบ ID ของรีวิวใน URL");
      setLoading(false);
      return;
    }

    const fetchReview = async () => {
      try {
        setLoading(true);
        const response = await reviewAPI.getById(id);
        const reviewData = response?.data;

        if (reviewData) {
          setReview(reviewData);
        } else {
          setError(`ไม่พบข้อมูลรีวิวสำหรับ ID: ${id}`);
        }
      } catch (err: any) {
        console.error("Failed to fetch review:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Result status="error" title="เกิดข้อผิดพลาด" subTitle={error} />;
  }

  if (!review) {
    return <Result status="warning" title="ไม่พบข้อมูลรีวิว" />;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "auto", minHeight: '85vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ justifySelf: "start" }}>
          <Button onClick={() => navigate("/my-jobs")}>ย้อนกลับ</Button>
        </div>
        <Title
          level={2}
          style={{
            margin: 0,
            textAlign: "center",
            justifySelf: "center",
            color: "#1E3A5F",
            whiteSpace: 'nowrap'
          }}
        >
          รายละเอียดรีวิว #{review.ID}
        </Title>
      </div>
      <Card>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="คอมเมนต์">
            <Paragraph>
              {review.comment || <Text type="secondary">ไม่มีคอมเมนต์</Text>}
            </Paragraph>
          </Descriptions.Item>

          <Descriptions.Item label="คะแนน">
            <Tag color="blue">{review.ratingscore_id}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="ชื่องาน">
            <Text>
              {review?.jobpost?.title || (
                <Text type="secondary">ไม่มีข้อมูลชื่องาน</Text>
              )}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item label="วันที่รีวิว">
            {new Date(review.datetime).toLocaleString("th-TH")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ReviewDetailPage;
