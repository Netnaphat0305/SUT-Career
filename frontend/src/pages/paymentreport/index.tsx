import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Tag,
  Button,
  Space,
  message,
  Input,
  Tooltip,
  Table,
  Flex,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import { paymentReportAPI } from "../../services/https";
import "./paymentreport.css";

const { Title, Text } = Typography;

type PaymentReportRow = {
  id?: number;
  reportname?: string;
  filepath?: string;
  create_date?: string;
  payment?: {
    id?: number;
    datetime?: string;
    status?: { status_name?: string };
    payment_method?: { methodname?: string };
    billable_item?: {
      description?: string;
      jobpost?: { id?: number; title?: string; employer?: { company_name?: string; address?: string } };
    };
    jobpost?: { id?: number; title?: string; employer?: { company_name?: string; address?: string } };
  };
  jobpost?: { id?: number; title?: string; employer?: { company_name?: string; address?: string } };
};

const asData = <T,>(r: any): T => (r?.data?.data ?? r?.data ?? r) as T;

const formatThaiDateTime = (iso?: string) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
    const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return `${date} เวลา ${time} น.`;
  } catch {
    return "-";
  }
};

const getStatusTag = (name?: string) => {
  if (!name) return <Tag>UNKNOWN</Tag>;
  const n = String(name).toLowerCase();
  const color =
    n.includes("สำเร็จ") || n === "success"
      ? "green"
      : n.includes("ค้าง") || n.includes("pending")
        ? "orange"
        : n.includes("ล้มเหลว") || n.includes("fail")
          ? "red"
          : "default";
  return <Tag color={color}>{name}</Tag>;
};

const PaymentReportPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("kanit-font");
    return () => document.body.classList.remove("kanit-font");
  }, []);

  const navigate = useNavigate();
  const location = useLocation() as any;
  const highlightIdFromNav = location?.state?.highlightId ?? null;
  const flashMsg = location?.state?.flash ?? null;

  const [rows, setRows] = useState<PaymentReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resp = await paymentReportAPI.getMine();
      const data = asData<any[]>(resp);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (flashMsg) message.success(flashMsg, 3);
    if (highlightIdFromNav != null) {
      navigate(".", { replace: true, state: {} });
    }
  }, []);

  const sortedRows = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const ta = new Date(a.create_date || a.payment?.datetime || 0).getTime() || 0;
      const tb = new Date(b.create_date || b.payment?.datetime || 0).getTime() || 0;
      return ta - tb;
    });
    return arr;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedRows;
    return sortedRows.filter((r) => {
      const title =
        r.payment?.billable_item?.jobpost?.title ??
        r.payment?.jobpost?.title ??
        r.jobpost?.title ??
        r.reportname ??
        "ไม่พบชื่อรายการ";
      const sub = r.payment?.billable_item?.description ?? "";
      const file = (r.filepath ?? "").split("/").pop() ?? "—";
      return title.toLowerCase().includes(q) || sub.toLowerCase().includes(q) || file.toLowerCase().includes(q);
    });
  }, [sortedRows, search]);

  const tableData = useMemo(() => {
    return filteredRows.map((r, idx) => {
      const reportId = r?.id ?? undefined;;

      const title =
        r.payment?.billable_item?.jobpost?.title ??
        r.payment?.jobpost?.title ??
        r.jobpost?.title ??
        r.reportname ??
        "ไม่พบชื่อรายการ";

      const fileName = r.filepath ? r.filepath.split("/").pop() : "—";
      const when = r.create_date || undefined;
      const method =
        r.payment?.payment_method?.methodname ??                 // เคสที่เป็นเอกพจน์
        (r.payment as any)?.payment_methods?.methodname ??       // เคส snake_case
        (r.payment as any)?.PaymentMethods?.methodname ??        // เคส PascalCase จาก Go
        (r as any)?.payment_method_name ??                       // เผื่อ BE ส่งมาฟิลด์แยก
        "-";
      return {
        key: r.id ?? `${idx}`,
        id: reportId,
        title,
        method,
        fileName,
        whenOrStatus: <Text>{formatThaiDateTime(when)}</Text>,
        fileHref: r.filepath ?? "",
        highlight: highlightIdFromNav != null && String(highlightIdFromNav) === String(r.id),
      };
    });
  }, [filteredRows, highlightIdFromNav]);

  const columns: ColumnsType<(typeof tableData)[number]> = [
    {
      title: "รหัส",
      dataIndex: "id",
      width: "10%",
      align: "left" as const,
      render: (v) => (v ?? "—"),
    },
    {
      title: "ชื่องาน",
      dataIndex: "title",
      width: "30%",
      ellipsis: true,
    },
    {
      title: "วิธีชำระ",
      dataIndex: "method",
      width: "20%",
      align: "left" as const,
    },
    {
      title: "วันที่และเวลา",
      dataIndex: "whenOrStatus",
      width: "20%",
      align: "left" as const,
    },
    {
      title: "ไฟล์รายงาน",
      dataIndex: "action",
      width: "20%",
      align: "left" as const,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<FilePdfOutlined />}
            disabled={!record.fileHref}
            onClick={() => window.open(record.fileHref, "_blank", "noopener,noreferrer")}
          >เปิดรายงาน</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="payment-report-page-container">
      <div className="report-container">
        <div className="table-card">
          <div className="header-row">
            <Flex justify="space-between" align="center">
              <Title level={2} style={{ margin: 24, color: "#1E3A5F" }}>
                รายงานการชำระเงิน
              </Title>

              <Space>
                <Input.Search
                  allowClear
                  placeholder="ค้นหา (ชื่องาน / รายละเอียด / ชื่อไฟล์)"
                  onSearch={setSearch}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 340 }}
                />
                <Tooltip title="รีโหลดรายการ">
                  <Button icon={<ReloadOutlined />} onClick={fetchData}></Button>
                </Tooltip>
              </Space>
            </Flex>
          </div>

          {/* ตารางหลัก */}
          <Table
            loading={loading}
            columns={columns}
            dataSource={tableData}
            rowClassName={(r) => (r.highlight ? "row-highlight" : "")}
            pagination={{
              position: ["bottomRight"],
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              onShowSizeChange: (_, size) => setPageSize(size),
              showTotal: (total, range) => `${range[0]}–${range[1]} จาก ${total} รายการ`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentReportPage;