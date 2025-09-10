// import React from "react";
import "./worklog.css";
import React, { useState } from "react";


const worklog = () => {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [Description, setDescription] = useState("");
  const [student, setStudent] = useState("");
  const [Jobpost, setJobpost] = useState("");
  
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   
    console.log({ student, date, hours, Jobpost,Description });
  };

  return (
    <div className="workhour-tracker-container">
      <div className="header">
        <div>
          <h2>บันทึกชั่วโมงทำงาน</h2>
          <p>
            บันทึกชั่วโมงการทำงานของนักเรียนและรายละเอียดสำหรับปรับการเงินเดือน
          </p>
        </div>

        {/* Navigation links here */}
      </div>

      <div className="main-content">
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              

              <div className="form-group">
                <label>งานของฉัน</label>
                <select
                  value={Jobpost}
                  onChange={(e) => setJobpost(e.target.value)}
                  onInvalidCapture={(e) => e.currentTarget.setCustomValidity('กรุณาเลือกงานง')}
                  required
                >
                  <option value="1">เลือกประเภทงานที่นักเรียนปฏิบัติ</option>
                  <option value="2">ประเภทงาน 2</option>
                  <option value="3">ประเภทงาน 3</option>
                  {/* Options will be mapped here */}
                  
                </select>
              </div>




              <div className="form-group">
                <label>เลือกนักเรียน</label>
                <select
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  onInvalidCapture={(e) => e.currentTarget.setCustomValidity('กรุณาเลือกนักเรียน')}
                  required
                >
                  <option value="">เลือกนักเรียนที่ต้องการบันทึกชั่วโมง</option>
                  <option value="1">นักเรียน 1</option>
                  <option value="2">นักเรียน 2</option>
                  <option value="3">นักเรียน 3</option>
                </select>
              </div>

            </div>

            <div className="form-row">
              <div className="from-group">
                <div className="form-group">
                  <label>วันที่ทำงาน</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>จำนวนชั่วโมง</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="12"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="เช่น 4 หรือ 4.5"
                      required
                    />
                    <small>ระบุจำนวนชั่วโมงทำงาน (0.5 - 12 ชั่วโมง)</small>
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>รายละเอียดงาน *</label>
                <textarea
                  value={Description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายรายละเอียดงานที่นักเรียนปฏิบัติ"
                  maxLength={500}
                  minLength={10}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn">
                ยกเลิก
              </button>
              <button type="submit" className="submit-btn">
                บันทึกชั่วโมง
              </button>
            </div>
          </form>
        </div>

        <div className="history-section">
          <h2>ประวัติการทำงานล่าสุด</h2>
          <p>เลือกนักเรียนเพื่อดูประวัติการทำงานล่าสุด</p>
          {/* Recent history list here */}
        </div>
      </div>
    </div>
  );
};

export default worklog;
