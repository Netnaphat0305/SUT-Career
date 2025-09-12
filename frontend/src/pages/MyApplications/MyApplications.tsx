import React, { useEffect, useState } from "react";
import { Button, Empty, Spin, message, Modal } from "antd";
import { ClockCircleOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { jobApplicationAPI } from "../../services/https";
import { useNavigate } from "react-router-dom";
import defaultLogo from "../../assets/profile.svg";
import "./MyApplications.css";
import PageHeader from "../../components/PageHeader";

const MyApplications: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await jobApplicationAPI.getMyApplications();
        setApplications(res?.data || []);
      } catch {
        message.error("โหลดใบสมัครไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusTag = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="tag-open">รอพิจารณา</span>;
      case "InterviewPending":
        return <span className="tag-open">รอเลือกวันสัมภาษณ์</span>;
      case "InterviewScheduled":
        return <span className="tag-open">รอสัมภาษณ์</span>;
      case "Interviewed":
        return <span className="tag-open">สัมภาษณ์เสร็จแล้ว</span>;
      case "Accepted":
        return <span className="tag-open">ผ่านการคัดเลือก</span>;
      case "Cancelled":
        return <span className="tag-close">ยกเลิกการสมัคร</span>;
      case "Rejected":
        return <span className="tag-close">ไม่ผ่านการคัดเลือก</span>;
      default:
        return null;
    }
  };

  const openModal = (app: any) => {
    setSelectedApp(app);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedApp(null);
    setIsModalVisible(false);
  };

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );
  }

  return (
    <div className="my-application-container">
      <PageHeader title="ใบสมัครของฉัน" />

      {applications.length === 0 ? (
        <Empty description="ยังไม่มีใบสมัคร" />
      ) : (
        <>
          {applications.map((app) => (
            <div
              key={app.ID}
              className="my-application-card"
              onClick={() => openModal(app)}
              style={{ cursor: "pointer" }}
            >
              {/* ฝั่งซ้าย */}
              <div className="my-application-left">
                <h2 className="my-application-title">
                  {app.JobPost?.title} {getStatusTag(app.application_status)}
                </h2>
                <p className="my-application-company">
                  {app.JobPost?.Employer?.company_name}
                </p>

                <div className="my-application-details">
                  <div className="my-application-detail">
                    <ClockCircleOutlined className="my-application-icon" />
                    <div>
                      <span>วันที่สมัคร</span>
                      <strong>
                        {new Date(app.CreatedAt).toLocaleDateString("th-TH")}
                      </strong>
                    </div>
                  </div>
                  <div className="my-application-detail">
                    <DollarCircleOutlined className="my-application-icon" />
                    <div>
                      <span>ค่าตอบแทน</span>
                      <strong>
                        {app.JobPost?.salary?.toLocaleString() || "-"} บาท
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ปุ่ม */}
                <div className="my-application-actions">
                  {app.application_status === "Pending" && (
                    <Button
                      className="btn-delete"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await jobApplicationAPI.updateStatus(
                            app.ID,
                            "Cancelled"
                          );
                          message.success("ยกเลิกการสมัครเรียบร้อยแล้ว");
                          setApplications((prev) =>
                            prev.map((item) =>
                              item.ID === app.ID
                                ? { ...item, application_status: "Cancelled" }
                                : item
                            )
                          );
                        } catch {
                          message.error("ยกเลิกการสมัครไม่สำเร็จ");
                        }
                      }}
                    >
                      ยกเลิกการสมัคร
                    </Button>
                  )}

                  {app.application_status === "InterviewPending" && (
                    <Button
                      className="btn-manageapp"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/interview?applicationId=${app.ID}`);
                      }}
                    >
                      เลือกวันสัมภาษณ์
                    </Button>
                  )}
                </div>
              </div>

              {/* ฝั่งขวา */}
              <div className="my-application-right">
                {app.JobPost?.image_url ? (
                  <img
                    src={app.JobPost.image_url}
                    alt={app.JobPost.title}
                    className="my-application-image"
                  />
                ) : (
                  <div className="my-application-image-fallback">
                    <img
                      src={defaultLogo}
                      alt="Default Logo"
                      className="my-application-image"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ===== Modal เดียวสำหรับทุกการ์ด ===== */}
          <Modal
            open={isModalVisible}
            onCancel={closeModal}
            footer={null}
            centered
            width={850}
            className="application-modal"
          >
            {selectedApp && (
              <div className="modal-content">
                {/* หัวเรื่อง */}
                <h2 className="modal-job-title">
                  {selectedApp.JobPost?.title}{" "}
                  {getStatusTag(selectedApp.application_status)}
                </h2>
                <p className="modal-company-name">
                  {selectedApp.JobPost?.Employer?.company_name}
                </p>

                {/* ข้อมูลแบบสองฝั่ง */}
                <div className="modal-two-columns">
                  {/* ฝั่งซ้าย - ข้อมูลผู้สมัคร */}
                  <div className="modal-student-info">
                    <h3>ข้อมูลผู้สมัคร</h3>
                    <p>
                      <strong>ชื่อ-นามสกุล:</strong>{" "}
                      {selectedApp.Student?.first_name}{" "}
                      {selectedApp.Student?.last_name}
                    </p>
                    <p>
                      <strong>อีเมล:</strong> {selectedApp.Student?.email}
                    </p>
                    <p>
                      <strong>เบอร์โทร:</strong> {selectedApp.Student?.phone}
                    </p>
                    <p>
                      <strong>คณะ:</strong> {selectedApp.Student?.faculty}
                    </p>
                    <p>
                      <strong>ปีการศึกษา:</strong> {selectedApp.Student?.year}
                    </p>
                    <p>
                      <strong>GPA:</strong> {selectedApp.Student?.gpa}
                    </p>
                    <p>
                      <strong>วันที่สมัคร:</strong>{" "}
                      {new Date(selectedApp.CreatedAt).toLocaleDateString(
                        "th-TH"
                      )}
                    </p>
                  </div>

                  {/* ฝั่งขวา - ข้อมูลงาน */}
                  <div className="modal-job-info">
                    <h3>รายละเอียดงาน</h3>
                    <p>
                      <strong>บริษัท:</strong>{" "}
                      {selectedApp.JobPost?.Employer?.company_name}
                    </p>
                    <p>
                      <strong>สถานที่:</strong>{" "}
                      {selectedApp.JobPost?.locationjob}
                    </p>
                    <p>
                      <strong>ค่าตอบแทน:</strong>{" "}
                      {selectedApp.JobPost?.salary?.toLocaleString()} บาท
                    </p>
                    <p>
                      <strong>วันหมดเขตรับสมัคร:</strong>{" "}
                      {new Date(
                        selectedApp.JobPost?.deadline
                      ).toLocaleDateString("th-TH")}
                    </p>

                    {/* รูปภาพงาน */}
                    {selectedApp.JobPost?.image_url && (
                      <div className="modal-image">
                        <img
                          src={selectedApp.JobPost.image_url}
                          alt={selectedApp.JobPost.title}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default MyApplications;