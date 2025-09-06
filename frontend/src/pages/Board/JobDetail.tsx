// import React, { useEffect, useState } from "react";
// import { Button } from "antd";
// import lahui from "../../assets/lahui.svg";
// import { useNavigate, useParams } from "react-router-dom";
// import "./JobDetail.css";
// import "../../index.css";
// import "../../Layout.css";
// import {
//   ClockCircleOutlined,
//   DollarCircleOutlined,
//   EnvironmentOutlined,
// } from "@ant-design/icons";
// import { jobPostAPI } from "../../services/https";

// interface Post {
//   id: number;
//   title: string;
//   image: string;
//   description?: string;
//   duration?: string;
//   salary: string;
//   location: string;
//   timestamp?: number;
// }

// const PostLayout: React.FC = () => {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
//   const { id } = useParams<{ id: string }>(); // ดึง id ที่เราคลิกมา
//   const navigate = useNavigate();

//   useEffect(() => {
//     const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");

//     setPosts(savedPosts);

//     // หาโพสต์ที่ id ตรงกับใน URL
//     const foundPost = savedPosts.find((p: Post) => p.id === Number(id));

//     if (foundPost) {
//       setSelectedPost(foundPost);
//     } else if (savedPosts.length > 0) {
//       // ถ้า id ไม่เจอ เลือกโพสต์แรก
//       setSelectedPost(savedPosts[0]);
//     }
//   }, [id]);

//   return (
//     <div className="post-layout-container">
//       {/* ฝั่งซ้าย: รายการโพสต์ */}
//       <div className="post-list-sidebar">
//         {posts.map((post) => (
//           <div
//             key={post.id}
//             className={`post-preview ${
//               selectedPost?.id === post.id ? "selected" : ""
//             }`}
//             onClick={() => setSelectedPost(post)}
//           >
//             <div className="post-text">
//               <h4>{post.title}</h4>
//               <p className="post-subtitle">
//                 LAHUI MALATANG <br />
//                 ร้านล่าฮุยมาล่าทัง
//               </p>

//               <div className="post-meta-icons">
//                 <div className="meta-item">
//                   <ClockCircleOutlined />
//                   <span>{post.duration || "ยังไม่ระบุ"}</span>
//                 </div>
//                 <div className="meta-item">
//                   <DollarCircleOutlined />
//                   <span>{post.salary}</span>
//                 </div>
//                 <div className="meta-item">
//                   <EnvironmentOutlined />
//                   <span>{post.location}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="post-image-wrapper">
//               <img className="post-image-detail" src={post.image || lahui} />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ฝั่งขวา: รายละเอียดโพสต์ที่เลือก */}
//       <div className="post-full-detail">
//         {selectedPost && (
//           <>
//             <div className="wrap-title-detail">
//               <div>
//                 <h2 className="title-detail">{selectedPost.title}</h2>
//                 <div className="image-subtitle-row">
//                   <img
//                     src={selectedPost.image}
//                     className="post-detail-image"
//                     alt={selectedPost.title}
//                   />
//                   <p className="post-subtitle-detail">
//                     LAHUI MALATANG <br />
//                     ร้านล่าฮุยมาล่าทัง
//                   </p>
//                 </div>
//               </div>

