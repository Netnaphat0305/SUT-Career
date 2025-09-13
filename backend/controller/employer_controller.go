package controller

import (
	"net/http"
	"time"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

type EmployerRegistrationPayload struct {
	Username    string    `json:"username" binding:"required"`
	Password    string    `json:"password" binding:"required"`
	CompanyName string    `json:"company_name" binding:"required"`
	Email       string    `json:"email" binding:"required,email"`
	Phone       string    `json:"phone" binding:"required"`
	Address     string    `json:"address" binding:"required"`
	FirstName   string    `json:"first_name" binding:"required"`
	LastName    string    `json:"last_name" binding:"required"`
	Birthday    time.Time `json:"birthday" binding:"required"`
	GenderID    uint      `json:"gender_id" binding:"required"`
}

func RegisterEmployer(c *gin.Context) {
	var payload EmployerRegistrationPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := config.DB().Begin()

	hashedPassword, err := config.HashPassword(payload.Password)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := entity.User{
		Username: payload.Username,
		Password: hashedPassword,
		Role:     entity.Emp, // กำหนด Role เป็น 'employer'
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Username may already exist"})
		return
	}

	employer := entity.Employer{
		UserID:      user.ID,
		CompanyName: payload.CompanyName,
		Email:       payload.Email,
		Phone:       payload.Phone,
		Address:     payload.Address,
		Firstname:   payload.FirstName,
		Lastname:    payload.LastName,
		Birthday:    payload.Birthday,
		GenderID:    payload.GenderID,
	}

	if err := tx.Create(&employer).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create employer profile"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Employer registration successful"})
}
