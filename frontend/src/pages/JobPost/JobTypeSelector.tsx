import React, { useState } from 'react';
import type { RadioChangeEvent } from 'antd';
import { Radio, Card, Form } from 'antd';

const JobTypeSelector: React.FC = () => {
  const [value, setValue] = useState<string>('part-time');

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  const jobTypes = [
    { label: 
      <span className="custom-label-radio ">ฟรีแลนซ์ (จ้างงานเป็นโปรเจกต์)</span>, value: 'part-time' },
    { label: 
      <span className="custom-label-radio ">สัญญาจ้าง (รายเดือน/รายปี)</span>, value: 'internship' },
    { label: 
      <span className="custom-label-radio ">พาร์ทไทม์ (รายชั่วโมง/รายวัน)</span>, value: 'one-time' },
    { label: 
      <span className="custom-label-radio ">งานประจำ</span>, value: 'full-time' },
  ];

  return (
    <Form.Item
     label={<span className="label">ลักษณะงาน</span>}
      name="jobType"
      rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}
    >
      <Radio.Group onChange={onChange} value={value} style={{ width: '100%' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {jobTypes.map((job) => (
  <Card
    key={job.value}
    className={`custom-card ${value === job.value ? 'custom-card-selected' : ''}`}
    onClick={() => setValue(job.value)}
    bodyStyle={{ padding: 0 }}
    style={{
      cursor: 'pointer',
    }}
  >
    <Radio
      value={job.value}
      style={{
        display: 'block',
        width: '100%',
        padding: '5px 14px',
        fontSize: '16px',
        lineHeight: '24px',
        minHeight: '40px',
      }}
    >
      {job.label}
    </Radio>
  </Card>

          ))}
        </div>
      </Radio.Group>
    </Form.Item>
  );
};

export default JobTypeSelector;
