import React, { useEffect, useState } from "react";
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
import { myjobpostAPI, billableItemAPI, reviewAPI } from "../../services/https";
import type { Jobpost } from "../../interfaces/jobpost";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "../../context/AuthContext";
import "./myjob.css";

const { Title, Text } = Typography;
type StatusTh = "รอการชำระ" | "รอตรวจสอบ" | "ชำระแล้ว" | "ล้มเหลว";
const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
const STATUS_ALIASES: Record<string, StatusTh> = {
  "": "รอการชำระ",
  รอการชำระ: "รอการชำระ",
  รอตรวจสอบ: "รอตรวจสอบ",
  ชำระแล้ว: "ชำระแล้ว",
  ล้มเหลว: "ล้มเหลว",
  ชำระไม่สำเร็จ: "ล้มเหลว",
};

const normalizeStatus = (s?: string | null): StatusTh =>
  STATUS_ALIASES[norm(s)] ?? "รอการชำระ";

export const getStatusFromPayload = (row: any): StatusTh => {
  const raw =
    row?.payment_status_name ??
    row?.payment?.status?.status_name ??
    row?.Payment?.Status?.status_name ??
    row?.status_name ??
    null;
  return normalizeStatus(raw);
};

export const canPay = (row: any) => {
  const s = getStatusFromPayload(row);
  return s === "รอการชำระ" || s === "ล้มเหลว";
};

export const canReview = (row: any) => {
  const s = getStatusFromPayload(row);
  return s === "รอตรวจสอบ" || s === "ชำระแล้ว";
};

export const statusColor = (row: any) => {
  const s = getStatusFromPayload(row);
  if (s === "รอการชำระ") return "red";
  if (s === "รอตรวจสอบ") return "gold";
  if (s === "ชำระแล้ว") return "green";
  if (s === "ล้มเหลว") return "volcano";
  return "default";
};

const asData = <T,>(r: any): T => (r?.data?.data ?? r?.data ?? r) as T;
const toJobId = (r: any) => Number(r.jobpost_id ?? r.ID ?? 0);
export const hasPaymentProofInPayload = (row: any): boolean =>
  Boolean(row?.proof_of_payment ?? row?.payment?.proof_of_payment);

const pick = <T,>(...vals: T[]) =>
  vals.find((v) => v !== undefined && v !== null);

/* ----------------- Review helpers ----------------- */
const extractReview = (raw: unknown): any | null => {
  if (!raw) return null;
  const any = raw as any;

  if (Array.isArray(any)) return any[0] ?? null;
  if (Array.isArray(any?.data)) return any.data[0] ?? null;

  const cand =
    any.review ??
    any.Review ??
    any.data?.review ??
    any.data?.Review ??
    any.data ??
    any;

  return cand && typeof cand === "object" ? cand : null;
};

export const hasReview = (raw: unknown): boolean => {
  const r = extractReview(raw);
  if (!r) return false;

  const id = pick(r.ID, r.id);
  const scoreId = pick(
    r.ratingscore_id,
    (r as any).ratingScoreId,
    r.ratingscore?.ID,
    r.RatingScore?.ID
  );
  const comment = String(pick(r.comment, r.Comment, "")).trim();

  return (id != null && scoreId != null) || comment.length > 0;
};

const MyJobPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("kanit-font");
    return () => document.body.classList.remove("kanit-font");
  }, []);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Jobpost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);

  const [reviewedModalOpen, setreviewedModalOpen] = useState(false);
  const [reviewInfo, setReviewInfo] = useState<any>(null);

  // ตรวจรีวิว
  const handleReviewClick = async (jobapplicationId: number) => {
    if (checkingId) return; // กันคลิกรัว
    setCheckingId(jobapplicationId);
    try {
      const res = await reviewAPI.getForJob(jobapplicationId);

      if (hasReview(res)) {
        const review = extractReview(res);
        setReviewInfo(review);
        setreviewedModalOpen(true);
        return;
      }
      navigate(`/review/${jobapplicationId}`);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        navigate(`/review/${jobapplicationId}`);
      } else {
        message.error(e?.message || "เกิดข้อผิดพลาดในการตรวจสอบรีวิว");
      }
    } finally {
      setCheckingId(null);
    }
  };

  const handleViewReview = () => {
    if (reviewInfo?.ID) {
      // ปิด Modal ที่แสดงอยู่
      setreviewedModalOpen(false);
      navigate(`/reviews/view/${reviewInfo.ID}`);
    } else {
      message.error("ไม่พบรหัสรีวิว");
    }
  };

  // ตรวจการชำระ
  const handlePayClick = async (jobapplicationId: number) => {
    // แก้จาก job_application เป็น job_application_id
    const res = await billableItemAPI.create({
      job_application_id: jobapplicationId,
    } as any);

    const created = (res as any)?.data?.data ?? {};
    const amount =
      Number(created?.amount ?? created?.billable_item?.amount ?? 0) ||
      undefined;
    const billableId =
      Number(created?.ID ?? created?.id ?? created?.billable_item_id) ||
      undefined;

    navigate(`/payment/${jobapplicationId}`, {
      state: { amount, billableId },
      replace: true,
    });
  };

  // โหลดรายการงานที่ Accepted ของ employer ปัจจุบัน
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("กรุณาล็อกอินเพื่อดูข้อมูลงานของคุณ");
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const resp = await myjobpostAPI.getAcceptedApplications();
        const list = asData<Jobpost[]>(resp);
        if (!cancelled) setJobs(list);
      } catch (err) {
        if (!cancelled) {
          setError("ไม่สามารถโหลดข้อมูลงานได้ กรุณาลองใหม่อีกครั้ง");
          message.error("เกิดข้อผิดพลาดในการดึงข้อมูลงาน");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const columns: ColumnsType<Jobpost> = [
    {
      title: "รหัสงาน",
      dataIndex: "ID",
      key: "id",
      sorter: (a, b) => toJobId(a) - toJobId(b),
      defaultSortOrder: "descend",
      sortDirections: ["descend", "ascend"],
      width: "12%",
      render: (v: any) => <span>{v ?? "-"}</span>,
    },
    {
      title: "ชื่องาน",
      dataIndex: "title",
      key: "title",
      width: "31%",
      render: (text: string) => <span>{text || "-"}</span>,
    },
    {
      title: "ยอดชำระ",
      dataIndex: "salary",
      key: "salary",
      width: "15%",
      render: (salary: number) =>
        typeof salary === "number" ? (
          <span>{salary.toLocaleString()} บาท</span>
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "สถานะ",
      key: "payment_status",
      width: "18%",
      render: (_: any, row: any) => {
        const s = getStatusFromPayload(row);
        return (
          <Tag
            color={statusColor(row)}
            style={{ fontFamily: "Kanit, sans-serif" }}
          >
            {s}
          </Tag>
        );
      },
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_: any, row: any) => {
        const id = Number(row?.ID ?? (row as any)?.id ?? 0);

        if (canPay(row)) {
          return (
            <Button
              type="primary"
              loading={checkingId === id}
              onClick={() => handlePayClick(id)}
            >
              ชำระเงิน
            </Button>
          );
        }
        if (canReview(row)) {
          return (
            <Button
              loading={checkingId === id}
              onClick={() => handleReviewClick(id)}
            >
              รีวิวการทำงาน
            </Button>
          );
        }
        return <Text type="secondary">ไม่มีการดำเนินการ</Text>;
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
            งานที่พร้อมชำระของฉัน ({jobs.length} งาน)
          </Title>
          <Space>
            <Button onClick={handleRefresh}>รีเฟรช</Button>
            <Button onClick={() => navigate("/payment-report")}>
              รายงานการชำระเงิน
            </Button>
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
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          locale={{
            emptyText: (
              <div>
                <p>ยังไม่มีงานที่พร้อมชำระ</p>
              </div>
            ),
          }}
        />
      </div>

      {/* Modal: แจ้งเคยรีวิวแล้ว */}
      <Modal
        open={reviewedModalOpen}
        onCancel={() => setreviewedModalOpen(false)}
        footer={null}
        centered
        maskClosable={false}
      >
        <Result
          status="success"
          title="งานนี้เคยได้รับรีวิวแล้ว"
          subTitle={
            <>
              <div>ระบบตรวจพบว่ารายการนี้เคยได้รับรีวิวแล้ว</div>
              {reviewInfo?.ID || reviewInfo?.id ? (
                <div style={{ marginTop: 4 }}>
                  หมายเลขการรีวิว{" "}
                  <Text strong>#{reviewInfo?.ID ?? reviewInfo?.id}</Text>
                </div>
              ) : null}
            </>
          }
          extra={
            <Space direction="vertical" style={{ width: "100%" }}>
              {reviewInfo?.ID && (
                <Button block type="primary" onClick={handleViewReview}>
                  ดูรีวิว
                </Button>
              )}
              <Button block onClick={() => setreviewedModalOpen(false)}>
                ปิด
              </Button>
            </Space>
          }
        />
      </Modal>
    </div>
  );
};

export default MyJobPage;
