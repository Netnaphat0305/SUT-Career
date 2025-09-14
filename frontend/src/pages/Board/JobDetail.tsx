import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Spin, message } from "antd";
import profile from "../../assets/profile.svg";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./JobDetail.css";
import "../../index.css";
import "../../Layout.css";
import {
  ClockCircleOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  MessageOutlined, // add by book
  FileTextOutlined,
} from "@ant-design/icons";
import { jobPostAPI, chatAPI } from "../../services/https";
import type { Jobpost } from "../../interfaces/jobpost";
import { API_BASE } from "../../config";

const PostLayout: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const [posts, setPosts] = useState<Jobpost[]>([]);
  const [selectedPost, setSelectedPost] = useState<Jobpost | null>(null);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const [messageApi, contextHolder] = message.useMessage();

  const SCROLL_KEY = "sidebar-scroll";

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await jobPostAPI.getAll();
        const data = res.data?.data || res.data || res;

        if (!data || data.length === 0) {
          messageApi.warning("ยังไม่มีประกาศงาน");
          setPosts([]);
          return;
        }

        // กรองเฉพาะโพสต์เปิดอยู่ (ทุก role)
        const visiblePosts = data.filter((p: Jobpost) => p.status === "Open");

        const sortedData = visiblePosts.sort(
          (a: Jobpost, b: Jobpost) =>
            new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );

        setPosts(sortedData);

        const statePost = (location.state as { post?: Jobpost })?.post;
        if (statePost) {
          // ถ้าโพสต์ปิด เด้งกลับไปหน้า PostBoard
          if (statePost.status === "Close") {
            messageApi.warning("โพสต์นี้ถูกปิดรับสมัครแล้ว");
            navigate("/Job/PostBoard");
            return;
          }
          setSelectedPost(statePost);
          return;
        }

        if (id) {
          const found = sortedData.find((p: Jobpost) => p.ID === Number(id));
          if (!found) {
            // ถ้าโพสต์ปิด เด้งกลับไปหน้า PostBoard
            messageApi.warning("โพสต์นี้ถูกปิดรับสมัครแล้ว");
            navigate("/Job/PostBoard");
            return;
          }
          setSelectedPost(found);
          return;
        }

        setSelectedPost(sortedData[0]);
      } catch (err) {
        console.error("Error fetching job post:", err);
        messageApi.error("โหลดโพสต์งานไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, location.state, role]);

  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  // edit by book

  // ฟังก์ชันเมื่อกด Contact
  const handleCreateChat = async () => {
    if (!selectedPost?.employer_id) return;

    try {
      // นักศึกษา → สร้างห้องกับ employer
      const room = await chatAPI.createOrGetRoom(
        selectedPost.employer_id, // targetId
        "employer" // targetRole
      );

      //  เมื่อสร้างเสร็จ → ไปหน้า Chat
      navigate("/Chat", { state: { roomId: room.ID } });
    } catch (err) {
      console.error("Failed to create chat room:", err);
      messageApi.error("ไม่สามารถสร้างห้องแชทได้");
    }
  };
  // edit by book

  return (
    <>
      {contextHolder}

      <div className="post-layout-container">
        {/* ฝั่งซ้าย: รายการโพสต์ */}
        <div className="post-list-sidebar" ref={sidebarRef}>
          {posts.map((post) => (
            <div
              key={post.ID}
              id={`post-${post.ID}`}
              className={`post-preview ${
                selectedPost?.ID === post.ID ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedPost(post);
                window.history.replaceState(
                  null,
                  "",
                  `/Job/post-detail/${post.ID}`
                );
              }}
            >
              <div className="post-card-content">
                {/* ข้อความประกาศ */}
                <div className="post-text">
                  <h4>{post.title}</h4>
                  <p className="post-subtitle">
                    {post.employer?.company_name || "ไม่ระบุบริษัท"}
                  </p>
                  <div className="post-meta">
                    <div className="meta-item">
                      <ClockCircleOutlined />
                      <span>
                        {post.deadline
                          ? new Date(post.deadline).toLocaleDateString("th-TH")
                          : "วันนี้ - จนกว่าจะปิดรับสมัคร"}
                      </span>
                    </div>
                    <div className="meta-item">
                      <DollarCircleOutlined />
                      <span>
                        {post.salary.toLocaleString()}
                        {post.SalaryType?.salary_type_name
                          ? ` บาท/${post.SalaryType.salary_type_name}`
                          : ""}
                      </span>
                    </div>
                    <div className="meta-item">
                      <EnvironmentOutlined />
                      <span>{post.locationjob}</span>
                    </div>
                  </div>
                </div>

                {/* โลโก้ */}
                <div className="post-image-wrapper">
                  <img
                    className="post-image-detail"
                    src={
                      post.image_url ? `${API_BASE}${post.image_url}` : profile
                    }
                    alt={post.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ฝั่งขวา: รายละเอียดโพสต์ */}
        <div className="post-full-detail">
          {selectedPost && (
            <>
              {/* โลโก้ + ชื่อบริษัท + ปุ่มสมัคร */}
              <div className="job-header-highlight">
                <div className="job-header-left">
                  <img
                    src={
                      selectedPost.image_url
                        ? `${API_BASE}${selectedPost.image_url}`
                        : profile
                    }
                    alt={selectedPost.title}
                    className="post-detail-image"
                  />

                  <div className="job-title-info">
                    <h2 className="title-detail">{selectedPost.title}</h2>
                    <p className="company-name">
                      {selectedPost.employer?.company_name || "ไม่ระบุบริษัท"}
                    </p>
                  </div>
                </div>

                {/* ปุ่มสมัครงาน */}
                <div className="job-header-right">
                  {role === "student" ? (
                    selectedPost.status === "Open" ? (
                      <Button
                        className="btn-Job-Application"
                        type="primary"
                        onClick={() =>
                          navigate("/Job/ApplyJob", {
                            state: { post: selectedPost },
                          })
                        }
                      >
                        ยื่นสมัครงาน
                      </Button>
                    ) : (
                      <Button
                        className="btn-Job-Application"
                        type="primary"
                        disabled
                      >
                        ปิดรับสมัครแล้ว
                      </Button>
                    )
                  ) : role === "employer" ? null : (
                    <Button
                      className="btn-Job-Application "
                      type="primary"
                      onClick={() =>
                        messageApi.warning("กรุณาเข้าสู่ระบบก่อนสมัครงาน")
                      }
                    >
                      ยื่นสมัครงาน
                    </Button>
                  )}
                </div>
              </div>
              <hr className="divider" />
              {/* Meta Info */}
              <div className="job-meta-detail">
                <div className="meta-item">
                  <ClockCircleOutlined />
                  <span>
                    {selectedPost.deadline
                      ? new Date(selectedPost.deadline).toLocaleDateString(
                          "th-TH"
                        )
                      : "วันนี้ - จนกว่าจะปิดรับสมัคร"}
                  </span>
                </div>
                <div className="meta-item">
                  <DollarCircleOutlined />
                  <span>
                    {selectedPost.salary.toLocaleString()}{" "}
                    {selectedPost.SalaryType?.salary_type_name
                      ? ` บาท/${selectedPost.SalaryType.salary_type_name}`
                      : ""}
                  </span>
                </div>
                <div className="meta-item">
                  <EnvironmentOutlined />
                  <span>{selectedPost.locationjob}</span>
                </div>
              </div>

              <hr className="divider" />

              {/* ลักษณะการจ้างงาน + เวลาทำงาน */}
              {/* ลักษณะการจ้างงาน + เวลาเริ่มเลิกงาน */}
              <div className="job-overview">
                <div className="job-type">
                  <h3>ลักษณะการจ้างงาน</h3>
                  <p>
                    {selectedPost.EmploymentType?.employment_type_name ||
                      "ไม่ระบุ"}
                  </p>
                </div>

                <div className="job-portfolio">
                  <h3>Portfolio</h3>
                  {selectedPost.portfolio_required &&
                  selectedPost.portfolio_required !== "false" ? (
                    <a
                      className="portfolio-link"
                      href={`${API_BASE}/download/${selectedPost.portfolio_required
                        ?.split("/")
                        .pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileTextOutlined className="portfolio-icon" />
                      ดาวน์โหลด Portfolio
                    </a>
                  ) : (
                    <p style={{ color: "green" }}>ไม่จำเป็นต้องมี</p>
                  )}
                </div>
              </div>

              {/* รายละเอียดงาน */}
              <div className="job-description">
                <h3>รายละเอียดงาน</h3>
                <p>{selectedPost.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
              </div>
              {/* edit By Book */}
              {role === "student" && (
                <div className="chat-fab" onClick={handleCreateChat}>
                  <span className="chat-label">Contact</span>
                  <MessageOutlined className="create-chat-button" />
                </div>
              )}
              {/* edit By Book */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PostLayout;
