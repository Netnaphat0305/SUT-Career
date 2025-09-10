import React, { useEffect, useState } from "react";
import { Button, Empty, Spin, message, Tag } from "antd";
import {
  ClockCircleOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { jobPostAPI } from "../../services/https";
import type { Jobpost } from "../../interfaces/jobpost";
import "./Mypost.css";
import lahui from "../../assets/lahui.svg";
import { useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import PageHeader from "../../components/PageHeader";

const MyPost: React.FC = () => {
  const [posts, setPosts] = useState<Jobpost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyPosts = async () => {
    try {
      NProgress.start();
      setLoading(true);
      const res = await jobPostAPI.getMyPosts();
      const data = res.data;

      // เรียงโพสต์ล่าสุด → เก่าสุด
      const sortedData = data.sort(
        (a: Jobpost, b: Jobpost) =>
          new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      );

      setPosts(sortedData);
    } catch (err) {
      console.error("Error fetching employer posts:", err);
      message.error("โหลดโพสต์งานไม่สำเร็จ");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await jobPostAPI.delete(id);
      message.success("ลบโพสต์เรียบร้อยแล้ว");
      fetchMyPosts();
    } catch (err) {
      message.error("ลบโพสต์ไม่สำเร็จ");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Open" ? "Close" : "Open";

      // เรียก API เพื่ออัปเดตสถานะ
      await jobPostAPI.update(id, { status: newStatus });

      // อัปเดต state ทันที ไม่ต้อง fetch ใหม่ทั้งหน้า
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.ID === id ? { ...post, status: newStatus } : post
        )
      );

      message.success(
        newStatus === "Open"
          ? "เปิดโพสต์งานเรียบร้อยแล้ว"
          : "ปิดโพสต์งานเรียบร้อยแล้ว"
      );
    } catch (err) {
      message.error("ไม่สามารถเปลี่ยนสถานะโพสต์ได้");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mypost-container">
      <PageHeader title="โพสต์ของฉัน" />

      {posts.length === 0 ? (
        <Empty description="ยังไม่มีโพสต์งาน" />
      ) : (
        posts.map((post) => {
          const deadlineText = post.deadline
            ? new Date(post.deadline).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "จนกว่าจะปิดรับสมัคร";

          return (
            <div key={post.ID} className="mypost-card">
              {/* ฝั่งซ้าย */}
              <div className="mypost-left">
                <h3 className="mypost-title">
                  {post.title}{" "}
                  <Tag
                    className={
                      post.status === "Open" ? "tag-open" : "tag-close"
                    }
                  >
                    {post.status === "Open" ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                  </Tag>
                </h3>
                <p className="mypost-company">
                  {post.Employer?.company_name || "ไม่ระบุบริษัท"}
                </p>

                <div className="mypost-details">
                  <div className="mypost-detail">
                    <ClockCircleOutlined className="mypost-icon" />
                    <div>
                      <span>ระยะเวลาการรับสมัคร</span>
                      <strong>{deadlineText}</strong>
                    </div>
                  </div>
                  <div className="mypost-detail">
                    <DollarCircleOutlined className="mypost-icon" />
                    <div>
                      <span>ค่าตอบแทน</span>
                      <strong>{post.salary.toLocaleString()} บาท</strong>
                    </div>
                  </div>
                  <div className="mypost-detail">
                    <EnvironmentOutlined className="mypost-icon" />
                    <div>
                      <span>สถานที่</span>
                      <strong>{post.locationjob}</strong>
                    </div>
                  </div>
                </div>

                {/* ปุ่มจัดการโพสต์ */}
                <div className="mypost-actions">
                  {/* เปิด / ปิดโพสต์ */}
                  <Button
                    icon={
                      post.status === "Open" ? (
                        <LockOutlined />
                      ) : (
                        <UnlockOutlined />
                      )
                    }
                    size="middle"
                    className="btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(post.ID, post.status);
                    }}
                  >
                    {post.status === "Open" ? "ปิดโพสต์" : "เปิดโพสต์"}
                  </Button>

                  {/* แก้ไข */}
                  <Button
                    icon={<EditOutlined />}
                    size="middle"
                    className="btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/jobpost/edit/${post.ID}`);
                    }}
                  >
                    แก้ไข
                  </Button>

                  {/* ลบ */}
                  <Button
                    icon={<DeleteOutlined />}
                    size="middle"
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.ID);
                    }}
                  >
                    ลบโพสต์
                  </Button>

                  {/* ดูผู้สมัคร */}
                  <Button
                    icon={<TeamOutlined />}
                    size="middle"
                    className="btn-manageapp"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/job-ManageApplicants/${post.ID}`);
                    }}
                  >
                    ดูผู้สมัคร
                  </Button>
                </div>
              </div>

              {/* ฝั่งขวา */}
              <div className="mypost-right">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="mypost-image"
                  />
                ) : (
                  <div className="mypost-image-fallback">
                    <img
                      src={lahui}
                      alt="Default Logo"
                      className="mypost-image"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyPost;
