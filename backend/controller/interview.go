package controller

import (
	"net/http"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// POST /interviews/book
// นักศึกษทำการจองตารางสัมภาษณ์
// ขอเปลี่ยนเงื่อนไขนะเพื่อน ให้มันเลือกจองคนอื่นไม่ได้
func BookInterview(c *gin.Context) {
    var input struct {
        ScheduleID       uint   `json:"schedule_id" binding:"required"`
        StudentID        uint   `json:"student_id" binding:"required"`
        JobApplicationID uint   `json:"job_application_id" binding:"required"`
        Description      string `json:"description"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ตรวจสอบว่า JobApplication มีอยู่จริง
    var app entity.JobApplication
    if err := config.DB().
        Preload("JobPost").
        First(&app, input.JobApplicationID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบใบสมัครงาน"})
        return
    }

    // ตรวจสอบว่า schedule มีอยู่จริง และยัง available
    var schedule entity.InterviewScheduling
    if err := config.DB().
        Where("id = ? AND status = ?", input.ScheduleID, "available").
        First(&schedule).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตารางสัมภาษณ์หรือถูกจองแล้ว"})
        return
    }

    // ตรวจสอบว่าตารางนี้เป็นของนายจ้างเดียวกัน
    if schedule.EmployerID != app.JobPost.EmployerID {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "ไม่สามารถเลือกตารางสัมภาษณ์ของนายจ้างคนอื่นได้",
        })
        return
    }

    tx := config.DB().Begin()

    // สร้าง Interview
    interview := entity.Interview{
        InterviewSchedulingID: input.ScheduleID,
        StudentID:             input.StudentID,
        JobApplicationID:      input.JobApplicationID, // เพิ่มตรงนี้
        Status:                "booked",
    }
    if err := tx.Create(&interview).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้างข้อมูลสัมภาษณ์ไม่สำเร็จ"})
        return
    }

    // อัปเดตสถานะตารางสัมภาษณ์
    schedule.Status = "booked"
    if err := tx.Save(&schedule).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตสถานะตารางสัมภาษณ์ไม่สำเร็จ"})
        return
    }

    // อัปเดตสถานะใบสมัครเป็น InterviewScheduled
    if err := tx.Model(&entity.JobApplication{}).
        Where("id = ?", input.JobApplicationID).
        Updates(map[string]interface{}{
            "application_status": entity.StatusInterviewScheduled,
            "last_update":        gorm.Expr("CURRENT_TIMESTAMP"),
        }).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตใบสมัครไม่สำเร็จ"})
        return
    }

    tx.Commit()

    c.JSON(http.StatusCreated, gin.H{
        "message": "จองตารางสัมภาษณ์สำเร็จ",
        "data":    interview,
    })
}


// GET /interviews/student/:studentId
// ดูการนัดหมายทั้งหมดของนักศึกษา
func GetInterviewsByStudent(c *gin.Context) {
	studentId := c.Param("studentId")
	var interviews []entity.Interview

	if err := config.DB().Where("student_id = ?", studentId).Preload("InterviewScheduling.Employer").Find(&interviews).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No interviews found for this student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": interviews})
}

// GET /interviews/employer/:employerId
// ดูการนัดหมายทั้งหมดของนายจ้าง
func GetInterviewsByEmployer(c *gin.Context) {
	employerId := c.Param("employerId")
	var interviews []entity.Interview

	// Join ตารางเพื่อค้นหา interview ที่เชื่อมกับ employerId
	err := config.DB().
		Joins("JOIN interview_schedulings ON interviews.interview_scheduling_id = interview_schedulings.id").
		Where("interview_schedulings.employer_id = ?", employerId).
		Preload("Student").
		Preload("InterviewScheduling").
		Find(&interviews).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No interviews found for this employer"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": interviews})
}
