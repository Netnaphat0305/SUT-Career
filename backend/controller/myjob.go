package controller

import (
	"net/http"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

func GetEmployerPostsWithAcceptedApplications(c *gin.Context) {
    // ดึง employerID จาก context ที่ได้มาจาก Middleware
    empID, ok := c.Get("employerID")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: employerID not found"})
        return
    }

    db := config.DB()

    // Struct สำหรับรับข้อมูลจาก Query
    // (เหมือนเดิม แต่เอา ID ซ้ำซ้อนออก)
    type Row struct {
        entity.Jobpost
        PaymentStatusName *string `json:"payment_status_name"`
        StudentAssigned   bool    `json:"student_assigned"`
    }

    var rows []Row

    err := db.Table("jobposts AS j").
        // Join เพื่อหาเฉพาะ Job ที่มี Application Status เป็น "Accepted"
        // ใช้ INNER JOIN เพื่อกรองเอาเฉพาะงานที่มีใบสมัครที่ accepted แล้วเท่านั้น
        Joins("JOIN job_applications AS ja ON ja.job_post_id = j.id AND ja.application_status = ?", entity.StatusAccepted). // หรือ entity.StatusAccepted
        // ใช้ LEFT JOIN กับตารางที่เหลือ เพราะงานอาจจะยังไม่มี payment
		Joins("LEFT JOIN billable_items AS bi ON bi.jobpost_id = j.id AND bi.deleted_at IS NULL").
        Joins("LEFT JOIN payments AS p ON p.billable_item_id = bi.id AND p.deleted_at IS NULL").
        Joins("LEFT JOIN statuses AS s ON s.id = p.status_id").
        Select(`
            j.*,
            MAX(s.status_name) AS payment_status_name,
            CASE WHEN j.student_id IS NOT NULL THEN 1 ELSE 0 END AS student_assigned
        `).
        Where("j.employer_id = ?", empID).
        Group("j.id").
        Order("j.created_at DESC").
        Scan(&rows).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    if rows == nil {
        // trả về mảng rỗng thay vì null để frontend dễ xử lý
        c.JSON(http.StatusOK, gin.H{"data": []Row{}})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": rows})
}