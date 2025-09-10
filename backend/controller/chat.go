package controller

import (
	"net/http"
	//"strconv"
	"time"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// POST /chat/room
// สร้างห้องแชทใหม่
func CreateChatRoom(c *gin.Context) {
	var input struct {
		StudentID  uint `json:"student_id" binding:"required"`
		EmployerID uint `json:"employer_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่ามีห้องแชทระหว่างสองคนนี้อยู่แล้วหรือไม่
	var existingRoom entity.ChatRoom
	if err := config.DB().Where("(student_id = ? AND employer_id = ?) OR (student_id = ? AND employer_id = ?)", input.StudentID, input.EmployerID, input.EmployerID, input.StudentID).First(&existingRoom).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"data": existingRoom})
		return
	}

	chatRoom := entity.ChatRoom{
		StudentID:  input.StudentID,
		EmployerID: input.EmployerID,
		StatusRoom: "active",
	}

	if err := config.DB().Create(&chatRoom).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create chat room"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": chatRoom})
}

// GET /chat/rooms/:userId
// ดึงห้องแชททั้งหมดของผู้ใช้
func GetUserChatRooms(c *gin.Context) {
	userId := c.Param("userId")
	var chatRooms []entity.ChatRoom

	if err := config.DB().Preload("Student").Preload("Employer").Where("student_id = ? OR employer_id = ?", userId, userId).Find(&chatRooms).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat rooms not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": chatRooms})
}

// GET /chat/history/:roomId
// ดึงประวัติการแชทในห้อง
func GetChatHistory(c *gin.Context) {
	roomId := c.Param("roomId")
	var chatHistory []entity.ChatHistory

	if err := config.DB().Where("chat_room_id = ?", roomId).Order("created_at asc").Preload("User").Find(&chatHistory).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat history not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": chatHistory})
}

// POST /chat/message
// ส่งข้อความใหม่
func SendChatMessage(c *gin.Context) {
	var message entity.ChatHistory
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	message.TimeStampSend = time.Now()

	if err := config.DB().Create(&message).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to send message"})
		return
	}

	// อัปเดต last message ใน chat room
	if err := config.DB().Model(&entity.ChatRoom{}).Where("id = ?", message.ChatRoomID).Update("last_message", message.Message).Error; err != nil {
		// สามารถ log error ไว้ได้ แต่ไม่จำเป็นต้อง block การทำงาน
	}

	c.JSON(http.StatusCreated, gin.H{"data": message})
}