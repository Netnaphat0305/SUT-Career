import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
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
import type { PaymentReportRow } from "../../interfaces/paymentreport";
import { toTHDateTime } from "../../utils";
import "./paymentreport.css";

const { Title, Text } = Typography;
const asData = <T,>(r: any): T => (r?.data?.data ?? r?.data ?? r) as T;
const toPaymentRepId = (r: any) => Number(r.payment_report_id ?? r.ID ?? 0);
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
      const ta = new Date(a.create_date || 0).getTime() || 0;
      const tb = new Date(b.create_date || 0).getTime() || 0;
      return ta - tb;
    });
    return arr;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedRows;
    return sortedRows.filter((r) => {
      const title = r.payment?.billable_item?.jobpost?.title ?? "ไม่พบชื่อรายการ";
      const sub = r.payment?.billable_item?.description ?? "";
      const file = (r.file_path ?? "").split("/").pop() ?? "—";
      return (
        title.toLowerCase().includes(q) ||
        sub.toLowerCase().includes(q) ||
        file.toLowerCase().includes(q)
      );
    });
  }, [sortedRows, search]);

  const tableData = useMemo(() => {
    return filteredRows.map((r, idx) => {
      const reportId = r?.ID ?? undefined;
      const title = r.reportname ?? r.payment?.billable_item?.jobpost?.title ?? "ไม่พบชื่อรายการ";
      const fileName = r.file_path ? r.file_path.split("/").pop() : "—";
      const when = r.create_date || undefined;
      const method = r.payment?.payment_method?.method_name ?? "-";
      return {
        key: r.ID ?? `${idx}`,
        id: reportId,
        title,
        method,
        fileName,
        whenOrStatus: <Text>{toTHDateTime(when)}</Text>,
        fileHref: r.file_path ?? "",
        highlight:
          highlightIdFromNav != null &&
          String(highlightIdFromNav) === String(r.ID),
      };
    });
  }, [filteredRows, highlightIdFromNav]);

  const columns: ColumnsType<(typeof tableData)[number]> = [
    {
      title: "รหัส",
      dataIndex: "id",
      sorter: (a, b) => toPaymentRepId(a) - toPaymentRepId(b),
      defaultSortOrder: "descend",
      sortDirections: ["descend", "ascend"],
      width: "10%",
      align: "left" as const,
      render: (v) => v ?? "-",
    },
    {
      title: "ชื่องาน",
      dataIndex: "title",
      width: "30%",
      ellipsis: true,
    },
    {
      title: "ช่องทางการชำระ",
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
            onClick={() =>
              window.open(record.fileHref, "_blank", "noopener,noreferrer")
            }
          >
            เปิดรายงาน
          </Button>
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
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                  ></Button>
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
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} จาก ${total} รายการ`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentReportPage;
