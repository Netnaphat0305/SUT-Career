// src/pages/admin/FinanceDashboardPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  DatePicker,
  Space,
  Statistic,
  Row,
  Col,
  Button,
  message,
  Typography,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import ReactECharts from "echarts-for-react";
import { adminFinanceAPI } from "../../services/https";

const { RangePicker } = DatePicker;
const { Title } = Typography;

/* ---------- Types ---------- */
type Metrics = { in: number; out: number; net: number };

type SeriesPoint = {
  date: string;
  in: number;
  out: number;
  net: number;
};

type FinanceSummaryPayload = {
  from: string;
  to: string;
  total_in: number;
  total_out: number;
  net: number;
  series: SeriesPoint[];
};

const FinanceDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState<Dayjs>(dayjs().add(-29, "day"));
  const [to, setTo] = useState<Dayjs>(dayjs());
  const [metrics, setMetrics] = useState<Metrics>({ in: 0, out: 0, net: 0 });
  const [series, setSeries] = useState<SeriesPoint[]>([]);

  // ใช้เปลี่ยน key เพื่อบังคับ re-render chart เมื่อช่วงวันที่เปลี่ยน
  const chartKey = `${from.format("YYYY-MM-DD")}-${to.format("YYYY-MM-DD")}`;

  const fetchAll = async () => {
    try {
      setLoading(true);
      const f = from.format("YYYY-MM-DD");
      const t = to.format("YYYY-MM-DD");

      const resp = await adminFinanceAPI.summary(f, t);

      // รองรับทั้งกรณีที่ summary() คืน AxiosResponse หรือคืน data ตรง ๆ
      const payload: FinanceSummaryPayload =
        resp && typeof resp === "object" && "data" in (resp as any) && "status" in (resp as any)
          ? (resp as any).data
          : (resp as any);

      setMetrics({
        in: Number(payload?.total_in ?? 0),
        out: Number(payload?.total_out ?? 0),
        net: Number(payload?.net ?? 0),
      });

      const arr = Array.isArray(payload?.series) ? payload.series : [];
      setSeries(
        arr.map((x: any) => ({
          date: String(x.date),
          in: Number(x.in ?? 0),
          out: Number(x.out ?? 0),
          net: Number(x.net ?? 0),
        }))
      );
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.error ?? "โหลดยอดสรุปไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก (กัน StrictMode เรียกซ้ำ)
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchAll();
  }, []);

  // ถ้าอยากให้เปลี่ยนช่วงวันที่แล้วโหลดอัตโนมัติ ให้เปิด useEffect นี้
  // useEffect(() => { fetchAll(); }, [from, to]);

  const option = useMemo(() => {
    const dates = series.map((s) => s.date);
    const inData = series.map((s) => s.in);
    const outData = series.map((s) => s.out);
    const netData = series.map((s) => s.net);
    const singlePoint = series.length <= 1;

    return {
      tooltip: { trigger: "axis" },
      legend: { data: ["in", "net", "out"] },
      grid: { left: 24, right: 16, bottom: 24, top: 40, containLabel: true },
      xAxis: { type: "category", data: dates, boundaryGap: false },
      yAxis: { type: "value", min: 0 },
      series: [
        { name: "in",  type: "line", smooth: true, showSymbol: true, symbolSize: singlePoint ? 8 : 4, data: inData },
        { name: "net", type: "line", smooth: true, showSymbol: true, symbolSize: singlePoint ? 8 : 4, data: netData },
        { name: "out", type: "line", smooth: true, showSymbol: true, symbolSize: singlePoint ? 8 : 4, data: outData },
      ],
    };
  }, [series]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
        <Title level={3} style={{ margin: 0 }}>สรุปรายรับ–รายจ่าย</Title>
        <Space>
          <RangePicker
            value={[from, to]}
            onChange={(v) => {
              if (!v) return;
              setFrom(v[0]!);
              setTo(v[1]!);
            }}
            allowClear={false}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}>
            โหลดใหม่
          </Button>
        </Space>
      </Space>

      <Row gutter={16}>
        <Col xs={24} md={8}><Card><Statistic title="เงินเข้า (IN)"  value={metrics.in}  precision={2} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="เงินออก (OUT)" value={metrics.out} precision={2} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="คงเหลือ (NET)" value={metrics.net} precision={2} /></Card></Col>
      </Row>

      <Card>
        <ReactECharts
          key={chartKey}
          option={option}
          style={{ width: "100%", height: 360 }}
          notMerge
          lazyUpdate
        />
      </Card>
    </Space>
  );
};

export default FinanceDashboardPage;