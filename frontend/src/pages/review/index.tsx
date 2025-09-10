// src/pages/review/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Card,
  Rate,
  Input,
  Button,
  Space,
  Flex,
  Modal,
  Result,
  message,
  Spin,
  List,
  Tag,
  Empty,
} from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { reviewAPI } from "../../services/https";
import type { CreateReviewPayload } from "../../interfaces/review";
import { parseToDate, toTHDateTime } from "../../utils/index";
import "./review.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const asData = <T,>(r: any): T => (r?.data?.data ?? r?.data ?? r) as T;

type ReviewItem = {
  ID?: number;
  id?: number;
  comment?: string;
  datetime?: string | Date | null;
  ratingscore_id?: number;
  ratingscore?: { rating_score_name?: string };
  student?: { first_name?: string; last_name?: string };
};

const ReviewPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("kanit-font");
    return () => document.body.classList.remove("kanit-font");
  }, []);

  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState<number>(5);
  const tips = ["แย่ที่สุด", "พอใช้", "ปานกลาง", "ดี", "ดีเยี่ยม"];
  const [comment, setComment] = useState<string>("");

  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!jobId) {
      message.error("ไม่พบรหัสงาน");
      navigate("/my-jobs");
      return;
    }

    let cancel = false;

    (async () => {
      try {
        setLoading(true);

        const res = await reviewAPI.getForJob(Number(jobId));
        const rows = asData<ReviewItem[]>(res);

        if (!cancel) {
          setReviews(rows);
          const reviewed = rows.length > 0;
          setAlreadyReviewed(reviewed);

          if (reviewed) {
            Modal.warning({
              title: "คุณได้รีวิวงานนี้แล้ว",
              content: "ระบบจะปิดการแก้ไขและส่งซ้ำให้โดยอัตโนมัติ",
              centered: true,
            });
          }
        }
      } catch (e: any) {
        if (!cancel) {
          message.error(e?.response?.data?.error || "โหลดรีวิวไม่สำเร็จ");
          setReviews([]);
          setAlreadyReviewed(false);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [jobId, navigate]);

  const onSubmit = async () => {
    if (!jobId) {
      message.error("ไม่พบรหัสงาน");
      navigate("/profile");
      return;
    }

    const raw = localStorage.getItem("profile");
    let employerId: number | undefined;
    try {
      const p = raw ? JSON.parse(raw) : null;
      employerId = Number(p?.ID ?? p?.id ?? p?.employer_id);
    } catch {
      /* ignore */
    }

    if (!employerId || Number.isNaN(employerId)) {
      message.error("ไม่พบรหัสนายจ้าง (employer_id) กรุณาล็อกอินใหม่");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateReviewPayload = {
        jobpost_id: Number(jobId),
        ratingscore_id: Number(rating),
        comment: (comment || "").trim(),
        employer_id: employerId,
        datetime: new Date(),
      };

      const createdRes = await reviewAPI.create(payload);
      const created = asData<ReviewItem>(createdRes);

      setAlreadyReviewed(true);
      setReviews((prev) => (created ? [created, ...prev] : prev));
      setSuccessOpen(true);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "ส่งรีวิวไม่สำเร็จ";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setSuccessOpen(false);
    navigate("/my-jobs");
  };

  const scoreTag = (id?: number) => {
    const color =
      id === 5
        ? "green"
        : id === 4
        ? "blue"
        : id === 3
        ? "gold"
        : id === 2
        ? "orange"
        : "red";
    return <Tag color={color}>{`คะแนน ${id ?? "-"}`}</Tag>;
  };

  const listData = useMemo(
    () =>
      reviews.map((r) => ({
        key: String(r.ID ?? r.id ?? Math.random()),
        title: scoreTag(r.ratingscore_id) || "-",
        description: r.comment || "-",
        datetime: toTHDateTime(r.datetime, "-"),
        by: r.student ? `${r.student.first_name ?? ""} ${r.student.last_name ?? ""}`.trim() : "",
      })),
    [reviews]
  );

  if (loading) {
    return (
      <div
        className="review-page-container"
        style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <div className="review-page-container" style={{ background: "#fff", padding: 24, minHeight: "85vh" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 24, color: "#1E3A5F" }}>
        รายการรีวิว
      </Title>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Flex style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ fontSize: 18, color: "#1E3A5F" }}>
            รหัสงาน : {jobId ?? "-"}
          </Text>
        </Flex>

        {/* ฟอร์มให้คะแนน/คอมเมนต์ */}
        <Card style={{ marginBottom: 24 }}>
          <Flex vertical align="center" gap="middle">
            <Text strong style={{ fontSize: 18, color: "#1E3A5F" }}>
              ให้คะแนนการทำงานกับนักศึกษาที่คุณจ้าง
            </Text>
            <Rate value={rating} onChange={setRating} tooltips={tips} style={{ fontSize: 44, color: "#1890ff" }} />
            <Flex justify="space-between" style={{ width: "45%", color: "#1E3A5F" }}>
              <Text type="secondary">แย่ที่สุด</Text>
              <Text type="secondary">ยอดเยี่ยมที่สุด</Text>
            </Flex>
          </Flex>
        </Card>

        <Card styles={{ body: { paddingTop: 0 } }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Flex vertical align="center" gap="middle">
              <Text strong style={{ fontSize: 18, color: "#1E3A5F" }}>
                บอกเล่าประสบการณ์ที่คุณได้รับกับเรา
              </Text>
            </Flex>
            <TextArea
              rows={8}
              placeholder="พิมพ์ข้อความรีวิวของคุณที่นี่..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ fontSize: 16, backgroundColor: "#E4F2FD" }}
              disabled={alreadyReviewed}
            />
          </Space>
        </Card>

        <Flex justify="center" style={{ marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            className="review-section middle-width-button"
            onClick={onSubmit}
            loading={submitting}
            disabled={alreadyReviewed}
          >
            {alreadyReviewed ? "รีวิวแล้ว" : "ส่งรีวิว"}
          </Button>
        </Flex>
      </div>

      <Modal
        open={successOpen}
        footer={null}
        centered
        closable
        onCancel={closeModal}
        maskClosable={false}
        zIndex={10000}
        getContainer={document.body}
      >
        <Result
          status="success"
          icon={<CheckCircleFilled style={{ color: "#52c41a" }} />}
          title={<span style={{ fontSize: 24 }}>รีวิวถูกส่งแล้ว</span>}
          subTitle={
            <>
              <div>ขอบคุณที่สละเวลาและแบ่งปันความคิดเห็น</div>
            </>
          }
          extra={
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block onClick={closeModal}>
                ปิด
              </Button>
            </Space>
          }
        />
      </Modal>
    </div>
  );
};

export default ReviewPage;