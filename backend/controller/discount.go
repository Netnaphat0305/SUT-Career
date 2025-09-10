package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var paidStatusIDs = []int{2, 3}

// GET /discounts
func ListDiscounts(c *gin.Context) {
	var discounts []entity.Discounts
	if err := config.DB().Find(&discounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve discounts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": discounts})
}

// GET /discounts/applicable?job_post_id=1&include_future=1
func ListApplicableDiscounts(c *gin.Context) {
	now := time.Now()
	includeFuture := c.Query("include_future") == "1"

	var discounts []entity.Discounts
	db := config.DB().Model(&entity.Discounts{})

	if includeFuture {
		db = db.Where("(valid_until IS NULL OR valid_until >= ?)", now)
	} else {
		db = db.
			Where("(valid_from IS NULL OR valid_from <= ?)", now).
			Where("(valid_until IS NULL OR valid_until >= ?)", now)
	}

	if err := db.Find(&discounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve discounts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": discounts})
}

// POST /discounts
func CreateDiscount(c *gin.Context) {
	var discount entity.Discounts
	if err := c.ShouldBindJSON(&discount); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB().Create(&discount).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create discount"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": discount})
}

// GET /api/discounts/used?employerId=123
// คืนรายการ discount_id ที่ employer นี้ "เคยใช้แล้ว" (อิงจาก payments ที่สถานะจ่ายแล้ว)
func DiscountUsedByEmployer(c *gin.Context) {
	empStr := c.Query("employerId")
	employerID, _ := strconv.Atoi(empStr)
	if employerID <= 0 {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "invalid employerId"})
	  return
	}
  
	type row struct {
	  DiscountID *uint `json:"discount_id"`
	}
	var rows []row
  
	db := config.DB()
  
	// --- ใช้ status_id ---
	// ตารางอ้างอิง: payments(p), billable_items(b), jobposts(j)
	// ถ้าชื่อคอลัมน์ต่างจากนี้ ปรับให้ตรง
	err := db.Raw(`
	  SELECT DISTINCT p.discount_id AS discount_id
	  FROM payments p
	  JOIN billable_items b ON b.id = p.billable_item_id
	  JOIN jobposts j ON j.id = b.job_post_id
	  WHERE j.employer_id = ? 
		AND p.discount_id IS NOT NULL
		AND p.status_id IN (?)
	`, employerID, paidStatusIDs).Scan(&rows).Error
  
	if err != nil {
	  c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	  return
	}
  
	// map เป็น []uint ตามสไตล์ response
	ids := make([]uint, 0, len(rows))
	for _, r := range rows {
	  if r.DiscountID != nil {
		ids = append(ids, *r.DiscountID)
	  }
	}
  
	c.JSON(http.StatusOK, gin.H{"data": ids})
  }

// GET /api/discounts/:id/usage?employerId=123
// คืน { data: { used: true/false } }
func CheckDiscountUsage(c *gin.Context) {
	dStr := c.Param("id")
	discountID, _ := strconv.Atoi(dStr)
  
	empStr := c.Query("employerId")
	employerID, _ := strconv.Atoi(empStr)
  
	if discountID <= 0 || employerID <= 0 {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "invalid params"})
	  return
	}
  
	used, err := hasEmployerUsedDiscount(config.DB(), uint(employerID), uint(discountID))
	if err != nil {
	  c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	  return
	}
  
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"used": used}})
  }
  
  func hasEmployerUsedDiscount(db *gorm.DB, employerID, discountID uint) (bool, error) {
	type one struct{ X int }
	var o one
  
	err := db.Raw(`
	  SELECT 1 AS x
	  FROM payments p
	  JOIN billable_items b ON b.id = p.billable_item_id
	  JOIN jobposts j ON j.id = b.job_post_id
	  WHERE j.employer_id = ?
		AND p.discount_id = ?
		AND p.status_id IN (?)
	  LIMIT 1
	`, employerID, discountID, paidStatusIDs).Scan(&o).Error
  
	if err != nil {
	  return false, err
	}
	return o.X == 1, nil
  }