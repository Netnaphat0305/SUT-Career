// backend/controller/review.go
package controller

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

type CreateReviewPayload struct {
	JobApplicationID     *uint      `json:"job_application_id"`
	RatingScoreID *uint      `json:"ratingscore_id"`
	Comment       string     `json:"comment"`
	Datetime      *time.Time `json:"datetime"`
}

func (p *CreateReviewPayload) Normalize() (jobID uint, scoreID uint, comment string) {
	if p.JobApplicationID != nil {
		jobID = *p.JobApplicationID
	}
	if p.RatingScoreID != nil {
		scoreID = *p.RatingScoreID
	}
	comment = p.Comment
	return
}

// // GET /api/reviews/scores    (public)
// func ListRatingScores(c *gin.Context) {
// 	role := c.GetString("role")
// 	if role == "" { // ยังไม่ได้ล็อกอิน
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
// 		return
// 	}

// 	if role != "employer" && role != "admin" {
// 		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
// 		return
// 	}

// 	var scores []entity.Ratingscores
// 	if err := config.DB().Find(&scores).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "fetch scores failed"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, gin.H{"data": scores})

// }

// GET /api/reviews/jobapp/:jobAppId  (protected)
func FindRatingsByJobApplicationID(c *gin.Context) {
    jobAppID := c.Param("jobAppId")
    var reviews []entity.Reviews
    
    if err := config.DB().
        Where("job_application_id = ?", jobAppID).
        Preload("Ratingscore").
        Preload("JobApplication").
        Find(&reviews).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": reviews})
}

func CreateReview(c *gin.Context) {
	db := config.DB()

	// 1) ต้องเป็นนายจ้างเท่านั้น (middleware ควร set employerID ลง context ไว้แล้ว)
	v, ok := c.Get("employerID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: employer only"})
		return
	}

	var empID int
	switch x := v.(type) {
	case int:
		empID = x
	case uint:
		empID = int(x)
	case int64:
		empID = int(x)
	case uint64:
		empID = int(x)
	default:
		empID = 0
	}

	if empID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: employer only"})
		return
	}

	// 2) อ่าน payload
	var payload CreateReviewPayload
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json payload"})
        return
    }

    jobAppID, scoreID, comment := payload.Normalize()
    if jobAppID <= 0 || scoreID <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "job_application_id and ratingscore_id are required"})
        return
    }

    // โหลด JobApplication แทน Jobpost
    var jobApp entity.JobApplication
    if err := db.Preload("JobPost").First(&jobApp, jobAppID).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "job application not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query job application failed"})
        return
    }

    // ตรวจสอบว่า JobPost เป็นของ employer นี้
    if int(jobApp.JobPost.EmployerID) != empID {
        c.JSON(http.StatusForbidden, gin.H{"error": "you can only review your own job applications"})
        return
    }

    // ตรวจสอบสถานะ JobApplication ว่าเป็น Accepted
    if jobApp.ApplicationStatus != entity.StatusAccepted {
        c.JSON(http.StatusBadRequest, gin.H{"error": "can only review accepted applications"})
        return
    }

    // ตรวจสอบรีวิวซ้ำ
    var existing entity.Reviews
    if err := db.Where("job_application_id = ?", jobAppID).First(&existing).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "review already exists for this job application"})
        return
    } else if !errors.Is(err, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query existing review failed"})
        return
    }

    // สร้างรีวิว
    loc, err := time.LoadLocation("Asia/Bangkok")
    if err != nil {
        loc = time.FixedZone("UTC+7", 7*3600)
    }

    review := entity.Reviews{
        JobApplicationID: &jobAppID, // เปลี่ยนจาก JobpostID
        Ratingscore_ID:   scoreID,
        Comment:          strings.TrimSpace(comment),
        Datetime:         time.Now().In(loc),
    }

    if err := db.Create(&review).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "create review failed"})
        return
    }

    _ = db.Preload("Ratingscore").Preload("JobApplication.JobPost").First(&review, review.ID).Error
    c.JSON(http.StatusCreated, gin.H{"data": review})
}

func GetReviewByID(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Review ID format"})
		return
	}

	var review entity.Reviews

	result := config.DB().
		Preload("Ratingscore").
		Preload("JobApplication.JobPost").
		First(&review, id)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
			return
		}

		// ⭐️ แก้ไขบรรทัดนี้เพื่อดู Error จริง ๆ
		log.Printf("Database error: %v\n", result.Error) // แสดง Error ใน Terminal
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not fetch review data",
			"details": result.Error.Error(), // ส่ง Error จริงกลับไปให้ Front-end ดูด้วย
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": review})
}


// GET /api/reviews/student/:studentId
func GetReviewsByStudentID(c *gin.Context) {
    studentIDStr := c.Param("studentId")
    studentID, err := strconv.Atoi(studentIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid student id"})
        return
    }

    db := config.DB()
    var reviews []entity.Reviews

    // 1. Find all JobApplication IDs for the student
    var jobAppIDs []uint
    if err := db.Model(&entity.JobApplication{}).Where("student_id = ?", studentID).Pluck("id", &jobAppIDs).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "could not query job applications"})
        return
    }

    if len(jobAppIDs) == 0 {
        // No job applications, so no reviews. Return empty.
        c.JSON(http.StatusOK, gin.H{"data": reviews})
        return
    }

    // 2. Find all reviews for those JobApplication IDs
    if err := db.
        Where("job_application_id IN ?", jobAppIDs).
        Preload("Ratingscore").
        Preload("JobApplication.JobPost.Employer.User"). // Preload for reviewer info
        Order("datetime desc").
        Find(&reviews).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch reviews"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": reviews})
}
