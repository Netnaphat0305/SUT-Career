// // src/pages/payments/QRPromptpayPage.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   useLocation,
//   useNavigate,
//   useParams,
//   useSearchParams,
// } from "react-router-dom";
// import {
//   Card,
//   Typography,
//   Button,
//   Upload,
//   message,
//   Space,
//   Modal,
//   Result,
// } from "antd";
// import type { UploadFile } from "antd/es/upload/interface";
// import { QrcodeOutlined, CheckCircleFilled } from "@ant-design/icons";
// import * as QR from "qrcode";
// import generatePayload from "promptpay-qr";

// import { paymentAPI, billableItemAPI } from "../../services/https";
// import QRCountdown from "./qrcountdown";

// const { Title, Text } = Typography;

// /* ---------------- Utils & Types ---------------- */
// const toBaht = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
// const asData = <T,>(r: unknown): T =>
//   ((r as any)?.data?.data ?? (r as any)?.data ?? r) as T;

// type QRNavState = { paymentId?: number; amount?: number };

// const payerFromPayment = (p: unknown): string => {
//   const src = p as any;
//   const e =
//     src?.employer ??
//     src?.Employer ??
//     src?.billable_item?.jobpost?.employer ??
//     src?.jobpost?.employer ??
//     {};
//   return e?.company_name ?? e?.CompanyName ?? "ผู้ชำระเงิน";
// };

// const payerFromBillable = (bi: unknown): string => {
//   const src = bi as any;
//   const e =
//     src?.jobpost?.employer ??
//     src?.Jobpost?.Employer ??
//     src?.employer ??
//     src?.Employer ??
//     {};
//   return e?.company_name ?? e?.CompanyName ?? "ผู้ชำระเงิน";
// };

// /* ---------------- Component ---------------- */
// const QRPromptpayPage: React.FC = () => {
//   useEffect(() => {
//     document.body.classList.add("kanit-font");
//     return () => document.body.classList.remove("kanit-font");
//   }, []);

//   const [searchParams] = useSearchParams();
//   const rrLocation = useLocation() as { state?: QRNavState };
//   const navState: QRNavState = rrLocation.state ?? {};

//   // รับ paymentId: state > query ?pid
//   const paymentId: number | undefined = useMemo(() => {
//     const fromState = navState.paymentId;
//     const fromQuery = Number(searchParams.get("pid"));
//     if (Number.isFinite(fromState) && Number(fromState) > 0)
//       return Number(fromState);
//     if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery;
//     return undefined;
//   }, [navState.paymentId, searchParams]);

//   const { billableItemId } = useParams<{ billableItemId: string }>();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const state = (location.state || {}) as {
//     paymentId?: number;
//     amount?: number;
//   };

//   const [amount, setAmount] = useState<number>(
//     () => Math.round(Number(navState.amount ?? 0) * 100) / 100
//   );
//   const [qrSrc, setQrSrc] = useState<string>("");
//   const promptpay = "0820657892"; // TODO: ใส่หมายเลขจริงของคุณ

//   const [fileList, setFileList] = useState<UploadFile[]>([]);
//   const [evidence, setEvidence] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [countStartAt, setCountStartAt] = useState<number | undefined>();
//   const [expired, setExpired] = useState(false);
//   const [qrNonce, setQrNonce] = useState(0); // ใช้บังคับ regenerate QR
//   const [jobTitle, setJobTitle] = useState<string>("รายการชำระเงิน");
//   const [payerName, setPayerName] = useState<string>("ผู้ชำระเงิน");

//   const [createdReportId, setCreatedReportId] = useState<number | null>(null);
//   const [successOpen, setSuccessOpen] = useState(false);
//   const closeModal = () => {
//     setSuccessOpen(false);
//     navigate("/my-jobs");
//   };

//   /* 1) ถ้าไม่ได้ส่ง amount มา → ดึงจาก Billable Item */
//   useEffect(() => {
//     const fetchAmount = async () => {
//       if (amount > 0) return;
//       if (!billableItemId) return;
//       try {
//         const res = await billableItemAPI.getById(Number(billableItemId));
//         const item = asData<any>(res);
//         const amt = Number(item?.amount || 0);
//         if (amt > 0) setAmount(toBaht(amt));
//       } catch {
//         // ใช้ค่าเดิมไปก่อน
//       }
//     };
//     void fetchAmount();
//   }, [billableItemId, amount]);

