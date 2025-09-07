package controller

import (
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

// ดึงข้อมูลนักศึกษา  JobPost พร้อม Preload
func InitJobApplication(c *gin.Context) {
	jobpostID := c.Param("id")
	userID, _ := c.Get("userID")
	// ดึงข้อมูลนักศึกษา + gender + bank
	var student entity.Student
	if err := config.DB().
		Preload("User").
		Preload("Gender").
		Preload("Bank").
		Where("user_id = ?", userID).
		First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักศึกษา"})
		return
	}
	// ดึงข้อมูลประกาศงาน + employer + category + employment type + salary type
	var jobpost entity.Jobpost
	if err := config.DB().
		Preload("Employer").
		Preload("Employer.User").
		Preload("JobCategory").
		Preload("EmploymentType").
		Preload("SalaryType").
		First(&jobpost, jobpostID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประกาศงาน"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"student": student,
		"student_code": student.User.Username,
		"jobpost": jobpost,
	})
}

func CreateJobApplication(c *gin.Context) {
	var app entity.JobApplication
	if err := c.ShouldBindJSON(&app); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	app.ApplicationStatus = entity.StatusPending
	app.LastUpdate = time.Now()

	if err := config.DB().Create(&app).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สมัครงานสำเร็จ",
		"data":    app,
	})
}

// GET /api/jobapplications/me
func GetMyApplications(c *gin.Context) {
    // ดึง userID จาก JWT middleware
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    // หา student ที่ล็อกอินอยู่
    var student entity.Student
    if err := config.DB().
        Where("user_id = ?", userID).
        First(&student).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักศึกษา"})
        return
    }

    // ดึงใบสมัครของ student นี้
    var applications []entity.JobApplication
    if err := config.DB().
        Preload("JobPost").
        Preload("JobPost.Employer").
        Where("student_id = ?", student.ID).
        Order("created_at DESC").
        Find(&applications).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงข้อมูลไม่สำเร็จ"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": applications})
}

/// GET /api/jobapplications/job/:jobpost_id
func GetApplicantsByJobPost(c *gin.Context) {
    jobpostID := c.Param("jobpost_id")

    var applications []entity.JobApplication
    if err := config.DB().
        Preload("Student").
        Preload("Student.User").
        Preload("Student.Gender").
        Preload("Student.Bank").
        Where("job_post_id = ?", jobpostID).
        Find(&applications).Error; err != nil {

        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "ไม่สามารถดึงข้อมูลผู้สมัครได้",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": applications,
    })
}

// PUT /api/jobapplications/:id/status
func UpdateApplicationStatus(c *gin.Context) {
    id := c.Param("id")

    var input struct {
        ApplicationStatus entity.ApplicationStatusEnum `json:"application_status" binding:"required"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var app entity.JobApplication
    if err := config.DB().First(&app, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบใบสมัคร"})
        return
    }

    app.ApplicationStatus = input.ApplicationStatus
    app.LastUpdate = time.Now()

    if err := config.DB().Save(&app).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตสถานะไม่สำเร็จ"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "อัปเดตสถานะเรียบร้อย",
        "data":    app,
    })
}
