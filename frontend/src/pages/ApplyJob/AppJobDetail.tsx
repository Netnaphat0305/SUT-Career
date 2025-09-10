// import React from "react";
// import { Input, Form, DatePicker, Select, Button, Upload,  Alert, } from "antd";
// import { UploadOutlined } from "@ant-design/icons"; // ✅ เพิ่มไอคอน
// import "./AppJobDetail.css"; // นำเข้าไฟล์ CSS

// const { TextArea } = Input;

// const uploadProps = {
//   beforeUpload: (file: File) => {
//     // ตรวจสอบไฟล์ก่อนอัปโหลด (สามารถเพิ่ม logic ได้)
//     return false; // ป้องกันการอัปโหลดอัตโนมัติ
//   },
// };

// const JobAppDetail: React.FC = () => {
//   return (
//     <div className="job-app-detail-wrapper">
//       <Form layout="vertical">
//         <div className="name-row">
//           {/* ชื่อ */}
//           <Form.Item
//             label={<span className="text-label">ชื่อ</span>}
//             name="firstname"
//             rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
//             className="name-item"
//           >
//             <Input placeholder="กรอกชื่อ" size="large" />
//           </Form.Item>

//           {/* นามสกุล */}
//           <Form.Item
//             label={<span className="text-label">นามสกุล</span>}
//             name="lastname"
//             rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
//             className="name-item"
//           >
//             <Input placeholder="กรอกนามสกุล" size="large" />
//           </Form.Item>

//           {/* รหัสนักศึกษา */}
//           <Form.Item
//             label={<span className="text-label">รหัสนักศึกษา</span>}
//             name="StudentID"
//             rules={[{ required: true, message: "กรุณากรอกรหัสนักศึกษา" }]}
//             className="name-item"
//           >
//             <Input placeholder="กรุณากรอกรหัสนักศึกษา" size="large" />
//           </Form.Item>

//           {/* เบอร์โทร */}
//           <Form.Item
//             label={<span className="text-label">เบอร์โทร</span>}
//             name="Phone"
//             rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}
//             className="name-item"
//           >
//             <Input placeholder="กรอกเบอร์โทร" size="large" />
//           </Form.Item>

//           {/* วันเกิด */}
//           <Form.Item
//             label={<span className="text-label">วันเกิด</span>}
//             name="BirthDay"
//             rules={[{ required: true, message: "กรุณาเลือกวันเกิด" }]}
//             className="name-item"
//           >
//             <DatePicker
//               size="large"
//               style={{ width: "100%" }}
//               format="YYYY-MM-DD"
//             />
//           </Form.Item>

//           {/* อายุ */}
//           <Form.Item
//             label={<span className="text-label">อายุ</span>}
//             name="Age"
//             rules={[{ required: true, message: "กรุณากรอกอายุ" }]}
//             className="name-item"
//           >
//             <Input placeholder="กรอกอายุ" size="large" />
//           </Form.Item>

//           {/* เพศ */}
//           <Form.Item
//             label={<span className="text-label">เพศ</span>}
//             name="Gender"
//             rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}
//             className="name-item"
//           >
//             <Select
//               placeholder="เลือกเพศ"
//               size="large"
//               className="gender-select"
//             >
//               <Select.Option value="ชาย">
//                 <span className="dropdown">ชาย</span>
//               </Select.Option>
//               <Select.Option value="หญิง">
//                 <span className="dropdown">หญิง</span>
//               </Select.Option>
//               <Select.Option value="อื่นๆ">
//                 <span className="dropdown">อื่นๆ</span>
//               </Select.Option>
//             </Select>
//           </Form.Item>

//           {/* อีเมล */}
//           <Form.Item
//             label={<span className="text-label">อีเมล</span>}
//             name="Email"
//             rules={[{ required: true, message: "กรุณากรอกอีเมล" }]}
//             className="name-item"
//           >
//             <Input placeholder="กรอกอีเมล" size="large" />
//           </Form.Item>

