// backend/controller/payment.go
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
    "errors"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

// GET /payments/job/:jobId
func GetPaymentByJobId(c *gin.Context) {
    jobId := c.Param("jobId")
    var payment entity.Payments

    err := config.DB().
        Table("payments").
        Joins("LEFT JOIN billable_items bi ON bi.id = payments.billable_item_id").
        Joins("JOIN jobposts jp ON (jp.billable_item_id = payments.billable_item_id OR jp.id = bi.jobpost_id)").
        Where("jp.id = ?", jobId).
        Order("payments.created_at DESC, payments.id DESC").
        Preload("Status").
        Preload("PaymentMethods").
        Preload("Discount").
        First(&payment).Error

    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found for this job"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": payment})
}

// GET /payments/employer/:employerId
func ListPaymentsByEmployerID(c *gin.Context) {
    employerId := c.Param("employerId")
    var payments []entity.Payments

    if err := config.DB().
        Table("payments").
        Joins("LEFT JOIN billable_items bi ON bi.id = payments.billable_item_id").
        Joins("JOIN jobposts jp ON (jp.billable_item_id = payments.billable_item_id OR jp.id = bi.jobpost_id)").
        Where("jp.employer_id = ?", employerId).
        Order("payments.created_at DESC, payments.id DESC").
        Preload("Status").
        Preload("PaymentMethods").
        Preload("Discount").
        Find(&payments).Error; err != nil {

        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": payments})
}

// GET /payments/statuses
func ListPaymentStatuses(c *gin.Context) {
	var statuses []entity.Statuses
	if err := config.DB().Find(&statuses).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": statuses})
}

// GET /payments/methods
func ListPaymentMethods(c *gin.Context) {
	var methods []entity.PaymentMethods
	if err := config.DB().Find(&methods).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": methods})
}

// GET /payments  // Admin
func ListPayments(c *gin.Context) {
    var payments []entity.Payments
    err := config.DB().
        Preload("Status").
        Preload("PaymentMethods").
        Preload("Discount").
        Find(&payments).Error

    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": payments})
}


// GET /payments/:id
func GetPaymentByID(c *gin.Context) {
    id := c.Param("id")

    var payment entity.Payments
    err := config.DB().
        Preload("Status").
        Preload("PaymentMethods").
        Preload("Discount").
        First(&payment, id).Error

    if errors.Is(err, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
        return
    }
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": payment})
}


// รูปแบบข้อมูลตอบกลับสำหรับหน้าโอนเงิน
type StudentPayInfo struct {
	JobpostID          uint    `json:"jobpost_id"`
	EmployerID         uint    `json:"employer_id"`
	StudentID          uint    `json:"student_id"`
	PayeeName          string  `json:"payee_name"`
	BankName           string  `json:"bank_name,omitempty"`
	BankAccount        string  `json:"bank_account,omitempty"` // ใช้เลขบัญชี/พร้อมเพย์ (แล้วแต่คุณเก็บ)
	Amount             float64 `json:"amount"`                 // จาก billable_items.amount ถ้ามี ไม่งั้นใช้ jobposts.salary
	PromptPayCandidate string  `json:"promptpay_candidate,omitempty"`
}

// GET /pay/job/:jobId/student-info
// **SQLite เวอร์ชัน**: ใช้ || ต่อสตริง, COALESCE, TRIM
func FindStudentPayInfoByJobID(c *gin.Context) {
	jobIDStr := c.Param("jobId")
	jobID64, err := strconv.ParseUint(jobIDStr, 10, 64)
	if err != nil || jobID64 == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}
	jobID := uint(jobID64)

	var row StudentPayInfo
	q := config.DB().
		Table("jobposts").
		Select(`
			jobposts.id AS jobpost_id,
			jobposts.employer_id AS employer_id,
			jobposts.student_id AS student_id,
			TRIM(COALESCE(students.first_name,'') || ' ' || COALESCE(students.last_name,'')) AS payee_name,
			banks.name AS bank_name,                                  -- ถ้าคอลัมน์จริงชื่ออื่น ให้แก้ตรงนี้
			students.bank_account AS bank_account,
			COALESCE(billable_items.amount, jobposts.salary) AS amount
		`).
		Joins(`LEFT JOIN students       ON students.id       = jobposts.student_id`).
		Joins(`LEFT JOIN banks          ON banks.id          = students.bank_id`).
		Joins(`LEFT JOIN billable_items ON billable_items.id = jobposts.billable_item_id`).
		Where(`jobposts.id = ?`, jobID).
		Limit(1)

	if err := q.Scan(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch"})
		return
	}
	if row.StudentID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "no student assigned to this job"})
		return
	}

	row.PromptPayCandidate = row.BankAccount

	c.JSON(http.StatusOK, gin.H{"data": row})
}

// POST /payments/:id/evidence
// func UploadEvidence(c *gin.Context) {
//     pid, err := strconv.Atoi(c.Param("id"))
//     if err != nil || pid <= 0 {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment id"})
//         return
//     }

//     // รับไฟล์จาก key "evidence"
//     file, err := c.FormFile("evidence")
//     if err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "missing file: evidence"})
//         return
//     }

//     // เตรียมโฟลเดอร์
//     base := "static/payment_evidence"
//     if err := os.MkdirAll(base, 0o755); err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "mkdir failed: " + err.Error()})
//         return
//     }

//     // ตั้งชื่อไฟล์กันชนกัน
//     ext := filepath.Ext(file.Filename)
//     fname := fmt.Sprintf("payment_%d_%d%s", pid, time.Now().UnixNano(), ext)
//     full := filepath.Join(base, fname)

//     if err := c.SaveUploadedFile(file, full); err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "save failed: " + err.Error()})
//         return
//     }

