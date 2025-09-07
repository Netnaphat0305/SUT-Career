package controller

import (
	"net/http"
	"strconv"
	"errors"
	"gorm.io/gorm"
	"fmt"
	
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// GET /billable_items
func ListBillableItems(c *gin.Context) {
	var items []entity.BillableItems
	if err := config.DB().Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve billable items"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func CreateBillableItem(c *gin.Context) {
    var item entity.BillableItems

    // แปลงข้อมูล JSON จาก client เป็น struct
    if err := c.ShouldBindJSON(&item); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Debug log ดูค่าที่ได้รับมา
    fmt.Printf("DEBUG: Received BillableItem: Description=%s, Amount=%.2f, JobpostID=%v, OrderID=%v\n",
        item.Description, item.Amount, item.JobpostID, item.OrderID)

    // ตรวจสอบว่ามี FK อย่างน้อย 1 ตัว (jobpost_id หรือ order_id)
    if item.JobpostID == nil && item.OrderID == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุอย่างน้อย jobpost_id หรือ order_id"})
        return
    }

    tx := config.DB().Begin() // เริ่ม transaction

    if err := tx.Create(&item).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "สร้าง billable item ไม่สำเร็จ"})
        return
    }

    payment := entity.Payments{
        BillableItemID: item.ID,
        StatusID:       1,
    }
    if err := tx.Create(&payment).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "สร้าง payment ไม่สำเร็จ"})
        return
    }

    tx.Commit() // บันทึกข้อมูลทั้งคู่

    c.JSON(http.StatusCreated, gin.H{
        "billable_item": item,
        "payment":       payment,
    })
}

// DELETE /billable_item/:id
func DeleteCreatorById(c *gin.Context) {
	id := c.Param("id")
	if tx := config.DB().Exec("DELETE FROM billableitemid WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted succesful"})
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
        Preload("Order").
        Preload("Jobpost.Employer").
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
