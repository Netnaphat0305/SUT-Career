package controller

import (
	"errors"
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
)

func GetEmployerPostsWithAcceptedApplications(c *gin.Context) {
	empID, ok := c.Get("employerID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: employerID not found"})
		return
	}

	db := config.DB()
	var pending struct {
		ID         uint
		StatusName string `gorm:"column:status_name"`
	}
	if err := db.Table("statuses").
		Where("LOWER(status_name) IN (?)", []string{"รอการชำระ", "unpaid", "pending"}).
		Limit(1).
		Scan(&pending).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query pending status failed"})
		return
	}
	if pending.ID == 0 {
		pending.ID = 1
		pending.StatusName = "รอการชำระ"
	}

	type Row struct {
		entity.Jobpost
		PaymentStatusID   *uint   `json:"status_id" gorm:"column:status_id"`
		PaymentStatusName *string `json:"status_name" gorm:"column:status_name"`
		StudentAssigned   bool    `json:"student_assigned" gorm:"column:student_assigned"`
	}

	var rows []Row

	err := db.Table("jobposts AS j").
		Joins(`
			JOIN job_applications AS ja
			  ON ja.job_post_id = j.id
			 AND ja.application_status = ?
		`, entity.StatusAccepted).
		Joins(`
			LEFT JOIN billable_items AS bi
			  ON bi.job_application_id = ja.id AND bi.deleted_at IS NULL
		`).
		Joins(`
			LEFT JOIN payments AS p
			  ON p.billable_item_id = bi.id AND p.deleted_at IS NULL
		`).
		Joins(`LEFT JOIN statuses AS s ON s.id = p.status_id`).
		Select(`
			j.*,
			COALESCE(s.id, ?) AS status_id,
			COALESCE(s.status_name, ?) AS status_name,
			CASE WHEN ja.student_id IS NOT NULL THEN 1 ELSE 0 END AS student_assigned
		`, pending.ID, pending.StatusName).
		Where("j.employer_id = ?", empID).
		Group("j.id, ja.id").
		Order("j.created_at DESC").
		Scan(&rows).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if rows == nil {
		c.JSON(http.StatusOK, gin.H{"data": []Row{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rows})
}

// GET /api/my-jobs/:id
func GetMyJobpostByID(c *gin.Context) {
	empID, ok := c.Get("employerID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: employerID not found"})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var jp entity.Jobpost
	if err := config.DB().
		Where("id = ? AND employer_id = ?", id, empID).
		Preload("Employer").
		Preload("SalaryType").
		Preload("EmploymentType").
		Preload("JobCategory").
		First(&jp).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "jobpost not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": jp})
}