import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Button,
  Typography,
  Flex,
  message,
  Spin,
  Result,
  Space,
  Tag,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import { jobpostAPI, paymentAPI, reviewAPI } from "../../services/https";
import type { Jobpost } from "../../interfaces/jobpost";
import type { ColumnsType } from "antd/es/table";

import "./myjob.css";

const { Title, Text } = Typography;

const isClosed = (name?: string | null) => {
  const n = (name || "").trim().toLowerCase();
  return n === "ปิด" || n === "close" || n === "closed";
};

const isOpen = (name?: string | null) => {
  const n = (name || "").trim().toLowerCase();
  return n === "เปิด" || n === "open" || n === "opened";
};

const asData = <T,>(r: any): T => (r?.data?.data ?? r?.data ?? r) as T;

const hasProof = (p: any) =>
  Boolean(p?.proof_of_payment || p?.ProofOfPayment || p?.proof || p?.evidence);

const extractReview = (raw: any) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  if (raw.review) return raw.review;
  if (raw.data && typeof raw.data === "object" && raw.data.review) return raw.data.review;
  return raw;
};

const hasReview = (r: any) => {
  const x = extractReview(r);
  return !!x && (
    x.review_id != null ||
    x.ID != null || x.id != null ||
    x.rating_score_id != null || x.ratingscore_id != null ||
    (typeof x.comment === "string" && x.comment.trim() !== "")
  );
};

const getStatusColor = (name?: string | null) => {
  if (isOpen(name)) return "blue";
  if (isClosed(name)) return "red";
  return "default";
};

const MyJobPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("kanit-font");
    return () => document.body.classList.remove("kanit-font");
  }, []);

  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Jobpost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [paidModalOpen, setPaidModalOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [reviewedModalOpen, setreviewedModalOpen] = useState(false);
  const [reviewInfo, setReviewInfo] = useState<any>(null);

  const handleReviewClick = async (jobId: number) => {
    setCheckingId(jobId);
    setCurrentJobId(jobId);
    try {
      const res = await reviewAPI.getForJob(jobId);
      const raw = asData<any>(res);
      const review = extractReview(raw);
  
      if (hasReview(review)) {
        setReviewInfo(review);
        setreviewedModalOpen(true);
        return;
      }
    } catch (e: any) {
      const st = e?.status ?? e?.response?.status;
      if (st && st !== 404) {
        message.error(e?.response?.data?.error || "เกิดข้อผิดพลาดในการตรวจสอบรีวิว");
        return;
      }
    } finally {
      setCheckingId(null);
    }
    
    navigate(`/review/${jobId}`);
  };
  const handlePayClick = async (jobId: number) => {
    setCheckingId(jobId);
    setCurrentJobId(jobId);
    try {
      const res = await paymentAPI.getByJobId(jobId);
      const pay = asData<any>(res);

      if (pay && hasProof(pay)) {
        setPaymentInfo(pay);
        setPaidModalOpen(true);
        return;
      }
    } catch (e: any) {
      const st = e?.status ?? e?.response?.status;
      if (st && st !== 404) {
        message.error(e?.message || "เกิดข้อผิดพลาดในการตรวจสอบสถานะการชำระ");
        return;
      }
    } finally {
      setCheckingId(null);
    }

    navigate(`/payment/${jobId}`);
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const load = async () => {
      try {
        setLoading(true);

        const profileRaw = localStorage.getItem("profile");
        if (!profileRaw) {
          setError("กรุณาล็อกอินเพื่อดูข้อมูลงานของคุณ");
          return;
        }

        let employerId: number | undefined;
        try {
          const profile = JSON.parse(profileRaw);
          employerId = profile?.ID ?? profile?.id;
        } catch {
          /* ignore parse error */
        }

        if (!employerId) {
          setError("ไม่พบรหัสนายจ้าง (Employer ID) ในระบบ");
          return;
        }

        // ดึงงานทั้งหมดของนายจ้าง แล้วกรองเฉพาะงานที่ปิด
        const resp = await jobpostAPI.getByEmployerId(employerId);
        const list = (resp as any)?.data ?? [];
        const arr: Jobpost[] = Array.isArray(list) ? list : [];
        const closedOnly = arr.filter((j) => isClosed((j as any).status));
        setJobs(closedOnly);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("ไม่สามารถโหลดข้อมูลงานได้ กรุณาลองใหม่อีกครั้ง");
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูลงาน");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const columns: ColumnsType<Jobpost> = [
    {
      title: "รหัสงาน",
      dataIndex: "ID",
      key: "id",
      width: "12%",
      render: (v: any) => <span>{v ?? "-"}</span>,
    },
    {
      title: "ชื่องาน",
      dataIndex: "title",
      key: "title",
      width: "34%",
      render: (text: string) => <span>{text || "-"}</span>,
    },
    {
      title: "ยอดชำระ",
      dataIndex: "salary",
      key: "salary",
      width: "18%",
      render: (salary: number) =>
        typeof salary === "number" ? (
          <span>{salary.toLocaleString()} บาท</span>
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "สถานะ",
      key: "status",
      width: "12%",
      render: (_: any, row: any) => {
        const label = isClosed(row?.status)
          ? "ปิด"
          : isOpen(row?.status)
          ? "เปิด"
          : row?.status ?? "-";
        return (
          <Tag color={getStatusColor(row?.status)} style={{ fontFamily: "Kanit, sans-serif" }}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: "การจัดการ",
      key: "actions",
      width: "24%",
      render: (_: any, record: Jobpost) => {
        const closed = isClosed((record as any)?.status);
        if (!closed) return null;

        const id = Number((record as any)?.ID ?? 0);
        return (
          <Space wrap>
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: "#52c41a" }}
              onClick={() => (id ? handleReviewClick(id) : message.error("ไม่พบรหัสงาน ไม่สามารถไปหน้ารีวิวได้"))}
            >
              รีวิวการทำงาน
            </Button>

            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: "#ffa940" }}
              loading={checkingId === id}
              onClick={() => (id ? handlePayClick(id) : message.error("ไม่พบรหัสงาน ไม่สามารถไปหน้าชำระเงินได้"))}
            >
              ชำระเงิน
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleRefresh = () => window.location.reload();

  if (loading) {
    return (
      <div className="myjob-page-container">
        <Spin tip="กำลังโหลดข้อมูลงาน...">
          <div style={{ minHeight: 240 }} />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myjob-page-container">
        <Result
          status="warning"
          title="เกิดข้อผิดพลาด"
          subTitle={error}
          extra={[
            <Button type="primary" key="retry" onClick={handleRefresh}>
              ลองใหม่อีกครั้ง
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="myjob-page-container">
      <div style={{ background: "#fff", padding: 24, minHeight: "85vh" }}>
        <Flex
          justify="space-between"
          align="center"
          style={{ maxWidth: 1200, margin: "0 auto 24px auto" }}
        >
          <Title level={2} style={{ marginBottom: 0, color: "#1E3A5F" }}>
            งานที่ปิดแล้วของฉัน ({jobs.length} งาน)
          </Title>
          <Space>
            <Button onClick={handleRefresh}>รีเฟรช</Button>
            <Button onClick={() => navigate("/payment-report")}>รายงานการชำระเงิน</Button>
          </Space>
        </Flex>

        <Table<Jobpost>
          columns={columns}
          dataSource={jobs}
          rowKey={(r) => String((r as any).ID ?? Math.random())}
          style={{ maxWidth: 1200, margin: "0 auto" }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          locale={{
            emptyText: (
              <div>
                <p>ไม่พบงานที่ปิดแล้ว</p>
                <p>ระบบจะแสดงเฉพาะงานที่มีสถานะ “ปิด” เท่านั้น</p>
              </div>
            ),
          }}
        />
      </div>

      <Modal
        open={reviewedModalOpen}
        onCancel={() => setreviewedModalOpen(false)}
        footer={null}
        centered
        maskClosable={false}
      ><Result status="success"
          title="งานนี้เคยได้รับรีวิวแล้ว"
          subTitle={
            <>
              <div>ระบบตรวจพบว่ารายการนี้เคยได้รับรีวิวแล้ว</div>
              {reviewInfo?.ID || reviewInfo?.id ? (
                <div style={{ marginTop: 4 }}>
                  หมายเลขการรีวิว <Text strong>#{reviewInfo?.ID ?? reviewInfo?.id}</Text>
                </div>
              ) : null}
            </>
          }extra={
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block onClick={() => setreviewedModalOpen(false)}>ปิด</Button>
            </Space>
          }
          />
          </Modal>

      {/* Modal: ชำระแล้ว + มีหลักฐาน */}
      <Modal
        open={paidModalOpen}
        onCancel={() => setPaidModalOpen(false)}
        footer={null}
        centered
        maskClosable={false}
      >
        <Result
          status="success"
          title="บิลนี้ชำระเงินเรียบร้อยแล้ว"
          subTitle={
            <>
              <div>ระบบพบหลักฐานการชำระเงินของงานนี้</div>
              {paymentInfo?.ID || paymentInfo?.id ? (
                <div style={{ marginTop: 4 }}>
                  หมายเลขการชำระเงิน <Text strong>#{paymentInfo?.ID ?? paymentInfo?.id}</Text>
                </div>
              ) : null}
            </>
          }
          extra={
            <Space direction="vertical" style={{ width: "100%" }}>
              {hasProof(paymentInfo) ? (
                <Button
                  block
                  type="primary"
                  onClick={() =>
                    window.open(
                      String(
                        paymentInfo?.proof_of_payment || paymentInfo?.ProofOfPayment
                      ),
                      "_blank"
                    )
                  }
                >
                  ดูหลักฐานการชำระเงิน
                </Button>
              ) : null}

              <Button block onClick={() => setPaidModalOpen(false)}>ปิด</Button>
            </Space>
          }
        />
      </Modal>
    </div>
  );
};

export default MyJobPage;