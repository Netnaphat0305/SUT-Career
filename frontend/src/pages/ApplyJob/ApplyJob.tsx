import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Input,
  Form,
  DatePicker,
  Select,
  Button,
  Upload,
  Alert,
  message,
  Modal,
  Result,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PageHeader from "../../components/PageHeader";
import "./ApplyJob.css";
import "./AppJobDetail.css";
import { jobApplicationAPI, studentAPI } from "../../services/https"; // เพิ่ม studentAPI
import profile from "../../assets/profile.svg";
import { API_BASE } from "../../config";

const { TextArea } = Input;

const ApplyJob: React.FC = () => {
  const location = useLocation();
  const { jobpost_id } = useParams();
  const post = location.state?.post;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>({});
  const [jobpost, setJobpost] = useState<any>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClose = () => {
    setIsModalVisible(false);
  };

  // โหลดข้อมูลนักศึกษา + JobPost
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await jobApplicationAPI.init(
          post?.ID || Number(jobpost_id)
        );

        setStudent(res.student);
        setJobpost(res.jobpost);

        form.setFieldsValue({
          ...res.student,
          student_code: res.student_code,
          birthday: dayjs(res.student.birthday),
        });
      } catch (error) {
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [form, jobpost_id, post]);

  useEffect(() => {
    console.log("📌 student object:", student);
  }, [student]);

  // ฟังก์ชันสมัครงาน + อัปเดตข้อมูลนักศึกษา
  const onFinish = async (values: any) => {
    try {
      // ✅1. อัปเดตข้อมูลนักศึกษาใน DB ก่อน
      const updatedStudent = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        birthday: values.birthday.format("YYYY-MM-DD"),
        age: values.age,
        email: values.email,
        faculty: values.faculty,
        year: values.year,
        gpa: parseFloat(values.gpa),
      };

      await studentAPI.updateapply(student.ID, updatedStudent);
      console.log("update student ---------", updatedStudent);

      // ✅ 2. สมัครงานตามปกติ
      const payload = {
        student_id: student.ID,
        job_post_id: jobpost.ID,
        application_reason: values.application_reason,
      };

      const res = await jobApplicationAPI.create(payload);

      if (res?.status === 201 || res?.status === 200 || res?.data) {
        const applicationId = res.data?.ID || res.ID;

        // ✅ 3. ถ้ามีไฟล์ Resume ให้ Upload
        if (resumeFile) {
          const formData = new FormData();
          formData.append("resume_file", resumeFile);
          await jobApplicationAPI.uploadResume(applicationId, formData);
          message.success("แนบ Resume สำเร็จ!");
        }

        message.success("สมัครงานสำเร็จ!");
        setIsModalVisible(true);
        form.resetFields();
      } else {
        message.error("สมัครงานไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  useEffect(() => {
    const checkIfApplied = async () => {
      if (!student?.ID || !jobpost?.ID) return;

      try {
        const res = await jobApplicationAPI.checkApplied(
          jobpost.ID,
          student.ID
        );
        setAlreadyApplied(res.applied);
      } catch (error) {
        console.error("Error checking application:", error);
      }
    };

    checkIfApplied();
  }, [student, jobpost]);

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="apply-job-container">
      <PageHeader title="ยื่นสมัครงาน" />

      {/* รายละเอียดประกาศงาน */}
      <div className="apply-job-content">
        <img
          src={post.image_url ? `${API_BASE}${post.image_url}` : profile}
          alt="Job"
          className="apply-job-image"
        />
        <div className="apply-detail-container">
          <div className="apply-detail">
            <h2 className="post-title-AppJob">
              {post?.title || jobpost?.title}
            </h2>
            <p>
              <strong>บริษัท:</strong>{" "}
              {post?.Employer?.company_name || "ไม่ระบุบริษัท"}
            </p>
            <p>
              <strong>ระยะเวลา:</strong> {post?.deadline || "ไม่ระบุ"}
            </p>
            <p>
              <strong>ค่าตอบแทน:</strong> {post?.salary || "ไม่ระบุ"}
            </p>
            <p>
              <strong>สถานที่:</strong> {post?.locationjob || "ไม่ระบุ"}
            </p>
          </div>
        </div>
      </div>

      {/* ส่วนกรอกฟอร์มสมัครงาน */}
      <div className="job-app-detail-wrapper">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="apply-form"
        >
          <div className="form-grid">
            <Form.Item
              label="ชื่อ"
              name="first_name"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label="นามสกุล"
              name="last_name"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item label="รหัสนักศึกษา" name="student_code">
              <Input size="large" readOnly />
            </Form.Item>
            <Form.Item
              label="เบอร์โทร"
              name="phone"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label="วันเกิด"
              name="birthday"
              rules={[{ required: true }]}
            >
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
            <Form.Item label="อายุ" name="age" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item label="อีเมล" name="email" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item label="คณะ" name="faculty" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item label="ชั้นปี" name="year" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value={1}>ปี 1</Select.Option>
                <Select.Option value={2}>ปี 2</Select.Option>
                <Select.Option value={3}>ปี 3</Select.Option>
                <Select.Option value={4}>ปี 4</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="GPA" name="gpa">
              <Input size="large" />
            </Form.Item>
          </div>

          <Form.Item
            label="เหตุผลการสมัคร"
            name="application_reason"
            rules={[{ required: true }]}
          >
            <TextArea
              placeholder="เขียนเหตุผลว่าทำไมคุณอยากสมัครตำแหน่งนี้"
              rows={5}
              size="large"
            />
          </Form.Item>

          {/* ปุ่มแนบไฟล์ Resume */}
          <Form.Item
            label="แนบไฟล์ Resume"
            name="resume_file"
            rules={[{ required: true, message: "กรุณาอัปโหลด Resume" }]}
          >
            <Upload
              beforeUpload={(file) => {
                setResumeFile(file);
                return false; // ไม่อัปโหลดอัตโนมัติ
              }}
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
            >
              <Button icon={<UploadOutlined />}>คลิกเพื่ออัปโหลด</Button>
            </Upload>
          </Form.Item>

          <Alert
            message="หากแก้ไขข้อมูลส่วนตัว ข้อมูลจะถูกบันทึกในระบบก่อนกดยืนยันสมัครงาน"
            type="info"
            showIcon
            style={{
              margin: "20px auto",
              width: "100%",
              maxWidth: "800px",
              display: "block",
            }}
          />

          {/* ปุ่มยืนยันสมัครงาน */}
          <div className="submit-wrapper">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              disabled={alreadyApplied}
            >
              {alreadyApplied ? "คุณสมัครงานนี้ไปแล้ว" : "ยืนยันสมัครงาน"}
            </Button>
          </div>

          <Modal
            open={isModalVisible}
            onCancel={handleClose}
            footer={null}
            centered
            width={450}
          >
            <Result
              status="success"
              title="ส่งใบสมัครเรียบร้อยแล้ว"
              subTitle="ระบบได้บันทึกข้อมูลของคุณไว้แล้ว"
            />
          </Modal>
        </Form>
      </div>
    </div>
  );
};

export default ApplyJob;
