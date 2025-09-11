// backend/controller/interview_scheduling.go
package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

// GET /interview-schedules
func GetInterviewSchedules(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var schedules []entity.InterviewScheduling

	if err := db.Preload("Employer").Preload("Interview").Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, schedules)
}

// GET /interview-schedules/:id
func GetInterviewSchedule(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")

	var schedule entity.InterviewScheduling
	if err := db.Preload("Employer").Preload("Interview").First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}
	c.JSON(http.StatusOK, schedule)
}

// POST /interview-schedules
func CreateInterviewSchedule(c *gin.Context) {
	// ดึง userID จาก JWT token
	userID, _ := c.Get("userID")
	var schedule entity.InterviewScheduling
	// หา employer_id ของ user นี้
	var employer entity.Employer
	if err := config.DB().Where("user_id = ?", userID).First(&employer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนายจ้าง"})
		return
	}

	// บันทึก employer_id ลง schedule
	schedule.EmployerID = employer.ID
	schedule.Status = "available"

	if err := config.DB().Create(&schedule).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create interview schedule"})
		return
	}
	// โหลดข้อมูล employer มาด้วย
	if err := config.DB().
		Preload("Employer").
		First(&schedule, schedule.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "โหลดข้อมูลนายจ้างไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": schedule})
}

// GET /interview-schedules/employer/:employerId
// ดูตารางเวลาทั้งหมดของนายจ้างคนนั้นๆ
func GetSchedulesByEmployer(c *gin.Context) {
	employerId := c.Param("employerId")
	var schedules []entity.InterviewScheduling
	//จะเอาไว้ดูข้อมูลผู้ว่าจ้าง
	if err := config.DB().
		Preload("Employer").
		Where("employer_id = ?", employerId).
		Find(&schedules).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedules not found for this employer"})
	}
	if err := config.DB().Create(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, schedules)
}

// PUT /interview-schedules/:id
func PutUpdateInterviewSchedule(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")

	var schedule entity.InterviewScheduling
	if err := db.First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	var input entity.InterviewScheduling
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	schedule.DateAndTime = input.DateAndTime
	schedule.Status = input.Status
	schedule.Detail = input.Detail
	schedule.EmployerID = input.EmployerID

	if err := db.Save(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, schedule)
}

// DELETE /interview-schedules/:id
func DeleteInterviewSchedule(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")

	var schedule entity.InterviewScheduling
	if err := db.First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	if err := db.Delete(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}
