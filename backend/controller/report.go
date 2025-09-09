package controller

import (
	// "crypto/des"
	"net/http"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"

	// "github.com/KBook22/System-Analysis-and-Design/services"
	"github.com/gin-gonic/gin"
	"time"
)

// returned by report ID
type ResultByReportID struct {
	Title       string    `json:"title"`
	Datetime    time.Time `json:"datetime"`
	Place       string    `json:"place"`
	Discription string    `json:"discription"`
	Username    string    `json:"username"`
	Statusname  string    `json:"statusname"`
	AdminEmail  string    `json:"admin_email"`
}

// result returned by user ID
type ResultByUserID struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Datetime    time.Time `json:"datetime"`
	Place       string    `json:"place"`
	Discription string    `json:"discription"`
	Username    string    `json:"username"`
	StatusID    uint      `json:"status_id"`
	StatusName  string    `json:"status_name"`
}

// Create report
func CreateReport(c *gin.Context) {
	var report entity.Report
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB().Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create report"})
		return
	}
	c.JSON(http.StatusOK, report)
}

// Get all reports
func GetAllReports(c *gin.Context) {
	var reports []entity.Report
	if err := config.DB().Order("created_at asc").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve reports"})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// Get report by ID report
func GetReportByID(c *gin.Context) {
	id := c.Param("id")
	var result ResultByReportID
	if err := config.DB().
		Table("reports").
		Select("reports.title, reports.datetime, reports.place, reports.discription, users.username, reprt,report_statuses.statusname, admins.email as admin_email").
		Joins("left join users on users.id = reports.user_id").
		Joins("left join report_statuses on report_statuses.id = reports.report_status_id").
		Joins("left join admins on admins.id = reports.admin_id").
		Where("reports.id = ? AND reports.deleted_at IS NULL", id). // checว่ามีid นั้นมั้ย และ ยังไม่ถูกลบ
		Scan(&result).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}
	c.JSON(http.StatusOK, result)
}

// get report by user ID เอาไว้แสดงข้อreport ขอผู้ใช้
func GetReportByUserID(c *gin.Context) {
	userID := c.Param("user_id")
	var reports []ResultByUserID

	if err := config.DB().
		Table("reports").
		Select(`reports.id, reports.title, reports.datetime, reports.place, reports.discription,
		        users.username, reports.report_status_id AS status_id, report_statuses.statusname AS status_name`).
		Joins("LEFT JOIN users ON users.id = reports.user_id").
		Joins("LEFT JOIN report_statuses ON report_statuses.id = reports.report_status_id").
		Where("reports.user_id = ? AND reports.deleted_at IS NULL", userID).
		Scan(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve reports"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reports})
}

// Delete report by ID
func DeleteReport(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB().Delete(&entity.Report{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete report"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Report deleted"})
}

// Update report by ID
func UpdateReport(c *gin.Context) {
	id := c.Param("id")
	var report entity.Report
	if err := config.DB().First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB().Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update report"})
		return
	}
	c.JSON(http.StatusOK, report)
}
