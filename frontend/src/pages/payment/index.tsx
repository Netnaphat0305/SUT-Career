import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Card,
  Typography,
  Divider,
  Button,
  Space,
  message,
  Skeleton,
  Flex,
} from "antd";
import type { Jobpost } from "../../interfaces/jobpost";
import type { Payment, CreatePaymentPayload } from "../../interfaces/payment";
import type { Discount } from "../../interfaces/discount";
import {
  myjobpostAPI,
  billableItemAPI,
  paymentAPI,
  discountAPI,
} from "../../services/https";
import PaymentMethodSelector from "./paymentmethodselector";
import CouponSelector from "./couponselector";
import "./payment.css";
import { calcDiscount, isWithin, toTHDate } from "../../utils/index";

const { Title, Text } = Typography;
type TimesheetSum = { total_hours?: number };

/* ---------- Utils ---------- */
const asData = <T,>(r: any): T => (r?.data?.data ?? r?.data ?? r) as T;

const detectSalaryType = (jp?: Jobpost | null) => {
  const raw =
    (jp as any)?.salary_type?.salary_type_name ??
    (jp as any)?.SalaryType?.salary_type_name ??
    (jp as any)?.SalaryType?.SalaryTypeName ??
    (jp as any)?.salary_type_name ??
    "";
  const s = String(raw || "").toLowerCase();
  if (s.includes("ชั่วโมง") || s.includes("hour"))
    return { key: "hourly", label: "รายชั่วโมง" };
  if (s.includes("วัน") || s.includes("day"))
    return { key: "daily", label: "รายวัน" };
  if (s.includes("เดือน") || s.includes("month"))
    return { key: "monthly", label: "รายเดือน" };
  if (s.includes("โปรเจกต์") || s.includes("project") || s.includes("ครั้ง"))
    return { key: "project", label: "เหมาจ่าย/โปรเจกต์" };
  return { key: "unknown", label: raw || "ไม่ระบุ" };
};

/* ---------- Small UI ---------- */
const DetailRow: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  isBold?: boolean;
}> = ({ label, value, isBold }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
    <Text type="secondary">{label}</Text>
    {isBold ? <Text strong>{value}</Text> : <Text>{value}</Text>}
  </div>
);

