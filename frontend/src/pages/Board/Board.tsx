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

  const [messageApi, contextHolder] = message.useMessage();

  const handlePostJob = () => {
    if (role === "employer") {
      navigate("/Job/post-job");
    } else if (role === "student") {
      messageApi.warning(
        "นักศึกษาไม่สามารถโพสต์งานได้ กรุณาสมัครสมาชิกเพื่อโพสต์งาน"
      );
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

      <div className="board-container">
        <div className="board-content">
          {/* ซ้าย: headline */}
          <div>
            <div className="subheadline">
              {role === "employer" && (
                <>
                  <h1>ผู้ว่าจ้างโพสต์งานเพื่อหาคนที่ใช่</h1>
                  <h1>นักศึกษาเลือกงานที่สนใจ !</h1>
                  <p className="hero-subtext">
                    ระบบประกาศงานสำหรับนักศึกษา มทส. โพสต์ง่าย สมัครง่าย
                    ตรงใจทั้งสองฝ่าย
                  </p>
                </>
              )}

              {role === "student" && (
                <>
                  <h1>นักศึกษาเลือกงานที่สนใจ!</h1>
                  <h1>เลือกงานที่ใช่ สมัครง่าย</h1>
                  <h1>ไม่พลาดทุกโอกาส!</h1>
                  <p className="hero-subtext">
                    สมัครง่าย ขั้นตอนไม่ซับซ้อน เลือกงานที่ตรงใจ <br />
                    พร้อมเริ่มต้นสร้างประสบการณ์การทำงานได้ทันที
                  </p>
                </>
              )}

              {!role && (
                <>
                  <h1>
                    ระบบประกาศงาน <br />
                    สำหรับนักศึกษา มทส.
                  </h1>
                  <p className="hero-subtext">
                    โพสต์ง่าย สมัครง่าย ตรงใจทั้งสองฝ่าย ใช้งานสะดวก <br />
                    ครอบคลุมทุกความต้องการของนักศึกษาและผู้ว่าจ้าง
                  </p>
                </>
              )}
            </div>

            {/* ปุ่ม */}
            <div className="button-row">
              {role === "employer" && (
                <>
                  <Button
                    type="primary"
                    className="btn-startpost"
                    onClick={handlePostJob}
                  >
                    เริ่มโพสต์ได้เลย
                  </Button>
                  <Button className="btn-mypost" onClick={handleMyPost}>
                    โพสต์ของฉัน
                  </Button>
                </>
              )}

              {!role && (
                <Button
                  type="primary"
                  className="btn-login"
                  onClick={() => navigate("/login")}
                >
                  เข้าสู่ระบบ
                </Button>
              )}
            </div>
          </div>

          {/* ขวา: banner */}
          <div className="banner-container">
            <div className="banner-content">
              <h1>
                {role === "employer" ? (
                  "เริ่มต้นประกาศหานักศึกษา"
                ) : role === "student" ? (
                  <>
                    สมัครงานได้ทันที <br /> เลือกงานที่ตรงใจคุณ
                  </>
                ) : (
                  "เริ่มต้นใช้งานระบบวันนี้ สมัคร/โพสต์ง่าย จบที่เดียว"
                )}
              </h1>

              <p>
                {role === "employer" &&
                  "โพสต์ประกาศแบบมืออาชีพ พร้อมรูปและรายละเอียดครบถ้วน"}
                {role === "student" &&
                  "เลือกงานที่ตรงใจ และติดตามสถานะการสมัครได้ทันที"}
                {!role && (
                  <>
                    เข้าสู่ระบบเพื่อค้นหางาน <br /> หรือประกาศงานได้ทันที
                  </>
                )}
              </p>
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
