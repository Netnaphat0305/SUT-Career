//Chat.tsx
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Layout, List, Avatar, Input, Button, Space, Typography, Row, Col, type MenuProps, Dropdown } from "antd"
import { DownOutlined, PictureOutlined, UserOutlined } from "@ant-design/icons"
import { type ChatHistory, type ChatRoom } from "../../interfaces/Chat"
import "./Chat.css" // <-- import ไฟล์ CSS ที่สร้างขึ้นมา

const { Text } = Typography
const items: MenuProps['items'] = [
  {
    label: (
      <a style={{ color: "red" }}>
        Block
      </a>
    ),
    key: 'Block',
  }
];
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
      const mockRooms = [
        { id: 1, name: "นายจ้าง A", lastMessage: "สวัสดีครับ" },
        { id: 2, name: "นายจ้าง B", lastMessage: "ขอบคุณครับ" },
        { id: 3, name: "นายจ้าง C", lastMessage: "OK" },
        { id: 4, name: "นายจ้าง D", lastMessage: "GOOD1!" },
        { id: 5, name: "นายจ้าง E", lastMessage: "GOOD2!" },
        { id: 6, name: "นายจ้าง F", lastMessage: "GOOD3!" },
        { id: 7, name: "นายจ้าง G", lastMessage: "GOOD4!" },
        { id: 8, name: "นายจ้าง H", lastMessage: "GOOD5!" },
        { id: 9, name: "นายจ้าง I", lastMessage: "GOOD6!" },
        { id: 10, name: "นายจ้าง J", lastMessage: "GOOD7!" },
      ]
      setChatRooms(mockRooms)
    }
    fetchChatRooms()
  }, [])

  useEffect(() => {
    console.log(selectedUser)
    if (selectedUser) {
      const fetchMessages = async () => {
        const mockMessages: ChatHistory[] = [
          { id: 1, chatRoomId: 1, sender: "นักศึกษา C", message: "สวัสดีครับ", time: "13:03", isOwn: true },
          { id: 2, chatRoomId: 1, sender: "นายจ้าง A", message: "สวัสดีครับAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", time: "13:05", isOwn: false },
        ]
        setCurrentMessages(mockMessages)
      }
      fetchMessages()
    }
  }, [selectedUser])

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      const newMsg = {
        chatRoomId: selectedUser,
        message: newMessage,
      }
      try {
        const savedMessage = {
          id: Date.now(),
          chatRoomId: selectedUser,
          sender: "นักศึกษา C",
          message: newMessage,
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          isOwn: true,
        }
        setCurrentMessages(prev => [...prev, savedMessage])
        setNewMessage("")
      } catch (error) {
        console.error("Failed to send message:", error)
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Layout Page
  const selectedUserData = chatRooms.find((user) => user.id === selectedUser)

  return (
    <Layout className="chat-layout">
      {/*Side bar*/}
      <div className="chat-sider">
        <div className="chat-sider-list">
          <List
            dataSource={chatRooms}
            renderItem={(user) => (
              <List.Item
                onClick={() => setSelectedUser(user.id)}
                className={`chat-list-item ${selectedUser === user.id ? "selected" : ""}`}
              >
                <List.Item.Meta
                  avatar={
                    (
                      <Avatar size={48} className="chat-avatar" icon={<UserOutlined />} />
                    )
                  }
                  title={
                    <Text strong className="chat-user-name">
                      {user.name}
                    </Text>
                  }
                  description={user.lastMessage}
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
          <Text strong className="chat-conversation-title">
            {selectedUserData ? selectedUserData.name : "เลือกห้องแชท"}
          </Text>
          {/* Help Menu */}
          {selectedUserData && (
            <div className="help">
              <Dropdown menu={{ items }} trigger={['click']}>
                <a onClick={(e) => e.preventDefault()}>
                  <Space>
                    HELP
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </div>
          )}
          {/* Help Menu */}
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          <Space direction="vertical" size="large" className="messages-space">
            {currentMessages.map((message) => (
              <Row key={message.id} justify={message.isOwn ? "end" : "start"}>
                <Col>
                  <div className={`message-container ${message.isOwn ? "own" : "other"}`}>
                    {/* Avatar User Replied Chat */}
                    {!message.isOwn && (
                      <Avatar size={32} className="avatar-other" icon={<UserOutlined />} />
                    )}
                    {/* Avatar User Owner Chat */}
                    {message.isOwn && (
                      <Avatar size={32} className="avatar-own" icon={<UserOutlined />} />
                    )}
                    <div>
                      {!message.isOwn && (
                        <div className="message-sender-name">
                          {message.sender}
                        </div>
                      )}
                      {message.isOwn && (
                        <div className="message-sender-name own-name">
                          นักศึกษา C
                        </div>
                      )}
                      <div className={`message-bubble ${message.isOwn ? "own-bubble" : "other-bubble"}`}>
                        {message.message}
                      </div>
                      <div className={`message-time ${message.isOwn ? "own-time" : "other-time"}`}>
                        {message.time}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            ))}
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