//               <Button
//                 className="btn-Job-Application"
//                 type="primary"
//                 onClick={() =>
//                   navigate("/Job/ApplyJob", { state: { post: selectedPost } })
//                 }
//               >
//                 ยื่นสมัครงาน
//               </Button>
//             </div>
//             <div className="box-with-top-bottom-border">
//               {selectedPost.description || "ไม่มีรายละเอียดเพิ่มเติม"}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Spin, message } from "antd";
import lahui from "../../assets/lahui.svg";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./JobDetail.css";
import "../../index.css";
import "../../Layout.css";
import {
  ClockCircleOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { jobPostAPI } from "../../services/https";
import type { Jobpost } from "../../interfaces/jobpost";

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

  // เก็บ scroll ใน sessionStorage (ไม่หายเมื่อ navigate)
  const SCROLL_KEY = "sidebar-scroll";

  // ดึงโพสต์ทั้งหมดจาก API
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

        const sortedData = data.sort(
          (a: Jobpost, b: Jobpost) =>
            new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );

        setPosts(sortedData);

        const statePost = (location.state as { post?: Jobpost })?.post;
        if (statePost) {
          setSelectedPost(statePost);
          return;
        }

        if (id) {
          const found = sortedData.find((p: Jobpost) => p.ID === Number(id));
          setSelectedPost(found || sortedData[0]);
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
  }, [id, location.state]);

  //  restore scroll position ก่อน render
  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  // โหลดข้อมูลอยู่ → แสดง Loading
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

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
              // onClick={() => {
              //   // บนทึกตำแหน่ง scroll ก่อน navigate
              //   if (sidebarRef.current) {
              //     sessionStorage.setItem(
              //       SCROLL_KEY,
              //       sidebarRef.current.scrollTop.toString()
              //     );
              //   }

              //   // navigate ไปโพสต์ที่เลือก โดยไม่ reset scroll
              //   navigate(`/Job/post-detail/${post.ID}`, {
              //     state: { post },
              //     replace: true,
              //   });
              // }}
              onClick={() => {
              // ไม่ใช้ navigate  เปลี่ยนเฉพาะ selectedPost
              setSelectedPost(post);

              // เปลี่ยน URL ให้เหมือน navigate แต่ไม่ reload หน้า
              window.history.replaceState(null, "", `/Job/post-detail/${post.ID}`);
              }}  
            >
              <div className="post-text">
                <h4>{post.title}</h4>
                <p className="post-subtitle">
                  {post.Employer?.company_name || "ไม่ระบุบริษัท"}
                </p>
                <div className="post-meta-icons">
                  <div className="meta-item">
                    <ClockCircleOutlined />
                    <span>
                      {post.deadline
                        ? new Date(post.deadline).toLocaleDateString("th-TH")
                        : "จนกว่าจะปิดรับสมัคร"}
                    </span>
                  </div>
                  <div className="meta-item">
                    <DollarCircleOutlined />
                    <span>{post.salary.toLocaleString()} บาท</span>
                  </div>
                  <div className="meta-item">
                    <EnvironmentOutlined />
                    <span>{post.locationjob}</span>
                  </div>
                </div>
              </div>
              <div className="post-image-wrapper">
                <img
                  className="post-image-detail"
                  src={post.image_url || lahui}
                  alt={post.title}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ฝั่งขวา: รายละเอียดโพสต์ */}
        <div className="post-full-detail">
          {selectedPost && (
            <>
              <div className="wrap-title-detail">
                <div>
                  <h2 className="title-detail">{selectedPost.title}</h2>
                  <div className="image-subtitle-row">
                    <img
                      src={selectedPost.image_url}
                      className="post-detail-image"
                      alt={selectedPost.title}
                    />
                    <p className="post-subtitle-detail">
                      {selectedPost.Employer?.company_name || "ไม่ระบุบริษัท"}
                    </p>
                  </div>
                </div>

                {/* ปุ่มยื่นสมัครงาน */}
                {role === "student" ? (
                  <Button
                    className="btn-Job-Application"
                    type="primary"
                    onClick={() =>
                      navigate("/Job/ApplyJob", { state: { post: selectedPost } })
                    }
                  >
                    ยื่นสมัครงาน
                  </Button>
                ) : role === "employer" ? null : (
                  <Button
                    className="btn-Job-Application"
                    type="primary"
                    onClick={() =>
                      messageApi.warning("กรุณาเข้าสู่ระบบก่อนสมัครงาน")
                    }
                  >
                    ยื่นสมัครงาน
                  </Button>
                )}
              </div>
              <div className="box-with-top-bottom-border">
                {selectedPost.description || "ไม่มีรายละเอียดเพิ่มเติม"}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PostLayout;
