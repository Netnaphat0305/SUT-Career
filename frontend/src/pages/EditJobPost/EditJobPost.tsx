import React, { useEffect, useState } from "react";
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
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import {
  jobPostAPI,
  jobCategoryAPI,
  salaryTypeAPI,
  employmentTypeAPI,
} from "../../services/https";
import type { Jobpost } from "../../interfaces/jobpost";
import defaultLogo from "../../assets/profile.svg";
import dayjs from "dayjs";
import "../JobPost/JobPost.css";
import { Spin } from "antd";
const { TextArea } = Input;

const EditJobPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<
    { id: number; category_name: string }[]
  >([]);
  const [salarytype, setSalaryTypes] = useState<
    { id: number; salary_type_name: string }[]
  >([]);
  const [employmenttype, setEmploymentTypes] = useState<
    { id: number; employment_type_name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [redirectLoading, setRedirectLoading] = useState(false);

  // โหลด categories
  useEffect(() => {
    jobCategoryAPI.getAll().then((data) => {
      const mapped = (data.data || data).map((cat: any) => ({
        id: cat.ID,
        category_name: cat.CategoryName || cat.category_name,
      }));
      setCategories(mapped);
    });
  }, []);

  // โหลด salary types
  useEffect(() => {
    salaryTypeAPI.getAll().then((data) => {
      const mapped = (data.data || data).map((s: any) => ({
        id: s.ID,
        salary_type_name: s.SalaryTypeName || s.salary_type_name,
      }));
      setSalaryTypes(mapped);
    });
  }, []);

  // โหลด employment types
  useEffect(() => {
    employmentTypeAPI.getAll().then((data) => {
      const mapped = (data.data || data).map((emp: any) => ({
        id: emp.ID,
        employment_type_name:
          emp.EmploymentTypeName || emp.employment_type_name,
      }));
      setEmploymentTypes(mapped);
    });
  }, []);

  // โหลดข้อมูล Job Post ปัจจุบัน
  useEffect(() => {
    const fetchJobPost = async () => {
      try {
        const res = await jobPostAPI.getById(Number(id));
        const post: Jobpost = res.data;
        setImagePreview(post.image_url || defaultLogo);

        form.setFieldsValue({
          Name: post.title,
          job_category_id: post.job_category_id,
          employmentTypeId: post.employment_type_id,
          locationjob: post.locationjob,
          jobDetails: post.description,
          compensation: post.salary,
          salaryTypeId: post.salary_type_id,
          applicationDeadline: dayjs(post.deadline),
        });
      } catch (error) {
        message.error("โหลดข้อมูลโพสต์ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchJobPost();
  }, [id, form]);

  // เมื่อกดบันทึก
  const handleFinish = async (values: any) => {
    try {
      const payload = {
        title: values.Name,
        description: values.jobDetails,
        salary: Number(values.compensation),
        locationjob: values.locationjob,
        deadline: values.applicationDeadline.toISOString(),
        job_category_id: values.job_category_id,
        employment_type_id: values.employmentTypeId,
        salary_type_id: values.salaryTypeId,
        image_url: imagePreview,
      };

      await jobPostAPI.update(Number(id), payload);
      if (portfolioFile) {
        await jobPostAPI.uploadPortfolio(Number(id), portfolioFile);
      }

      message.success("แก้ไขประกาศงานสำเร็จ!");
      setOpen(true);
    } catch (error) {
      console.error(error);
      message.error("แก้ไขโพสต์ไม่สำเร็จ");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRedirectLoading(true);

    // หน่วงเวลา 1 วินาทีเพื่อโชว์ Loading
    setTimeout(() => {
      setRedirectLoading(false);
      navigate("/Job/Mypost-job");
      // โหลดข้อมูลใหม่ให้โพสต์ล่าสุดขึ้นมา
      window.location.reload();
    }, 1000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="jobpost-wrapper">
      <div className="jobpost-card">
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={handleFinish}
        >
          <PageHeader title="แก้ไขประกาศงาน" />

          <Form.Item
            label="ชื่องาน"
            name="Name"
            rules={[{ required: true, message: "กรุณากรอกชื่องาน" }]}
          >
            <Input placeholder="กรอกชื่องาน" size="large" />
          </Form.Item>

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

          <Form.Item
            label="ประเภทงาน"
            name="employmentTypeId"
            rules={[{ required: true, message: "กรุณาเลือกประเภทงาน" }]}
          >
            <Radio.Group>
              <div className="jobpost-radio-group">
                {employmenttype.map((emp) => (
                  <Card
                    key={emp.id}
                    className={
                      form.getFieldValue("employmentTypeId") === emp.id
                        ? "custom-card-selected"
                        : ""
                    }
                  >
                    <Radio value={emp.id}>{emp.employment_type_name}</Radio>
                  </Card>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>

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
                rules={[
                  { required: true, message: "กรุณาเลือกประเภทเงินเดือน" },
                ]}
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

          <Form.Item
            label="วันหมดเขตรับสมัคร"
            name="applicationDeadline"
            rules={[{ required: true, message: "กรุณาเลือกวันหมดเขตรับสมัคร" }]}
          >
            <DatePicker
              size="large"
              className="full-width"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item label="แนบผลงาน (Portfolio)">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPortfolioFile(file);
              }}
            />
          </Form.Item>

           <Form.Item label="เลือกรูปโลโก้ร้าน (ถ้ามี)">
                      <input type="file" accept="image/*" onChange={handleImageChange} />
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
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </div>

      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        width={450}
      >
        <Result
          status="success"
          title="แก้ไขโพสต์งานเรียบร้อยแล้ว"
          subTitle="ข้อมูลโพสต์งานนี้ถูกอัปเดตแล้ว"
        />
      </Modal>
      <Modal
        open={redirectLoading}
        footer={null}
        closable={false}
        centered
        width={300}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
          <p style={{ marginTop: 15, fontSize: 16 }}>กำลังโหลดข้อมูล...</p>
        </div>
      </Modal>
    </div>
  );
};

export default EditJobPost;
