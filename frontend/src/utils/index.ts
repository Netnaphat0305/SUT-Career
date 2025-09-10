// utils/payments.ts
// 
export const asData = <T,>(r: any): T => (r?.data?.data ?? r?.data ?? r) as T;
// แปลงค่าเป็นตัวเลข ถ้าไม่ใช่ตัวเลขให้คืนค่าเริ่มต้น
export const getNum = (v: any, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
// แปลง Date เป็นวันที่ภาษาไทยแบบ “02 กันยายน 2568”
export const toTHDate = (d?: Date | null) =>
  d ? d.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" }) : "-";
// เช็กสตริงสถานะว่าดูเป็น “จ่ายแล้ว” ไหม (เช่น paid, ชำระ, สำเร็จ, success)
export const isPaidStatus = (s?: string | null) => /paid|ชำระ|สำเร็จ|success/i.test(String(s || ""));
// สรุปว่า “จ่ายแล้ว” ถ้าพบหลักฐาน (proof_of_payment/evidence ฯลฯ) หรือ สถานะที่แสดงว่าชำระแล้ว
export const hasPaidWithProof = (p: any) => {
  const proof = p?.proof_of_payment || p?.ProofOfPayment || p?.proof || p?.evidence || "";
  const statusName =
    p?.PaymentStatus?.status_name ||
    p?.payment_status?.status_name ||
    p?.Status?.status_name ||
    p?.status_name ||
    p?.status ||
    "";
  return Boolean(proof) || isPaidStatus(statusName);
};
// หายอดเต็มก่อนหักส่วนลด จากฟิลด์ที่อยู่ใน job หรือ order
export const resolveGrossAmount = (job?: any, order?: any): number => {
  const fromJob = getNum(job?.amount) || getNum(job?.salary) || getNum(job?.price);
  const fromOrder = getNum(order?.subtotal) || getNum(order?.total);
  return Math.max(0, fromJob || fromOrder || 0);
};
// เช็กว่าขณะนี้อยู่ในช่วงวันที่กำหนดหรือไม่ (ใช้กับช่วงเวลาคูปอง)
export const isWithin = (now: Date, from?: Date | string, to?: Date | string) => {
  const f = from ? new Date(from) : undefined;
  const t = to ? new Date(to) : undefined;
  if (f && now < f) return false;
  if (t && now > t) return false;
  return true;
};
// คำนวณส่วนลดจากคูปอง (รองรับแบบเปอร์เซ็นต์และแบบจำนวนคงที่) โดยจะไม่ให้ติดลบ/เกินยอดฐาน
export const calcDiscount = (d: { discount_type?: string; discount_value?: number } | null | undefined, base: number) => {
  if (!d) return 0;
  const t = (d.discount_type || "").toLowerCase();
  if (t === "percent" || t === "percentage") {
    const off = Math.floor(((d.discount_value || 0) / 100) * base);
    return Math.max(0, Math.min(off, base));
  }
  return Math.max(0, Math.min(Number(d.discount_value || 0), base));
};

export const getHttpStatus = (e: any) => e?.response?.status ?? e?.status ?? 0;
export const getHttpMessage = (e: any) => {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  return d?.error || e?.message || "";
};

// ----- Payment-like checks -----
export const getStatusName = (p: any) =>
  p?.PaymentStatus?.status_name ??
  p?.payment_status?.status_name ??
  p?.Status?.status_name ??
  p?.status_name ??
  p?.status ??
  "";

export const getStatusId = (p: any) =>
  Number(p?.status_id ?? p?.StatusID ?? p?.payment_status_id ?? NaN);

export const isPaidWord = (s?: string | null) =>
  /paid|success|settled|complete|completed|ชำระ|สำเร็จ|เรียบร้อย|เสร็จ/i.test(
    String(s || "")
  );

export const hasPaidFlag = (p: any) =>
  Boolean(
    p?.paid === true ||
    p?.is_paid === true ||
    p?.settled === true ||
    p?.isSettled === true
  );

/** ดึง URL หลักฐาน (คงตัวนี้ไว้ตามที่คุณมี) */
export const extractProofUrls = (p: any): string[] => {
  const c: string[] = [];
  const v = [
    p?.proof_of_payment,
    p?.ProofOfPayment,
    p?.proof,
    p?.evidence,
  ].filter(Boolean);
  v.forEach((x) => {
    if (!x) return;
    if (Array.isArray(x)) c.push(...x.map(String));
    else c.push(String(x));
  });
  return c.filter(Boolean);
};

export const isPaidLike = (p: any): boolean => {
  if (!p) return false;

  const hasProof = extractProofUrls(p).length > 0;

  const statusId = Number(
    p?.status_id ??
    p?.StatusID ??
    p?.payment_status_id ??
    p?.PaymentStatusID
  );

  const code = String(
    p?.status_code ??
    p?.StatusCode ??
    p?.payment_status?.code ??
    p?.PaymentStatus?.code ??
    ""
  ).toLowerCase();

  const name = String(
    p?.status_name ??
    p?.StatusName ??
    p?.payment_status?.status_name ??
    p?.PaymentStatus?.status_name ??
    ""
  ).toLowerCase();

  const PAID_STATUS_IDS = new Set<number>();
  const PAID_CODES = new Set(["paid", "settled", "completed"]);
  const isPaidById = PAID_STATUS_IDS.has(statusId);
  const isPaidByCode = code && PAID_CODES.has(code);
  const isPaidByName = /(paid|ชำระแล้ว|ชำระเงินแล้ว)/i.test(name);

  return hasProof || isPaidById || isPaidByCode || isPaidByName;
};

export const pickPaid = (res: any) => {
  const data = (res?.data?.data ?? res?.data ?? res) as any;
  if (!data) return null;
  if (Array.isArray(data)) return data.find(isPaidLike) || null;
  return isPaidLike(data) ? data : null;
};

export const pickCompanyName = (obj: any): string => {
  const e = obj?.employer ?? obj?.Employer ?? obj ?? {};
  const fullName = [e?.first_name, e?.last_name].filter(Boolean).join(" ").trim();
  return (
    e?.company_name ??
    e?.CompanyName ??
    e?.name ??
    e?.Name ??
    (fullName || "")
  );
};

export const pickFullName = (e: any): string | null => {
  if (!e) return null;
  const direct = e.full_name ?? e.fullname ?? e.contact_name ?? e.ContactName ?? null;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const first =
    e.first_name ?? e.FirstName ?? e.firstname ?? e.user?.first_name ?? e.user?.FirstName ?? "";
  const last =
    e.last_name ?? e.LastName ?? e.lastname ?? e.user?.last_name ?? e.user?.LastName ?? "";
  const merged = [first, last].filter(Boolean).join(" ").trim();
  return merged || null;
};

export const triggerDownload = (url: string, filename?: string) => {
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  if (filename) a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
};


// review utils
export const parseToDate = (v?: string | number | Date | null): Date | null => {
  if (v == null) return null;

  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

  if (typeof v === "number") {
    const ms = v < 1e12 ? v * 1000 : v;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const s = String(v).trim();
  if (!s || s.startsWith("0001-01-01")) return null;

  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

export const toTHDateTime = (v?: string | number | Date | null, empty = ""): string => {
  const d = parseToDate(v);
  return d
    ? d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" })
    : empty;
};