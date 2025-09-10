package controller

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
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
		Preload("Payment.JobPost").
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
        Joins("JOIN payments p ON p.id = payment_reports.payment_id").
        Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
        Joins("JOIN jobposts j ON j.billable_item_id = bi.id").
        Where("j.employer_id = ?", employerID).
        Preload("Payment").
        Preload("Payment.BillableItem").
        Preload("Payment.PaymentMethods").
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
    role := c.GetString("role")
    if role != "employer" { // ถ้าคุณ normalize เป็นตัวเล็กทั้งหมดก็ใช้ strings.ToLower(role)
        c.JSON(http.StatusForbidden, gin.H{"error": "only employer can view their reports"})
        return
    }

    var employer entity.Employer
    if err := config.DB().Where("user_id = ?", userID).First(&employer).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "employer profile not found"})
        return
    }

    var reports []entity.PaymentReports
    if err := config.DB().
        Model(&entity.PaymentReports{}).
        Joins("JOIN payments p ON p.id = payment_reports.payment_id").
        Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
        Joins("JOIN jobposts j ON j.billable_item_id = bi.id").
        Where("j.employer_id = ?", employer.ID).
        Preload("Payment").
        Preload("Payment.BillableItem").
        Preload("Payment.PaymentMethods").
        Preload("Payment.Status").
        Find(&reports).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "fetch reports failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": reports})
}

func UploadPaymentReport(c *gin.Context) {
	pidStr := c.PostForm("payment_id")
	if pidStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing payment_id"})
		return
	}
	pid, err := strconv.Atoi(pidStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment_id"})
		return
	}

	// ตรวจว่ามี payment จริง
	var payment entity.Payments
	if err := config.DB().First(&payment, pid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing file"})
		return
	}

	// เก็บไฟล์ไว้ใต้ /static/reports
	saveDir := filepath.Join("static", "reports")
	_ = os.MkdirAll(saveDir, 0755)

	filename := fmt.Sprintf("payment_report_%d_%d%s", payment.ID, time.Now().Unix(), filepath.Ext(file.Filename))
	savePath := filepath.Join(saveDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	report := entity.PaymentReports{
		Reportname: c.PostForm("report_name"),
		Filepath:   "/" + savePath, 
	}
	if err := config.DB().Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create payment report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": report})
}