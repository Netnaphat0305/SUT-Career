// import React, { useEffect, useState } from "react";
// import { Avatar, Upload, message, Spin, Card, Descriptions } from "antd";
// import { EditOutlined, UserOutlined } from "@ant-design/icons";
// import { employerProfileAPI } from "../../services/https";

// const EmployerProfile: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [emp, setEmp] = useState<any>(null);

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await employerProfileAPI.getMe();
//       setEmp(res.data?.data || res.data);
//     } catch (err) {
//       console.error(err);
//       message.error("โหลดโปรไฟล์ไม่สำเร็จ");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   // file -> base64 data URL
//   const toBase64 = (file: File): Promise<string> =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = reject;
//     });

//   const validateImage = (file: File) => {
//     const okType = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type);
//     if (!okType) message.error("รองรับเฉพาะ PNG / JPG / JPEG / WEBP");
//     const okSize = file.size / 1024 / 1024 < 2; // < 2MB
//     if (!okSize) message.error("รูปต้องเล็กกว่า 2MB");
//     return okType && okSize;
//   };

//   const handleBeforeUpload = async (file: File) => {
//     if (!validateImage(file)) return Upload.LIST_IGNORE;
//     try {
//       setUploading(true);
//       const base64 = await toBase64(file);
//       // ส่งเป็น JSON: { avatar_url: "data:image/...;base64,..." }
//       await employerProfileAPI.uploadAvatar({ avatar_url: base64 });
//       message.success("อัปโหลดรูปสำเร็จ");
//       await fetchProfile();
//     } catch (err) {
//       console.error(err);
//       message.error("อัปโหลดรูปไม่สำเร็จ");
//     } finally {
//       setUploading(false);
//     }
//     return false; // ปิดอัปโหลดอัตโนมัติของ antd
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", padding: 40 }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   // ใช้ base64 ตรงๆ
//   const avatarSrc = emp?.avatar_url || undefined;

//   return (
//     <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
//       <Card title="โปรไฟล์ผู้ว่าจ้าง" bordered>
//         <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24 }}>
//           <Upload
//             showUploadList={false}
//             beforeUpload={handleBeforeUpload}
//             accept="image/png,image/jpeg,image/jpg,image/webp"
//             disabled={uploading}
//           >
//             <div className="relative group cursor-pointer" style={{ position: "relative" }}>
//               <Avatar
//                 size={96}
//                 src={avatarSrc}
//                 icon={!avatarSrc ? <UserOutlined /> : undefined}
//                 style={{ backgroundColor: "#d1d5db", color: "#4b5563", fontSize: 24 }}
//               />
//               <div
//                 style={{
//                   position: "absolute",
//                   bottom: -4,
//                   right: -4,
//                   background: "#fff",
//                   borderRadius: "9999px",
//                   padding: 6,
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
//                   opacity: uploading ? 0.6 : 1,
//                 }}
//                 title="เปลี่ยนรูปโปรไฟล์"
//               >
//                 <EditOutlined style={{ color: "#666" }} />
//               </div>
//             </div>
//           </Upload>
//         </div>

//         <Descriptions column={1} bordered>
//           <Descriptions.Item label="บริษัท">{emp?.company_name || "-"}</Descriptions.Item>
//           <Descriptions.Item label="ผู้ติดต่อ">{emp?.contact_person || "-"}</Descriptions.Item>
//           <Descriptions.Item label="อีเมล">{emp?.email || "-"}</Descriptions.Item>
//           <Descriptions.Item label="เบอร์โทร">{emp?.phone || "-"}</Descriptions.Item>
//           <Descriptions.Item label="ที่อยู่">{emp?.address || "-"}</Descriptions.Item>
//           <Descriptions.Item label="เพศ">{emp?.gender?.gender || "-"}</Descriptions.Item>
//           <Descriptions.Item label="ชื่อผู้ใช้ (ระบบ)">{emp?.user?.username || "-"}</Descriptions.Item>
//         </Descriptions>
//       </Card>
//     </div>
//   );
// };

// export default EmployerProfile;


import React, { useEffect, useState } from "react";
import { Avatar, Upload, message, Spin, Card, Descriptions } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { employerProfileAPI } from "../../services/https";
import "./EmployerProfile.css"; // ✅ import CSS

const EmployerProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [emp, setEmp] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await employerProfileAPI.getMe();
      setEmp(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      message.error("โหลดโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // file -> base64 data URL
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const validateImage = (file: File) => {
    const okType = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type);
    if (!okType) message.error("รองรับเฉพาะ PNG / JPG / JPEG / WEBP");
    const okSize = file.size / 1024 / 1024 < 2; // < 2MB
    if (!okSize) message.error("รูปต้องเล็กกว่า 2MB");
    return okType && okSize;
  };

  const handleBeforeUpload = async (file: File) => {
    if (!validateImage(file)) return Upload.LIST_IGNORE;
    try {
      setUploading(true);
      const base64 = await toBase64(file);
      await employerProfileAPI.uploadAvatar({ avatar_url: base64 });
      message.success("อัปโหลดรูปสำเร็จ");
      await fetchProfile();
    } catch (err) {
      console.error(err);
      message.error("อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  const avatarSrc = emp?.avatar_url || undefined;

  return (
    <div style={{ background: "#fff", padding: 24, minHeight: "85vh" }}>
    <div className="employer-profile-container">
      <Card title="โปรไฟล์ผู้ว่าจ้าง" bordered>
        <div className="profile-avatar-wrapper">
          <Upload
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            disabled={uploading}
          >
            <div className="profile-avatar-group" title="เปลี่ยนรูปโปรไฟล์">
              <Avatar
                size={96}
                src={avatarSrc}
                icon={!avatarSrc ? <UserOutlined /> : undefined}
                className="profile-avatar"
              />
              <div className={`profile-avatar-edit ${uploading ? "disabled" : ""}`}>
                <EditOutlined />
              </div>
            </div>
          </Upload>
        </div>

        <Descriptions column={1} bordered className="profile-descriptions">
          <Descriptions.Item label="บริษัท">{emp?.company_name || "-"}</Descriptions.Item>
          <Descriptions.Item label="ผู้ติดต่อ">{emp?.contact_person || "-"}</Descriptions.Item>
          <Descriptions.Item label="อีเมล">{emp?.email || "-"}</Descriptions.Item>
          <Descriptions.Item label="เบอร์โทร">{emp?.phone || "-"}</Descriptions.Item>
          <Descriptions.Item label="ที่อยู่">{emp?.address || "-"}</Descriptions.Item>
          <Descriptions.Item label="เพศ">{emp?.gender?.gender || "-"}</Descriptions.Item>
          <Descriptions.Item label="ชื่อผู้ใช้ (ระบบ)">{emp?.user?.username || "-"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
    </div>
  );
};

export default EmployerProfile;
