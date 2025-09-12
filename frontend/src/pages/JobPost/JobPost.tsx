import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Modal,
  Result,
  message,
  DatePicker,
  Alert,
  Select,
  Radio,
  Card,
  Row,
  Col,
} from "antd";
import { useAuth } from "../../context/AuthContext";
import type { RadioChangeEvent } from "antd";
import "./JobPost.css";
import PageHeader from "../../components/PageHeader";
import {
  jobPostAPI,
  jobCategoryAPI,
  salaryTypeAPI,
  employmentTypeAPI,
} from "../../services/https";
import type { CreateJobpost } from "../../interfaces/jobpost";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

const JobPost: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null); // ✅ state สำหรับโลโก้

  const navigate = useNavigate();
  const [confirmLoading, setConfirmLoading] = useState(false);

  // state
  const [categories, setCategories] = useState<
    { id: number; category_name: string }[]
  >([]);
  const [salarytype, setSalaryTypes] = useState<
    { id: number; salary_type_name: string }[]
  >([]);
  const [employmenttype, setEmploymentTypes] = useState<
    { id: number; employment_type_name: string }[]
  >([]);

  // โหลด categories
  useEffect(() => {
    jobCategoryAPI
      .getAll()
      .then((res: any) => {
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list)) {
          const mapped = list.map((cat: any) => ({
            id: cat.ID,
            category_name: cat.CategoryName || cat.category_name,
          }));
          setCategories(mapped);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // โหลด salary types
  useEffect(() => {
    salaryTypeAPI
      .getAll()
      .then((res: any) => {
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list)) {
          const mapped = list.map((s: any) => ({
            id: s.ID,
            salary_type_name: s.SalaryTypeName || s.salary_type_name,
          }));
          setSalaryTypes(mapped);
        }
      })
      .catch((err) => console.error("Error fetching salary types:", err));
  }, []);

  // โหลด employment types
  useEffect(() => {
    employmentTypeAPI
      .getAll()
      .then((res: any) => {
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list)) {
          const mapped = list.map((emp: any) => ({
            id: emp.ID,
            employment_type_name:
              emp.EmploymentTypeName || emp.employment_type_name,
          }));
          setEmploymentTypes(mapped);
        }
      })
      .catch((err) => console.error("Error fetching employment types:", err));
  }, []);

  // ส่งฟอร์ม
  const handleFinish = async (values: any) => {
    try {
      setConfirmLoading(true);

      const payload: CreateJobpost = {
        title: values.Name,
        description: values.jobDetails,
        salary: Number(values.compensation),
        locationjob: values.locationjob,
        deadline: values.applicationDeadline.toISOString(),
        status: "Open",
        portfolio_required: "false",
        job_category_id: values.job_category_id,
        employment_type_id: values.employmentTypeId,
        salary_type_id: values.salaryTypeId,
        employer_id: Number(user?.id),
        image_url: "", // จะอัปโหลดทีหลัง
      };

      const res = await jobPostAPI.create(payload);
      const jobpostId = res.data.ID || res.data.data?.ID;

      // อัปโหลด portfolio ถ้ามี
      if (portfolioFile) {
        await jobPostAPI.uploadPortfolio(jobpostId, portfolioFile);
      }

      // อัปโหลด logo ถ้ามี
      if (logoFile) {
        await jobPostAPI.uploadPortfolio(jobpostId, logoFile);
        // 🔹 ถ้า backend แยก API upload logo เช่น uploadLogo()
        // ให้เปลี่ยนเป็น jobPostAPI.uploadLogo(jobpostId, logoFile)
      }

      setOpen(true);
      setConfirmLoading(false);
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      message.error("บันทึกงานไม่สำเร็จ!");
      setConfirmLoading(false);
    }
  };

  // reset modal
  const handleClose = () => {
    setOpen(false);
    setPortfolioFile(null);
    setLogoFile(null);
    form.resetFields();
    navigate("/Job/Board");
  };

  // เลือก Portfolio
  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPortfolioFile(file);
  };

  // เลือก Logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoFile(file);
  };
  // เงินเดือน
  const SalaryInput: React.FC = () => (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="เงินเดือน/ค่าตอบแทน"
          name="compensation"
          rules={[{ required: true, message: "กรุณากรอกเงินเดือน" }]}
        >
          <Input type="number" placeholder="กรอกค่าตอบแทน" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label="ประเภทการจ่ายเงิน"
          name="salaryTypeId"
          rules={[{ required: true, message: "กรุณาเลือกประเภทเงินเดือน" }]}
        >
          <Select placeholder="เลือกประเภท">
            {salarytype.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.salary_type_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    </Row>
  );

  // ประเภทงาน
  const EmploymentTypeSelector: React.FC = () => (
    <Form.Item
      label="ประเภทงาน"
      name="employmentTypeId"
      rules={[{ required: true, message: "กรุณาเลือกประเภทงาน" }]}
    >
      <Radio.Group>
        <div className="employment-grid">
          {employmenttype.map((emp) => (
            <Card
              key={emp.id}
              onClick={() =>
                form.setFieldsValue({ employmentTypeId: emp.id })
              }
              className={`custom-card ${
                form.getFieldValue("employmentTypeId") === emp.id
                  ? "custom-card-selected"
                  : ""
              }`}
            >
              <Radio value={emp.id}>{emp.employment_type_name}</Radio>
            </Card>
          ))}
        </div>
      </Radio.Group>
    </Form.Item>
  );

  // หมวดหมู่
  const JobCategorySelector: React.FC = () => (
    <Form.Item
      name="job_category_id"
      label="หมวดหมู่ของงาน"
      rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}
    >
      <Select placeholder="เลือกหมวดหมู่">
        {categories.map((cat) => (
          <Select.Option key={cat.id} value={cat.id}>
            {cat.category_name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  return (
    <div className="jobpost-wrapper">
      <div className="jobpost-card">
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={handleFinish}
        >
          <PageHeader title="รายละเอียดประกาศงาน" />

          <Form.Item
            label="ชื่องาน"
            name="Name"
            rules={[{ required: true, message: "กรุณากรอกชื่องาน" }]}
          >
            <Input placeholder="กรอกชื่องาน" size="large" />
          </Form.Item>

          <JobCategorySelector />
          <EmploymentTypeSelector />

          <Form.Item
            label="ที่ตั้ง"
            name="locationjob"
            rules={[{ required: true, message: "กรุณากรอก Location" }]}
          >
            <Input placeholder="กรอก Location" size="large" />
          </Form.Item>

          <Form.Item
            label="รายละเอียดงาน"
            name="jobDetails"
            rules={[{ required: true, message: "กรุณากรอกรายละเอียดงาน" }]}
          >
            <TextArea rows={4} placeholder="อธิบายรายละเอียดงาน" />
          </Form.Item>

          <SalaryInput />

          <Form.Item
            label="วันหมดเขตรับสมัคร"
            name="applicationDeadline"
            rules={[{ required: true, message: "กรุณาเลือกวันหมดเขตรับสมัคร" }]}
          >
            <DatePicker size="large" style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          {/* ✅ อัปโหลด Portfolio */}
          <Form.Item label="แนบผลงาน (Portfolio)">
            <input
              id="portfolio-upload"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              style={{ display: "none" }}
              onChange={handlePortfolioChange}
            />
            <Button
              type="primary"
              onClick={() =>
                document.getElementById("portfolio-upload")?.click()
              }
            >
              อัปโหลด Portfolio
            </Button>
            {portfolioFile && (
              <span style={{ marginLeft: 10 }}>{portfolioFile.name}</span>
            )}
          </Form.Item>

          {/* ✅ อัปโหลด Logo */}
          <Form.Item label="เลือกรูปโลโก้ร้าน (ถ้ามี)">
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleLogoChange}
            />
            <Button onClick={() => document.getElementById("logo-upload")?.click()}>
              เลือกรูปโลโก้
            </Button>
            {logoFile && (
              <span style={{ marginLeft: 10 }}>{logoFile.name}</span>
            )}
          </Form.Item>

          <Alert
            message="สำหรับโพสต์จ้างงานเท่านั้น"
            description="ห้ามใส่ข้อมูลติดต่อส่วนตัว หากฝ่าฝืนจะถูกลบประกาศ"
            type="warning"
            showIcon
          />

          <div className="submit-button-wrapper">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className="submit-button"
              loading={confirmLoading}
            >
              ยืนยัน
            </Button>
          </div>
        </Form>
      </div>

      <Modal open={open} onCancel={handleClose} footer={null} centered width={450}>
        <Result
          status="success"
          title="โพสต์งานเรียบร้อยแล้ว"
          subTitle="นักศึกษาสามารถเห็นประกาศนี้ได้ทันที และคุณสามารถติดตามผู้สมัครได้ตลอดเวลา"
          extra={[
            <Button type="primary" key="go" onClick={handleClose}>
              ไปที่โพสต์งาน
            </Button>,
          ]}
        />
      </Modal>
    </div>
  );
};

export default JobPost;
