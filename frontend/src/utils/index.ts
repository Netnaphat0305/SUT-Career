// utils/payments.ts
// 
export const asData = <T,>(r: any): T => (r?.data?.data ?? r?.data ?? r) as T;
// แปลงค่าเป็นตัวเลข ถ้าไม่ใช่ตัวเลขให้คืนค่าเริ่มต้น
export const getNum = (v: any, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
// แปลง Date เป็นวันที่ภาษาไทยแบบ “02 กันยายน 2568”
export const toTHDate = (d?: Date | null) =>
  d ? d.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" }) : "-";
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