package controller

import (
	"fmt"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// GET /payment-reports
// NOTE: ปรับแก้ Preload ให้ดึงข้อมูล Jobpost และ Employer มาด้วยสำหรับหน้า Admin
func ListPaymentReports(c *gin.Context) {
	var paymentreports []entity.PaymentReports
	if err := config.DB().
		Preload("Payments.BillableItem.Jobpost.Employer.User").
		Preload("Payments.PaymentMethod").
		Preload("Payments.Status").
		Order("payment_reports.create_date DESC").
		Find(&paymentreports).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": paymentreports})
}

// GET /payment-reports/employer/:id
// NOTE: ปรับ Query ให้มีประสิทธิภาพและสอดคล้องกับฟังก์ชันอื่น
func ListPaymentReportsByEmployerID(c *gin.Context) {
	var reports []entity.PaymentReports
	employerID := c.Param("id")
	if err := config.DB().
		Joins("JOIN payments ON payments.payment_report_id = payment_reports.id").
		Joins("JOIN billable_items bi ON bi.id = payments.billable_item_id").
		Joins("JOIN job_applications ja ON ja.id = bi.job_application_id").
		Joins("JOIN jobposts j ON j.id = ja.job_post_id").
		Where("j.employer_id = ?", employerID).
		Preload("Payments.BillableItem.Jobpost").
		Preload("Payments.PaymentMethod").
		Preload("Payments.Status").
		Order("payment_reports.create_date DESC").
		Find(&reports).Error; err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": reports})
}

// GET /payment-reports/me
func ListMyPaymentReports(c *gin.Context) {
	employerIDValue, exists := c.Get("employerID")
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Employer ID not found in context"})
		return
	}
	employerID, ok := employerIDValue.(uint)
	if !ok || employerID == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid Employer ID"})
		return
	}

	var reportIDs []uint
	if err := config.DB().
		Table("payment_reports").
		Select("payment_reports.id").
		Joins("JOIN payments ON payments.payment_report_id = payment_reports.id").
		Joins("JOIN billable_items ON billable_items.id = payments.billable_item_id").
		Joins("JOIN job_applications ON job_applications.id = billable_items.job_application_id").
		Joins("JOIN jobposts ON jobposts.id = job_applications.job_post_id").
		Where("jobposts.employer_id = ?", employerID).
		Group("payment_reports.id").
		Pluck("payment_reports.id", &reportIDs).Error; err != nil {
		fmt.Println("ListMyPaymentReports: subquery error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to find report IDs"})
		return
	}

	if len(reportIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []entity.PaymentReports{}})
		return
	}

	var reports []entity.PaymentReports
	if err := config.DB().
		Preload("Payment.BillableItem.JobApplication.JobPost.Employer.User").
		Preload("Payment.BillableItem.JobApplication.Student.User").
		Preload("Payment.BillableItem.JobApplication.JobPost.JobCategory").
		Preload("Payment.BillableItem.JobApplication.JobPost.EmploymentType").
		Preload("Payment.BillableItem.JobApplication.JobPost.SalaryType").
		Preload("Payment.PaymentMethod").
		Preload("Payment.Status").
		Where("id IN ?", reportIDs).
		Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to find reports"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reports})
}

// POST /payment-reports/upload
// NOTE: โค้ดส่วนนี้ดีอยู่แล้ว ไม่มีการเปลี่ยนแปลง
func UploadPaymentReport(c *gin.Context) {
	// 1) รับไฟล์
	f, err := c.FormFile("file")
	if err != nil {
		f, err = c.FormFile("pdf")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
			return
		}
	}

	// 2) เตรียมโฟลเดอร์
	dir := filepath.Join("static", "payment_reports")
	if err := os.MkdirAll(dir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create folder"})
		return
	}

	// 3) รับ payment_id (optional)
	pidStr := c.PostForm("payment_id")
	var pid uint
	if pidStr != "" {
		if p, err := strconv.Atoi(pidStr); err == nil && p > 0 {
			pid = uint(p)
		}
	}

	// 4) สร้างชื่อไฟล์ “อ่านง่าย”
	ts := time.Now().UnixNano()
	baseName := c.PostForm("report_name")
	if baseName == "" {
		baseName = "Payment Receipt"
	}

	baseName = fmt.Sprintf("%s#%d", baseName, ts)
	filename := fmt.Sprintf("receipt_%d_%d.pdf", pid, ts)
	diskPath := filepath.Join(dir, filename)

	if err := c.SaveUploadedFile(f, diskPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	rel := path.Join("/static/payment_reports", filename)
	base := strings.TrimRight(os.Getenv("PUBLIC_BASE_URL"), "/")
	if base == "" {
		base = "http://localhost:8080"
	}
	fullURL := base + rel

	now := time.Now()
	report := entity.PaymentReports{
		Reportname: baseName,
		Filepath:   fullURL,
		CreateDate: now,
	}
	if err := config.DB().Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create payment report"})
		return
	}

	// 7) ลิงก์กับ payment (ถ้ามี)
	if pid > 0 {
		if err := config.DB().Model(&entity.Payments{}).
			Where("id = ?", pid).
			Update("payment_report_id", report.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to link payment report", "detail": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": report})
}