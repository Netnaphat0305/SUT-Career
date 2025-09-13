import React, { useState, useContext } from "react";
import "./report .css";
import { message } from "antd";
import { reportAPI } from "../../../services/https/index"; // 1. Import reportAPI จาก service
import { AuthContext } from "../../../context/AuthContext"; // 2. Import AuthContext เพื่อเข้าถึงข้อมูล user

const Reportpage: React.FC = () => {
  const auth = useContext(AuthContext); // ดึงข้อมูล user ที่ login อยู่



  // 3. สร้าง state เพื่อเก็บข้อมูลจากฟอร์ม
  const [formData, setFormData] = useState({
    title: "",
    place: "",
    date: "",
    time: "",
    discription: "", // ใช้ 'discription' ให้ตรงกับ backend
  });

  // 4. ฟังก์ชันสำหรับอัปเดต state เมื่อผู้ใช้กรอกข้อมูล
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  // 5. ป
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า

    if (!auth?.user?.id) {
      message.error("กรุณาเข้าสู่ระบบก่อนทำการรายงาน");
      return;
    }

    // 6. เตรียมข้อมูล (payload) ที่จะส่งไปให้ API
    // สังเกตว่าเราส่งเป็น ID ไม่ได้ส่งเป็น Object ตาม interface
    const reportData = {
      title: formData.title,
      place: formData.place,
      datetime: `${formData.date}T${formData.time}:00Z`, // รวม date และ time เป็น format ที่ backend รับได้
      discription: formData.discription,
      user_id: auth.user.id, // ใช้ ID ของ user ที่ login อยู่
      report_status_id: 1, // กำหนดสถานะเริ่มต้น (เช่น 1 = รอดำเนินการ)
      admin_id: null, // ID ของ admin ที่จะรับเรื่อง (อาจมี logic อื่น)
    };

    try {
      // 7. เรียกใช้ฟังก์ชัน create จาก reportAPI ที่เราสร้างไว้
      const response = await reportAPI.create(reportData);

      // console.log('Report submission response:', response);

      // // ตรวจสอบ response จาก axios (ใน service)
      // console.log('Response status:', response.status);
      if (response.id || response.ID) {
        message.success("บันทึกรายงานสำเร็จ!");
        // เคลียร์ฟอร์มหลังจากส่งข้อมูลสำเร็จ
        setFormData({
          title: "",
          place: "",
          date: "",
          time: "",
          discription: "",
        });
        // console.log("data clear");
      } else {
        // หาก service คืน error มาใน response.data
        message.error(response?.data?.error || "บันทึกข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      message.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="report-overlay">
      <div className="safety-report-container">
        <div className="safety-report-header">
          <h2 className="title">รายงานความปลอดภัย</h2>
          <span className="exclamation-icon">!</span>
        </div>
        {/* 8. เพิ่ม onSubmit และเชื่อม input ทุกตัวเข้ากับ state */}
        <form className="safety-report-form" onSubmit={handleSubmit}>
          <div className="form-rows">
            <div className="form-group">
              <label htmlFor="title" className="label">
                ชื่อเหตุการณ์
              </label>
              <input
                type="text"
                id="title"
                className="input-field"
                value={formData.title}
                onChange={handleChange}
                placeholder="เช่น อุบัติเหตุเครื่องจักร"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="place" className="label">
                สถานที่
              </label>
              <input
                type="text"
                id="place"
                className="input-field"
                value={formData.place}
                onChange={handleChange}
                placeholder="เช่น อาคาร A ชั้น 2"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date" className="label">
                วันที่
              </label>
              <input
                type="date"
                id="date"
                className="input-field"
                value={formData.date}
                onChange={handleChange}
                placeholder="เลือกวันที่"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time" className="label">
                เวลา
              </label>
              <input
                type="time"
                id="time"
                className="input-field"
                value={formData.time}
                onChange={handleChange}
                placeholder="เลือกเวลา"
                required
              />
            </div>
          </div>

          <div className="form-group description-group">
            <label htmlFor="discription" className="label">
              รายละเอียด
            </label>
            <textarea
              id="discription"
              className="textarea-field"
              rows={5}
              value={formData.discription}
              onChange={handleChange}
              placeholder="อธิบายเหตุการณ์ เช่น สาเหตุ ความเสียหาย หรือผู้ที่เกี่ยวข้อง"
              required
            ></textarea>
          </div>
          <>
            <button type="submit" className="submit-button">
              ยืนยันบันทึก
            </button>
          </>
        </form>
      </div>
    </div>
  );
};

export default Reportpage;
