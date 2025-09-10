// src/features/paymentreports/generateandupload.reactpdf.tsx
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { paymentReportAPI } from "../../services/https";
import type { GenReportInputReactPDF } from "../../interfaces/paymentreport";

import THSarabunReg        from "../../../public/fonts/THSarabunNew.ttf";
import THSarabunBold       from "../../../public/fonts/THSarabunNew Bold.ttf";
import THSarabunItalic     from "../../../public/fonts/THSarabunNew Italic.ttf";
import THSarabunBoldItalic from "../../../public/fonts/THSarabunNew BoldItalic.ttf";

dayjs.locale("th");

const TH: React.FC<{ style?: any; children?: any }> = ({ style, children }) => {
  const raw = Array.isArray(children) ? String(children.join("")) : String(children ?? "");
  const fixed = raw.replace(/\u0E33/g, "\u0E4D\u0E32");
  return <Text style={style}>{fixed}</Text>;
};

try {
  Font.register({
    family: "THSarabunNew",
    fonts: [
      { src: THSarabunReg },
      { src: THSarabunBold,       fontWeight: 700 },
      { src: THSarabunItalic,     fontStyle: "italic" },
      { src: THSarabunBoldItalic, fontWeight: 700, fontStyle: "italic" },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
} catch (e) {
  console.warn("Font register failed:", e);
}

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "THSarabunNew", fontSize: 12, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandText: { fontSize: 22, fontWeight: 700, color: "#1E3A5F" },
  docTitle: { fontSize: 14, fontWeight: 700, color: "#0f172a", textAlign: "right" },
  docSub: { fontSize: 10, color: "#6b7280", textAlign: "right" },
  hr: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 10 },
  sectionBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  row: { flexDirection: "row", marginBottom: 6 },
  label: { width: 170, color: "#6b7280" },
  value: { flex: 1, fontWeight: 500 },
  successRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  successDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#16a34a", marginRight: 6 },
  note: { marginTop: 10, fontSize: 10, color: "#6b7280" },
});

function formatThaiDateBuddhist(isoOrDate: string | null) {
  const d = dayjs(isoOrDate);
  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  return `${d.date()} ${months[d.month()]} ${d.year() + 543} เวลา ${d.format("HH:mm")} น.`;
}

const thMoney = (n: number) =>
  `${Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;

export async function generateAndUploadReportReactPDF(input: GenReportInputReactPDF) {
  const {
    paymentId,
    amount,
    date: dateInput = new Date(),
    method_name,
    jobTitle,
    employerName,
    employerAddress,     // เผื่อใช้ตอนหลัง
    logoDataUrl,
  } = input;

  // ข้อความตามที่สั่ง
  const brandName = "SUT Career";
  const titleText = jobTitle?.trim() ? jobTitle.trim() : "รายการชำระเงิน";
  const companyText = employerName?.trim() ? employerName.trim() : "-";
  const AddressText = employerAddress?.trim() ? employerAddress.trim() : "-";
  const payeeText = "บริษัท SUT Career";
  const date = typeof dateInput === "string" ? dateInput : dateInput.toISOString();

  const Doc = (
    <Document author={brandName} title={`Receipt #${paymentId}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* ซ้าย: โลโก้มุมบนซ้าย + SUT Career */}
          <View style={styles.brandRow}>
            {logoDataUrl ? <Image src={logoDataUrl} style={{ width: 36, height: 36, marginRight: 8 }} /> : null}
            <TH style={styles.brandText}>{brandName}</TH>
          </View>

          {/* ขวา: ชื่อเอกสาร + เลขที่/วันออก */}
          <View>
            <TH style={styles.docTitle}>ใบเสร็จรับเงินอิเล็กทรอนิกส์</TH>
            <TH style={styles.docSub}>เลขที่เอกสาร: #{String(paymentId)}</TH>
            <TH style={styles.docSub}>ออก ณ วันที่ {formatThaiDateBuddhist(date)}</TH>
          </View>
        </View>

        <View style={styles.hr} />

        {/* กล่องสรุปตามลำดับที่ต้องการ */}
        <View style={styles.sectionBox}>
          <View style={styles.row}>
            <TH style={styles.label}>ผู้ชำระเงิน</TH>
            <TH style={styles.value}>{companyText}</TH>
          </View>

          <View style={styles.row}>
            <TH style={styles.label}>ที่อยู่</TH>
            <TH style={styles.value}>{AddressText}</TH>
          </View>

          <View style={styles.row}>
            <TH style={styles.label}>รายการที่ชำระ</TH>
            <TH style={styles.value}>{titleText}</TH>
          </View>

          <View style={styles.row}>
            <TH style={styles.label}>จำนวนเงิน</TH>
            <TH style={styles.value}>{thMoney(amount)}</TH>
          </View>

          <View style={styles.row}>
            <TH style={styles.label}>ผู้รับเงิน</TH>
            <TH style={styles.value}>{payeeText}</TH>
          </View>

          {/* แสดงวิธีชำระ/วันที่ เผื่ออ้างอิง (ไม่บังคับ) */}
          <View style={styles.row}>
            <TH style={styles.label}>ช่องทางชำระ</TH>
            <TH style={styles.value}>{method_name}</TH>
          </View>
          <View style={styles.row}>
            <TH style={styles.label}>วันที่ชำระ</TH>
            <TH style={styles.value}>{formatThaiDateBuddhist(date)}</TH>
          </View>
        </View>

        {/* สถานะ */}
        <View style={styles.successRow}>
          <View>
            <TH style={{ fontSize: 10, color: "#6b7280" }}>
              เอกสารนี้ออกโดยระบบอิเล็กทรอนิกส์ ใช้เป็นหลักฐานการชำระเงิน
            </TH>
          </View>
        </View>

        <TH style={styles.note}>
          หมายเหตุ: เอกสารนี้ใช้เป็นหลักฐานการชำระเงินเท่านั้น ไม่ใช่ใบกำกับภาษี
        </TH>
      </Page>
    </Document>
  );

  // สร้าง & อัปโหลด
  const blob = await pdf(Doc).toBlob();
  const filename = `receipt-${paymentId}.pdf`;

  const fd = new FormData();
  fd.append("file", new File([blob], filename, { type: "application/pdf" }));
  fd.append("payment_id", String(paymentId));

  const uploadResp = await paymentReportAPI.upload(fd);
  return { blob, filename, uploadResp };
}

// ให้ import ได้ทั้ง default และ named
export default generateAndUploadReportReactPDF;