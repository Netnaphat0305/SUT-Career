//Chat.tsx
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Layout, List, Avatar, Input, Button, Space, Typography, Row, Col } from "antd"
import { PictureOutlined, UserOutlined } from "@ant-design/icons"
import { type ChatHistory, type ChatRoom } from "../../interfaces/Chat"
import {
  chatAPI
} from "../../services/https/"
import "./Chat.css" // <-- import ไฟล์ CSS ที่สร้างขึ้นมา

const { Text } = Typography
const Chat: React.FC = () => {
  // Define Data
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState<string>("")
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [currentMessages, setCurrentMessages] = useState<ChatHistory[]>([])
  //to go bottom if send new message
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  // scroll แบบ smooth เวลา currentMessages มีการเปลี่ยน (เช่น ได้ข้อความใหม่ หรือเราส่ง)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  // scroll แบบ instant เฉพาะตอนเปลี่ยนห้อง (เปิดห้องครั้งแรก)
  useEffect(() => {
    if (messagesEndRef.current && currentMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" }) // instant
    }
  }, [selectedUser]) // trigger ตอนเปลี่ยนห้อง

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
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const msgs = await chatAPI.listMessages(selectedUser) // API: GET /api/chat/rooms/:roomId/messages
          setCurrentMessages(msgs)
        } catch (err) {
          console.error("Error fetching messages:", err)
        }
      }
      fetchMessages()
    }
  }, [selectedUser])


  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      try {
        // เรียก API จริง → ส่งข้อความไป DB
        const savedMessage = await chatAPI.sendMessage(selectedUser, newMessage)

        // อัปเดต state messages ด้วยข้อความที่เพิ่งส่ง
        setCurrentMessages((prev) => [...prev, savedMessage])

        // ล้างช่อง input
        setNewMessage("")
      } catch (error) {
        console.error("Failed to send message:", error)
      }
    }
  }


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

        </div>

        {/* Messages Area */}
        <div className="messages-area">
          <Space direction="vertical" size="large" className="messages-space">
            {currentMessages.map((message) => {
              const isOwn = message.UserSenderID === user.id;  // user.id มาจาก localStorage
              const timeStr = new Date(message.Time_Stamp_Send).toLocaleTimeString(
                "th-TH",
                { hour: "2-digit", minute: "2-digit" }
              );
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
                            {chatRooms.map((rooms) =>
                            (() => {
                              if (role === "student") {
                                return `${rooms.Employer.first_name} ${rooms.Employer.last_name}`;
                              } else {
                                return `${rooms.Student.first_name} ${rooms.Student.last_name}`;
                              }
                            })())}
                          </div>
                        )}
                        {isOwn && (
                          <div className="message-sender-name own-name">
                            คุณ
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`message-bubble ${isOwn ? "own-bubble" : "other-bubble"
                            }`}
                        >
                          {message.Message}
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
        </div>

        {/* Message Input */}
        {selectedUser && (
          <div className="message-input-area">
            <Row gutter={12} align="middle">
              <Col>
                <Button type="text" icon={<PictureOutlined />} size="large" />
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
