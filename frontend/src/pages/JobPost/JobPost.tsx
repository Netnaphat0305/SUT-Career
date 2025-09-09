// import React, { useState } from "react";
// import {
//   Form,
//   Input,
//   Button,
//   Modal,
//   Result,
//   message,
//   DatePicker,
//   Alert,
//   Select,
//   Radio,
//   Card,
//   Row,
//   Col,
//   TimePicker,
// } from "antd";
// import type { RadioChangeEvent } from "antd";
// import axios from "axios";
// import "./JobPost.css";
// import PageHeader from "../../components/PageHeader";

// const { TextArea } = Input;
// const { RangePicker } = TimePicker;

// const JobPost: React.FC = () => {
//   const [form] = Form.useForm();
//   const [open, setOpen] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   // เมื่อ submit ฟอร์ม
//   const handleFinish = async (values: any) => {
//     try {
//       const payload = {
//         title: values.Name,
//         description: values.jobDetails,
//         salary: Number(values.compensation),
//         salary_type: values.salaryType,
//         locationjob: values.locationjob,
//         job_type: values.jobType,
//         work_time: values.workTime,
//         deadline: values.applicationDeadline.toISOString(),
//         portfolio_required: values.portfolio_required,
//         status: "Open",
//       };

//       console.log("ส่งไป backend:", payload);
//       await axios.post("http://localhost:8080/api/jobposts", payload);
//       setOpen(true);
//     } catch (error: any) {
//       console.error("Error:", error.response?.data || error.message);
//       message.error("บันทึกงานไม่สำเร็จ!");
//     }
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setImagePreview(null);
//     form.resetFields();
//   };

//   // Upload Image (preview base64)
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   // Salary Input (เงินเดือน + ประเภทการจ่าย)
//   const SalaryInput: React.FC = () => (
//     <Row gutter={16}>
//       <Col span={12}>
//         <Form.Item
//           label="เงินเดือน/ค่าตอบแทน"
//           name="compensation"
//           rules={[{ required: true, message: "กรุณากรอกเงินเดือน" }]}
//         >
//           <Input type="number" placeholder="กรอกค่าตอบแทน" />
//         </Form.Item>
//       </Col>
//       <Col span={12}>
//         <Form.Item
//           label="ประเภทการจ่าย"
//           name="salaryType"
//           rules={[{ required: true, message: "กรุณาเลือกประเภทเงินเดือน" }]}
//         >
//           <Select placeholder="เลือกประเภท">
//             <Select.Option value="hour">รายชั่วโมง</Select.Option>
//             <Select.Option value="day">รายวัน</Select.Option>
//             <Select.Option value="month">รายเดือน</Select.Option>
//             <Select.Option value="project">รายโปรเจกต์</Select.Option>
//           </Select>
//         </Form.Item>
//       </Col>
//     </Row>
//   );

//   // JobTypeSelector
//   const JobTypeSelector: React.FC = () => {
//     const [value, setValue] = useState<string>("part-time");

//     const onChange = (e: RadioChangeEvent) => {
//       const jobType = e.target.value;
//       setValue(jobType);

//       // ✅ set ค่า salaryType อัตโนมัติตาม jobType
//       switch (jobType) {
//         case "part-time":
//           form.setFieldsValue({ salaryType: "hour" });
//           break;
//         case "contract":
//         case "full-time":
//           form.setFieldsValue({ salaryType: "month" });
//           break;
//         case "freelance":
//           form.setFieldsValue({ salaryType: "project" });
//           break;
//         default:
//           form.setFieldsValue({ salaryType: undefined });
//       }
//     };

//     const jobTypes = [
//       { label: "ฟรีแลนซ์ (โปรเจกต์)", value: "freelance" },
//       { label: "สัญญาจ้าง (รายเดือน/รายปี)", value: "contract" },
//       { label: "พาร์ทไทม์ (รายชั่วโมง/รายวัน)", value: "part-time" },
//       { label: "งานประจำ", value: "full-time" },
//     ];

//     return (
//       <Form.Item
//         label="ลักษณะงาน"
//         name="jobType"
//         rules={[{ required: true, message: "กรุณาเลือกประเภทงาน" }]}
//       >
//         <Radio.Group
//           onChange={onChange}
//           value={value}
//           style={{ width: "100%" }}
//         >
//           <div style={{ display: "grid", gap: 12 }}>
//             {jobTypes.map((job) => (
//               <Card
//                 key={job.value}
//                 onClick={() =>
//                   onChange({ target: { value: job.value } } as any)
//                 }
//                 className={value === job.value ? "custom-card-selected" : ""}
//               >
//                 <Radio value={job.value}>{job.label}</Radio>
//               </Card>
//             ))}
//           </div>
//         </Radio.Group>
//       </Form.Item>
//     );
//   };

