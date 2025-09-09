import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Spin, message, Avatar, Empty, Tag } from "antd";
import { jobApplicationAPI, jobPostAPI } from "../../services/https";
import defaultProfile from "../../assets/profile.svg";
import "./ManageApplicants.css";
import type { JobApplication, JobPost } from "../../interfaces/jobApplication";

const ManageApplicants: React.FC = () => {
  const { jobpost_id } = useParams<{ jobpost_id: string }>();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [jobpost, setJobpost] = useState<JobPost | null>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<JobApplication | null>(null);

  // โหลดข้อมูลโพสต์ + ผู้สมัคร
  const fetchData = async () => {
    try {
      const postRes = await jobPostAPI.getById(Number(jobpost_id));
      setJobpost(postRes.data);

      const appRes = await jobApplicationAPI.getByJobPost(Number(jobpost_id));
      setApplicants(appRes?.data || []);

      // ถ้ามี applicant ถูกเลือกอยู่ ให้ sync ข้อมูลล่าสุดด้วย
      if (selectedApplicant) {
        const updated = appRes?.data.find(
          (a: JobApplication) => a.ID === selectedApplicant.ID
        );
        if (updated) setSelectedApplicant(updated);
      }
    } catch (error) {
      message.error("โหลดข้อมูลผู้สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobpost_id]);

  // ฟังก์ชันอัปเดตสถานะผู้สมัคร
  const updateApplicantStatus = async (
    applicationId: number,
    status: string,
    successMsg: string
  ) => {
    try {
      await jobApplicationAPI.updateStatus(applicationId, status);
      message.success(successMsg);
      fetchData();
    } catch (error) {
      message.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );
  }

  return (
    <div className="manage-applicants-container">
      {jobpost && (
        <div className="job-header">
          <div>
            <h2 className="job-title">{jobpost.title}</h2>
            <p className="job-company">
              {jobpost.Employer?.company_name || "ไม่ระบุบริษัท"}
            </p>
          </div>
          <img
            src={jobpost.image_url || defaultProfile}
            alt="logo"
            className="job-logo"
          />
        </div>
      )}

      <h3 className="section-title">รายชื่อผู้สมัครงาน</h3>

      {applicants.length === 0 ? (
        <Empty description="ยังไม่มีผู้สมัครงาน" />
      ) : (
        <div className="manage-content">
          {/* รายชื่อผู้สมัคร */}
          <div className="applicants-list">
            {applicants.map((app) => (
              <Card
                key={app.ID}
                className={`applicant-card ${
                  selectedApplicant?.ID === app.ID ? "selected" : ""
                }`}
                onClick={() => setSelectedApplicant(app)}
              >
                <div className="applicant-info">
                  <Avatar
                    size={64}
                    src={defaultProfile}
                    style={{ marginRight: 16 }}
                  />
                  <div>
                    <h4 className="applicant-name">
                      {app.Student?.first_name} {app.Student?.last_name}
                    </h4>
                    <p className="applicant-details">
                      {app.Student?.user?.username} • {app.Student?.phone}
                    </p>
                    <Tag
                      color={
                        app.application_status === "Pending"
                          ? "blue"
                          : app.application_status === "InterviewPending"
                          ? "orange"
                          : app.application_status === "InterviewScheduled"
                          ? "gold"
                          : app.application_status === "Interviewed"
                          ? "purple"
                          : app.application_status === "Accepted"
                          ? "green"
                          : app.application_status === "Cancelled"
                          ? "default"
                          : "red"
                      }
                    >
                      {app.application_status === "Pending" && "รอพิจารณา"}
                      {app.application_status === "InterviewPending" &&
                        "รอเลือกวันสัมภาษณ์"}
                      {app.application_status === "InterviewScheduled" &&
                        "รอสัมภาษณ์"}
                      {app.application_status === "Interviewed" &&
                        "สัมภาษณ์เสร็จแล้ว"}
                      {app.application_status === "Accepted" &&
                        "ผ่านการคัดเลือก"}
                      {app.application_status === "Rejected" &&
                        "ไม่ผ่านการคัดเลือก"}
                      {app.application_status === "Cancelled" &&
                        "นักศึกษายกเลิกการสมัคร"}
                    </Tag>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Panel รายละเอียดผู้สมัคร */}
          <div className="applicant-detail-panel">
            {selectedApplicant ? (
              <>
                <Avatar
                  size={80}
                  src={defaultProfile}
                  style={{ marginBottom: 16 }}
                />
                <h3>
                  {selectedApplicant.Student?.first_name}{" "}
                  {selectedApplicant.Student?.last_name}
                </h3>
                <p>รหัสนักศึกษา: {selectedApplicant.Student?.user?.username}</p>
                <p>เบอร์โทร: {selectedApplicant.Student?.phone}</p>
                <p>
                  ธนาคาร:{" "}
                  {selectedApplicant.Student?.bank?.bank_name || "ไม่ได้ระบุ"}
                </p>
                <p>
                  เหตุผลการสมัคร:{" "}
                  {selectedApplicant.application_reason || "ไม่ได้ระบุเหตุผล"}
                </p>

                {/* แสดงวันสัมภาษณ์ ถ้ามี */}
                {selectedApplicant.InterviewScheduling && (
                  <p>
                    วันสัมภาษณ์:{" "}
                    {new Date(
                      selectedApplicant.InterviewScheduling.DateAndTime
                    ).toLocaleString("th-TH")}
                  </p>
                )}

                {/* ปุ่มจัดการสถานะ */}
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="primary"
                    disabled={
                      selectedApplicant.application_status === "Cancelled" ||
                      selectedApplicant.application_status !== "Pending"
                    }
                    onClick={() =>
                      updateApplicantStatus(
                        selectedApplicant.ID,
                        "InterviewPending",
                        "เลือกผู้สมัครเรียบร้อยแล้ว (รอเลือกวันสัมภาษณ์)"
                      )
                    }
                  >
                    เลือกผู้สมัคร
                  </Button>

                  <Button
                    type="dashed"
                    disabled={
                      selectedApplicant.application_status !==
                      "InterviewScheduled"
                    }
                    onClick={() =>
                      updateApplicantStatus(
                        selectedApplicant.ID,
                        "Interviewed",
                        "อัปเดตเป็นสัมภาษณ์เสร็จแล้ว"
                      )
                    }
                  >
                    สัมภาษณ์เสร็จ
                  </Button>

                  <Button
                    type="primary"
                    disabled={
                      selectedApplicant.application_status !== "Interviewed"
                    }
                    onClick={() =>
                      updateApplicantStatus(
                        selectedApplicant.ID,
                        "Accepted",
                        "รับเข้าทำงานเรียบร้อยแล้ว"
                      )
                    }
                  >
                    รับเข้าทำงาน
                  </Button>

                  <Button
                    danger
                    disabled={
                      selectedApplicant.application_status !== "Interviewed"
                    }
                    onClick={() =>
                      updateApplicantStatus(
                        selectedApplicant.ID,
                        "Rejected",
                        "ปฏิเสธผู้สมัครเรียบร้อยแล้ว"
                      )
                    }
                  >
                    ไม่รับ
                  </Button>
                </div>
              </>
            ) : (
              <p style={{ color: "#999" }}>
                กรุณาเลือกผู้สมัครจากรายการด้านซ้าย
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageApplicants;
