// backend/controller/payment.go

package controller

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"sort"
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

/* ================== Helpers ================== */
func statusIDByName(db *gorm.DB, names ...string) (uint, error) {
	var id uint
	for _, n := range names {
		err := db.Table("statuses").
			Select("id").
			Where("LOWER(status_name) = ?", strings.ToLower(strings.TrimSpace(n))).
			Take(&id).Error
		if err == nil {
			return id, nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, err
		}
	}
	return 0, gorm.ErrRecordNotFound
}

/* ================== Masters ================== */
// // GET /api/payments/statuses
// func ListPaymentStatuses(c *gin.Context) {
// 	var rows []struct {
// 		ID         uint   `json:"id"`
// 		StatusName string `json:"status_name"`
// 	}
// 	if err := config.DB().Table("payment_statuses").
// 		Select("id, status_name").
// 		Order("id asc").
// 		Scan(&rows).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}
// 	c.JSON(http.StatusOK, gin.H{"data": rows})
// }

// GET /api/paymentsmethods
func ListPaymentMethods(c *gin.Context) {
	var rows []entity.PaymentMethods
	if err := config.DB().Table("payment_methods").
		Select("id, methodname").
		Order("id asc").
		Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, rows)
}

type createPaymentReq struct {
	BillableItemID  uint      `json:"billable_item_id" binding:"required"`
	PaymentMethodID uint      `json:"payment_method_id" binding:"required"`
	Amount          float32   `json:"amount" binding:"required"`
	DiscountID      *uint     `json:"discount_id"`
	Datetime        time.Time `json:"datetime"`
}

func CreatePayment(c *gin.Context) {
	var req createPaymentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	pendingID, err := statusIDByName(db, "รอการชำระ")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pending status not found, please seed statuses"})
		return
	}

	p := entity.Payments{
		BillableItemID:  req.BillableItemID,
		PaymentMethodID: req.PaymentMethodID,
		Amount:          req.Amount,
		StatusID:        pendingID,
		Datetime:        time.Now(),
	}

	if req.DiscountID != nil {
		p.DiscountID = req.DiscountID
	}

	if err := db.Create(&p).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_ = db.Preload("Status").Preload("PaymentMethod").
		Preload("BillableItem").First(&p, p.ID)
	c.JSON(http.StatusCreated, gin.H{"data": p})
}

// GET /api/payments
func ListPayments(c *gin.Context) {
	db := config.DB()
	var pays []entity.Payments
	if err := db.
		Preload("Status").
		Preload("PaymentMethod").
		Preload("Discount").
		Preload("BillableItem").
		Preload("BillableItem.Jobpost").
		Preload("BillableItem.Jobpost.Employer").
		Order("created_at DESC, id DESC").
		Find(&pays).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pays})
}

// GET /api/payments/:id
func GetPaymentByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var pay entity.Payments
	if err := config.DB().
		Preload("Status").
		Preload("PaymentMethod").                     // ← แก้ไขจาก PaymentMethods
		Preload("Discount").
		Preload("BillableItem").
		Preload("BillableItem.Jobpost").             // ← เพิ่ม nested preload
		Preload("BillableItem.Jobpost.Employer").    // ← เพิ่ม employer พร้อม address
		First(&pay, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pay})
}

// GET /api/payments/job/:jobId
func GetPaymentByJobId(c *gin.Context) {
	jobIdStr := c.Param("jobId")
	if jobIdStr == "" {
		jobIdStr = c.Param("id")
	}

	jobID, err := strconv.ParseUint(jobIdStr, 10, 64)
	if err != nil || jobID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	var payment entity.Payments
	err = config.DB().
		Model(&entity.Payments{}).
		Select("payments.*").
		Joins("LEFT JOIN billable_items bi ON bi.id = payments.billable_item_id").
		Joins("JOIN jobposts jp ON (jp.billable_item_id = payments.billable_item_id OR jp.id = bi.jobpost_id)").
		Where("jp.id = ?", jobID).
		Order("payments.created_at DESC, payments.id DESC").
		Preload("Status").
		Preload("PaymentMethod").                     // ← แก้ไขจาก PaymentMethods
		Preload("Discount").
		Preload("BillableItem").
		Preload("BillableItem.Jobpost").             // ← เพิ่ม nested preload
		Preload("BillableItem.Jobpost.Employer").    // ← เพิ่ม employer
		First(&payment).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found for this job"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": payment})
}

// GET /api/payments/billable/:billableId - แก้ไข Preload ให้ครบถ้วน
func GetLatestPaymentByBillable(c *gin.Context) {
	bid := c.Param("billableId")
	var p entity.Payments
	
	err := config.DB().
		Where("billable_item_id = ?", bid).
		Order("payments.created_at DESC, payments.id DESC").
		Preload("BillableItem").
		Preload("BillableItem.Jobpost").
		Preload("BillableItem.Jobpost.Employer").    // ← แก้ไข: เลือกทุก field ของ employer รวม address
		Preload("PaymentMethod").                     // ← เพิ่ม PaymentMethod
		Preload("Status").
		First(&p).Error
		
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": p})
}

