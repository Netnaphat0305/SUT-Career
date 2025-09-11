import React, { useState, useEffect} from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Statistic,
  Card,
  Empty,
  Flex,
  Button,
  Table, 
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import { StudentFinanceAPI } from "../../services/https";
import type {
  StudentFinance,
} from "../../interfaces/payment";
import { useAuth } from "../../context/AuthContext";
import "./financialpage.css"

const { Content } = Layout;
const { Title, Text } = Typography;

const FinancialReportPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<StudentFinance[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("kanit-font");

    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        
        let financeDataResponse;
        let financeSummaryResponse;

        try {
          [financeDataResponse, financeSummaryResponse] = await Promise.all([
            StudentFinanceAPI.getFinanceData(),
            StudentFinanceAPI.getFinanceSummary(),
          ]);
        } catch (newApiError: any) {
          if (user?.id) {
            try {
              [financeDataResponse, financeSummaryResponse] = await Promise.all([
                StudentFinanceAPI.getFinanceDataByStudentId(user.id),
                StudentFinanceAPI.getFinanceSummaryByStudentId(user.id),
              ]);
            } catch (userIdError: any) {
              [financeDataResponse, financeSummaryResponse] = await Promise.all([
                StudentFinanceAPI.getFinanceDataByStudentId(1),
                StudentFinanceAPI.getFinanceSummaryByStudentId(1),
              ]);
            }
          } else {
            throw new Error("No user data available");
          }
        }

        setTransactions(financeDataResponse?.data || []);

        const backendSummary = financeSummaryResponse?.data;
        if (backendSummary) {
          const mappedSummary = {
            jobsThisMonth: backendSummary.monthlyJobCount || 0,
            totalJobs: backendSummary.totalJobCount || 0,
            totalAmount: backendSummary.totalEarnings || 0,
          };
          setSummary(mappedSummary);
        } else {
          setSummary({ jobsThisMonth: 0, totalJobs: 0, totalAmount: 0 });
        }
      } catch (err: any) {
        if (err.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }
        const errorMessage = err?.response?.data?.error || err?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล";
        setError(errorMessage);
        setTransactions([]);
        setSummary({ jobsThisMonth: 0, totalJobs: 0, totalAmount: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
      setError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
    }

    return () => {
      document.body.classList.remove("kanit-font");
    };
  }, [user]);


  const formatDateTime = (datetime: Date | string | undefined): string => {
    if (!datetime) return "ไม่ระบุวันที่";
    try {
      const date = typeof datetime === 'string' ? new Date(datetime) : datetime;
      if (isNaN(date.getTime())) return "ไม่ระบุวันที่";
      return date.toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Bangkok"
      });
    } catch (error) {
      return "ไม่ระบุวันที่";
    }
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return "0";
    return amount.toLocaleString('th-TH', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  
  const columns: ColumnsType<StudentFinance> = [
    {
      title: 'รายการ',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text) => text || "ไม่ระบุชื่องาน",
    },
    {
      title: 'วันที่',
      dataIndex: 'datetime',
      key: 'datetime',
      render: (datetime) => formatDateTime(datetime),
      sorter: (a, b) => new Date(a.datetime || 0).getTime() - new Date(b.datetime || 0).getTime(),
    },
    {
      title: 'จำนวนเงิน (บาท)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => (
        <Text strong style={{ color: "#52c41a" }}>
          + {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
  ];


  if (loading) { /* ... Loading UI ... */ }
  if (!user) { /* ... No user UI ... */ }
  if (error) { /* ... Error UI ... */ }

  return (
    <Layout style={{ maxWidth: "880px", minHeight: "100vh", margin: "auto", background: "#f5f5f5" }}>
      <Content style={{ padding: "30px" }}>
 
        <Flex justify="space-between" align="center" style={{ marginBottom: "30px" }}>
          <Title level={2} style={{ margin: 0 }}>
            รายงานด้านการเงิน
          </Title>
          <Button type="primary" size="large" onClick={() => alert('Withdraw button clicked!')}>
            ถอนเงิน
          </Button>
        </Flex>

        <Row gutter={[16, 16]} style={{ marginBottom: "30px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="งานเดือนนี้" value={summary?.jobsThisMonth || 0} suffix="งาน" valueStyle={{ color: "#3f8600" }}/>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="งานทั้งหมด" value={summary?.totalJobs || 0} suffix="งาน" valueStyle={{ color: "#1890ff" }}/>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="รายได้รวม" value={formatCurrency(summary?.totalAmount)} suffix="฿" valueStyle={{ color: "#cf1322" }}/>
            </Card>
          </Col>
        </Row>

        <Card title="ประวัติการเงิน">
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey={(record, index) => `${record.datetime}-${index}`}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="ยังไม่มีประวัติการเงิน" /> }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default FinancialReportPage;