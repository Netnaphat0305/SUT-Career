import React from "react";
import { Row, Col, Form, DatePicker, TimePicker } from "antd";
import type { Dayjs } from "dayjs";

const { RangePicker } = TimePicker;

const WorkTimeAndDeadline: React.FC = () => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label={<span className="label">เวลาเริ่ม-เลิกงาน (ถ้ามี)</span>}
          name="workTime"
        >
          <RangePicker format="HH:mm" size="large" style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          label={<span className="label">วันหมดเขตรับสมัคร</span>}
          name="applicationDeadline"
          rules={[{ required: true, message: "กรุณาเลือกวันหมดเขตรับสมัคร" }]}
        >
          <DatePicker
            size="large"
            style={{ width: "100%" }}
            format="YYYY-MM-DD" // ✅ บังคับ format ที่ต้องการ
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default WorkTimeAndDeadline;