//   /* 2) สร้าง QR จาก amount */
//   useEffect(() => {
//     if (!amount || amount <= 0) {
//       setQrSrc("");
//       return;
//     }
//     try {
//       const payload = generatePayload(promptpay, { amount });
//       QR.toDataURL(
//         payload,
//         { width: 280, margin: 1 },
//         (err: unknown, url?: string) => {
//           if (err || !url) {
//             // eslint-disable-next-line no-console
//             console.error(err);
//             message.error("ไม่สามารถสร้าง QR ได้");
//             setQrSrc("");
//             return;
//           }
//           setQrSrc(url);
//         }
//       );
//     } catch (e) {
//       // eslint-disable-next-line no-console
//       console.error(e);
//       message.error("ไม่สามารถสร้าง QR ได้");
//       setQrSrc("");
//     }
//   }, [amount, promptpay]);

//   /* 3) โหลด meta: จาก paymentId → ไม่งั้นจาก billable → ไม่งั้นใช้ค่า state */
//   useEffect(() => {
//     let cancelled = false;

//     const titleFromPayment = (p: any): string =>
//       p?.job_title ??
//       p?.title ??
//       p?.billable_item?.jobpost?.title ??
//       "รายการชำระเงิน";
//     const amountFromPayment = (p: any): number =>
//       Number(p?.amount ?? p?.total ?? state?.amount ?? 0);

//     const titleFromBillable = (bi: any): string =>
//       bi?.jobpost?.title ?? "รายการชำระเงิน";
//     const amountFromBillable = (bi: any): number =>
//       Number(bi?.amount ?? state?.amount ?? 0);

//     const loadMeta = async () => {
//       try {
//         // 3.1) มี paymentId → ดึงตรง
//         if (paymentId) {
//           try {
//             const res = await paymentAPI.getById(Number(paymentId));
//             const p = asData<any>(res);
//             if (!cancelled && p) {
//               setJobTitle(titleFromPayment(p));
//               setPayerName(payerFromPayment(p));
//               setAmount(amountFromPayment(p));
//               return;
//             }
//           } catch {
//             // 404 หรืออื่น ๆ → ไป fallback
//           }
//         }

//         // 3.2) ไม่มี paymentId → หาตัวล่าสุดจาก billable
//         if (billableItemId) {
//           try {
//             // ✅ ใช้ getLatestByBillable (ของคุณมีอยู่แล้ว)
//             const rb = await paymentAPI.getLatestByBillable(
//               Number(billableItemId)
//             );
//             const p = asData<any>(rb);
//             if (!cancelled && p) {
//               setJobTitle(titleFromPayment(p));
//               setPayerName(payerFromPayment(p));
//               setAmount(amountFromPayment(p));
//               return;
//             }
//           } catch {
//             // ไม่มี payment ล่าสุด → ไปดึง billable item
//           }

//           try {
//             const biRes = await billableItemAPI.getById(Number(billableItemId));
//             const bi = asData<any>(biRes);
//             if (!cancelled && bi) {
//               setJobTitle(titleFromBillable(bi));
//               setPayerName(payerFromBillable(bi));
//               setAmount(amountFromBillable(bi));
//               return;
//             }
//           } catch {
//             // ใช้ default ต่อ
//           }
//         }

//         // 3.3) สุดท้าย ใช้ amount จาก state (ถ้ามี)
//         if (!cancelled) {
//           if (state?.amount) setAmount(Number(state.amount));
//           setJobTitle((t) => t || "รายการชำระเงิน");
//         }
//       } catch {
//         /* swallow */
//       }
//     };

//     void loadMeta();
//     return () => {
//       cancelled = true;
//     };
//   }, [paymentId, billableItemId, state?.amount]);

