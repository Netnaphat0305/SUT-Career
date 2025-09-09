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
func ListPaymentReports(c *gin.Context) {
	var paymentreports []entity.PaymentReports
	if err := config.DB().
		Preload("Payment").
		Preload("Payment.BillableItem").
		Preload("Payment.BillableItem.Jobpost").
		Preload("Payment.PaymentMethod").
		Preload("Payment.Status").
		Find(&paymentreports).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": paymentreports})
}

// GET /payment-reports/employer/:id
func ListPaymentReportsByEmployerID(c *gin.Context) {
	var reports []entity.PaymentReports
	employerID := c.Param("id")

	if err := config.DB().
		Model(&entity.PaymentReports{}).
		Joins("JOIN payments p ON p.payment_report_id = payment_reports.id").
		Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
		Joins("JOIN jobposts j ON j.id = bi.jobpost_id").
		Where("j.employer_id = ?", employerID).
		Preload("Payment").
		Preload("Payment.BillableItem").
		Preload("Payment.BillableItem.Jobpost").
		Preload("Payment.PaymentMethod").
		Preload("Payment.Status").
		Find(&reports).Error; err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": reports})
}

// GET /payment-reports/me
func ListMyPaymentReports(c *gin.Context) {
	userID := c.GetUint("userID")
	role := strings.ToLower(c.GetString("role"))
	if role != "employer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "only employer can view their reports"})
		return
	}

	var employer entity.Employer
	if err := config.DB().Where("user_id = ?", userID).First(&employer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employer profile not found"})
		return
	}

	var pays []entity.Payments
	if err := config.DB().
		Where("payments.payment_report_id IS NOT NULL").
		Joins("JOIN billable_items bi ON bi.id = payments.billable_item_id").
		Joins("JOIN jobposts j ON j.id = bi.jobpost_id").
		Where("j.employer_id = ?", employer.ID).
		Order("payments.created_at ASC, payments.id ASC").
		Preload("BillableItem").
		Preload("BillableItem.Jobpost").
		Preload("PaymentMethod").
		Preload("Status").
		Find(&pays).Error; err != nil {
		fmt.Println("ListMyPaymentReports: load payments error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "fetch reports failed"})
		return
	}

	if len(pays) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []any{}})
		return
	}

	ids := make([]uint, 0, len(pays))
	for _, p := range pays {
		if p.PaymentReportID != nil && *p.PaymentReportID > 0 {
			ids = append(ids, *p.PaymentReportID)
		}
	}

	var reps []entity.PaymentReports
	if err := config.DB().Where("id IN ?", ids).Find(&reps).Error; err != nil {
		fmt.Println("ListMyPaymentReports: load reports error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "fetch reports failed"})
		return
	}
	repByID := make(map[uint]entity.PaymentReports, len(reps))
	for _, r := range reps {
		repByID[r.ID] = r
	}

	type Row struct {
		ID         uint             `json:"id"`
		Reportname string           `json:"reportname"`
		Filepath   string           `json:"filepath"`
		CreateDate time.Time        `json:"create_date"`
		Payment    *entity.Payments `json:"payment,omitempty"`
		Methodname string           `json:"methodname,omitempty"`
		StatusName string           `json:"status_name,omitempty"`
	}

	out := make([]Row, 0, len(pays))
	for i := range pays {
		p := pays[i]
		rid := uint(0)
		if p.PaymentReportID != nil {
			rid = *p.PaymentReportID
		}
		rep := repByID[rid]

		out = append(out, Row{
			ID:         rep.ID,
			Reportname: rep.Reportname,
			Filepath:   rep.Filepath,
			CreateDate: rep.CreateDate,
			Payment:    &p,
			Methodname: func() string {
				if p.PaymentMethod != nil && p.PaymentMethod.Methodname != "" {
					return p.PaymentMethod.Methodname
				}
				return ""
			}(),
			StatusName: func() string {
				if p.Status != nil {
					return p.Status.StatusName
				}
				return ""
			}(),
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": out})
}

// payment-reports/upload
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
		_ = config.DB().Model(&entity.Payments{}).
			Where("id = ?", pid).
			Update("payment_report_id", report.ID).
			Error
	}

	c.JSON(http.StatusOK, gin.H{"data": report})
}