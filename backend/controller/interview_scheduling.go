// backend/controller/interview_scheduling.go
package controller

import (
	"net/http"
	"log"
	"github.com/gin-gonic/gin"
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

// GET /api/interview-scheduling
func GetAllInterviewSchedules(c *gin.Context) {
	db := config.DB()
	var schedules []entity.InterviewScheduling

	if err := db.Preload("Employer").Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schedules)
}

// GET /api/interview-scheduling/:id
func GetInterviewScheduleByID(c *gin.Context) {
	db := config.DB()
	id := c.Param("id")

	var schedule entity.InterviewScheduling
	if err := db.Preload("Employer").First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	c.JSON(http.StatusOK, schedule)
}
// GET /api/interview-schedules/get/employer
func GetSchedulesByEmployerID(c *gin.Context) {
	db := config.DB()
	userID := c.MustGet("userID")

	// หา employer ที่ผูกกับ userID
	var employer entity.Employer
	if err := db.Where("user_id = ?", userID).First(&employer).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "employer not found"})
		return
	}

	// Debug log
	// log.Printf("Set employerID %d for user_id %v", employer.ID, userID)

	// ดึง schedules ที่ belong กับ employer.ID
	var schedules []entity.InterviewScheduling
	if err := db.Where("employer_id = ?", employer.ID).
		Preload("Employer.User").
		Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Debug log
	log.Printf("Found %d schedules for employerID %d", len(schedules), employer.ID)

	c.JSON(http.StatusOK, schedules)
}



// POST /api/interview-scheduling
func CreateInterviewSchedule(c *gin.Context) {
	db := config.DB()

	var input entity.InterviewScheduling
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Status == "" {
		input.Status = "available"
	}

	if err := db.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schedule"})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// DELETE /api/interview-scheduling/:id
func DeleteInterviewSchedule(c *gin.Context) {
	db := config.DB()
	id := c.Param("id")

	var schedule entity.InterviewScheduling
	if err := db.First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	if err := db.Delete(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete schedule"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}
