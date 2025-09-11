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

// // GET /billable_items
// func ListBillableItems(c *gin.Context) {
// 	var items []entity.BillableItems
// 	if err := config.DB().Find(&items).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve billable items"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, items)
// }

// // DELETE /billable_item/:id
// func DeleteBillableItemById(c *gin.Context) {
// 	id := c.Param("id")
// 	if tx := config.DB().Exec("DELETE FROM billableitemid WHERE id = ?", id); tx.RowsAffected == 0 {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "deleted succesful"})
// }

// func GetBillableItemByID(c *gin.Context) {
// 	id, err := strconv.Atoi(c.Param("id"))
// 	if err != nil || id <= 0 {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
// 		return
// 	}
// 	var bi entity.BillableItems
// 	err = config.DB().
// 		Preload("Jobpost").
// 		Preload("Order").
// 		Preload("Jobpost.Employer").
// 		First(&bi, id).Error
// 	if errors.Is(err, gorm.ErrRecordNotFound) {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "billable item not found"})
// 		return
// 	} else if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}
// 	c.JSON(http.StatusOK, gin.H{"data": bi})
// }

// func getPendingStatusID(tx *gorm.DB) (uint, error) {
// 	var s struct {
// 		ID         uint
// 		StatusName string `gorm:"column:status_name"`
// 	}
// 	if err := tx.Table("statuses").
// 		Where("LOWER(status_name) IN (?)", []string{"รอการชำระ", "unpaid", "pending"}).
// 		Limit(1).
// 		Scan(&s).Error; err != nil {
// 		return 0, err
// 	}
// 	if s.ID == 0 {
// 		return 1, nil
// 	}
// 	return s.ID, nil
// }

// func EnsureBillAndPaymentForJob(tx *gorm.DB, jobID uint) (*entity.BillableItems, *entity.Payments, bool, error) {
// 	created := false

// 	var jp struct {
// 		ID              uint
// 		Title           string
// 		Salary          float32
// 		BillableItemID  *uint `gorm:"column:billable_item_id"`
// 	}
// 	if err := tx.Table("jobposts").
// 		Select("id, title, salary, billable_item_id").
// 		Where("id = ?", jobID).
// 		Take(&jp).Error; err != nil {
// 		if errors.Is(err, gorm.ErrRecordNotFound) {
// 			return nil, nil, false, fmt.Errorf("jobpost not found")
// 		}
// 		return nil, nil, false, err
// 	}

// 	var bi entity.BillableItems
// 	if jp.BillableItemID != nil {
// 		if err := tx.First(&bi, *jp.BillableItemID).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
// 			return nil, nil, false, err
// 		}
// 	}

// 	if bi.ID == 0 {
// 		if err := tx.Where("jobpost_id = ?", jobID).First(&bi).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
// 			return nil, nil, false, err
// 		}
// 	}

// 	if bi.ID == 0 {
// 		bi = entity.BillableItems{
// 			Description: jp.Title,
// 			Amount:      jp.Salary,
// 			JobpostID:   &jp.ID,
// 		}
// 		if err := tx.
// 			Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "jobpost_id"}}, DoNothing: true}).
// 			Create(&bi).Error; err != nil {
// 			return nil, nil, false, err
// 		}
// 		if bi.ID == 0 {
// 			if err := tx.Where("jobpost_id = ?", jobID).First(&bi).Error; err != nil {
// 				return nil, nil, false, err
// 			}
// 		}
// 		_ = tx.Table("jobposts").Where("id = ?", jp.ID).
// 			Update("billable_item_id", bi.ID).Error
// 		created = true
// 	}
// 	var pay entity.Payments
// 	if err := tx.
// 		Where("billable_item_id = ?", bi.ID).
// 		Order("created_at DESC, id DESC").
// 		First(&pay).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
// 		return nil, nil, created, err
// 	}

// 	if pay.ID == 0 {
// 		statusID, _ := getPendingStatusID(tx)
// 		pay = entity.Payments{
// 			BillableItemID: bi.ID,
// 			StatusID:       statusID,
// 			Datetime:       time.Now(),
// 		}
// 		if err := tx.Create(&pay).Error; err != nil {
// 			return nil, nil, created, err
// 		}
// 		created = true
// 	}

// 	if err := tx.Preload("Status").First(&pay, pay.ID).Error; err != nil {
// 		return &bi, &pay, created, err
// 	}

// 	return &bi, &pay, created, nil
// }

type CreateBillableReq struct {
	JobpostID   uint   `json:"jobpost_id"`
	Description string `json:"description"`
}

func CreateOrUpdateBillableItem(c *gin.Context) {
	var req CreateBillableReq
	if err := c.ShouldBindJSON(&req); err != nil || req.JobpostID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	db := config.DB()

	// โหลด salary + salary type
	var job struct {
		ID             uint
		Title          string
		Salary         float64
		SalaryTypeName string
	}
	if err := db.Table("jobposts AS j").
		Select("j.id, j.title, j.salary, LOWER(st.salary_type_name) AS salary_type_name").
		Joins("LEFT JOIN salary_types st ON st.id = j.salary_type_id").
		Where("j.id = ?", req.JobpostID).
		Scan(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "load job failed"})
		return
	}

	st := job.SalaryTypeName
	amount := job.Salary

	switch {
	case strings.Contains(st, "ชั่วโมง") || strings.Contains(st, "hour"):
		hours, err := computeWorkedHoursGORM(db, req.JobpostID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "sum hours failed"})
			return
		}
		amount = round2(hours * job.Salary)

	case strings.Contains(st, "วัน") || strings.Contains(st, "day") ||
		strings.Contains(st, "project") || strings.Contains(st, "โปรเจ"):
		amount = round2(job.Salary)

	case strings.Contains(st, "เดือน") || strings.Contains(st, "month"):
		amount = round2(job.Salary)
	}

	// upsert billable by job
	var bi entity.BillableItems
	err := db.Where("jobpost_id = ?", job.ID).First(&bi).Error
	if err == gorm.ErrRecordNotFound {
		bi = entity.BillableItems{
			Description: ifEmpty(req.Description, job.Title),
			Amount:      float32(amount),
			JobpostID:   &job.ID,
		}
		if err := db.Create(&bi).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		_ = db.Table("jobposts").Where("id = ?", job.ID).Update("billable_item_id", bi.ID).Error
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	} else {
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
		Preload("Jobpost").
		Preload("Jobpost.Employer").
		Preload("Jobpost.PaymentMethod").
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