package controller

import (
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"net/http"
)

// GET /api/employer/me ดึงโปรไฟล์ Employer ของ user ที่ login อยู่
func GetEmployerProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var employer entity.Employer //เก็บข้อมูลลง db
	if err := config.DB().
		Preload("User").
		Preload("Gender").
		Where("user_id = ?", userID).
		First(&employer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employer not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": employer}) //ถ้าเจอ
}

// PUT /api/employer/me/avatar อัปเดตรูป Avatar ของ Employer ที่ login อยู่
func UpdateMyEmployerAvatar(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var body struct {
		AvatarURL string `json:"avatar_url"` // รับ base64 data URL
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if body.AvatarURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "avatar_url is required"})
		return
	}

	var emp entity.Employer
	if err := config.DB().Where("user_id = ?", userID).First(&emp).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employer not found"})
		return
	}

	// Update avatar_url ใน DB ของ employer
	if err := config.DB().Model(&emp).Update("avatar_url", body.AvatarURL).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update avatar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"image": body.AvatarURL})
}
