package controller

import (
	"net/http"
	//"time"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// POST /interview-schedules
// นายจ้างสร้างช่วงเวลาที่สะดวกสำหรับการสัมภาษณ์
func CreateInterviewSchedule(c *gin.Context) {
	var schedule entity.InterviewScheduling
	if err := c.ShouldBindJSON(&schedule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อาจจะมีการดึง EmployerID จาก token ในอนาคต
	// schedule.EmployerID = ...

	schedule.Status = "available" // สถานะเริ่มต้นคือ "ว่าง"

	if err := config.DB().Create(&schedule).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create interview schedule"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": schedule})
}

// GET /interview-schedules/employer/:employerId
// ดูตารางเวลาทั้งหมดของนายจ้างคนนั้นๆ
func GetSchedulesByEmployer(c *gin.Context) {
	employerId := c.Param("employerId")
	var schedules []entity.InterviewScheduling

	if err := config.DB().Where("employer_id = ?", employerId).Find(&schedules).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedules not found for this employer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": schedules})
}

// DELETE /interview-schedules/:id
// ลบช่วงเวลาที่ยังไม่มีการนัดหมาย
func DeleteInterviewSchedule(c *gin.Context) {
	id := c.Param("id")
	var schedule entity.InterviewScheduling

	// ค้นหา schedule ที่ต้องการลบ
	if err := config.DB().Where("id = ? AND status = ?", id, "available").First(&schedule).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found or is already booked"})
		return
	}

	if err := config.DB().Delete(&schedule).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete schedule"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}