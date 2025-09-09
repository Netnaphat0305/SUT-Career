// backend/controller/review.go
package controller

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

type CreateReviewPayload struct {
	JobPostID     *uint      `json:"jobpost_id"`
	RatingScoreID *uint      `json:"ratingscore_id"`
	Comment       string     `json:"comment"`
	Datetime      *time.Time `json:"datetime"`
}

func (p *CreateReviewPayload) Normalize() (jobID uint, scoreID uint, comment string) {
	if p.JobPostID != nil {
		jobID = *p.JobPostID
	}
	if p.RatingScoreID != nil {
		scoreID = *p.RatingScoreID
	}
	comment = p.Comment
	return
}

// GET /api/reviews/scores    (public)
func ListRatingScores(c *gin.Context) {
	role := c.GetString("role")
	if role == "" { // ยังไม่ได้ล็อกอิน
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if role != "employer" && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	var scores []entity.Ratingscores
	if err := config.DB().Find(&scores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "fetch scores failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": scores})

}

// GET /api/reviews/job/:jobId   (protected)
func FindRatingsByJobPostID(c *gin.Context) {
	jobID := c.Param("jobId")

	var reviews []entity.Reviews
	if err := config.DB().
		Where("jobpost_id = ?", jobID).
		Preload("Ratingscore").
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
	jobID, scoreID, comment := payload.Normalize()
	if jobID <= 0 || scoreID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "jobpost_id and ratingscore_id are required"})
		return
	}

	// 3) โหลดงาน
	var jp entity.Jobpost
	if err := db.First(&jp, jobID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "job post not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query job post failed"})
		return
	}

	// 4) ตรวจว่า job นี้เป็นของนายจ้างคนนี้จริง
	if int(jp.EmployerID) != empID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only review your own job"})
		return
	}

	// 5) ตรวจว่า ratingscore มีจริง
	var rs entity.Ratingscores
	if err := db.First(&rs, scoreID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ratingscore_id"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query rating score failed"})
		return
	}

	// 6) กันรีวิวซ้ำ: 1 งาน 1 รีวิว
	{
		var existing entity.Reviews
		if err := db.Where("jobpost_id = ?", jobID).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "review already exists for this job"})
			return
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "query existing review failed"})
			return
		}
	}

	// 7) เวลา Asia/Bangkok
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		loc = time.FixedZone("UTC+7", 7*3600)
	}
	now := time.Now().In(loc)

	review := entity.Reviews{
		JobpostID:      jobID,
		Ratingscore_ID: rs.ID,
		Comment:        strings.TrimSpace(comment),
		Datetime:       now,
	}

	if err := db.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create review failed"})
		return
	}
	_ = db.Preload("Ratingscore").First(&review, review.ID).Error
	c.JSON(http.StatusCreated, gin.H{"data": review})
}