//   // Location
//   const Location: React.FC = () => (
//     <Form.Item
//       label="ที่ตั้ง"
//       name="locationjob"
//       rules={[{ required: true, message: "กรุณากรอก Location" }]}
//     >
//       <Input placeholder="กรอก Location" size="large" />
//     </Form.Item>
//   );

//   // WorkTime + Deadline
//   const WorkTimeAndDeadline: React.FC = () => (
//     <Row gutter={16}>
//       <Col span={12}>
//         <Form.Item label="เวลาเริ่ม-เลิกงาน (ถ้ามี)" name="workTime">
//           <RangePicker format="HH:mm" size="large" style={{ width: "100%" }} />
//         </Form.Item>
//       </Col>
//       <Col span={12}>
//         <Form.Item
//           label="วันหมดเขตรับสมัคร"
//           name="applicationDeadline"
//           rules={[{ required: true, message: "กรุณาเลือกวันหมดเขตรับสมัคร" }]}
//         >
//           <DatePicker
//             size="large"
//             style={{ width: "100%" }}
//             format="YYYY-MM-DD"
//           />
//         </Form.Item>
//       </Col>
//     </Row>
//   );

//   return (
//     <div className="jobpost-wrapper">
//       <div className="jobpost-card">
//         <Form
//           form={form}
//           layout="vertical"
//           autoComplete="off"
//           onFinish={handleFinish}
//         >
//           <PageHeader title="รายละเอียดประกาศงาน" />

//           <Form.Item
//             label="ชื่องาน"
//             name="Name"
//             rules={[{ required: true, message: "กรุณากรอกชื่องาน" }]}
//           >
//             <Input placeholder="กรอกชื่องาน" size="large" />
//           </Form.Item>

//           <JobTypeSelector />
//           <Location />
//           <WorkTimeAndDeadline />

//           <Form.Item
//             label="รายละเอียดงาน"
//             name="jobDetails"
//             rules={[{ required: true, message: "กรุณากรอกรายละเอียดงาน" }]}
//           >
//             <TextArea rows={4} placeholder="อธิบายรายละเอียดงาน" />
//           </Form.Item>

//           <SalaryInput />
//           <Form.Item label="แนบผลงาน (Portfolio)">
//             <input
//               type="file"
//               accept=".pdf,.doc,.docx,.jpg,.png"
//               onChange={async (e) => {
//                 const file = e.target.files?.[0];
//                 if (file) {
//                   const formData = new FormData();
//                   formData.append("portfolio", file);

//                   try {
//                     const res = await axios.post(
//                       "http://localhost:8080/api/jobposts/upload-portfolio",
//                       formData,
//                       { headers: { "Content-Type": "multipart/form-data" } }
//                     );
//                     // ✅ เซ็ตค่า path กลับเข้าฟอร์ม
//                     form.setFieldsValue({
//                       portfolio_required: res.data.filePath,
//                     });
//                   } catch (err) {
//                     message.error("อัพโหลดไฟล์ไม่สำเร็จ");
//                   }
//                 }
//               }}
//             />
//           </Form.Item>

//           <Form.Item label="เลือกรูปโลโก้ร้าน (ถ้ามี)">
//             <input type="file" accept="image/*" onChange={handleImageChange} />
//             {imagePreview && (
//               <img
//                 src={imagePreview}
//                 alt="preview"
//                 style={{ marginTop: 10, width: 120, borderRadius: 8 }}
//               />
//             )}
//           </Form.Item>

//           <Alert
//             message="สำหรับโพสต์จ้างงานเท่านั้น"
//             description="ห้ามใส่ข้อมูลติดต่อส่วนตัว หากฝ่าฝืนจะถูกลบประกาศ"
//             type="warning"
//             showIcon
//           />

//           <div className="submit-button-wrapper">
//             <Button
//               type="primary"
//               size="large"
//               htmlType="submit"
//               className="submit-button"
//             >
//               ยืนยัน
//             </Button>
//           </div>
//         </Form>
//       </div>

//       <Modal
//         open={open}
//         onCancel={handleClose}
//         footer={null}
//         centered
//         width={450}
//       >
//         <Result
//           status="success"
//           title="โพสต์งานเรียบร้อยแล้ว"
//           subTitle="นักศึกษาสามารถเห็นประกาศนี้ได้ทันที และคุณสามารถติดตามผู้สมัครได้ตลอดเวลา"
//         />
//       </Modal>
//     </div>
//   );
// };

