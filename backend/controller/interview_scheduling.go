// backend/controller/interview_scheduling.go
package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

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
	db := c.MustGet("db").(*gorm.DB)
	var schedule entity.InterviewScheduling

	if err := c.ShouldBindJSON(&schedule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Create(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, schedule)
}

// PUT /interview-schedules/:id
func UpdateInterviewSchedule(c *gin.Context) {
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
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
