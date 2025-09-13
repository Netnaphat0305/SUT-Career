package controller

import (
	"net/http"
	"gorm.io/gorm"
    "math"
	"strconv"
	"errors"
    "strings"
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

type CreateBillableForAppReq struct {
	JobApplicationID uint   `json:"job_application_id" binding:"required"`
	Description      string `json:"description"`
}

func CreateOrUpdateBillableForApplication(c *gin.Context) {
	var req CreateBillableForAppReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload, job_application_id is required"})
		return
	}

	db := config.DB()

	var app entity.JobApplication
	if err := db.Preload("JobPost").First(&app, req.JobApplicationID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "job application not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load job application"})
		return
	}

	if app.ApplicationStatus != entity.StatusAccepted {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot create a bill for a non-accepted application"})
		return
	}

	if app.JobPost.ID == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "job post data is missing in the application"})
		return
	}
	jobID := app.JobPost.ID

	var jobDetails struct {
		Salary         float64
		SalaryTypeName string
	}
	if err := db.Table("jobposts AS j").
		Select("j.salary, LOWER(st.salary_type_name) AS salary_type_name").
		Joins("LEFT JOIN salary_types st ON st.id = j.salary_type_id").
		Where("j.id = ?", jobID).
		Scan(&jobDetails).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load job details"})
		return
	}
	st := jobDetails.SalaryTypeName
	amount := jobDetails.Salary

	switch {
	case strings.Contains(st, "ชั่วโมง") || strings.Contains(st, "hour"):
    hours, err := computeWorkedHoursGORM(db, jobID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sum worked hours"})
        return
    }
    amount = round2(hours * jobDetails.Salary)

	case strings.Contains(st, "วัน") || strings.Contains(st, "day") ||
		strings.Contains(st, "project") || strings.Contains(st, "โปรเจ"):
		amount = round2(jobDetails.Salary)

	case strings.Contains(st, "เดือน") || strings.Contains(st, "month"):
		amount = round2(jobDetails.Salary)
	}
	var bi entity.BillableItems
	err := db.Where("job_application_id = ?", req.JobApplicationID).First(&bi).Error
	if err == gorm.ErrRecordNotFound {
		// Create new billable item
		bi = entity.BillableItems{
			Description:      ifEmpty(req.Description, app.JobPost.Title),
			Amount:           float32(amount),
			JobApplicationID: &req.JobApplicationID,
		}
		if err := db.Create(&bi).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	} else {
		// Update existing billable item
		if err := db.Model(&bi).Updates(map[string]any{
			"amount":      amount,
			"description": ifEmpty(req.Description, bi.Description),
		}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"data": bi})
}

func computeWorkedHoursGORM(db *gorm.DB, jobID uint) (float64, error) {
    var total struct{ Sum float64 }
    if err := db.Model(&entity.Worklog{}).
        Select("COALESCE(SUM(hours),0) AS sum").
        Where("jobpost_id = ?", jobID).
        Scan(&total).Error; err != nil {
        return 0, err
    }
    return math.Max(0, total.Sum), nil
}

func round2(x float64) float64 { return math.Round(x*100) / 100 }

func ifEmpty(s, def string) string {
	if strings.TrimSpace(s) == "" {
		return def
	}
	return s
}

func GetBillableItemByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var bi entity.BillableItems
	err = config.DB().
		Preload("JobApplication.JobPost.Employer").
		Preload("JobApplication.JobPost.SalaryType").
		Preload("JobApplication.Student").
		First(&bi, id).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "billable item not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bi})
}