// export default JobPost;

import React, { useState, useEffect, } from "react";
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
import defaultLogo from "../../assets/profile.svg";


const { TextArea } = Input;

const JobPost: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);

  console.log(user)

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
      .then((data) => {
        const mapped = (data.data || data).map((cat: any) => ({
          id: cat.ID,
          category_name: cat.CategoryName || cat.category_name,
        }));
        setCategories(mapped);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // โหลด salary types
  useEffect(() => {
    salaryTypeAPI
      .getAll()
      .then((data) => {
        const mapped = (data.data || data).map((s: any) => ({
          id: s.ID,
          salary_type_name: s.SalaryTypeName || s.salary_type_name,
        }));
        setSalaryTypes(mapped);
      })
      .catch((err) => console.error("Error fetching salary types:", err));
  }, []);

  // โหลด employment types
  useEffect(() => {
    employmentTypeAPI
      .getAll()
      .then((data) => {
        const mapped = (data.data || data).map((emp: any) => ({
          id: emp.ID,
          employment_type_name:
            emp.EmploymentTypeName || emp.employment_type_name,
        }));

        setEmploymentTypes(mapped);
      })
      .catch((err) => console.error("Error fetching employment types:", err));
  }, []);


  // ส่งฟอร์ม สร้าง payload ที่ตรงกับ interface CreateJobpost
  const handleFinish = async (values: any) => {
    try {
      const payload: CreateJobpost = {
        title: values.Name,
        description: values.jobDetails,
        salary: Number(values.compensation),
        locationjob: values.locationjob,
        deadline: values.applicationDeadline.toISOString(),
        status: "Open", // ผู้ว่าจ้างกรอก
        portfolio_required: "false", // ผู้ว่าจ้างกรอก
        job_category_id: values.job_category_id,
        employment_type_id: values.employmentTypeId,
        salary_type_id: values.salaryTypeId,
        employer_id: Number(user?.id), // จาก context
        image_url: imagePreview || defaultLogo,
      };
      console.log("ส่งไป backend:", payload);
      const res = await jobPostAPI.create(payload);
      const jobpostId = res.data.ID || res.data.data?.ID;

      // upload portfolio ถ้ามี สร้าง payload ที่ตรงกับ interface CreateJobpost
      if (portfolioFile) {
        await jobPostAPI.uploadPortfolio(jobpostId, portfolioFile);
      }
      //  ถ้าสำเร็จ เปิด Modal success
      //  ถ้า error แสดงข้อความ error
      setOpen(true);
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      message.error("บันทึกงานไม่สำเร็จ!");
    }
  };

  // reset modal
  const handleClose = () => {
    setOpen(false);
    setImagePreview(null);
    setPortfolioFile(null);
    form.resetFields();
  };

  // เลือกรูป
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
          <Select placeholder="เลือกประเภท" onChange={(value)=>console.log("เลือก",value)}>
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
  const EmploymentTypeSelector: React.FC = () => {
    const [value, setValue] = useState<number | null>(null);

    const onChange = (e: RadioChangeEvent) => {
      setValue(e.target.value);
    };

    return (
      <Form.Item
        label="ประเภทงาน"
        name="employmentTypeId"
        rules={[{ required: true, message: "กรุณาเลือกประเภทงาน" }]}
      >
        <Radio.Group onChange={onChange} value={value}>
          <div style={{ display: "grid", gap: 12 }}>
            {employmenttype.map((emp) => (
              <Card
                key={emp.id}
                onClick={() => onChange({ target: { value: emp.id } } as any)}
                className={value === emp.id ? "custom-card-selected" : ""}
              >
                <Radio value={emp.id}>{emp.employment_type_name}</Radio>
              </Card>
            ))}
          </div>
        </Radio.Group>
      </Form.Item>
    );
  };

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
            <DatePicker
              size="large"
              style={{ width: "100%" }}
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
            {imagePreview && (
              <img
                src={imagePreview || defaultLogo}
                alt="preview"
                style={{ marginTop: 10, width: 120, borderRadius: 8 }}
              />
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
            >
              ยืนยัน
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
          title="โพสต์งานเรียบร้อยแล้ว"
          subTitle="นักศึกษาสามารถเห็นประกาศนี้ได้ทันที และคุณสามารถติดตามผู้สมัครได้ตลอดเวลา"
        />
      </Modal>
    </div>
  );
};

export default JobPost;
