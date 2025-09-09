// export default Board;
import React from "react";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./Board.css";
import Announcement from "../../assets/Announcement.svg";
import PostBoard from "./PostBoard";
import "../../index.css";

const Board: React.FC = () => {
  const navigate = useNavigate();

  // ดึงข้อมูล user จาก localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  // Ant Design v5
  const [messageApi, contextHolder] = message.useMessage();

  const handlePostJob = () => {
    if (role === "employer") {
      navigate("/Job/post-job");
    } else if (role === "student") {
      messageApi.warning("นักศึกษาไม่สามารถโพสต์งานได้ กรุณาสมัครสมาชิกเพื่อโพสต์งาน");
    } else {
      messageApi.warning("กรุณาเข้าสู่ระบบในฐานะผู้ว่าจ้างเพื่อโพสต์งาน");
    }
  };

  const handleMyPost = () => {
    if (role === "employer") {
      navigate("/Job/Mypost-job");
    }
  };

  return (
    <>
      {contextHolder}

      {/* HERO (ตรงกับ CSS แบบปกติ) */}
      <div className="board-container">
        <div className="board-content">
          {/* ซ้าย: หัวข้อ + ปุ่ม */}
          <div>
            <div className="subheadline">
              <h1>ผู้ว่าจ้างโพสต์งานเพื่อหาคนที่ใช่</h1>
              <h1>นักศึกษาเลือกงานที่สนใจ !</h1>
            </div>

            <p className="hero-subtext">
              ระบบประกาศงานสำหรับนักศึกษา มทส. โพสต์ง่าย ค้นหาไว ตรงใจทั้งสองฝ่าย
            </p>

            <div className="button-row">
              <Button
                type="primary"
                className="btn-startpost"
                onClick={handlePostJob}
              >
                เริ่มโพสต์ได้เลย
              </Button>

              {role === "employer" && (
                <Button className="btn-mypost" onClick={handleMyPost}>
                  โพสต์ของฉัน
                </Button>
              )}
            </div>
          </div>

          {/* ขวา: การ์ดโปรโมท (banner) */}
          <div className="banner-container">
            <div className="banner-content">
              <h1>เริ่มต้นประกาศหานักศึกษา</h1>
              <p>โพสต์ประกาศแบบมืออาชีพ <br />
              พร้อมรูปและรายละเอียดครบถ้วน</p>
              
            </div>

            <img
              src={Announcement}
              alt="ประกาศงาน"
              className="banner-image"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* LIST */}
      <section className="board-list">
        <PostBoard />
      </section>
    </>
  );
};

export default Board;
