package controller


import (
	"net/http"
	"github.com/KBook22/System-Analysis-and-Design/config" 
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	


)

type StudentInfo struct {
        ID   uint   `json:"id"`
        Name string `json:"name"`
    }

func CreateWorklog(c *gin.Context) {
var worklog entity.Worklog
	if err := c.ShouldBindJSON(&worklog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB().Create(&worklog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create worklog"})
		return
	}
	c.JSON(http.StatusCreated, worklog)
}
// Get All Worklogs ยังไม่ใช้
func GetAllWorklogs(c *gin.Context) {
	var worklogs []entity.Worklog
	if err := config.DB().Preload("Jobpost").Find(&worklogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot find worklogs"})
		return
	}
	c.JSON(http.StatusOK, worklogs)
}
//Get Worklog of Student
func GetWorklogStudent(c *gin.Context) {
	studentID := c.Param("id")

	var worklogs []entity.Worklog
	if err := config.DB().
		Where("student_id = ?", studentID).
		Preload("Jobpost").
		
		Find(&worklogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot find worklogs"})
		return
	}
	c.JSON(http.StatusOK, worklogs)
}


// Update Worklog by ID
func UpdateWorklogByID(c *gin.Context) {
	id := c.Param("id")
	var worklog entity.Worklog

	if err := config.DB().First(&worklog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "worklog not found"})
		return
	}

	if err := c.ShouldBindJSON(&worklog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB().Save(&worklog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update worklog"})
		return
	}

	c.JSON(http.StatusOK, worklog)
}

// Delete Worklog by ID
func DeleteWorklogID(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB().Delete(&entity.Worklog{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot delete worklog"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted successfully"})
}

// GetJobpostByUserID ค้นหาประกาศงานทั้งหมดจาก User ID ของนายจ้าง
func GetJobpostByUserID(c *gin.Context) {
    // 1. รับ User ID จาก URL parameter
    userID := c.Param("id")

    // 2. ค้นหา Employer ID จากตาราง Employer โดยใช้ User ID
    var employer entity.Employer
    if err := config.DB().Where("user_id = ?", userID).First(&employer).Error; err != nil {
        // ถ้าไม่พบ Employer ที่ผูกกับ User ID นี้
        c.JSON(http.StatusNotFound, gin.H{"error": "Employer profile not found for this user"})
        return
    }

    // 3. ใช้ Employer ID ที่ได้ (employer.ID) และ  employmentTypeID = 2(parttime) ไปค้นหา Jobposts
    var jobposts []entity.Jobpost
    if err := config.DB().Where("employer_id = ? AND employment_type_id = ?", employer.ID, 2).Find(&jobposts).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot find job posts for this employer"})
        return
    }

    // 4. ส่งข้อมูล Jobposts กลับไป
    c.JSON(http.StatusOK, jobposts)
}

// ฟังก์ชันเดิมของคุณ (สามารถลบออกหรือเก็บไว้ถ้ายังใช้งานที่อื่น)
func GetJobpostByEmployerID(c *gin.Context) {
    employerID := c.Param("id")
    var jobposts []entity.Jobpost
    if err := config.DB().Where("employer_id = ?", employerID).Find(&jobposts).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot find jobposts"})
        return
    }
    c.JSON(http.StatusOK, jobposts)
}

// Get Students by Jobpost ID
func GetstudentByjobpostID(c *gin.Context) {
    jobpostID := c.Param("id")

    var jobapplications []entity.JobApplication// ดึงข้อมูลนักเรียนที่เกี่ยวข้องมาด้วย
    if err := config.DB().
		Preload("Student").
        Where("job_post_id = ? AND application_status =? ", jobpostID ,"Accepted").
        Find(&jobapplications).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot find job applications"})
        return
    }

    var students []StudentInfo
    for _, app := range jobapplications {
        // ตรวจสอบว่ามีข้อมูลนักเรียนอยู่จริงโดยเช็คจาก ID
        if app.Student.ID != 0 {
            students = append(students, StudentInfo{
                ID:   app.Student.ID,
                Name: app.Student.FirstName + " " + app.Student.LastName, // รวมชื่อและนามสกุล
            })
        }
    }

    c.JSON(http.StatusOK, students)
}

func GetWorklogsByUserID(c *gin.Context) {
    // 1. รับ User ID จาก URL parameter
    userID := c.Param("id")

    // 2. ค้นหา Employer ID จากตาราง Employer โดยใช้ User ID
    var employer entity.Employer
    if err := config.DB().Where("user_id = ?", userID).First(&employer).Error; err != nil {
        // ถ้าไม่พบ Employer ที่ผูกกับ User ID นี้
        c.JSON(http.StatusNotFound, gin.H{"error": "Employer profile not found for this user"})
        return
    }

    // 3. ใช้ Employer ID ที่ได้ (employer.ID) และ  employmentTypeID = 2(parttime) ไปค้นหา Jobposts
    var jobposts []entity.Jobpost
    if err := config.DB().Where("employer_id = ? AND employment_type_id = ?", employer.ID, 2).Find(&jobposts).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot find job posts for this employer"})
        return
    }
	

    var worklogs []entity.Worklog
	for _, jobpost := range jobposts {
		var wl []entity.Worklog
		if err := config.DB().Where("jobpost_id = ?", jobpost.ID).Preload("Jobpost").Preload("Student").Order("updated_at desc").Find(&wl).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot find worklogs"})
			return
		}
		worklogs = append(worklogs, wl...)
	}

	// 5. ส่งข้อมูล Worklogs กลับไป
	c.JSON(http.StatusOK, worklogs)
}