/* ---------- Page ---------- */
const PaymentPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [job, setJob] = useState<Jobpost | null>(null);
  const [billableId, setBillableId] = useState<number | null>(null);

  const [gross, setGross] = useState<number>(0);
  const [manualGross, setManualGross] = useState<number | null>(null);

  const [method, setMethod] = useState<number>(1);
  const [promptpayId, setPromptpayId] = useState<number>(1);

  const [coupons, setCoupons] = useState<Discount[]>([]);
  const [usedCouponIds, setUsedCouponIds] = useState<Set<number>>(new Set());
  const [couponId, setCouponId] = useState<number>(0);

  const [timesheetSum, setTimesheetSum] = useState<TimesheetSum>({});
  const [alreadyPaid, setAlreadyPaid] = useState<boolean>(false);

  const now = useMemo(() => new Date(), []);
  const navState = (location.state || {}) as any;
  const billableFromState = Number(navState.billableId || 0) || null;
  const amountFromState = Number(navState.amount || 0) || null;

  /* ----- load: job + ensure/create billable item ----- */
  useEffect(() => {
    if (!billableId || alreadyPaid) return;
    let alive = true;

    (async () => {
      try {
        const resp = await paymentAPI.getLatestByBillable(billableId);
        if (!alive || !resp?.data?.data) {
          setAlreadyPaid(false);
          return;
        }
        const p = resp.data.data as any;
        const st = String(
          p?.Status?.status_name ?? p?.status?.status_name ?? ""
        ).toLowerCase();
        setAlreadyPaid(st === "paid" || st === "success");
      } catch {
        setAlreadyPaid(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [billableId, alreadyPaid]);
  
/* ----- load: job + ensure/create billable item ----- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await myjobpostAPI.getById(Number(jobId));
        const jp = asData<Jobpost>(resp);
        if (cancelled) return;
        setJob(jp);

        if (!cancelled && Number.isFinite(amountFromState)) {
          setGross(amountFromState!);
        } else {
          const fallback = Number((jp as any)?.salary ?? 0);
          setGross(Number.isFinite(fallback) ? fallback : 0);
        }

        let billableRes: any = null;

        if (billableFromState) {
          billableRes = await billableItemAPI.getById(billableFromState);
        } else {
          billableRes = await billableItemAPI.create({
            job_application_id: Number(jobId),
          } as any);
        }

        if (cancelled) return;

        // ✨ --- แก้ไขบรรทัดนี้ --- ✨
        // ลบ .data ออก ให้เข้าถึงจาก object ที่ได้มาโดยตรง
        const hours = Number(billableRes?.hours_worked ?? 0); 
        setTimesheetSum({ total_hours: hours });

        // ส่วนที่เหลือจะยังทำงานได้ เพราะ asData ถูกออกแบบมาให้จัดการเรื่องนี้ได้
        const billableData = asData<any>({ data: billableRes });
        const createdAmount = Number(
          billableData?.amount ?? billableData?.billable_item?.amount ?? billableData?.Amount
        );
        if (Number.isFinite(createdAmount)) {
          setGross(createdAmount);
        }

        const bid = Number(billableData?.ID ?? billableData?.id ?? 0) || null;
        setBillableId(bid);
        
      } catch (e: any) {
        if (!cancelled) {
          const msg =
            e?.response?.data?.error || e?.message || "โหลดข้อมูลไม่สำเร็จ";
          setError(msg);
          message.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);
  /* ----- load: coupons + used coupons ----- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let res: any = null;
        if ((discountAPI as any)?.getAll)
          res = await (discountAPI as any).getAll();
        else if ((discountAPI as any)?.list)
          res = await (discountAPI as any).list();

        const list = asData<any[]>(res) ?? [];
        const mapped: Discount[] = list.map((d: any) => ({
          ID: Number(d?.ID ?? d?.id),
          discount_name: String(d?.discount_name ?? "-"),
          discount_value: Number(d?.discount_value ?? 0),
          discount_type: String(d?.discount_type ?? "").toLowerCase(),
          valid_from: d?.valid_from ?? null,
          valid_until: d?.valid_until ?? null,
        }));
        if (!cancelled) setCoupons(mapped);

        const profileRaw = localStorage.getItem("profile");
        let employerId = 0;
        try {
          employerId = Number(JSON.parse(profileRaw || "{}")?.ID ?? 0);
        } catch {}
        if (employerId && (discountAPI as any)?.getUsedByEmployer) {
          const usedRes = await (discountAPI as any).getUsedByEmployer(
            employerId
          );
          const usedIds = new Set<number>(
            (asData<any[]>(usedRes) ?? []).map((x: any) =>
              Number(x?.discount_id ?? x)
            )
          );
          if (!cancelled) setUsedCouponIds(usedIds);
        }
      } catch (e) {
        console.warn("โหลดคูปองไม่สำเร็จ (ข้ามได้):", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const st = (location.state || {}) as any;
    if (st?.amount && Number.isFinite(Number(st.amount))) {
      setManualGross(Number(st.amount));
    }
    if (st?.billableId && Number.isFinite(Number(st.billableId))) {
      setBillableId(Number(st.billableId));
    }
  }, [location.state]);

  const salaryType = detectSalaryType(job);
  const grossAmount = Number(manualGross ?? (gross || 0));
  const selectedCoupon = useMemo(
    () => (couponId ? coupons.find((c) => c.ID === couponId) ?? null : null),
    [couponId, coupons]
  );
  const discountAmount = useMemo(
    () => (selectedCoupon ? calcDiscount(selectedCoupon, grossAmount) : 0),
    [selectedCoupon, grossAmount]
  );
  const netAmount = useMemo(
    () => Math.max(0, grossAmount - discountAmount),
    [grossAmount, discountAmount]
  );

  const view = useMemo(
    () => ({
      employerName: (job as any)?.employer?.company_name ?? "",
      employerAddress: (job as any)?.employer?.address ?? "",
      jobTitle: (job as any)?.title ?? "",
      salaryTypeKey: salaryType.key,
      salaryTypeLabel: salaryType.label,
      grossAmount,
    }),
    [job, salaryType, grossAmount]
  );

  /* ---------- Submit ---------- */
  const handleCreatePayment = async () => {
    try {
      if (billableId == null) {
        message.error("ข้อมูลยังไม่พร้อม กรุณาลองใหม่");
        return;
      }
      if (netAmount <= 0) {
        message.error("ยอดสุทธิไม่ถูกต้อง");
        return;
      }
      if (method !== promptpayId) {
        message.warning("ระบบอนุญาตเฉพาะการชำระด้วย QR PromptPay");
        setMethod(promptpayId);
        return;
      }

      // ถ้าเคยจ่ายแล้วและไม่ใช่รายเดือน → ไปหน้ารายละเอียด
      if (alreadyPaid && salaryType.key !== "monthly") {
        navigate(`/qr-payment/${billableId}`, {
          state: { jobapplicationId: Number(jobId), title: view.jobTitle },
        });
        return;
      }

      setCreating(true);

      const payload: CreatePaymentPayload = {
        billable_item_id: Number(billableId),
        payment_method_id: Number(promptpayId),
        amount: Number(netAmount),
        ...(couponId ? { discount_id: Number(couponId) } : {}),
        status_id: 1,
        jobTitle: view.jobTitle,
      };

      const res = await paymentAPI.create(payload);
      const created = asData<Payment>(res);

      message.success("สร้างรายการชำระเงินสำเร็จ");

      navigate(`/qr-payment/${billableId}`, {
        state: {
          paymentId: (created as any)?.ID ?? (created as any)?.id,
          amount: netAmount,
          jobId: Number(jobId),
          title: view.jobTitle,
        },
        replace: true,
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "สร้างรายการชำระเงินไม่สำเร็จ";
      message.error(msg);
    } finally {
      setCreating(false);
    }
  };
  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: "24px auto" }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div
      className="payment-page-container"
      style={{ background: "#fff", padding: "16px 24px 32px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          maxWidth: 960,
          margin: "0 auto 24px auto",
          columnGap: 12,
        }}
      >
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
          }}
        >
          รายการชำระเงิน
        </Title>
        <div />
      </div>

      <div style={{ maxWidth: 960, margin: "8px auto 0", width: "100%" }}>
        {/* นายจ้าง/ชื่องาน */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <Flex align="center" gap={16}>
            <div>
              <Text strong style={{ fontSize: 16 }}>
                {view.employerName}
              </Text>
              <br />
              <Text type="secondary">{view.employerAddress ?? ""}</Text>
            </div>
          </Flex>
        </Card>

        {/* รายละเอียดการจ้างงาน */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <Title level={5} style={{ textAlign: "left", marginBottom: 10 }}>
            รายละเอียดการจ้างงาน
          </Title>
          <Divider style={{ margin: "12px 0" }} />
          <Space direction="vertical" style={{ width: "100%" }} size={10}>
            <DetailRow label="ชื่องาน" value={view.jobTitle || "-"} />
            <DetailRow
              label="ประเภทการจ้าง (SalaryType)"
              value={view.salaryTypeLabel}
            />
            {view.salaryTypeKey === "hourly" && (
              <DetailRow
                label="ชั่วโมงที่ทำงาน (รวม)"
                value={`${Number(timesheetSum?.total_hours || 0)} ชม.`}
              />
            )}
            <DetailRow
              label="รวมยอดเงินที่ต้องชำระ"
              value={`${Number(view.grossAmount || 0).toLocaleString()} บาท`}
              isBold
            />
          </Space>
        </Card>

        {/* คูปองส่วนลด */}
        <CouponSelector
          coupons={coupons as any}
          usedCouponIds={usedCouponIds}
          now={now}
          grossAmount={Number(view.grossAmount || 0)}
          couponId={couponId}
          setCouponId={setCouponId}
          isWithin={isWithin as any}
          calcDiscount={calcDiscount as any}
          toTHDate={(d) => toTHDate(d as any)}
        />

        {/* ช่องทางการชำระเงิน */}
        <PaymentMethodSelector method={method} setMethod={setMethod} />
        {/* สรุปยอด */}
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Title level={5} style={{ textAlign: "left", margin: 0 }}>
            ข้อมูลการชำระเงิน
          </Title>
          <Divider style={{ margin: "12px 0" }} />
          <Space direction="vertical" style={{ width: "100%" }} size={10}>
            <DetailRow
              label="ค่าบริการ/งาน"
              value={`${Number(view.grossAmount || 0).toLocaleString()} บาท`}
            />
            <DetailRow
              label="ส่วนลด"
              value={`${discountAmount.toLocaleString()} บาท`}
            />
            <Divider style={{ margin: "12px 0" }} />
            <DetailRow
              label={<Text strong>ยอดชำระเงินทั้งหมด</Text>}
              value={<Text strong>{netAmount.toLocaleString()} บาท</Text>}
            />
          </Space>
        </Card>

        {/* ปุ่มชำระเงิน */}
        <Flex justify="center">
          <Button
            type="primary"
            size="large"
            style={{ minWidth: 220, height: 44, borderRadius: 12 }}
            loading={creating}
            onClick={handleCreatePayment}
          >
            {alreadyPaid && view.salaryTypeKey !== "monthly"
              ? "ดูรายละเอียดการชำระเงิน"
              : "ชำระเงิน"}
          </Button>
        </Flex>
      </div>
    </div>
  );
};

export default PaymentPage;
