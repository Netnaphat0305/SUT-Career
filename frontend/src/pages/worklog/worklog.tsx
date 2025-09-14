  import React, { useState, useEffect, useContext } from "react"; // 1. import useEffect
  import "./worklog.css";
  import { worklogAPI } from "../../services/https/index"; // 2. Import service สำหรับดึงข้อมูล
  import message from "antd/es/message";
  import { AuthContext } from "../../context/AuthContext"; // 2. Import AuthContext เพื่อเข้าถึงข้อมูล user
  import PageHeader from "../../components/PageHeader";
  import {  Modal } from "antd";
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

  interface WorklogItem {//เอาไว้ดึงworklog list data
    id: number;
    description: string;
    time: string;
    hours: number;
    student: {
      id: number;
      first_name: string;
      last_name: string;
    };
    jobpost: {
      ID: number;
      title: string;
    };
  }


  const Worklog = () => {
    // =============State สำหรับฟอร์ม=============
    const [date, setDate] = useState("");
    const [hours, setHours] = useState("");
    const [description, setDescription] = useState(""); // เปลี่ยนเป็น camelCase
    const [student, setStudent] = useState(Number);
    const [JobPostId, setJobPostId] = useState(Number); // State สำหรับเก็บ ID ของงานที่เลือก
    // =========================================

    const auth = useContext(AuthContext); // 3. ใช้ useContext เพื่อเข้าถึงข้อมูล user ที่ login อยู่

    // --- vvvv ส่วนที่เพิ่มเข้ามา vvvv ---
    const [jobPostsList, setJobPostsList] = useState<JobPost[]>([]); // State สำหรับเก็บรายการงาน dropdown
    const [studentList, setStudentList] = useState<Student[]>([]); // เปลี่ยนเป็น array ของ Student  dropdown
    const [isLoading, setIsLoading] = useState(true); // State สำหรับสถานะการโหลด
    const [error, setError] = useState<string | null>(null); // State สำหรับเก็บ Error
    const [worklogs, setWorklogs] = useState<WorklogItem[]>([]); //  สำหรับเก็บรายการ worklog
    const [isStudentsLoading, setIsStudentsLoading] = useState(false); // State โหลดนักเรียน
    const [expandedDescriptions] = useState<number[]>([]); //  เก็บ ID ของ worklog ที่ขยายรายละเอียด
    
    //================ควบคุม Modal=======================
    const [isModalOpen, setIsModalOpen] = useState(false); //  ควบคุม Modal
    // --- state ใหม่ ---
    const [editingWorklogId, setEditingWorklogId] = useState<number | null>(null);

    const showModal = () => {
      setIsModalOpen(true);
    };

    const handleOk = () => {
      setIsModalOpen(false);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
    };
    //==========================================
    
    // ================fetchdata================4. ใช้ useEffect เพื่อดึงข้อมูล JobPost เมื่อคอมโพเนนต์ถูกสร้าง
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
        console.log("Fetched Job Posts:", data); // ตรวจสอบข้อมูลที่ได้
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลงาน");
        console.error(err);
      } finally {
        setIsLoading(false); // สิ้นสุดการโหลด
      } // ตรวจสอบ state หลังการตั้งค่า
    };

    const fetchStudentsByJobPost = async (jobPostId: number, preselectedStudentId?: number) => {
    if (!jobPostId) {
      setStudentList([]);
      return;
    }
    setIsStudentsLoading(true);
    try {
      const data = await worklogAPI.getJobApplicationByJobpostID(jobPostId);
      setStudentList(data || []);

      // ถ้าเราได้ preselectedStudentId ให้ตั้งค่า student หลังโหลดเสร็จ
      if (preselectedStudentId) {
        setStudent(preselectedStudentId);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudentList([]);
    } finally {
      setIsStudentsLoading(false);
    }
  };

    const fetchWorklogs = async () => {
      try {
        const userStorage = localStorage.getItem("user");
        const userId = userStorage ? JSON.parse(userStorage).id : null;

        if (!userId) {
          message.error("ไม่พบข้อมูลผู้ใช้");
          return;
        }

        const data = await worklogAPI.getWorklogByUserID(userId);
        if (data) {
          const normalized = data.map((w: any) => ({
          id: w.id || w.ID,   // 👈 แก้ตรงนี้
          description: w.description,
          time: w.time,
          hours: w.hours,
          student: w.student,
          jobpost: w.jobpost,
        }));

        setWorklogs(normalized);
        }
        console.log("Fetched Worklogs eee:", data);
      } catch (err) {
        console.error("Error fetching worklogs:", err);
        message.error("ไม่สามารถดึงข้อมูลประวัติการทำงานได้");
      }
    };
    //==========================================

    useEffect(() => {
      fetchStudentsByJobPost;
      fetchWorklogs();// ดึงข้อมูล worklogs เมื่อคอมโพเนนต์ถูกโหลดครั้งแรก
    }, []);

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
    //   // ตรวจสอบค่า selectedJobPostId
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
     const worklogUpdateData = {
      description: description,
      time: formattedDate,
      hours: Number(hours),

    };
    

    try {
      let res;
      if (editingWorklogId) {
        // ✏️ update
        res = await worklogAPI.update(editingWorklogId, worklogUpdateData);
        if (res.id || res.ID) {
          message.success("แก้ไขรายงานสำเร็จ!");
        }
        console.log(editingWorklogId,worklogData)
      } else {
        // 🆕 create
        res = await worklogAPI.create(worklogData);
        if (res.id || res.ID) {
          message.success("บันทึกรายงานสำเร็จ!");
        }
      }

      // เคลียร์ฟอร์ม + state
      setDate("");
      setHours("");
      setDescription("");
      setStudent(0);
      setJobPostId(0);
      setStudentList([]);
      setEditingWorklogId(null);

      await fetchWorklogs();
    } catch (error) {
      console.error("Failed to submit report:", error);
      message.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  // --- ฟังก์ชัน handleEdit ---
  const handleEdit = (log: WorklogItem) => {
    setEditingWorklogId(log.id);
    setDate(new Date(log.time).toISOString().split("T")[0]);
    setHours(String(log.hours));
    setDescription(log.description);
    setJobPostId(log.jobpost ? (log.jobpost.ID) : 0);

    // โหลดนักเรียนพร้อมตั้งค่า preselected student
    if (log.jobpost?.ID && log.student?.id) {
      fetchStudentsByJobPost(log.jobpost.ID, log.student.id);
    } else {
      setStudent(0);
    }
  };

  // --- ฟังก์ชันยกเลิกแก้ไข ---
  const handleCancelEdit = () => {
    setEditingWorklogId(null);
    setDate("");
    setHours("");
    setDescription("");
    setStudent(0);
    setJobPostId(0);
  };

    const handleDelete = async (id: number) => {
    try {
      console.log("Delete worklog with ID:", id);
      const confirmDelete = window.confirm("คุณต้องการลบข้อมูลนี้หรือไม่?");
      if (!confirmDelete) return;

      await worklogAPI.delete(id); // เรียก API เพื่อลบ
      message.success("ลบข้อมูลสำเร็จ");

      // โหลด worklogs ใหม่หลังลบ
      await fetchWorklogs();
    } catch (error) {
      console.error("Error deleting worklog:", error);
      message.error("ไม่สามารถลบข้อมูลได้");
    }
  };

    // Add this function to toggle description expansion

    return (
      <div className="workhour-tracker-container">
        <PageHeader title="บันทึกชั่วโมงการทำงาน" />
        <button onClick={fetchWorklogs}>โหลดงาน</button>
        <div className="main-content">
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>งานของฉัน</label>
                  {/* 5. อัปเดต Dropdown ให้แสดงข้อมูลจาก State */}
                  <select
                    value={JobPostId}
                    onChange={(e) => setJobPostId(Number(e.target.value))}
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
                    onChange={(e) => setStudent(Number(e.target.value))}
                    
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
                {editingWorklogId ? (
      <>
        <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
          ยกเลิกแก้ไข
        </button>
        <button type="submit" className="submit-btn">
          บันทึกแก้ไข
        </button>
      </>
    ) : (
      <>
        <button type="button" className="cancel-btn">
          ยกเลิก
        </button>
        <button type="submit" className="submit-btn">
          บันทึกชั่วโมง
        </button>
      </>
    )}
              </div>
            </form>
          </div>

          <div className="history-section">
            <h2>ประวัติการทำงานล่าสุด</h2>
            {worklogs.length === 0 ? (
              <p>ยังไม่มีข้อมูลการทำงาน</p>
            ) : (
              <ul className="worklog-list">
                {worklogs.map((log) => (
                  <li key={log.id} className="worklog-item">
                    <div>
                      <strong>{log.jobpost?.title}</strong>
                      <p>
                        {log.student
                          ? `${log.student.first_name} ${log.student.last_name}`
                          : "ไม่ระบุชื่อ"}
                      </p>
                      <p className="description">
                        {expandedDescriptions.includes(log.id)
                          ? log.description
                          : log.description.slice(0, 10) +
                            (log.description.length > 10 ? "..." : "")}
                        {log.description.length > 50 && (
                          <>
                            <button className="toggle-description" onClick={showModal}>"แสดงน้อยลง"</button>
                            <Modal
                              title="รายละเอียดงาน"
                              closable={{ "aria-label": "Custom Close Button" }}
                              open={isModalOpen}
                              onOk={handleOk}
                              onCancel={handleCancel}
                              okText="ตกลง"
                              cancelText="ปิด"
                            >
                              <p>{log.description}</p>
                            </Modal>
                          </>
                        )}
                      </p>
                      <small>
                        {new Date(log.time).toLocaleDateString()} | {log.hours}{" "}
                        ชั่วโมง
                      </small>
                    </div>
                    <div className="actions">
                      <button onClick={() => handleEdit(log)}>แก้ไข</button>
                      {/*() => handleEdit(log) */}
                      <button onClick={() => handleDelete(log.id)}>ลบ</button>{" "}
                      {/*() => handleDelete(log.id)*/}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default Worklog;
