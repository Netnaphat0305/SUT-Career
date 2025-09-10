import React, { useState } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  message,
  DatePicker,
  Alert,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
// import type { Dayjs } from "dayjs";
import "./JobPost.css"; // import CSS ปกติ
import UploadImages from "./UploadImages";

const { TextArea } = Input;

const uploadProps: UploadProps = {
  name: "file",
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  headers: {
    authorization: "authorization-text",
  },
  onChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} อัพโหลดสำเร็จ`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} อัพโหลดล้มเหลว`);
    }
  },
};

const JobDescriptionSection: React.FC = () => {
  // const [compensation, setCompensation] = useState('');
  // const [deadline, setDeadline] = useState<Dayjs | null>(null);

  // const onChangeCompensation = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setCompensation(e.target.value);
  // };

  // const onChangeDeadline = (date: Dayjs | null) => {
  //   setDeadline(date);
  // };

  return (
    <div className="form-container">
      {/* รายละเอียดงาน */}
      <Form.Item
        label={<span className="label">รายละเอียดงาน</span>}
        name="jobDetails"
        rules={[{ required: true, message: "กรุณากรอกรายละเอียดงาน" }]}
      >
        <TextArea
          className="custom-textarea"
          placeholder={
            "อธิบายรายละเอียดงานที่คุณต้องการ เช่น\n" +
            "   1.ข้อมูลงาน: จุดประสงค์ของงาน, กลุ่มลูกค้า, แผนการดำเนินงาน, อื่นๆ\n" +
            "   2.รายละเอียดงาน: จำนวนชิ้นงาน, ขอบเขตงาน, เงื่อนไขที่จำเป็น, อื่นๆ"
          }
          rows={6}
          size="large"
          style={{ fontSize: 14 }}
        />
      </Form.Item>

      {/* ข้อความแจ้งเตือน ควรอยู่นอก Form.Item */}
      <p
        className="custom-job-description-note"
        style={{ marginTop: 0, marginBottom: 12 }}
      >
        เมื่อมีนักศึกษาสมัครงาน
        ระบบจะบันทึกข้อมูลการสมัครไว้ในระบบและแสดงรายชื่อผู้สมัครใหม่ในหน้าประกาศของคุณโดยอัตโนมัติ
        คุณจะได้รับแจ้งเตือนผ่านระบบ (ข้อความแจ้งเตือนในหน้า dashboard
        หรือสัญลักษณ์แจ้งเตือนมุมขวาบน)
        พร้อมลิงก์เพื่อเข้าดูรายละเอียดผู้สมัครได้ทันที
        ระบบจะแสดงข้อมูลของผู้สมัคร เช่น ชื่อ-สกุล, วันที่สมัคร, เอกสารแนบ
        (Resume) เพื่อให้ผู้ว่าจ้างสามารถคัดเลือกผู้สมัครได้ภายในระบบแบบครบวงจร
      </p>

      {/* ตัวอย่างผลงาน */}
      <Form.Item
        label={<span className="label">ตัวอย่างงานที่ต้องการ (ถ้ามี)</span>}
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} className="custom-input">
            คลิกเพื่ออัปโหลด
          </Button>
        </Upload>
      </Form.Item>

      {/* ค่าตอบแทน พร้อม Dropdown หน่วยเงิน และ วันหมดเขตรับสมัคร */}
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <Form.Item
          label={<span className="label">ค่าตอบแทน</span>}
          name="compensation"
          rules={[{ required: true, message: "กรุณากรอกค่าตอบแทน" }]}
          style={{ flex: 1 }}
        >
          <Input
            className="custom-input"
            placeholder="กรอกค่าตอบแทน เช่น 15000"
            size="large"
            addonBefore={
              <Select
                defaultValue="รายเดือน"
                style={{ width: 130 }}
                className="label"
              >
                <Select.Option value="รายเดือน">
                  <span className="dropdown">รายเดือน</span>
                </Select.Option>
                <Select.Option value="รายชั่วโมง">
                  <span className="dropdown">รายชั่วโมง</span>
                </Select.Option>
                <Select.Option value="รายวัน">
                  <span className="dropdown">รายวัน</span>
                </Select.Option>
                <Select.Option value="รายตามโปรเจค">
                  <span className="dropdown">รายตามโปรเจค</span>
                </Select.Option>
              </Select>
            }
          />
        </Form.Item>

        <Form.Item
          label={<span className="label">วันหมดเขตรับสมัคร</span>}
          name="applicationDeadline"
          rules={[{ required: true, message: "กรุณาเลือกวันหมดเขตรับสมัคร" }]}
          style={{ flex: 1 }}
        >
          <DatePicker
            // value={deadline}
            // onChange={onChangeDeadline}
            size="large"
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
          />
        </Form.Item>
      </div>

      {/* upload รูป */}
      <Form.Item label={<span className="label">อัพโหลดรูปภาพเพิ่มเติม</span>}>
        <UploadImages />
      </Form.Item>

      {/* คำเตือน */}
      <Alert
        className="custom-job-description-note"
        message="สำหรับ “โพสต์จ้างงาน” เท่านั้น"
        description="ไม่อนุญาตให้โพสต์ขายงานตนเอง, ใส่ข้อมูลการติดต่อ หรือใช้งานโดยขัดต่อเงื่อนไขของระบบ หากพบจะปิดประกาศของคุณทันที"
        type="warning"
        showIcon
        style={{ marginTop: 16, width: "100%" }}
      />

      {/* ปุ่มยืนยัน */}
      <div className="submit-button-wrapper">
        <Button
          type="primary"
          size="large"
          className="submit-button"
          htmlType="submit"
        >
          ยืนยัน
        </Button>
      </div>
    </div>
  );
};

export default JobDescriptionSection;
