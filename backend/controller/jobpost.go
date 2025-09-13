package controller

import (
	"fmt"
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

// GET /jobposts
// use by PostBoard ดึงข้อมูลประกาศงานทั้งหมด เรียงจากโพสต์ล่าสุดก่อน
func ListJobPosts(c *gin.Context) {
	var jobposts []entity.Jobpost
	if err := config.DB().
		Preload("Employer").
		Preload("Employer.User").
		Preload("JobCategory").
		Preload("EmploymentType").
		Preload("SalaryType").
		Order("created_at DESC").
		Find(&jobposts).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// เช็ค deadline ทุกโพสต์ ถ้าหมดเขต อัพเดตเป็น Close
	now := time.Now()
	for i := range jobposts {
		if jobposts[i].Deadline.Before(now) && jobposts[i].Status == "Open" {
			jobposts[i].Status = "Close"
			config.DB().Save(&jobposts[i])
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": jobposts})
}

// GET /jobposts/:id
// use by Post Detail ดึงข้อมูลประกาศงานตาม ID
func GetJobPostByID(c *gin.Context) {
	var jobpost entity.Jobpost
	id := c.Param("id")

	if err := config.DB().
		Preload("Employer").
		Preload("Employer.User").
		Preload("JobCategory").
		Preload("EmploymentType").
		Preload("Applications.Student"). //preload นักศึกษาที่สมัครงานนี้
		Preload("SalaryType").
		First(&jobpost, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job post not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": jobpost})
}

// GET /jobposts/employer/:id
func ListJobPostsByEmployerID(c *gin.Context) {
	var jobposts []entity.Jobpost
	id := c.Param("id")
	if err := config.DB().
		Preload("Employer").
		Where("employer_id = ?", id).
		Find(&jobposts).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": jobposts})
}

// POST /jobposts
func CreateJobPost(c *gin.Context) {
	employerID, ok := c.Get("employerID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var jobpost entity.Jobpost
	if err := c.ShouldBindJSON(&jobpost); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !jobpost.Deadline.IsZero() {
		loc, _ := time.LoadLocation("Asia/Bangkok")
		deadlineStr := jobpost.Deadline.Format(time.RFC3339)

		// 1) พยายาม parse แบบ RFC3339
		if parsed, err := time.Parse(time.RFC3339, deadlineStr); err == nil {
			localDeadline := parsed.In(loc)
			onlyDate, _ := time.ParseInLocation("2006-01-02", localDeadline.Format("2006-01-02"), loc)
			jobpost.Deadline = onlyDate.Add(24*time.Hour - time.Second)

		} else if parsed, err := time.ParseInLocation("2006-01-02", deadlineStr, loc); err == nil {
			// 2) parse YYYY-MM-DD
			jobpost.Deadline = parsed.Add(24*time.Hour - time.Second)
		}
	}

	jobpost.EmployerID = employerID.(uint)

	if err := config.DB().Create(&jobpost).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": jobpost})
}

// อัปเดตข้อมูลประกาศงาน
// PUT /jobposts/:id
func UpdateJobPost(c *gin.Context) {
	var jobpost entity.Jobpost
	id := c.Param("id")

	// หาโพสต์ก่อน
	if err := config.DB().First(&jobpost, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job post not found"})
		return
	}

	// อ่านข้อมูลจาก Body
	var request map[string]interface{}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ถ้ามีการส่ง deadline มา → บังคับ set ให้เป็นสิ้นวัน
	if deadlineRaw, ok := request["deadline"]; ok {
		if deadlineStr, ok := deadlineRaw.(string); ok {
			loc, _ := time.LoadLocation("Asia/Bangkok")

			// 1) พยายาม parse แบบ RFC3339 (เช่น 2025-09-14T00:00:00+07:00)
			if parsed, err := time.Parse(time.RFC3339, deadlineStr); err == nil {
				localDeadline := parsed.In(loc)
				onlyDate, _ := time.ParseInLocation("2006-01-02", localDeadline.Format("2006-01-02"), loc)
				request["deadline"] = onlyDate.Add(24*time.Hour - time.Second)

			} else if parsed, err := time.ParseInLocation("2006-01-02", deadlineStr, loc); err == nil {
				// 2) ถ้า parse แบบ YYYY-MM-DD ได้ → ใช้อันนี้
				request["deadline"] = parsed.Add(24*time.Hour - time.Second)
			}
		}
	}

	// อัปเดตเฉพาะฟิลด์ที่ส่งมา
	if err := config.DB().Model(&jobpost).Updates(request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตโพสต์ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตโพสต์สำเร็จ",
		"data":    jobpost,
	})
}

// DELETE /jobposts/:id
// ลบประกาศงาน
func DeleteJobPost(c *gin.Context) {
	id := c.Param("id")

	// ตรวจสอบว่าโพสต์มีอยู่จริงไหม
	var jobpost entity.Jobpost
	if err := config.DB().First(&jobpost, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบโพสต์นี้"})
		return
	}
	// ลบโพสต์
	if err := config.DB().Delete(&jobpost).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบโพสต์ไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบโพสต์เรียบร้อยแล้ว"})
}

// GET /api/employer/myposts
func GetEmployerPosts(c *gin.Context) {
	// ดึงค่า employerID จาก context โดยตรง
	employerID, ok := c.Get("employerID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// ดึง jobposts ตาม employerID ที่ login อยู่ พร้อม preload Employer
	var jobposts []entity.Jobpost
	if err := config.DB().
		Preload("Employer"). //  preload ข้อมูล Employer
		Where("employer_id = ?", employerID).
		Find(&jobposts).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("employerID:", employerID)
	fmt.Println("count jobposts:", len(jobposts))

	c.JSON(http.StatusOK, gin.H{"data": jobposts})
}

// POST /jobposts/upload-portfolio/:id
// อัพโหลดไฟล์ Portfolio และอัปเดตใน Jobpost
func UploadPortfolio(c *gin.Context) {
	id := c.Param("id") // รับ id ของ jobpost ที่จะอัพเดต

	file, err := c.FormFile("portfolio")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบไฟล์"})
		return
	}

	filename := file.Filename
	savePath := "./uploads/" + filename

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
		return
	}

	// อัปเดตใน DB
	var jobpost entity.Jobpost
	if err := config.DB().First(&jobpost, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job post not found"})
		return
	}

	jobpost.PortfolioRequired = &savePath
	if err := config.DB().Save(&jobpost).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดต jobpost ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "อัพโหลดสำเร็จ",
		"filePath": savePath,
		"data":     jobpost,
	})
}

// POST /jobposts/upload-logo/:id
func UploadLogo(c *gin.Context) {
	id := c.Param("id")

	file, err := c.FormFile("logo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบไฟล์โลโก้"})
		return
	}

	filename := file.Filename
	savePath := "./uploads/" + filename

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
		return
	}

	var jobpost entity.Jobpost
	if err := config.DB().First(&jobpost, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job post not found"})
		return
	}
	publicPath := "/uploads/" + filename
	jobpost.ImageURL = &publicPath

	if err := config.DB().Model(&jobpost).Update("image_url", publicPath).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดต jobpost ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "อัปโหลดโลโก้สำเร็จ",
		"filePath": publicPath,
		"data":     jobpost,
	})
}
