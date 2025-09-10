// import React, { useEffect, useState } from "react";
// import { Card, Spin, Empty, message, Tag, Progress, Button } from "antd";
// import { useNavigate } from "react-router-dom";
// import { jobApplicationAPI } from "../../services/https";
// import "./MyApplications.css";

// import defaultLogo from "../../assets/profile.svg";

// const MyApplications: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   const [applications, setApplications] = useState<any[]>([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchApplications = async () => {
//       try {
//         const res = await jobApplicationAPI.getMyApplications();
//         setApplications(res?.data || []);
//       } catch (error) {
//         message.error("โหลดใบสมัครไม่สำเร็จ");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchApplications();
//   }, []);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Pending":
//         return "blue";
//       case "InterviewPending":
//         return "orange";
//       case "InterviewScheduled":
//         return "gold";
//       case "Interviewed":
//         return "purple";
//       case "Accepted":
//         return "green";
//       case "Rejected":
//         return "red";
//       case "Cancelled":
//         return "gray";
//       default:
//         return "default";
//     }
//   };

//   if (loading) {
//     return (
//       <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
//     );
//   }

//   return (
//     <div className="my-applications-container">
//       <h2 className="page-title">ใบสมัครของฉัน</h2>

//       {applications.length === 0 ? (
//         <Empty description="ยังไม่มีใบสมัคร" />
//       ) : (
//         <div className="applications-list">
//           {applications.map((app) => (
//             <Card key={app.ID} className="application-card">
//               <div className="application-info">
//                 <div className="application-details">
//                   <h3>{app.JobPost?.title}</h3>
//                   <p>{app.JobPost?.Employer?.company_name}</p>
//                   <p>
//                     วันที่สมัคร:{" "}
//                     {new Date(app.CreatedAt).toLocaleDateString("th-TH")}
//                   </p>

//                   {/* แสดงสถานะ */}
//                   <Tag color={getStatusColor(app.application_status)}>
//                     {app.application_status === "Pending" && "รอพิจารณา"}
//                     {app.application_status === "InterviewPending" &&
//                       "รอเลือกวันสัมภาษณ์"}
//                     {app.application_status === "InterviewScheduled" &&
//                       "รอสัมภาษณ์"}
//                     {app.application_status === "Interviewed" &&
//                       "สัมภาษณ์เสร็จแล้ว"}
//                     {app.application_status === "Accepted" && "ผ่านการคัดเลือก"}
//                     {app.application_status === "Cancelled" && "ยกเลิกการสมัคร"}
//                     {app.application_status === "Rejected" &&
//                       "ไม่ผ่านการคัดเลือก"}
//                   </Tag>

//                   {/* แสดงวันสัมภาษณ์ */}
//                   {app.application_status === "InterviewScheduled" &&
//                     app.InterviewScheduling && (
//                       <p style={{ marginTop: "8px" }}>
//                         วันสัมภาษณ์:{" "}
//                         {new Date(
//                           app.InterviewScheduling.DateAndTime
//                         ).toLocaleString("th-TH")}
//                       </p>
//                     )}
//                   {/* ยกเลิกการสมัคร */}
//                   {app.application_status === "Pending" && (
//                     <Button
//                       danger
//                       style={{ marginTop: "10px" }}
//                       onClick={async () => {
//                         try {
//                           await jobApplicationAPI.updateStatus(
//                             app.ID,
//                             "Cancelled"
//                           );
//                           message.success("ยกเลิกการสมัครเรียบร้อยแล้ว");

//                           // อัปเดต state ให้ UI เปลี่ยนสถานะทันที
//                           setApplications((prev) =>
//                             prev.map((item) =>
//                               item.ID === app.ID
//                                 ? { ...item, application_status: "Cancelled" }
//                                 : item
//                             )
//                           );
//                         } catch (error) {
//                           message.error("ยกเลิกการสมัครไม่สำเร็จ");
//                         }
//                       }}
//                     >
//                       ยกเลิกการสมัคร
//                     </Button>
//                   )}

//                   {/* ปุ่มเลือกวันสัมภาษณ์ */}
//                   {app.application_status === "InterviewPending" && (
//                     <Button
//                       type="primary"
//                       style={{ marginTop: "10px" }}
//                       onClick={() =>
//                         navigate(`/interview?applicationId=${app.ID}`)
//                       }
//                     >
//                       เลือกวันสัมภาษณ์
//                     </Button>
//                   )}
//                 </div>

//                 <div className="application-logo">
//                   <img
//                     src={app.JobPost?.Employer?.logo || defaultLogo}
//                     alt="logo"
//                   />
//                 </div>
//               </div>

//               {/* Progress bar */}
//               <Progress
//                 percent={
//                   app.application_status === "Pending"
//                     ? 20
//                     : app.application_status === "InterviewPending"
//                     ? 40
//                     : app.application_status === "InterviewScheduled"
//                     ? 60
//                     : app.application_status === "Interviewed"
//                     ? 80
//                     : app.application_status === "Accepted"
//                     ? 100
//                     : 0
//                 }
//                 showInfo={false}
//                 strokeColor="#1890ff"
//               />
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyApplications;


import React, { useEffect, useState } from "react";
import { Button, Empty, Spin, message } from "antd";
import { ClockCircleOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { jobApplicationAPI } from "../../services/https";
import { useNavigate } from "react-router-dom";
import defaultLogo from "../../assets/profile.svg";
import "./MyApplications.css";
import PageHeader from "../../components/PageHeader";

const MyApplications: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
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

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  }

  return (
    <div className="my-application-container">
      <PageHeader title="ใบสมัครของฉัน" />

      {applications.length === 0 ? (
        <Empty description="ยังไม่มีใบสมัคร" />
      ) : (
        applications.map((app) => (
          <div key={app.ID} className="my-application-card">
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
                    onClick={async () => {
                      try {
                        await jobApplicationAPI.updateStatus(app.ID, "Cancelled");
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
                    onClick={() =>
                      navigate(`/interview?applicationId=${app.ID}`)
                    }
                  >
                    เลือกวันสัมภาษณ์
                  </Button>
                )}
              </div>
            </div>

            {/* ฝั่งขวา */}
            <div className="my-application-right">
              <img
                src={app.JobPost?.Employer?.logo || defaultLogo}
                alt="logo"
                className="my-application-image"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyApplications;
