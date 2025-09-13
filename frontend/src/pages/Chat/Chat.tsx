//Chat.tsx
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom";
import { Layout, List, Avatar, Input, Button, Space, Typography, Row, Col, Modal } from "antd"
import { PictureOutlined, UserOutlined } from "@ant-design/icons"
import { type ChatHistory, type ChatRoom } from "../../interfaces/Chat"
import {
  chatAPI,
  ChatUploadAPI
} from "../../services/https/"
import "./Chat.css" // <-- import ไฟล์ CSS ที่สร้างขึ้นมา
import PageHeader from "../../components/PageHeader";

const { Text } = Typography
const Chat: React.FC = () => {
  const location = useLocation();
  const { roomId } = location.state || {};
  // Define Data
  const [selectedUser, setSelectedUser] = useState<number | null>(roomId || null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ChatHistory[]>([]);
  //preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  //to go bottom if send new message
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // state บอกว่า user อยู่ใกล้ bottom ไหม
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // ฟังก์ชันตรวจว่า scroll อยู่ล่างสุดหรือยัง
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isBottom = scrollHeight - scrollTop <= clientHeight + 50; // tolerance 50px
    setIsAtBottom(isBottom);
  };

  // effect: ติด event scroll
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);
  
  // effect: scroll ลงล่างเฉพาะตอนอยู่ที่ bottom หรือเปลี่ยนห้องใหม่
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [selectedUser]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const rooms = await chatAPI.listMyRooms() // เรียก API จริงแทน mock
        setChatRooms(rooms)
      } catch (err) {
        console.error("Error fetching chat rooms:", err)
      }
    }
    fetchChatRooms()
  }, [])


  useEffect(() => {
    if (!selectedUser) return;

    // ฟังก์ชันดึงข้อความ
    const fetchMessages = async () => {
      try {
        const msgs = await chatAPI.listMessages(selectedUser);
        setCurrentMessages(msgs);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    // ดึงครั้งแรกทันที
    fetchMessages();

    // ตั้ง interval ดึงซ้ำทุก 1 วินาที
    const intervalId = setInterval(fetchMessages, 1000);

    // cleanup ตอนออกจากห้องหรือ component unmount
    return () => clearInterval(intervalId);
  }, [selectedUser]);


  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      try {
        const savedMessage = await chatAPI.sendMessage(selectedUser, {
          message: newMessage,
          message_type: "text",
        });

        setCurrentMessages((prev) => [...prev, savedMessage]);

        // อัปเดตห้องใน sidebar
        setChatRooms((prev) =>
          prev.map((room) =>
            room.ID === selectedUser
              ? {
                ...room,
                Last_Message: savedMessage.Message,
                last_message_at: savedMessage.Time_Stamp_Send,
              }
              : room
          )
        );

        setNewMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };


  // Chat.tsx
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedUser || !e.target.files?.length) return;

    const file = e.target.files[0];

    try {
      // อัปโหลดจริงไป backend
      const url = await ChatUploadAPI.uploadFile(file);

      // ส่ง message เป็น image
      const savedMessage = await chatAPI.sendMessage(selectedUser, {
        image_url: url,
        message_type: "image",
      });

      setCurrentMessages((prev) => [...prev, savedMessage]);
    } catch (error) {
      console.error("Failed to send image:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Layout Page
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const getPartnerName = (room: ChatRoom): string => {
    if (role === "student") {
      return room.Employer
        ? `${room.Employer.first_name ?? ""} ${room.Employer.last_name ?? ""}`
        : `Employer`;
    } else {
      return room.Student
        ? `${room.Student.first_name ?? ""} ${room.Student.last_name ?? ""}`
        : `Student`;
    }
  };

  const selectedUserData = chatRooms.find((user) => user.ID === selectedUser)

  return (
    <Layout className="chat-layout">
      {/*Side bar*/}
      <div className="chat-sider">
        <div className="chat-sider-list">
          <List
            dataSource={chatRooms}
            renderItem={(room) => (
              <List.Item
                onClick={() => setSelectedUser(room.ID)}
                className={`chat-list-item ${selectedUser === room.ID ? "selected" : ""
                  }`}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      className="chat-avatar"
                      icon={<UserOutlined />}
                    />
                  }
                  title={
                    <Text strong className="chat-user-name">
                      {getPartnerName(room)}
                    </Text>
                  }
                  description={room.Last_Message || ""}
                />
              </List.Item>
            )}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {/* Chat Header */}
        <div className="chat-conversation-header">

          <Text className="chat-conversation-title">{selectedUserData ? getPartnerName(selectedUserData) : "เลือกห้องแชท"}</Text>
          {/* <PageHeader title="เลือกห้องแชท" /> */}
          

        </div>

        {/* Messages Area */}
        <div className="messages-area" ref={messagesContainerRef}>
          <Space direction="vertical" size="large" className="messages-space">
            {currentMessages.map((message) => {
              const isOwn = message.UserSenderID === user.id;  // user.id มาจาก localStorage
              const timeStr = new Date(message.Time_Stamp_Send).toLocaleTimeString(
                "th-TH",
                { hour: "2-digit", minute: "2-digit" }
              );
              console.log("role = ",message.User?.role);
              return (
                <Row key={message.ID} justify={isOwn ? "end" : "start"}>
                  <Col>
                    <div className={`message-container ${isOwn ? "own" : "other"}`}>
                      {/* Avatar */}
                      <Avatar
                        size={32}
                        className={isOwn ? "avatar-own" : "avatar-other"}
                        icon={<UserOutlined />}
                      />

                      <div>
                        {/* Sender name */}
                        {!isOwn && (
                          <div className="message-sender-name">
                            {message.User?.role === "student"
                              ? `${selectedUserData?.Student?.first_name ?? ""} ${selectedUserData?.Student?.last_name ?? ""}`
                              : `${selectedUserData?.Employer?.first_name ?? ""} ${selectedUserData?.Employer?.last_name ?? ""}`}
                          </div>
                        )}
                        {isOwn && (
                          <div className="message-sender-name own-name">
                            คุณ
                          </div>
                        )}
                        {/* Message bubble */}
                        <div
                          className={`message-bubble ${message.Message_Type === "image"
                            ? "image-bubble"
                            : isOwn
                              ? "own-bubble"
                              : "other-bubble"
                            }`}
                        >
                          {message.Message_Type === "image" && message.Image_URL ? (
                            <img
                              src={message.Image_URL}
                              alt="sent"
                              style={{ maxWidth: "200px", borderRadius: "8px", cursor: "pointer" }}
                              onClick={() => setPreviewImage(message.Image_URL ?? null)}
                            />
                          ) : (
                            message.Message
                          )}
                        </div>

                        {/* Time */}
                        <div
                          className={`message-time ${isOwn ? "own-time" : "other-time"
                            }`}
                        >
                          {timeStr}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              );
            })}
            <div ref={messagesEndRef} />
          </Space>
          <Modal
            open={!!previewImage}
            footer={null}
            onCancel={() => setPreviewImage(null)}
            centered
            width="80%"
            bodyStyle={{ textAlign: "center", background: "white" }}
          >
            {previewImage && (
              <img
                src={previewImage}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
          </Modal>
        </div>

        {/* Message Input */}
        {selectedUser && (
          <div className="message-input-area">
            <Row gutter={12} align="middle">
              <Col>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id="upload-image"
                  onChange={handleUploadImage}
                />
                <Button
                  type="text"
                  icon={<PictureOutlined />}
                  size="large"
                  onClick={() => document.getElementById("upload-image")?.click()}
                >
                </Button>
              </Col>
              <Col flex="auto">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="พิมพ์ข้อความ..."
                  size="large"
                  className="message-input"
                />
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={handleSendMessage}
                  size="large"
                  className="send-button"
                >
                  ส่ง
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Chat;