func UploadEvidence(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	// บันทึกใต้ ./static/payment_evidence เพื่อเสิร์ฟผ่าน /static
	baseDir := filepath.Join(".", "static", "payment_evidence")
	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot prepare storage"})
		return
	}

	var savedRel, publicURL string
	file, err := c.FormFile("evidence") // ฝั่ง FE ส่งคีย์ "evidence"
	if err != nil || file == nil {
		file, err = c.FormFile("file") // เผื่อบางที่ส่งชื่อ "file"
	}

	if err == nil && file != nil {
		orig := filepath.Base(file.Filename)
		ext := strings.ToLower(filepath.Ext(orig))
		if ext == "" { ext = ".bin" }
		name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		full := filepath.Join(baseDir, name)
		if err := c.SaveUploadedFile(file, full); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "cannot save file"})
			return
		}

		// เก็บใน DB เป็น path แบบ relative ต่อ /static
		savedRel = filepath.ToSlash(filepath.Join("payment_evidence", name))
		publicURL = "/static/" + savedRel
	}

	// อัปเดตสถานะเป็น "ชำระแล้ว"
	reviewID, err := statusIDByName(db, "ชำระแล้ว")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "review status not found, please seed statuses"})
		return
	}

	updates := map[string]any{"status_id": reviewID}
	if savedRel != "" {
		updates["proof_of_payment"] = savedRel
	}

	if err := db.Model(&entity.Payments{}).
		Where("id = ?", id).
		Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}

	var p entity.Payments
	_ = db.Preload("Status").
		Preload("PaymentMethod").
		Preload("BillableItem").
		First(&p, "id = ?", id).Error
	c.JSON(http.StatusOK, gin.H{
		"data": p,
		"public_url": publicURL, // ตัวอย่าง: /static/payment_evidence/16942401....jpg
	})
}

// ------------------------------ admin -----------------------------------
type dayPoint struct {
	Date string  `json:"date"` // YYYY-MM-DD (Asia/Bangkok)
	In   float32 `json:"in"`
	Out  float32 `json:"out"`
	Net  float32 `json:"net"`
}

// GET /api/admin/finance/summary?from=2025-09-01&to=2025-09-09
func FinanceSummary(c *gin.Context) {
	db := config.DB()
	fromStr := c.Query("from")
	toStr := c.Query("to")
	loc, _ := time.LoadLocation("Asia/Bangkok")
	now := time.Now().In(loc)
	var from, to time.Time
	var err error
	if fromStr == "" {
		from = now.AddDate(0, 0, -29) // default 30 วันล่าสุด
	} else {
		from, err = time.ParseInLocation("2006-01-02", fromStr, loc)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from date"})
			return
		}
	}
	if toStr == "" {
		to = now
	} else {
		to, err = time.ParseInLocation("2006-01-02", toStr, loc)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to date"})
			return
		}
	}

	// ครอบคลุมทั้งวันสุดท้าย
	to = to.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	// --- เงินเข้า (payments) ---
	paidID, err := statusIDByName(db, "ชำระแล้ว")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status 'ชำระแล้ว' not found"})
		return
	}

	var pays []entity.Payments
	if err := db.
		Where("status_id = ? AND created_at BETWEEN ? AND ?", paidID, from, to).
		Preload("BillableItem").
		Find(&pays).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query payments failed"})
		return
	}

	// รวมยอดรายวัน
	bucket := map[string]*dayPoint{}
	totalIn, totalOut := float32(0), float32(0)
	// Payments → In
	for _, p := range pays {
		d := p.Datetime.In(loc).Format("2006-01-02")
		if _, ok := bucket[d]; !ok {
			bucket[d] = &dayPoint{Date: d}
		}
		amt := safePaymentAmount(p)
		bucket[d].In += amt
		totalIn += amt
	}

	// คำนวณ Net + เรียงวัน
	var series []dayPoint
	for _, v := range bucket {
		v.Net = v.In - v.Out
		series = append(series, *v)
	}

	sort.Slice(series, func(i, j int) bool { return series[i].Date < series[j].Date })
	c.JSON(http.StatusOK, gin.H{
		"from": from.Format("2006-01-02"),
		"to": to.Format("2006-01-02"),
		"total_in": totalIn,
		"total_out": totalOut,
		"net": totalIn - totalOut,
		"series": series,
	})
}

func safePaymentAmount(p entity.Payments) float32 {
	return p.Amount
}


// ---------------------- Student -------------------------
type StudentFinanceResponse struct {
    StudentID uint      `json:"student_id"`
    JobID     uint      `json:"job_id"`
    JobTitle  string    `json:"jobTitle"`
    Amount    float32   `json:"amount"`
    Datetime  time.Time `json:"datetime"`
}

type StudentFinanceSummary struct {
    MonthlyJobCount int     `json:"monthlyJobCount"`
    TotalJobCount   int     `json:"totalJobCount"`
    TotalEarnings   float32 `json:"totalEarnings"`
}