//     // URL แบบสาธารณะ (ต้องมี r.Static("/static", "./static") ที่ main.go)
//     url := path.Join("/static/payment_evidence", fname)

//     // หา status "ชำระสำเร็จ" ถ้ามี (ไม่บังคับ)
//     var paid entity.Statuses
//     _ = config.DB().
//         Where("status_name IN (?)", []string{"สำเร็จ", "Paid", "PAID", "SUCCESS"}).
//         First(&paid).Error

//     updates := map[string]any{
//         "proof_of_payment": url,
//         "datetime":         time.Now(),
//     }
//     if paid.ID != 0 {
//         updates["status_id"] = paid.ID
//     }

//     if err := config.DB().Model(&entity.Payments{}).
//         Where("id = ?", pid).
//         Updates(updates).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed: " + err.Error()})
//         return
//     }

//     c.JSON(http.StatusOK, gin.H{
//         "ok": true,
//         "data": gin.H{
//             "id":               pid,
//             "proof_of_payment": url,
//             "status":           func() string { if paid.ID > 0 { return paid.StatusName }; return "UPDATED" }(),
//         },
//     })
// }

func UploadEvidence(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	// ตรวจว่ามี payment นี้ไหม
	var cnt int64
	if err := config.DB().Table("payments").Where("id = ?", id).Count(&cnt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if cnt == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	// รองรับทั้ง key "file" (แนะนำ) และ "evidence" เพื่อความยืดหยุ่น
	f, err := c.FormFile("file")
	if err != nil {
		f, err = c.FormFile("evidence")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
			return
		}
	}

	// สร้างโฟลเดอร์ปลายทาง (ให้ backend เสิร์ฟได้ด้วย r.Static("/static", "./static"))
	dir := filepath.Join("static", "payment_evidence")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ตั้งชื่อไฟล์กันชนกัน
	fname := fmt.Sprintf("payment_%d_%d%s", id, time.Now().UnixNano(), filepath.Ext(f.Filename))
	diskPath := filepath.Join(dir, fname)

	// เซฟไฟล์ลงดิสก์
	if err := c.SaveUploadedFile(f, diskPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rel := path.Join("/static/payment_evidence", fname)

	base := strings.TrimRight(os.Getenv("PUBLIC_BASE_URL"), "/")
	if base == "" {
		base = "http://localhost:8080"
	}

	fullURL := base + rel

	if err := config.DB().Exec(
		`UPDATE payments SET proof_of_payment = ? WHERE id = ?`,
		fullURL, id,
	).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"id":                id,
		"proof_of_payment":  fullURL,
	}})
}

func isSettled(p *entity.Payments) bool {
    if p == nil {
        return false
    }
    // ✔️ ฟิลด์เป็น string → เช็คค่าว่างแทน
    if strings.TrimSpace(p.Proof_of_Payment) != "" {
        return true
    }
    if p.Status != nil {
        name := strings.ToLower(strings.TrimSpace(p.Status.StatusName))
        if name == "สำเร็จ" || name == "paid" || name == "success" {
            return true
        }
    }
    return false
}

type CreatePaymentReq struct {
    BillableItemID  uint       `json:"billable_item_id" binding:"required"`
    PaymentMethodID uint       `json:"payment_method_id" binding:"required"`
    DiscountID      *uint      `json:"discount_id"`
    Amount          *float32   `json:"amount"`
    Datetime        *time.Time `json:"datetime"`
    StatusID        *uint      `json:"status_id"`
}

// POST /payments (idempotent)
func CreatePayment(c *gin.Context) {
    var req CreatePaymentReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()

    var existed entity.Payments
    if err := db.
        Preload("Status").
        Where("billable_item_id = ?", req.BillableItemID).
        Order("id DESC").
        First(&existed).Error; err == nil {

        if isSettled(&existed) {
            c.JSON(http.StatusConflict, gin.H{
                "error":      "payment already settled for this billable",
                "payment_id": existed.ID,
            })
            return
        }
        c.JSON(http.StatusOK, gin.H{"data": existed})
        return
    }

    now := time.Now()
    dt := now
    if req.Datetime != nil {
        dt = *req.Datetime
    }

    amt := float32(0)
    if req.Amount != nil {
        amt = *req.Amount
    }

    p := entity.Payments{
        BillableItemID:  req.BillableItemID,
        PaymentMethodID: req.PaymentMethodID,
        DiscountID:      req.DiscountID,
        Datetime:        dt,
        Amount:          amt,
    }
    if req.StatusID != nil {
        p.StatusID = *req.StatusID
    }

    if err := db.Create(&p).Error; err != nil {
        var current entity.Payments
        if e := db.Preload("Status").
            Where("billable_item_id = ?", req.BillableItemID).
            Order("id DESC").
            First(&current).Error; e == nil {

            if isSettled(&current) {
                c.JSON(http.StatusConflict, gin.H{
                    "error":      "payment already settled for this billable",
                    "payment_id": current.ID,
                })
                return
            }
            c.JSON(http.StatusOK, gin.H{"data": current})
            return
        }
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"data": p})
}

type PaymentRow struct {
	ID             uint    `json:"ID"`
	BillableItemID uint    `json:"billable_item_id"`
	StatusID       *int    `json:"status_id,omitempty"`
	StatusName     *string `json:"status_name,omitempty"`
	ProofOfPayment *string `json:"proof_of_payment,omitempty"`
}

// GET /api/payments/billable/:id
func GetPaymentByBillable(c *gin.Context) {
    id, _ := strconv.Atoi(c.Param("id"))
    if id <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid billable id"})
        return
    }

    var p entity.Payments
    err := config.DB().
        Where("billable_item_id = ?", id).
        Order("id DESC").
        First(&p).Error

    if errors.Is(err, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
        return
    }
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": p})
}