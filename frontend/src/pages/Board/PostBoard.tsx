import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Empty, Spin, message } from "antd";
import PageHeader from "../../components/PageHeader";
import "./PostBoard.css";
import { jobPostAPI } from "../../services/https";
import type { Jobpost } from "../../interfaces/jobpost";
import { FileTextOutlined } from "@ant-design/icons";
import {
  ClockCircleOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext"; //  import
import { API_BASE } from "../../config";

const PostBoard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); //  ดึง user
  const role = user?.role; // student หรือ employer

  const [posts, setPosts] = useState<Jobpost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await jobPostAPI.getAll();
        let result: Jobpost[] = res.data || res;

        // กรองโพสต์หมดเขตออกเสมอ (ไม่ว่า student หรือ employer)
        result = result.filter(
          (post) =>
            post.status === "Open" &&
            (!post.deadline ||
              dayjs(post.deadline).endOf("day").isAfter(dayjs()))
        );

        const sorted = result.sort(
          (a, b) =>
            new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );

        setPosts(sorted);
      } catch (err) {
        console.error("Error fetching posts:", err);
        message.error("โหลดโพสต์งานไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="bg-gray">
      <PageHeader title="บอร์ดโพสต์งาน" />
      <div className="job-list">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : posts.length === 0 ? (
          <Empty description="ยังไม่มีโพสต์งาน" />
        ) : (
          posts.map((post) => {
            const isExpired =
              post.deadline && dayjs(post.deadline).isBefore(dayjs(), "day");

            const deadlineText = isExpired
              ? "หมดเวลารับสมัครแล้ว"
              : post.deadline
              ? new Date(post.deadline).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "จนกว่าจะปิดรับสมัคร";

            return (
              <div
                key={post.ID}
                className={`job-card ${
                  isExpired && role === "student" ? "job-card-disabled" : ""
                }`}
                onClick={() => {
                  if (!(isExpired && role === "student")) {
                    navigate(`/Job/post-detail/${post.ID}`);
                  }
                }}
              >
                {/* ฝั่งซ้าย */}
                <div className="job-left">
                  <h3 className="job-title">{post.title}</h3>
                  <p className="company">
                    {post.Employer?.company_name || "ไม่ระบุบริษัท"}
                  </p>

                  <div className="job-details">
                    <div className="job-detail">
                      <ClockCircleOutlined className="job-icon" />
                      <div>
                        <span>ระยะเวลาการรับสมัคร</span>
                        <strong
                          style={{ color: isExpired ? "red" : "inherit" }}
                        >
                          {deadlineText}
                        </strong>
                      </div>
                    </div>
                    <div className="job-detail">
                      <DollarCircleOutlined className="job-icon" />
                      <div>
                        <span>ค่าตอบแทน</span>
                        <strong>{post.salary.toLocaleString()} บาท</strong>
                      </div>
                    </div>
                    <div className="job-detail">
                      <EnvironmentOutlined className="job-icon" />
                      <div>
                        <span>สถานที่</span>
                        <strong>{post.locationjob}</strong>
                      </div>
                    </div>
                  </div>

                  {/* ลิงก์ดาวน์โหลด Portfolio */}
                  {post.portfolio_required &&
                    post.portfolio_required !== "false" && (
                      <a
                        className="portfolio-link"
                        href={`${API_BASE}/download/${post.portfolio_required
                          ?.split("/")
                          .pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileTextOutlined className="portfolio-icon" />
                        ดาวน์โหลด Portfolio
                      </a>
                    )}
                </div>

                {/* ฝั่งขวา */}
                <div className="job-right">
                  {post.image_url ? (
                    <img
                      src={`${API_BASE}${post.image_url}`}
                      alt={post.title}
                      className="job-image"
                    />
                  ) : (
                    <div className="job-image-fallback">
                      <img
                        src="/src/assets/profile.svg"
                        alt="Default Logo"
                        className="job-image"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostBoard;