//           {/* คณะ/สาขา */}
//           <Form.Item
//             label={<span className="text-label">คณะ/สาขา</span>}
//             name="Faculty"
//             rules={[{ required: true, message: "กรุณาเลือกคณะ/สาขา" }]}
//             className="name-item full-width"
//           >
//             <Select
//               placeholder="เลือกคณะ/สาขา"
//               size="large"
//               className="Faculty-select"
//             >
//               <Select.Option value="วิศวกรรมศาตร์">
//                 <span className="dropdown">วิศวกรรมศาตร์</span>
//               </Select.Option>
//               <Select.Option value="ดิจิเทค">
//                 <span className="dropdown">ดิจิเทค</span>
//               </Select.Option>
//               <Select.Option value="พยาบาล">
//                 <span className="dropdown">พยาบาล</span>
//               </Select.Option>
//             </Select>
//           </Form.Item>

//           {/* ชั้นปีการศึกษา */}
//           <Form.Item
//             label={<span className="text-label">ชั้นปีการศึกษา</span>}
//             name="Year"
//             rules={[{ required: true, message: "กรุณาเลือกชั้นปีการศึกษา" }]}
//             className="name-item"
//           >
//             <Select
//               placeholder="เลือกชั้นปีการศึกษา"
//               size="large"
//               className="year-select"
//             >
//               <Select.OptGroup
//                 label={<span className="dropdown">ปริญญาตรี</span>}
//               >
//                 <Select.Option value="ปี1">
//                   <span className="dropdown">ปี 1</span>
//                 </Select.Option>
//                 <Select.Option value="ปี2">
//                   <span className="dropdown">ปี 2</span>
//                 </Select.Option>
//                 <Select.Option value="ปี3">
//                   <span className="dropdown">ปี 3</span>
//                 </Select.Option>
//                 <Select.Option value="ปี4">
//                   <span className="dropdown">ปี 4</span>
//                 </Select.Option>
//               </Select.OptGroup>
//             </Select>
//           </Form.Item>

//           {/* เกรดเฉลี่ย (ถ้ามี) */}
//           <Form.Item
//             label={<span className="text-label">เกรดเฉลี่ย (ถ้ามี)</span>}
//             name="GPA"
//             className="name-item"
//           >
//             <Input placeholder="กรอกเกรดเฉลี่ย" size="large" />
//           </Form.Item>

//           {/* แนะนำตัว */}
//           <Form.Item
//             label={<span className="text-label">แนะนำตัว</span>} // ✅ เพิ่ม label
//             name="ApplicationReason"
//             rules={[{ required: true, message: "กรุณากรอกรายละเอียดงาน" }]}
//             className="name-item full-width"
//           >
//             <TextArea
//               className="custom-textarea-AppJob"
//               placeholder="เขียนแนะนำตัวคุณสั้น ๆ เช่น ความสามารถ จุดเด่น ประสบการณ์ หรือสิ่งที่คุณสนใจเกี่ยวกับตำแหน่งงานนี้ เพื่อช่วยให้ผู้ว่าจ้างเข้าใจและรู้จักคุณมากขึ้น”"
//               rows={6}
//               size="large"
//               style={{ fontSize: 14 }}
//             />
//           </Form.Item>

//           <Form.Item
//             label={<span className="text-label">ไฟล์ผลงาน (Resume ถ้ามี)</span>}
//           >
//             <Upload {...uploadProps}>
//               <Button icon={<UploadOutlined />} className="resume-upload">
//                 คลิกเพื่ออัปโหลด
//               </Button>
//             </Upload>
//           </Form.Item>
//         </div>

// <Alert
//   className="custom-job-description-note"
//   description="กรุณาตรวจสอบข้อมูลให้ถูกต้อง และแนบเอกสารให้ครบถ้วน ก่อนกดยืนยันส่งใบสมัคร"
//   type="warning"
//   showIcon
//   style={{ marginTop: 16, width: "100%" }}
// />

//         {/* ปุ่มยืนยัน */}
//         <div className="submit-button-wrapper-AppJob">
//           <Button
//             type="primary"
//             size="large"
//             className="submit-button-AppJob"
//             htmlType="submit"
//           >
//             ยืนยันสมัครงาน
//           </Button>
//         </div>
//       </Form>{" "}
//       {/* ปิด Form ที่เปิดไว้ */}
//     </div>
//   );
// };

// export default JobAppDetail;
