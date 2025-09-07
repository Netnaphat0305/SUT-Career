import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Spin, message, Avatar, Empty } from "antd";
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await jobPostAPI.getById(Number(jobpost_id));
        setJobpost(postRes.data);

        const appRes = await jobApplicationAPI.getByJobPost(Number(jobpost_id));
        setApplicants(appRes?.data || []);
      } catch (error) {
        message.error("โหลดข้อมูลผู้สมัครไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobpost_id]);

  // ฟังก์ชันเลือกผู้สมัคร
  const handleSelectApplicant = async (applicationId: number) => {
    try {
      // แก้เป็นอัปเดตสถานะเป็น InterviewPending
      await jobApplicationAPI.updateStatus(applicationId, "InterviewPending");
      message.success("เลือกผู้สมัครเรียบร้อยแล้ว (รอสัมภาษณ์)");

      const appRes = await jobApplicationAPI.getByJobPost(Number(jobpost_id));
      setApplicants(appRes?.data || []);

      const updated = appRes?.data.find(
        (a: JobApplication) => a.ID === applicationId
      );
      if (updated) setSelectedApplicant(updated);
    } catch (error) {
      message.error("ไม่สามารถเลือกผู้สมัครได้");
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
                  </div>
                </div>
              </Card>
            ))}
          </div>

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
                <Button
                  type="primary"
                  size="large"
                  disabled={
                    selectedApplicant.application_status === "InterviewPending"
                  }
                  onClick={() => handleSelectApplicant(selectedApplicant.ID)}
                >
                  {selectedApplicant.application_status === "InterviewPending"
                    ? "เลือกแล้ว (รอสัมภาษณ์)"
                    : "เลือก"}
                </Button>
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
