import React, { useEffect, useState } from "react";
import { Card, Button, Empty, Spin, message, Tag } from "antd";
import { jobPostAPI } from "../../services/https";
import type { Jobpost } from "../../interfaces/jobpost";
import "./Mypost.css";
import lahui from "../../assets/lahui.svg";
import { useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

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
      await jobPostAPI.update(id, { status: newStatus });
      message.success(
        newStatus === "Open"
          ? "เปิดโพสต์งานเรียบร้อยแล้ว"
          : "ปิดโพสต์งานเรียบร้อยแล้ว"
      );
      fetchMyPosts();
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
      <h2 className="mypost-header">โพสต์ของฉัน</h2>

      {posts.length === 0 ? (
        <Empty description="ยังไม่มีโพสต์งาน" />
      ) : (
        posts.map((post) => (
          <Card key={post.ID} className="mypost-card">
            <div className="mypost-content">
              <div className="mypost-info">
                <h3 className="mypost-title">
                  {post.title}{" "}
                  <Tag color={post.status === "Open" ? "green" : "red"}>
                    {post.status === "Open" ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                  </Tag>
                </h3>
                <p className="mypost-company">
                  {post.Employer?.company_name || "ไม่ระบุบริษัท"}
                </p>
                <div className="mypost-detail">
                  <span>
                    📅 Deadline:{" "}
                    {post.deadline
                      ? new Date(post.deadline).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "จนกว่าจะปิดรับสมัคร"}
                  </span>
                  <span>💰 เงินเดือน: {post.salary.toLocaleString()} บาท</span>
                  <span>📍 {post.locationjob}</span>
                </div>
              </div>

              <div className="mypost-logo">
                <img
                  src={post.image_url || lahui}
                  alt={post.title || "default-logo"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = lahui;
                  }}
                />
              </div>
            </div>

            <div className="mypost-actions">
              <Button
                size="small"
                onClick={() => handleToggleStatus(post.ID, post.status)}
                type={post.status === "Open" ? "default" : "primary"}
              >
                {post.status === "Open" ? "ปิดโพสต์" : "เปิดโพสต์"}
              </Button>

              <Button
                size="small"
                type="default"
                onClick={() => navigate(`/jobpost/edit/${post.ID}`)}
              >
                แก้ไข
              </Button>

              <Button
                danger
                size="small"
                onClick={() => handleDelete(post.ID)}
              >
                ลบโพสต์
              </Button>

              <Button
                type="primary"
                size="small"
                onClick={() => navigate(`/job-ManageApplicants/${post.ID}`)}
              >
                ดูรายชื่อผู้สมัครงาน
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default MyPost;
