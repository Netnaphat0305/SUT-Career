package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

// ===== Chat API =====

// GET /api/chat/rooms
func ListMyChatRooms(c *gin.Context) {
    userID, _ := c.Get("userID")
    role, _ := c.Get("role")

    db := config.DB()
    var rooms []entity.ChatRoom

    q := db.Model(&entity.ChatRoom{})

    if role == "student" {
        q = q.Where("student_id = ?", userID)
    } else if role == "employer" {
        q = q.Where("employer_id = ?", userID)
    } else {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role"})
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
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

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

	db.Where("chat_room_id = ?", roomId).Order("created_at asc").Find(&msgs)
	c.JSON(http.StatusOK, msgs)
}

// POST /api/chat/rooms/:roomId/messages
func SendMessage(c *gin.Context) {
	role, _ := c.Get("role")

	roomId, _ := strconv.Atoi(c.Param("roomId"))
	var req struct {
		Message string `json:"message"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "message required"})
		return
	}

	db := config.DB()
	msg := entity.ChatHistory{
		ChatRoomID: uint(roomId),
		SenderRole: role.(string),
		Message:    req.Message,
		TimeStampSend:     time.Now(),
	}
	db.Create(&msg)

	// อัปเดตเวลาข้อความล่าสุด
	now := time.Now()
	db.Model(&entity.ChatRoom{}).Where("id = ?", roomId).Update("last_message_at", now)

	c.JSON(http.StatusOK, msg)
}

// ===== Chat API =====