//   useEffect(() => {
//     if (!amount || amount <= 0) {
//       setQrSrc("");
//       setCountStartAt(undefined);
//       setExpired(true);
//       return;
//     }
//     try {
//       const payload = generatePayload(promptpay, { amount });
//       QR.toDataURL(payload, { width: 280, margin: 1 }, (err, url) => {
//         if (err || !url) {
//           console.error(err);
//           message.error("ไม่สามารถสร้าง QR ได้");
//           setQrSrc("");
//           setCountStartAt(undefined);
//           setExpired(true);
//           return;
//         }
//         setQrSrc(url);
//         setCountStartAt(Date.now()); // เริ่มนับ 15 นาทีตั้งแต่สร้างสำเร็จ
//         setExpired(false);
//       });
//     } catch (e) {
//       console.error(e);
//       message.error("ไม่สามารถสร้าง QR ได้");
//       setQrSrc("");
//       setCountStartAt(undefined);
//       setExpired(true);
//     }
//   }, [amount, promptpay, qrNonce]);

//   const refreshQR = () => setQrNonce((n) => n + 1);

//   /* 4) เปิดปุ่มส่งเมื่อมี paymentId และมีไฟล์ */
//   const canSubmit = useMemo(
//     () => !!paymentId && !!(evidence || fileList.length > 0) && !expired,
//     [paymentId, evidence, fileList, expired]
//   );

//   /* 5) อัปโหลดหลักฐาน → BE อัปเดตสถานะเป็น "ตรวจสอบ" → สร้างใบเสร็จ (dynamic import) */
//   const handleUpload = async () => {
//     if (!paymentId) return message.error("ไม่พบรหัสการชำระเงิน");

//     const realFile =
//       evidence ?? (fileList[0]?.originFileObj as File | undefined);
//     if (!realFile) return message.warning("กรุณาเลือกไฟล์หลักฐาน");

//     try {
//       setUploading(true);

//       // 1) อัปโหลดหลักฐานไป BE (BE จะอัปเดตสถานะเป็น 'ตรวจสอบ' ตามที่คุณทำไว้)
//       const fd = new FormData();
//       fd.append("evidence", realFile, realFile.name);
//       await paymentAPI.uploadEvidence(Number(paymentId), fd);

//       // 2) ออกใบเสร็จ + อัปโหลด (dynamic import กันตอนเข้าหน้า)
//       let reportId: number | null = null;
//       try {
//         const mod = await import("./generateandupload");
//         // รองรับทั้ง named และ default export
//         const generateAndUploadReportReactPDF =
//           (mod as any).generateAndUploadReportReactPDF ?? (mod as any).default;

//         type GenArgs = {
//           paymentId: number;
//           amount: number;
//           date: string;
//           jobTitle?: string;
//           employerName?: string;
//           // method?: string; // ถ้าในฟังก์ชันรองรับค่อยเปิด
//         };

//         const result = await (
//           generateAndUploadReportReactPDF as (a: GenArgs) => Promise<any>
//         )({
//           paymentId: Number(paymentId),
//           amount,
//           date: new Date().toISOString(),
//           jobTitle,
//           employerName: payerName,
//           // method: "QR PromptPay",
//         });

//         // รองรับ response ได้ทั้งรูปแบบ { uploadResp: { data: {...} } } หรือ AxiosResponse/อ็อบเจ็กต์ตรง ๆ
//         const uploadResp = (result?.uploadResp ?? result) as any;
//         const payload = uploadResp?.data ?? uploadResp ?? {};
//         const id = payload?.report_id ?? payload?.ID ?? payload?.id ?? null;

//         reportId = Number.isFinite(Number(id)) ? Number(id) : null;
//         setCreatedReportId(reportId ?? null);
//       } catch (e) {
//         console.warn("generate PDF failed:", e);
//         message.warning("บันทึกหลักฐานสำเร็จ แต่สร้างใบเสร็จไม่สำเร็จ");
//       }