// GET /api/my/finance - ใช้ user_id จาก JWT token
func GetMyFinance(c *gin.Context) {
	userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
        return
    }

    db := config.DB()
    paidStatusID, err := statusIDByName(db, "ชำระแล้ว")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "status 'ชำระแล้ว' not found"})
        return
    }

    var results []StudentFinanceResponse
    
    err = db.
        Table("payments p").
        Select(`
            s.id as student_id,
            jp.id as job_id,
            jp.title as job_title,
            p.amount,
            p.datetime
        `).
        Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
        Joins("JOIN jobposts jp ON jp.id = bi.jobpost_id").
        Joins("JOIN students s ON s.id = jp.student_id").
        Joins("JOIN users u ON u.id = s.user_id").  // เชื่อมกับ users table
        Where("u.id = ? AND p.status_id = ?", userID, paidStatusID).
        Order("p.datetime DESC").
        Find(&results).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": results})
}

// GET /api/my/finance/summary - ใช้ user_id จาก JWT token
func GetMyFinanceSummary(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
        return
    }

    db := config.DB()
    paidStatusID, err := statusIDByName(db, "ชำระแล้ว")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "status 'ชำระแล้ว' not found"})
        return
    }

    // คำนวณเดือนปัจจุบัน
    now := time.Now()
    currentMonth := fmt.Sprintf("%02d", int(now.Month()))  // 01-12
    currentYear := fmt.Sprintf("%d", now.Year())           // 2025
    
    var totalCount int64
    var totalEarnings float32
    var monthlyCount int64

    // Total jobs and earnings
    db.Table("payments p").
        Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
        Joins("JOIN jobposts jp ON jp.id = bi.jobpost_id").
        Joins("JOIN students s ON s.id = jp.student_id").
        Joins("JOIN users u ON u.id = s.user_id").
        Where("u.id = ? AND p.status_id = ?", userID, paidStatusID).
        Count(&totalCount).
        Pluck("SUM(p.amount)", &totalEarnings)

    // ใช้ strftime แทน MONTH/YEAR
    db.Table("payments p").
        Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
        Joins("JOIN jobposts jp ON jp.id = bi.jobpost_id").
        Joins("JOIN students s ON s.id = jp.student_id").
        Joins("JOIN users u ON u.id = s.user_id").
        Where("u.id = ? AND p.status_id = ? AND strftime('%m', p.datetime) = ? AND strftime('%Y', p.datetime) = ?",
            userID, paidStatusID, currentMonth, currentYear).
        Count(&monthlyCount)

    summary := StudentFinanceSummary{
        MonthlyJobCount: int(monthlyCount),
        TotalJobCount:   int(totalCount),
        TotalEarnings:   totalEarnings,
    }

    c.JSON(http.StatusOK, gin.H{"data": summary})
}

// GET /api/student/:id/finance - legacy endpoint
func GetStudentFinance(c *gin.Context) {
    studentID := c.Param("id")
    db := config.DB()
    
    paidStatusID, err := statusIDByName(db, "ชำระแล้ว")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "status 'ชำระแล้ว' not found"})
        return
    }

    var results []StudentFinanceResponse
    err = db.
        Table("payments p").
        Select(`
            jp.student_id,
            jp.id as job_id,
            jp.title as job_title,
            p.amount,
            p.datetime
        `).
        Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
        Joins("JOIN jobposts jp ON jp.id = bi.jobpost_id").
        Where("jp.student_id = ? AND p.status_id = ?", studentID, paidStatusID).
        Order("p.datetime DESC").
        Find(&results).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": results})
}

// GetStudentFinanceSummary (legacy endpoint) เหมือนกัน
func GetStudentFinanceSummary(c *gin.Context) {
    studentID := c.Param("id")
    db := config.DB()
    
    paidStatusID, err := statusIDByName(db, "ชำระแล้ว")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "status 'ชำระแล้ว' not found"})
        return
    }

    // คำนวณเดือนปัจจุบัน
    now := time.Now()
    currentMonth := fmt.Sprintf("%02d", int(now.Month()))
    currentYear := fmt.Sprintf("%d", now.Year())
    
    var totalCount int64
    var totalEarnings float32
    var monthlyCount int64

    // Total jobs and earnings
    db.Table("payments p").
        Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
        Joins("JOIN jobposts jp ON jp.id = bi.jobpost_id").
        Where("jp.student_id = ? AND p.status_id = ?", studentID, paidStatusID).
        Count(&totalCount).
        Pluck("SUM(p.amount)", &totalEarnings)

    // ใช้ strftime แทน MONTH/YEAR
    db.Table("payments p").
        Joins("JOIN billable_items bi ON bi.id = p.billable_item_id").
        Joins("JOIN jobposts jp ON jp.id = bi.jobpost_id").
        Where("jp.student_id = ? AND p.status_id = ? AND strftime('%m', p.datetime) = ? AND strftime('%Y', p.datetime) = ?",
            studentID, paidStatusID, currentMonth, currentYear).
        Count(&monthlyCount)

    summary := StudentFinanceSummary{
        MonthlyJobCount: int(monthlyCount),
        TotalJobCount:   int(totalCount),
        TotalEarnings:   totalEarnings,
    }

    c.JSON(http.StatusOK, gin.H{"data": summary})
}