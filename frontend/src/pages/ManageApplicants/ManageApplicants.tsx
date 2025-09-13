import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, message, Avatar, Empty } from "antd";
import { jobApplicationAPI, jobPostAPI } from "../../services/https";
import defaultProfile from "../../assets/profile.svg";
import "./ManageApplicants.css";
import type { JobApplication, JobPost } from "../../interfaces/jobApplication";
import PageHeader from "../../components/PageHeader";
import { API_BASE } from "../../config";
// import type { Student } from "../../interfaces/student";

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
          <div className="job-header-info">
            <h2 className="job-title">{jobpost.title}</h2>
            <p className="job-company">
              {jobpost.Employer?.company_name || "ไม่ระบุบริษัท"}
            </p>
          </div>
          <img
            src={
              jobpost.image_url
                ? `${API_BASE}${jobpost.image_url}`
                : defaultProfile
            }
            alt="logo"
            className="job-logo"
          />
        </div>
      )}

      <PageHeader title="รายชื่อผู้สมัครงาน" />

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
                  {/* Avatar */}
                  <Avatar
                    size={64}
                    src={
                      app.Student?.profile_image_url
                        ? app.Student.profile_image_url.startsWith("http")
                          ? app.Student.profile_image_url
                          : `${API_BASE}${app.Student.profile_image_url}`
                        : defaultProfile
                    }
                    className="applicant-avatar"
                  />

                  {/* ข้อมูลผู้สมัคร */}
                  <div className="applicant-content">
                    <h4 className="applicant-name">
                      {app.Student?.first_name} {app.Student?.last_name}
                    </h4>
                    <p className="applicant-details">
                      {app.Student?.user?.username} • {app.Student?.phone}
                    </p>

                    {/* ป้ายสถานะ */}
                    <span
                      className={`tag ${
                        app.application_status === "Pending"
                          ? "tag-pending"
                          : app.application_status === "InterviewPending"
                          ? "tag-interview-pending"
                          : app.application_status === "InterviewScheduled"
                          ? "tag-interview-scheduled"
                          : app.application_status === "Interviewed"
                          ? "tag-interviewed"
                          : app.application_status === "Accepted"
                          ? "tag-accepted"
                          : app.application_status === "Rejected"
                          ? "tag-rejected"
                          : "tag-cancelled"
                      }`}
                    >
                      {app.application_status === "Pending" && "รอพิจารณา"}
                      {app.application_status === "InterviewPending" &&
                        "รอนักศึกษาเลือกวันสัมภาษณ์"}
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
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Panel รายละเอียดผู้สมัคร */}
          <div className="applicant-detail-panel">
            {selectedApplicant ? (
              <>
                {/* ส่วนบน: Avatar และชื่อ */}
                <div className="applicant-profile-header">
                  <Avatar
                    size={90}
                    src={
                      selectedApplicant?.Student?.profile_image_url
                        ? selectedApplicant.Student.profile_image_url.startsWith(
                            "http"
                          )
                          ? selectedApplicant.Student.profile_image_url
                          : `${API_BASE}${selectedApplicant.Student.profile_image_url}`
                        : defaultProfile
                    }
                    className="applicant-profile-avatar"
                  />

                  <div>
                    <h3 className="applicant-profile-name">
                      {selectedApplicant.Student?.first_name}{" "}
                      {selectedApplicant.Student?.last_name}
                    </h3>
                    <p className="applicant-profile-role">
                      {selectedApplicant.Student?.faculty || "นักศึกษา"}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="profile-divider" />

                {/* ส่วนข้อมูลนักศึกษา */}
                <div className="applicant-profile-info">
                  <div className="info-row">
                    <span className="info-label">รหัสนักศึกษา:</span>
                    <span className="info-value">
                      {selectedApplicant.Student?.user?.username || "-"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">เบอร์โทรศัพท์:</span>
                    <span className="info-value">
                      {selectedApplicant.Student?.phone || "-"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">อีเมล:</span>
                    <span className="info-value">
                      {selectedApplicant.Student?.email || "-"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">ธนาคาร:</span>
                    <span className="info-value">
                      {selectedApplicant.Student?.bank?.bank_name ||
                        "ไม่ได้ระบุ"}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="profile-divider" />

                {/* เหตุผลการสมัคร */}
                <div className="applicant-profile-reason">
                  <h4>เหตุผลในการสมัคร</h4>
                  <p>
                    {selectedApplicant.application_reason ||
                      "นักศึกษาไม่ได้ระบุเหตุผลในการสมัคร"}
                  </p>
                </div>

                {/* Divider */}
                <div className="profile-divider" />

                {/* Resume ผู้สมัคร */}
                <div className="applicant-profile-resume">
                  {/* Resume ของผู้สมัคร */}
                  {selectedApplicant?.resume_file ? (
                    <div className="resume-section">
                      <h4>Resume</h4>
                      <a
                        href={`${API_BASE}/download/resume/${selectedApplicant.resume_file
                          .split("/")
                          .pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ดาวน์โหลด Resume
                      </a>
                    </div>
                  ) : (
                    <p style={{ color: "#888" }}>ผู้สมัครไม่ได้แนบ Resume</p>
                  )}
                </div>

                {/* Divider */}
                <div className="profile-divider" />

                {/* วันสัมภาษณ์ */}
                {selectedApplicant.InterviewScheduling && (
                  <div className="interview-date">
                    <span className="info-label">วันสัมภาษณ์:</span>
                    <span className="info-value">
                      {new Date(
                        selectedApplicant.InterviewScheduling.DateAndTime
                      ).toLocaleString("th-TH")}
                    </span>
                  </div>
                )}

                {/* ปุ่มจัดการสถานะ */}
                <div className="applicant-actions">
                  <button
                    className="btn-manageapp"
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
                  </button>

                  <button
                    className="btn-interviewed"
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
                  </button>

                  <button
                    className="btn-accept"
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
                  </button>

                  <button
                    className="btn-reject"
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
                  </button>
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
