package controller

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

// upload
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no file provided"})
		return
	}

	// เก็บไฟล์ลงโฟลเดอร์ uploads/
	dst := filepath.Join("uploads", filepath.Base(file.Filename))
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	// สร้าง URL (เช่น http://localhost:8080/uploads/filename.png)
	url := "/uploads/" + filepath.Base(file.Filename)

	c.JSON(http.StatusOK, gin.H{"url": url})
}

// ===== Chat API =====

// GET /api/chat/rooms
func ListMyChatRooms(c *gin.Context) {
	userID := c.MustGet("userID")

	roleVal := c.MustGet("role")

	role := string(roleVal.(entity.RoleEnum))

	db := config.DB()
	var rooms []entity.ChatRoom

	q := db.Model(&entity.ChatRoom{})
	if role == "student" {

		var student entity.Student
		if err := db.Where("user_id = ?", userID).Find(&student).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "student not found"})
			return
		}

		quserid := student.ID

		q = q.Where("student_id = ?", quserid)
	} else if role == "employer" {

		var employer entity.Employer
		if err := db.Where("user_id = ?", userID).Find(&employer).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "employer not found"})
			return
		}

		quserid := employer.ID

		q = q.Where("employer_id = ?", quserid)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Preload เฉพาะ student/employer ของห้องที่เกี่ยวข้อง
	q = q.Preload("Student.User").Preload("Employer.User").Order("last_message_at desc")

	if err := q.Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, rooms)
}

// POST /api/chat/rooms
func CreateOrGetRoom(c *gin.Context) {
	userID := c.MustGet("userID")
	role := c.MustGet("role")

	var req struct {
		TargetID   uint   `json:"target_id"`
		TargetRole string `json:"target_role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	db := config.DB()
	var room entity.ChatRoom

	var studentID uint
	var employerID uint

	if role == "student" && req.TargetRole == "employer" {
		id := userID.(uint)
		studentID = id
		employerID = req.TargetID
	} else if role == "employer" && req.TargetRole == "student" {
		id := userID.(uint)
		studentID = req.TargetID
		employerID = id
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role combination"})
		return
	}

	err := db.Where("student_id = ? AND employer_id = ?", studentID, employerID).First(&room).Error
	if err == gorm.ErrRecordNotFound {
		room = entity.ChatRoom{StudentID: studentID, EmployerID: employerID}
		db.Create(&room)
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

// GET /api/chat/rooms/:roomId/messages
func ListRoomMessages(c *gin.Context) {
	roomId, _ := strconv.Atoi(c.Param("roomId"))
	db := config.DB()
	var msgs []entity.ChatHistory

	db.Preload("User").Where("chat_room_id = ?", roomId).Preload("User").Order("created_at asc").Find(&msgs)
	c.JSON(http.StatusOK, msgs)
}

// POST /api/chat/rooms/:roomId/messages
func SendMessage(c *gin.Context) {
	userID := c.MustGet("userID")

	roomId, _ := strconv.Atoi(c.Param("roomId"))
	var req struct {
		Message     string `json:"message"`
		ImageURL    string `json:"image_url"`
		MessageType string `json:"message_type"` // "text" หรือ "image"
	}

	// ถ้าไม่มีทั้งข้อความและรูป → error
	if err := c.ShouldBindJSON(&req); err != nil || (req.Message == "" && req.ImageURL == "") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "message or image required"})
		return
	}

	db := config.DB()
	now := time.Now()

	// 1. สร้าง ChatHistory record
	msg := entity.ChatHistory{
		ChatRoomID:    uint(roomId),
		UserSenderID:  userID.(uint),
		Message:       req.Message,
		ImageURL:      req.ImageURL, // << เก็บ URL จริง
		MessageType:   req.MessageType,
		TimeStampSend: time.Now(),
	}

	if err := db.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save message"})
		return
	}

	// 2. อัปเดต ChatRoom (บันทึกข้อความล่าสุด/เวลา)
	lastMessage := req.Message
	if req.MessageType == "image" && req.ImageURL != "" {
		lastMessage = "[รูปภาพ]" // ใช้เป็น placeholder เวลาดึง list แชท
	}

	if err := db.Model(&entity.ChatRoom{}).
		Where("id = ?", roomId).
		Updates(map[string]interface{}{
			"Lastmessage":   lastMessage,
			"LastMessageAt": now,
		}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update chat room"})
		return
	}

	// 3. preload User ด้วย (เพื่อให้ frontend ใช้ได้เลย)
	if err := db.Preload("User").First(&msg, msg.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user info"})
		return
	}

	// 4. ส่ง response กลับ
	c.JSON(http.StatusOK, msg)
}

// ===== Chat API =====