//       // 3) เคลียร์ไฟล์ + แจ้งผล
//       setFileList([]);
//       setEvidence(null);
//       message.success("อัปโหลดหลักฐานสำเร็จ");
//       setSuccessOpen(true);
//     } catch (e: any) {
//       console.error(e);
//       message.error(
//         e?.response?.data?.error || e?.message || "อัปโหลดหลักฐานไม่สำเร็จ"
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   const goToPaymentReports = () => {
//     navigate("/payment-report", {
//       state: {
//         flash: "ออกใบเสร็จเรียบร้อย",
//         highlightId: createdReportId,
//       },
//     });
//   };

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="payment-page-container" style={{ padding: 24 }}>
//       <div style={{ maxWidth: 720, margin: "0 auto" }}>
//         <div style={{ textAlign: "center", marginBottom: 16 }}>
//           <Title level={2} style={{ margin: 0 }}>
//             QR PromptPay
//           </Title>
//           <Text type="secondary">สแกนเพื่อชำระเงิน</Text>
//         </div>

//         {/* QR */}
//         <Card style={{ borderRadius: 14, marginBottom: 16 }}>
//           <Space
//             direction="vertical"
//             style={{ width: "100%" }}
//             size={12}
//             align="center"
//           >
//             {qrSrc && (
//               <QRCountdown
//                 startAt={countStartAt}
//                 minutes={15}
//                 onExpire={() => setExpired(true)}
//               />
//             )}
//             {expired && (
//               <Text type="danger">QR หมดอายุแล้ว • กรุณากด “รีเฟรช QR”</Text>
//             )}
//             <Text>
//               ยอดชำระ <Text strong>{amount.toLocaleString()} บาท</Text>
//             </Text>
//             <Text type="secondary">ชื่อบัญชี: นางสาวพนิดา โต๊ะเหลือ</Text>
//             <Text type="secondary">ปลายทาง PromptPay: {promptpay}</Text>
//             <Button onClick={refreshQR} disabled={!amount}>
//               รีเฟรช QR
//             </Button>
//           </Space>
//         </Card>

//         {/* อัปโหลดหลักฐาน */}
//         <Card style={{ borderRadius: 14 }}>
//           <Space direction="vertical" style={{ width: "100%" }}>
//             <Text strong>แนบหลักฐานการชำระเงิน</Text>
//             <Upload
//               accept=".jpg,.jpeg,.png,.pdf"
//               multiple={false}
//               maxCount={1}
//               fileList={fileList}
//               beforeUpload={(file) => {
//                 setEvidence(file as File);
//                 setFileList([
//                   {
//                     uid: (file as any).uid ?? String(Date.now()),
//                     name: file.name,
//                     status: "done",
//                     originFileObj: file,
//                   } as UploadFile,
//                 ]);
//                 return false;
//               }}
//               onChange={(info) => {
//                 setFileList(info.fileList);
//                 const latest = info.fileList[info.fileList.length - 1];
//                 setEvidence((latest?.originFileObj as File) ?? null);
//               }}
//               onRemove={() => {
//                 setFileList([]);
//                 setEvidence(null);
//               }}
//             >
//               <Button block>เลือกไฟล์</Button>
//             </Upload>
//             <Button
//               type="primary"
//               block
//               disabled={!canSubmit}
//               loading={uploading}
//               onClick={handleUpload}
//             >
//               อัปโหลดหลักฐาน
//             </Button>
//           </Space>
//         </Card>
//       </div>

//       {/* Modal สำเร็จ */}
//       <Modal
//         open={successOpen}
//         footer={null}
//         centered
//         closable
//         onCancel={closeModal}
//         maskClosable
//       >
//         <Result
//           status="success"
//           icon={<CheckCircleFilled style={{ color: "#52c41a" }} />}
//           title={<span style={{ fontSize: 24 }}>ชำระเงินสำเร็จ</span>}
//           subTitle={
//             <>
//               <div>บันทึกหลักฐานและออกใบเสร็จเรียบร้อย</div>
//               {paymentId && (
//                 <div style={{ marginTop: 4 }}>
//                   หมายเลขการชำระเงิน <Text strong>#{paymentId}</Text>
//                   {amount ? (
//                     <>
//                       {" "}
//                       • ยอด <Text strong>{amount.toLocaleString()} บาท</Text>
//                     </>
//                   ) : null}
//                 </div>
//               )}
//               <div style={{ marginTop: 4 }}>
//                 ผู้ชำระเงิน: <Text strong>{payerName}</Text>
//               </div>
//             </>
//           }
//           extra={
//             <Space direction="vertical" style={{ width: "100%" }}>
//               <Button type="primary" block onClick={goToPaymentReports}>
//                 ดูรายการใบเสร็จ
//               </Button>
//               <Button block onClick={closeModal}>
//                 ปิดหน้าต่างนี้
//               </Button>
//             </Space>
//           }
//         />
//       </Modal>
//     </div>
//   );
// };

// export default QRPromptpayPage;

// src/pages/payments/QRPromptpayPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Upload,
  message,
  Space,
  Modal,
  Result,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { QrcodeOutlined, CheckCircleFilled } from "@ant-design/icons";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";
import { asData, pickCompanyName } from "../../utils";
import { paymentAPI, billableItemAPI } from "../../services/https";
import QRCountdown from "./qrcountdown";

const { Title, Text } = Typography;

/* ---------------- Utils & Types ---------------- */
const toBaht = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

type QRNavState = { paymentId?: number; amount?: number };

const payerFromPayment = (p: unknown): string => {
  const src = p as any;
  const e =
    src?.employer ??
    src?.Employer ??
    src?.billable_item?.jobpost?.employer ??
    src?.jobpost?.employer ??
    {};
  return e?.company_name ?? e?.CompanyName ?? "ผู้ชำระเงิน";
};

/* ---------------- Component ---------------- */
const QRPromptpayPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("kanit-font");
    return () => document.body.classList.remove("kanit-font");
  }, []);

  const [searchParams] = useSearchParams();
  const rrLocation = useLocation() as { state?: QRNavState };
  const navState: QRNavState = rrLocation.state ?? {};

  // รับ paymentId: state > query ?pid
  const paymentId: number | undefined = useMemo(() => {
    const fromState = navState.paymentId;
    const fromQuery = Number(searchParams.get("pid"));
    if (Number.isFinite(fromState) && Number(fromState) > 0)
      return Number(fromState);
    if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery;
    return undefined;
  }, [navState.paymentId, searchParams]);

  const { billableItemId } = useParams<{ billableItemId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state || {}) as {
    paymentId?: number;
    amount?: number;
  };

  const [amount, setAmount] = useState<number>(
    () => Math.round(Number(navState.amount ?? 0) * 100) / 100
  );
  const [qrSrc, setQrSrc] = useState<string>("");
  const promptpay = "0820657892"; // TODO: ใส่หมายเลขจริงของคุณ

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // countdown
  const [countStartAt, setCountStartAt] = useState<number | undefined>();
  const [expired, setExpired] = useState(false);
  const [qrNonce, setQrNonce] = useState(0); // ใช้บังคับ regenerate QR

  const [jobTitle, setJobTitle] = useState<string>("รายการชำระเงิน");
  const [payerName, setPayerName] = useState<string>("ผู้ชำระเงิน");

  const [createdReportId, setCreatedReportId] = useState<number | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const closeModal = () => {
    setSuccessOpen(false);
    navigate("/my-jobs");
  };

  /* 1) ถ้าไม่ได้ส่ง amount มา → ดึงจาก Billable Item */
  useEffect(() => {
    const fetchAmount = async () => {
      if (amount > 0) return;
      if (!billableItemId) return;
      try {
        const res = await billableItemAPI.getById(Number(billableItemId));
        const item = asData<any>(res);
        const amt = Number(item?.amount || 0);
        if (amt > 0) setAmount(toBaht(amt));
      } catch {
        // ใช้ค่าเดิมไปก่อน
      }
    };
    void fetchAmount();
  }, [billableItemId, amount]);

  /* 2) โหลด meta: จาก paymentId → ไม่งั้นจาก billable → ไม่งั้นใช้ค่า state */
  useEffect(() => {
    let cancelled = false;

    const titleFromPayment = (p: any): string =>
      p?.job_title ??
      p?.title ??
      p?.billable_item?.jobpost?.title ??
      "รายการชำระเงิน";
    const amountFromPayment = (p: any): number =>
      Number(p?.amount ?? p?.total ?? state?.amount ?? 0);

    const titleFromBillable = (bi: any): string =>
      bi?.jobpost?.title ?? "รายการชำระเงิน";
    const amountFromBillable = (bi: any): number =>
      Number(bi?.amount ?? state?.amount ?? 0);

    const loadMeta = async () => {
      try {
        if (paymentId) {
          try {
            const res = await paymentAPI.getById(Number(paymentId));
            const p = asData<any>(res);
            if (!cancelled && p) {
              setJobTitle(titleFromPayment(p));
              setPayerName(payerFromPayment(p));
              setAmount(amountFromPayment(p));
              return;
            }
          } catch {
            /* fallback ต่อ */
          }
        }

        if (billableItemId) {
          try {
            const rb = await paymentAPI.getLatestByBillable(
              Number(billableItemId)
            );
            const p = asData<any>(rb);
            if (!cancelled && p) {
              setJobTitle(titleFromPayment(p));
              setPayerName(payerFromPayment(p));
              setAmount(amountFromPayment(p));
              return;
            }
          } catch {
            /* no latest */
          }

          try {
            const biRes = await billableItemAPI.getById(Number(billableItemId));
            const bi = asData<any>(biRes);
            if (!cancelled && bi) {
              setJobTitle(titleFromBillable(bi));
              setPayerName(pickCompanyName);
              setAmount(amountFromBillable(bi));
              return;
            }
          } catch {
            /* ใช้ default */
          }
        }

        if (!cancelled) {
          if (state?.amount) setAmount(Number(state.amount));
          setJobTitle((t) => t || "รายการชำระเงิน");
        }
      } catch {
        /* swallow */
      }
    };

    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, [paymentId, billableItemId, state?.amount]);

  /* 3) สร้าง QR + ผูก countdown + รองรับ refresh */
  useEffect(() => {
    (async () => {
      if (!amount || amount <= 0) {
        setQrSrc("");
        setCountStartAt(undefined);
        setExpired(true);
        return;
      }
      try {
        const receiver = String(promptpay).replace(/\D/g, "");
        const payload = generatePayload(receiver, { amount });
        const url = await QRCode.toDataURL(payload, {
          width: 280,
          margin: 1,
          errorCorrectionLevel: "M",
        });
        setQrSrc(url);
        setCountStartAt(Date.now()); // เริ่มนับ 15 นาทีตั้งแต่สร้างสำเร็จ
        setExpired(false);
      } catch (e) {
        console.error(e);
        message.error("ไม่สามารถสร้าง QR ได้");
        setQrSrc("");
        setCountStartAt(undefined);
        setExpired(true);
      }
    })();
  }, [amount, promptpay, qrNonce]);

  const refreshQR = () => setQrNonce((n) => n + 1);

  /* 4) เปิดปุ่มส่งเมื่อมี paymentId และมีไฟล์ และ QR ยังไม่หมดอายุ */
  const canSubmit = useMemo(
    () => !!paymentId && !!(evidence || fileList.length > 0) && !expired,
    [paymentId, evidence, fileList, expired]
  );

  /* 5) อัปโหลดหลักฐาน → BE อัปเดตสถานะเป็น "ตรวจสอบ" → สร้างใบเสร็จ (dynamic import) */
  const handleUpload = async () => {
    if (!paymentId) return message.error("ไม่พบรหัสการชำระเงิน");

    const realFile =
      evidence ?? (fileList[0]?.originFileObj as File | undefined);
    if (!realFile) return message.warning("กรุณาเลือกไฟล์หลักฐาน");

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("evidence", realFile, realFile.name);
      await paymentAPI.uploadEvidence(Number(paymentId), fd);

      let reportId: number | null = null;
      try {
        const mod = await import("./generateandupload");
        const generateAndUploadReportReactPDF =
          (mod as any).generateAndUploadReportReactPDF ?? (mod as any).default;

        type GenArgs = {
          paymentId: number;
          amount: number;
          date: string;
          jobTitle?: string;
          employerName?: string;
        };

        const result = await (
          generateAndUploadReportReactPDF as (a: GenArgs) => Promise<any>
        )({
          paymentId: Number(paymentId),
          amount,
          date: new Date().toISOString(),
          jobTitle,
          employerName: payerName,
        });

        const uploadResp = (result?.uploadResp ?? result) as any;
        const payload = uploadResp?.data ?? uploadResp ?? {};
        const id = payload?.report_id ?? payload?.ID ?? payload?.id ?? null;

        reportId = Number.isFinite(Number(id)) ? Number(id) : null;
        setCreatedReportId(reportId ?? null);
      } catch (e) {
        console.warn("generate PDF failed:", e);
        message.warning("บันทึกหลักฐานสำเร็จ แต่สร้างใบเสร็จไม่สำเร็จ");
      }

      setFileList([]);
      setEvidence(null);
      message.success("อัปโหลดหลักฐานสำเร็จ");
      setSuccessOpen(true);
    } catch (e: any) {
      console.error(e);
      message.error(
        e?.response?.data?.error || e?.message || "อัปโหลดหลักฐานไม่สำเร็จ"
      );
    } finally {
      setUploading(false);
    }
  };

  const goToPaymentReports = () => {
    navigate("/payment-report", {
      state: {
        flash: "ออกใบเสร็จเรียบร้อย",
        highlightId: createdReportId,
      },
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="payment-page-container" style={{ padding: 24 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>
            QR PromptPay
          </Title>
          <Text type="secondary">สแกนเพื่อชำระเงิน</Text>
        </div>

        {/* QR */}
        <Card style={{ borderRadius: 14, marginBottom: 16 }}>
          <Space
            direction="vertical"
            style={{ width: "100%" }}
            size={12}
            align="center"
          >
            {qrSrc ? (
              <img
                src={qrSrc}
                alt="PromptPay QR"
                style={{ width: 280, height: 280 }}
              />
            ) : (
              <QrcodeOutlined style={{ fontSize: 64 }} />
            )}

            {qrSrc && (
              <QRCountdown
                startAt={countStartAt}
                minutes={15}
                onExpire={() => setExpired(true)}
              />
            )}
            {expired && (
              <Text type="danger">QR หมดอายุแล้ว • กรุณากด “รีเฟรช QR”</Text>
            )}

            <Text type="secondary">ชื่อบัญชี: นางสาวพนิดา โต๊ะเหลือ</Text>
            <Text>
              ยอดชำระ <Text strong>{amount.toLocaleString()} บาท</Text>
            </Text>

            <Button onClick={refreshQR} disabled={!amount}>
              รีเฟรช QR
            </Button>
          </Space>
        </Card>

        {/* อัปโหลดหลักฐาน */}
        <Card style={{ borderRadius: 14 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Upload
              accept=".jpg,.jpeg,.png,.pdf"
              multiple={false}
              maxCount={1}
              fileList={fileList}
              beforeUpload={(file) => {
                setEvidence(file as File);
                setFileList([
                  {
                    uid: (file as any).uid ?? String(Date.now()),
                    name: file.name,
                    status: "done",
                    originFileObj: file,
                  } as UploadFile,
                ]);
                return false;
              }}
              onChange={(info) => {
                setFileList(info.fileList);
                const latest = info.fileList[info.fileList.length - 1];
                setEvidence((latest?.originFileObj as File) ?? null);
              }}
              onRemove={() => {
                setFileList([]);
                setEvidence(null);
              }}
            >
            <Button type="link" style={{fontSize: 14, textDecoration: 'underline'}}>แนบหลักฐานการชำระเงิน</Button>
            </Upload>
            <Button
              type="primary"
              block
              disabled={!canSubmit}
              loading={uploading}
              onClick={handleUpload}
            >
              อัปโหลดหลักฐาน
            </Button>
          </Space>
        </Card>
      </div>

      {/* Modal สำเร็จ */}
      <Modal
        open={successOpen}
        footer={null}
        centered
        closable
        onCancel={closeModal}
        maskClosable
      >
        <Result
          status="success"
          icon={<CheckCircleFilled style={{ color: "#52c41a" }} />}
          title={<span style={{ fontSize: 24 }}>ชำระเงินสำเร็จ</span>}
          subTitle={
            <>
              <div>บันทึกหลักฐานและออกใบเสร็จเรียบร้อย</div>
              {paymentId && (
                <div style={{ marginTop: 4 }}>
                  หมายเลขการชำระเงิน <Text strong>#{paymentId}</Text>
                  {amount ? (
                    <>
                      {" "}
                      • ยอด <Text strong>{amount.toLocaleString()} บาท</Text>
                    </>
                  ) : null}
                </div>
              )}
            </>
          }
          extra={
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button type="primary" block onClick={goToPaymentReports}>
                ดูรายการใบเสร็จ
              </Button>
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

export default QRPromptpayPage;
