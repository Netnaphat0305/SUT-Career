import React, { useState, useEffect, useContext } from "react"; // 1. import useEffect
import "./worklog.css";
import { worklogAPI } from "../../services/https/index"; // 2. Import service สำหรับดึงข้อมูล
import message from "antd/es/message";
import { AuthContext } from "../../context/AuthContext"; // 2. Import AuthContext เพื่อเข้าถึงข้อมูล user
// 3. กำหนด Type สำหรับข้อมูล JobPost ที่จะรับมาจาก API
interface JobPost {
  ID: number;
  title: string;
}
//  กำหนด Type สำหรับข้อมูล Student ที่จะรับมาจาก API
interface Student {
  id: number;
  name: string;
}

const Worklog = () => {
  // เปลี่ยนชื่อ component เป็นตัวพิมพ์ใหญ่ตาม Convention
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState(""); // เปลี่ยนเป็น camelCase
  const [student, setStudent] = useState("");
  const [JobPostId, setJobPostId] = useState(""); // State สำหรับเก็บ ID ของงานที่เลือก

  // --- vvvv ส่วนที่เพิ่มเข้ามา vvvv ---
  const [jobPostsList, setJobPostsList] = useState<JobPost[]>([]); // State สำหรับเก็บรายการงาน
  const [studentList, setStudentList] = useState<Student[]>([]); // เปลี่ยนเป็น array ของ Student
  const [isLoading, setIsLoading] = useState(true); // State สำหรับสถานะการโหลด
  const [error, setError] = useState<string | null>(null); // State สำหรับเก็บ Error

  const [isStudentsLoading, setIsStudentsLoading] = useState(false); // State โหลดนักเรียน
  // --- ^^^^ ส่วนที่เพิ่มเข้ามา ^^^^ ---
  const auth = useContext(AuthContext);

  // 4. ใช้ useEffect เพื่อดึงข้อมูล JobPost เมื่อคอมโพเนนต์ถูกสร้าง
  const fetchJobPosts = async () => {
    // สมมติว่าเราได้ employer ID มาจากการ login (ในตัวอย่างนี้ใช้ ID = 1)
    // คุณต้องเปลี่ยน '1' เป็น ID ของ employer ที่ login อยู่จริงๆ
    // ตัวอย่างการดึง ID จาก localStorage
    const userStorage = localStorage.getItem("user");
    const userId = userStorage ? JSON.parse(userStorage).id : null;
    if (!userId) {
      setError("ไม่พบข้อมูลผู้ใช้");
      setIsLoading(false);
      return;
    }
    try {
      const data = await worklogAPI.getJobpostByUserID(userId);
      if (data) {
        setJobPostsList(data); // นำข้อมูลที่ได้มาใส่ใน state
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลงาน");
      console.error(err);
    } finally {
      setIsLoading(false); // สิ้นสุดการโหลด
    } // ตรวจสอบ state หลังการตั้งค่า
  };

  const fetchStudentsByJobPost = async (jobPostId: number) => {
    if (!jobPostId) {
      setStudentList([]); // ถ้าไม่มี JobPost ID ให้เคลียร์รายชื่อนักเรียน
      return;
    }
    setIsStudentsLoading(true);
    setStudent(""); // รีเซ็ตนักเรียนที่เลือกไว้
    try {
      const data = await worklogAPI.getJobApplicationByJobpostID(jobPostId);
      if (data) {
        setStudentList(data);
      }
      if (data.length === 0) {
        console.warn("No students found for the selected job post.");
        setStudentList([]); // เคลียร์รายชื่อถ้าไม่มีนักเรียน
      }
      console.log("Fetched Students:", data); // ตรวจสอบข้อมูลที่ได้
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudentList([]); // เคลียร์รายชื่อหากมีข้อผิดพลาด
    } finally {
      setIsStudentsLoading(false);
    }
  };

  // [] หมายถึงให้ effect นี้ทำงานแค่ครั้งเดียวตอนคอมโพเนนต์โหลด

  useEffect(() => {
    fetchJobPosts();
    console.log("Selected Job Post ID changed:", JobPostId);
    if (JobPostId) {
      fetchStudentsByJobPost(Number(JobPostId));
    } else {
      setStudentList([]); // เคลียร์รายชื่อนักเรียนถ้าไม่ได้เลือกงาน
    }

    // ตรวจสอบค่า selectedJobPostId
  }, [JobPostId]);

  // useEffect(() => {
  //   console.log("Selected Student ID changed:", student);
  // }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth?.user?.id) {
      message.error("กรุณาเข้าสู่ระบบก่อนทำการรายงาน");
      return;
    }

    const formattedDate = new Date(date).toISOString();
    const worklogData = {
      description: description,
      time: formattedDate,
      hours: Number(hours),
      student_id: Number(student),
      jobpost_id: Number(JobPostId),
    };

    console.log("Submitting Worklog Data:", worklogData);

    try {
      // 7. เรียกใช้ฟังก์ชัน create จาก reportAPI ที่เราสร้างไว้
      const res = await worklogAPI.create(worklogData);
      // console.log('Report submission response:', response);
      // console.log('Response status:', response.status);
      // ตรวจสอบ response จาก axios (ใน service)
      
      if (res.id || res.ID) {
        message.success("บันทึกรายงานสำเร็จ!");
        // เคลียร์ฟอร์มหลังจากส่งข้อมูลสำเร็จ
        setDate("");
        setHours("");
        setDescription("");
        setStudent("");
        setJobPostId(""); 
        setStudentList([]); // เคลียร์รายชื่อนักเรียน
      } else {

        message.error(res?.data?.error || "บันทึกข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      message.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="workhour-tracker-container">
      <div className="header">
        <div>
          <h2>บันทึกชั่วโมงทำงาน</h2>
          <button onClick={fetchJobPosts}>โหลดงานของฉัน</button>
          <p>
            บันทึกชั่วโมงการทำงานของนักเรียนและรายละเอียดสำหรับปรับการเงินเดือน
          </p>
        </div>
      </div>

      <div className="main-content">
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>งานของฉัน</label>
                {/* 5. อัปเดต Dropdown ให้แสดงข้อมูลจาก State */}
                <select
                  value={JobPostId}
                  onChange={(e) => setJobPostId(e.target.value)}
                  required
                  disabled={isLoading || error !== null} // ปิดการใช้งานระหว่างโหลดหรือเมื่อมี error
                >
                  <option value="">
                    {isLoading
                      ? "กำลังโหลดรายการงาน..."
                      : error
                      ? error
                      : "เลือกงานของฉัน"}
                  </option>
                  {!isLoading &&
                    !error &&
                    jobPostsList.map((post) => (
                      <option key={post.ID} value={post.ID}>
                        {post.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>เลือกนักเรียน</label>
                <select
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  required
                  disabled={!JobPostId || isStudentsLoading} // ปิดใช้งานถ้ายังไม่เลือกงาน หรือกำลังโหลด
                >
                  <option value="">
                    {isStudentsLoading
                      ? "กำลังโหลด..."
                      : !JobPostId
                      ? "กรุณาเลือกงานก่อน"
                      : JobPostId && studentList.length === 0
                      ? "ไม่มีนักเรียนที่เกี่ยวข้อง"
                      : "เลือกนักเรียน"}
                  </option>
                  {studentList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
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
                  value={description}
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
        </div>
      </div>
    </div>
  );
};

export default Worklog;
