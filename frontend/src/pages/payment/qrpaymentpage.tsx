// src/pages/payments/QRPromptpayPage.tsx - แก้ไขด้วย state polling แทน delay

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
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
  Flex,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { CheckCircleFilled } from "@ant-design/icons";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";
import { asData } from "../../utils";
import {
  paymentAPI,
  billableItemAPI,
  paymentReportAPI,
} from "../../services/https";
import QRCountdown from "./qrcountdown";
import type { Payment } from "../../interfaces/payment";
import type { Billableitem } from "../../interfaces/billableitem";
import {
  payerFromPayment,
  getEmployerAddress,
  getPaymentMethodName,
  getJobTitle,
  getAmountFromData,
} from "../../utils/index";
const { Title, Text } = Typography;

// const toBaht = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

type QRNavState = { paymentId?: number; amount?: number };

/* ---------------- Component ---------------- */
const QRPromptpayPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("kanit-font");
    return () => document.body.classList.remove("kanit-font");
  }, []);

  const [searchParams] = useSearchParams();
  const rrLocation = useLocation() as { state?: QRNavState };
  const navState: QRNavState = rrLocation.state ?? {};

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

  const [amount, setAmount] = useState(
    () => Math.round(Number(navState.amount ?? 0) * 100) / 100
  );
  const [qrSrc, setQrSrc] = useState("");
  const promptpay = "0820657892";
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // countdown
  const [countStartAt, setCountStartAt] = useState<number | undefined>();
  const [expired, setExpired] = useState(false);
  const [qrNonce, setQrNonce] = useState(0);

  // ข้อมูลสำหรับ PDF
  const [jobTitle, setJobTitle] = useState("รายการชำระเงิน");
  const [payerName, setPayerName] = useState("ผู้ชำระเงิน");
  const [payerAddress, setPayerAddress] = useState("ที่อยู่ไม่ระบุ");
  const [paymentMethodName, setPaymentMethodName] = useState("PromptPay");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [createdReportId, setCreatedReportId] = useState<number | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  // ใช้ ref เพื่อ track ข้อมูลล่าสุด
  const dataRef = useRef({
    jobTitle: "รายการชำระเงิน",
    payerName: "ผู้ชำระเงิน",
    payerAddress: "ที่อยู่ไม่ระบุ",
    paymentMethodName: "PromptPay",
    amount: 0,
  });

  // ฟังก์ชันตรวจสอบว่าข้อมูลเปลี่ยนจาก default หรือยัง
  const hasRealData = useCallback(() => {
    return (
      jobTitle !== "รายการชำระเงิน" ||
      payerName !== "ผู้ชำระเงิน" ||
      payerAddress !== "ที่อยู่ไม่ระบุ" ||
      paymentMethodName !== "PromptPay"
    );
  }, [jobTitle, payerName, payerAddress, paymentMethodName]);

  // ฟังก์ชันรอให้ข้อมูลพร้อม
  const waitForData = useCallback(
    async (maxWaitMs: number = 10000): Promise<boolean> => {
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitMs) {
        if (hasRealData()) {
          return true; // มีข้อมูลจริงแล้ว
        }
        await new Promise((resolve) => setTimeout(resolve, 100)); // รอ 100ms แล้วลองใหม่
      }

      return false; // timeout
    },
    [hasRealData]
  );

  // อัปเดต ref เมื่อ state เปลี่ยน
  useEffect(() => {
    dataRef.current = {
      jobTitle,
      payerName,
      payerAddress,
      paymentMethodName,
      amount,
    };
    console.log('🔄 [State/Ref Update] dataRef อัปเดตเป็น:', dataRef.current);
  }, [jobTitle, payerName, payerAddress, paymentMethodName, amount]);

  const closeModal = () => {
    setSuccessOpen(false);
    navigate("/my-jobs");
  };

  // // ดึง amount จาก billable item ถ้าไม่มี
  // useEffect(() => {
  //   const fetchAmount = async () => {
  //     if (amount > 0) return;
  //     if (!billableItemId) return;

  //     try {
  //       const res = await billableItemAPI.getById(Number(billableItemId));
  //       const item = asData(res) as Billableitem;

  //       const amt = getAmountFromData(item);
  //       if (amt > 0) setAmount(toBaht(amt));
  //     } catch (error) {
  //       // Silent error
  //     }
  //   };
  //   void fetchAmount();
  // }, [billableItemId, amount]);

  // โหลดข้อมูลหลัก
  useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      try {
        let success = false;

        // Priority 1: ลอง payment API
        if (paymentId && !success) {
          try {
            const res = await paymentAPI.getById(Number(paymentId));
            const p = asData(res) as Payment;

            if (!cancelled && p) {
              const title = getJobTitle(p);
              const payer = payerFromPayment(p);
              const address = getEmployerAddress(p);
              const method = getPaymentMethodName(p);
              const amt = getAmountFromData(p);
              console.log('✅ [API Payment] ข้อมูลที่ได้:', { payer, address });
              setJobTitle(title);
              setPayerName(payer);
              setPayerAddress(address);
              setPaymentMethodName(method);
              if (amt > 0) setAmount(amt);

              success = true;
            }
          } catch (error) {
            // Silent fail
          }
        }

        // Priority 2: ลอง billable API
        if (billableItemId && !success && !cancelled) {
          try {
            const rb = await paymentAPI.getLatestByBillable(
              Number(billableItemId)
            );
            const p = asData(rb) as Payment;

            if (p) {
              const title = getJobTitle(p);
              const payer = payerFromPayment(p);
              const address = getEmployerAddress(p);
              const method = getPaymentMethodName(p);
              const amt = getAmountFromData(p);

              setJobTitle(title);
              setPayerName(payer);
              setPayerAddress(address);
              setPaymentMethodName(method);
              if (amt > 0) setAmount(amt);

              success = true;
            }
          } catch (error) {
            // Silent fail
          }
        }

        // Priority 3: ลองดึงจาก Payment Reports
        if (!success && !cancelled) {
          try {
            const reportsRes = await paymentReportAPI.getMine();
            const reports = asData(reportsRes);

            if (Array.isArray(reports) && reports.length > 0) {
              let targetReport =
                reports.find((r: any) => r.payment?.ID === paymentId) ||
                reports[0];

              if (targetReport?.payment) {
                const p = targetReport.payment;

                const title = getJobTitle(p);
                const payer = payerFromPayment(p);
                const address = getEmployerAddress(p);
                const method = getPaymentMethodName(p);
                const amt = getAmountFromData(p);

                setJobTitle(title);
                setPayerName(payer);
                setPayerAddress(address);
                setPaymentMethodName(method);
                if (amt > 0) setAmount(amt);

                success = true;
              }
            }
          } catch (error) {
            // Silent fail
          }
        }

        // Priority 4: ลอง billable item ตรงๆ
        if (billableItemId && !success && !cancelled) {
          try {
            const biRes = await billableItemAPI.getById(Number(billableItemId));
            const bi = asData(biRes) as Billableitem;

            if (bi) {
              const title =
                bi.job_application?.jobpost?.title ||
                bi.description ||
                "รายการชำระเงิน";
              const amt = getAmountFromData(bi);

              setJobTitle(title);
              if (amt > 0) setAmount(amt);

              if (bi.job_application?.jobpost?.employer) {
                const payer =
                  bi.job_application?.jobpost.employer.company_name ||
                  "ผู้ชำระเงิน";
                const address =
                  bi.job_application?.jobpost.employer.address ||
                  "ที่อยู่ไม่ระบุ";
                console.log('✅ [API BillableItem] ข้อมูลที่ได้:', { payer, address });
                setPayerName(payer);
                setPayerAddress(address);
              }

              success = true;
            }
          } catch (error) {
            // Silent fail
          }
        }

        // Final fallback
        if (!success && !cancelled && state?.amount) {
          setAmount(Number(state.amount));
        }
      } catch (error) {
        // Silent error
      }
    };

    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, [paymentId, billableItemId, state?.amount]);

  // โหลด logo
  useEffect(() => {
    const convertLogoToDataUrl = async () => {
      const logoUrls = [
        "/assets/logo.svg",
        "/logo.svg",
        "/assets/logo.png",
        "/logo.png",
      ];

      for (const url of logoUrls) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            setLogoDataUrl(result);
          };
          reader.readAsDataURL(blob);
          return;
        } catch (error) {
          // Silent fail
        }
      }
    };
    void convertLogoToDataUrl();
  }, []);

  // สร้าง QR Code
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
        setCountStartAt(Date.now());
        setExpired(false);
      } catch (e) {
        message.error("ไม่สามารถสร้าง QR ได้");
        setQrSrc("");
        setCountStartAt(undefined);
        setExpired(true);
      }
    })();
  }, [amount, promptpay, qrNonce]);

  const canSubmit = useMemo(
    () => !!paymentId && !!(evidence || fileList.length > 0) && !expired,
    [paymentId, evidence, fileList, expired]
  );

  const handleUpload = useCallback(async () => {
    if (!paymentId) return message.error("ไม่พบรหัสการชำระเงิน");

    const realFile =
      evidence ?? (fileList[0]?.originFileObj as File | undefined);
    if (!realFile) return message.warning("กรุณาเลือกไฟล์หลักฐาน");

    try {
      setUploading(true);

      const hideLoading = message.loading("กำลังตรวจสอบข้อมูล...", 0);

      const dataReady = await waitForData(10000); // รอสูงสุด 10 วินาที
      hideLoading();

      if (!dataReady) {
        message.warning("ไม่สามารถโหลดข้อมูลได้ จะใช้ข้อมูลพื้นฐาน");
      }

      const fd = new FormData();
      fd.append("evidence", realFile, realFile.name);
      await paymentAPI.uploadEvidence(Number(paymentId), fd);

      let reportId: number | null = null;
      try {
        const currentData = dataRef.current;

        const mod = await import("./generateandupload");
        const generateAndUploadReportReactPDF =
          (mod as any).generateAndUploadReportReactPDF ?? (mod as any).default;

        const result = await generateAndUploadReportReactPDF({
          paymentId: Number(paymentId),
          amount: currentData.amount || amount,
          date: new Date().toISOString(),
          jobTitle: currentData.jobTitle,
          employerName: currentData.payerName,
          employerAddress: currentData.payerAddress,
          method_name: currentData.paymentMethodName,
          logoDataUrl: logoDataUrl,
        });
        console.log('🔥 [To PDF] ข้อมูลที่กำลังจะส่งไปสร้าง PDF:', currentData);
        const resp = (result?.uploadResp ?? result) as any;
        const data = resp?.data?.data ?? resp?.data ?? resp ?? {};
        const id = data?.ID ?? data?.id ?? data?.report_id ?? null;
        reportId = Number.isFinite(Number(id)) ? Number(id) : null;
        setCreatedReportId(reportId ?? null);
      } catch (e) {
        message.warning("บันทึกหลักฐานสำเร็จ แต่สร้างใบเสร็จไม่สำเร็จ");
      }

      setFileList([]);
      setEvidence(null);
      message.success("อัปโหลดหลักฐานสำเร็จ");
      setSuccessOpen(true);
    } catch (e: any) {
      message.error(
        e?.response?.data?.error || e?.message || "อัปโหลดหลักฐานไม่สำเร็จ"
      );
    } finally {
      setUploading(false);
    }
  }, [paymentId, evidence, fileList, waitForData, logoDataUrl, amount]);

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
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ color: "#1E3A5F" }}>
              QR PromptPay
            </Title>
            <Text type="secondary">สแกนเพื่อชำระเงิน</Text>
          </div>

          {/* QR */}
          <div style={{ textAlign: "center" }}>
            {qrSrc ? (
              <img
                src={qrSrc}
                alt="QR Code"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            ) : (
              <div
                style={{
                  width: "28%",
                  height: "28%",
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <Text type="secondary">กำลังโหลด QR Code...</Text>
              </div>
            )}
            <br></br>
            {qrSrc && (
              <QRCountdown
                startAt={countStartAt}
                durationMinutes={15}
                onExpired={() => setExpired(true)}
              />
            )}

            {expired && (
              <Text type="danger">QR หมดอายุแล้ว • กรุณากด "รีเฟรช QR"</Text>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "#1E3A5F" }}>
              ชื่อบัญชี: นางสาวพนิดา โต๊ะเหลือ
            </Text>
            <br />
            <Text style={{ color: "#1E3A5F" }}>
              ยอดชำระ{" "}
              <Text style={{ color: "#1E3A5F" }} strong>
                {amount.toLocaleString()} บาท
              </Text>
            </Text>
          </div>

          <Flex justify="center">
            <Button
              type="default"
              onClick={() => setQrNonce((n) => n + 1)}
              disabled={!amount}
            >
              รีเฟรช QR
            </Button>
          </Flex>

          {/* อัปโหลดหลักฐาน */}
            <Upload
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
              accept="image/*,.pdf"
              maxCount={1}
            >
              <Button type="dashed" block>
                แนบหลักฐานการชำระเงิน
              </Button>
            </Upload>

          <Button
            type="primary"
            block
            size="large"
            disabled={!canSubmit}
            loading={uploading}
            onClick={handleUpload}
          >
            ยืนยันการชำระเงิน
          </Button>
        </Space>
      </Card>

      {/* Modal สำเร็จ */}
      <Modal
        open={successOpen}
        footer={null}
        onCancel={closeModal}
        centered
        closable={false}
      >
        <Result
          icon={<CheckCircleFilled style={{ color: "#52c41a" }} />}
          title="ชำระเงินสำเร็จ"
          subTitle={
            <>
              บันทึกหลักฐานและออกใบเสร็จเรียบร้อย
              {paymentId && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    หมายเลขการชำระเงิน #{paymentId}
                    {amount ? <> • ยอด {amount.toLocaleString()} บาท</> : null}
                  </Text>
                </div>
              )}
            </>
          }
          extra={
            <Space>
              <Button type="primary" onClick={goToPaymentReports}>
                ดูรายการใบเสร็จ
              </Button>
              <Button onClick={closeModal}>ปิด</Button>
            </Space>
          }
        />
      </Modal>
    </div>
  );
};

export default QRPromptpayPage;
