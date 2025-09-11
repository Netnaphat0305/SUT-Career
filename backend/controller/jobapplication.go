package controller

import (
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
    "fmt"
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

    // ดึงใบสมัครของ student นี้ + preload ทั้ง Student + JobPost
    var applications []entity.JobApplication
    if err := config.DB().
        Preload("Student").
        Preload("Student.User").
        Preload("Student.Gender").
        Preload("Student.Bank").
        Preload("JobPost").
        Preload("JobPost.Employer").
        Preload("InterviewScheduling").
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
        Preload("InterviewScheduling").
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

// GET /api/jobapplications/check/:jobpost_id/:student_id
func CheckJobApplication(c *gin.Context) {
    jobpostID := c.Param("jobpost_id")
    studentID := c.Param("student_id")

    var existing entity.JobApplication
    if err := config.DB().
        Where("job_post_id = ? AND student_id = ?", jobpostID, studentID).
        First(&existing).Error; err == nil {
        // ถ้ามีอยู่แล้ว
        c.JSON(http.StatusOK, gin.H{
            "applied": true,
            "message": "คุณสมัครงานนี้ไปแล้ว",
        })
        return
    }

    // ถ้ายังไม่มี
    c.JSON(http.StatusOK, gin.H{
        "applied": false,
        "message": "ยังไม่ได้สมัคร",
    })
}

// PUT /api/jobapplications/:id/interview
func UpdateInterviewSchedule(c *gin.Context) {
    id := c.Param("id")

    var input struct {
        InterviewSchedulingID uint `json:"interview_scheduling_id" binding:"required"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // หาใบสมัคร
    var app entity.JobApplication
    if err := config.DB().
        Preload("JobPost").
        First(&app, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบใบสมัคร"})
        return
    }

    // หา InterviewScheduling
    var schedule entity.InterviewScheduling
    if err := config.DB().
        First(&schedule, input.InterviewSchedulingID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตารางสัมภาษณ์"})
        return
    }

    // ตรวจสอบว่าตารางสัมภาษณ์นี้เป็นของ Employer ของโพสต์นี้จริงไหม
    if schedule.EmployerID != app.JobPost.EmployerID {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "ไม่สามารถเลือกตารางสัมภาษณ์ของนายจ้างคนอื่นได้",
        })
        return
    }

    // ตรวจสอบว่ายัง Available อยู่ไหม
    if schedule.Status != "available" {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "ตารางสัมภาษณ์นี้ถูกจองไปแล้ว",
        })
        return
    }

    // อัปเดตสถานะของใบสมัคร + ผูก InterviewSchedulingID
    app.InterviewSchedulingID = &input.InterviewSchedulingID
    app.ApplicationStatus = entity.StatusInterviewScheduled
    app.LastUpdate = time.Now()

    if err := config.DB().Save(&app).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตวันสัมภาษณ์ไม่สำเร็จ"})
        return
    }

    // 6. อัปเดตสถานะของตารางสัมภาษณ์ให้ไม่ว่าง
    schedule.Status = "booked"
    if err := config.DB().Save(&schedule).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตสถานะตารางสัมภาษณ์ไม่สำเร็จ"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "เลือกวันสัมภาษณ์สำเร็จ",
        "data":    app,
    })
}

// POST /api/jobapplications/:id/upload-resume_file
func UploadResume(c *gin.Context) {
    id := c.Param("id")

    var jobApp entity.JobApplication
    if err := config.DB().First(&jobApp, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบการสมัครงานนี้"})
        return
    }

    // รับไฟล์จาก form-data
    file, err := c.FormFile("resume_file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาเลือกไฟล์"})
        return
    }

    // กำหนด path สำหรับบันทึกไฟล์
    path := fmt.Sprintf("uploads/resume_file/%d_%s", jobApp.ID, file.Filename)

    // บันทึกไฟล์ลง server
    if err := c.SaveUploadedFile(file, path); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
        return
    }

    // อัปเดตชื่อไฟล์ใน DB
    jobApp.ResumeFile = path
    if err := config.DB().Save(&jobApp).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตข้อมูลไม่สำเร็จ"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "อัปโหลด Portfolio สำเร็จ",
        "resume_file": path,
    })
}
