// // backend/controllers/qna_controller.go
// package controller

// import (
// 	"net/http"
// 	"strconv"

// 	"github.com/KBook22/System-Analysis-and-Design/config"
// 	"github.com/KBook22/System-Analysis-and-Design/entity"
// 	"github.com/KBook22/System-Analysis-and-Design/services"
// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"
// )

// // --- FAQ Management (For Admins) ---

// // POST /faqs
// func CreateFAQ(c *gin.Context) {
// 	var faq entity.FAQ
// 	if err := c.ShouldBindJSON(&faq); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// ดึง AdminID จาก Token (ในอนาคตควรเช็ค Role Admin)
// 	adminID, exists := c.Get("userID")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin not identified"})
// 		return
// 	}
// 	faq.AdminID = adminID.(uint)

// 	if err := config.DB().Create(&faq).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create FAQ"})
// 		return
// 	}
// 	c.JSON(http.StatusCreated, faq)
// }

// // GET /faqs
// func GetFAQs(c *gin.Context) {
// 	faqs, err := services.GetFAQs()
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve FAQs"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, faqs)
// }

// // PUT /faqs/:id
// func UpdateFAQ(c *gin.Context) {
// 	idStr := c.Param("id")
// 	id, err := strconv.ParseUint(idStr, 10, 32)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid FAQ ID"})
// 		return
// 	}

// 	var faq entity.FAQ
// 	if err := config.DB().First(&faq, uint(id)).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "FAQ not found"})
// 		return
// 	}

// 	var input struct {
// 		Title   string `json:"title"`
// 		Content string `json:"content"`
// 	}
// 	if err := c.ShouldBindJSON(&input); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	faq.Title = input.Title
// 	faq.Content = input.Content
// 	config.DB().Save(&faq)

// 	c.JSON(http.StatusOK, faq)
// }

// // DELETE /faqs/:id
// func DeleteFAQ(c *gin.Context) {
// 	idStr := c.Param("id")
// 	id, err := strconv.ParseUint(idStr, 10, 32)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid FAQ ID"})
// 		return
// 	}

// 	if err := config.DB().Delete(&entity.FAQ{}, uint(id)).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete FAQ"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "FAQ deleted successfully"})
// }


// // --- Request Ticket System ---

// // POST /tickets
// func CreateRequestTicket(c *gin.Context) {
// 	var ticket entity.RequestTicket
// 	if err := c.ShouldBindJSON(&ticket); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	userID, exists := c.Get("userID")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
// 		return
// 	}

// 	createdTicket, err := services.CreateTicket(&ticket, userID.(uint))
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request ticket"})
// 		return
// 	}
// 	c.JSON(http.StatusCreated, createdTicket)
// }

// // GET /admin/tickets (สำหรับ Admin)
// func GetRequestTickets(c *gin.Context) {
// 	var tickets []entity.RequestTicket
// 	// เพิ่ม .Preload("User") และ .Preload("Replies.Author") เพื่อให้ดึงข้อมูลที่เกี่ยวข้องมาด้วย
// 	if err := config.DB().Preload("User").Preload("Replies.Author").Order("created_at desc").Find(&tickets).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tickets"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, tickets)
// }

// // GET /tickets (สำหรับผู้ใช้ที่ล็อกอินอยู่)
// func GetMyRequestTickets(c *gin.Context) {
// 	userID, exists := c.Get("userID")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
// 		return
// 	}

// 	var tickets []entity.RequestTicket
// 	// ค้นหา tickets ทั้งหมดที่ตรงกับ user_id ของคนที่ล็อกอิน
// 	if err := config.DB().Where("user_id = ?", userID).Order("created_at desc").Find(&tickets).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user tickets"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, tickets)
// }

// // GET /tickets/:id
// func GetRequestTicketByID(c *gin.Context) {
// 	idStr := c.Param("id")
// 	id, err := strconv.ParseUint(idStr, 10, 32)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
// 		return
// 	}

// 	ticket, err := services.GetTicketByID(uint(id))
// 	if err != nil {
// 		if err == gorm.ErrRecordNotFound {
// 			c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
// 			return
// 		}
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve ticket"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, ticket)
// }


// // POST /tickets/:id/replies
// func CreateTicketReply(c *gin.Context) {
// 	ticketID, err := strconv.Atoi(c.Param("id"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
// 		return
// 	}

// 	var reply entity.TicketReply
// 	if err := c.ShouldBindJSON(&reply); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}
	
// 	var ticket entity.RequestTicket
// 	if err := config.DB().First(&ticket, ticketID).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
// 		return
// 	}

// 	authorID, exists := c.Get("userID")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Author not identified"})
// 		return
// 	}
// 	reply.AuthorID = authorID.(uint)

// 	reply.TicketID = uint(ticketID)

// 	if err := config.DB().Create(&reply).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply"})
// 		return
// 	}

// 	config.DB().Preload("Author").First(&reply, reply.ID)
// 	c.JSON(http.StatusCreated, reply)
// }

// // PUT /tickets/:id/status (สำหรับ Admin)
// func UpdateTicketStatus(c *gin.Context) {
// 	ticketID, err := strconv.Atoi(c.Param("id"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
// 		return
// 	}

// 	var statusUpdate struct {
// 		Status string `json:"status" binding:"required"`
// 	}

// 	if err := c.ShouldBindJSON(&statusUpdate); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	var ticket entity.RequestTicket
// 	if err := config.DB().First(&ticket, ticketID).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
// 		return
// 	}

// 	ticket.Status = statusUpdate.Status
// 	if err := config.DB().Save(&ticket).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket status"})
// 		return
// 	}
	
// 	config.DB().Preload("User").Preload("Replies.Author").First(&ticket, ticket.ID)
// 	c.JSON(http.StatusOK, ticket)
// }

package controller

import (
	"net/http"
	"strconv"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// --- FAQ Management (For Admins) ---

// POST /faqs
func CreateFAQ(c *gin.Context) {
	var faq entity.FAQ
	if err := c.ShouldBindJSON(&faq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin not identified"})
		return
	}
	faq.AdminID = adminID.(uint)

	if err := config.DB().Create(&faq).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create FAQ"})
		return
	}
	c.JSON(http.StatusCreated, faq)
}

// GET /faqs
func GetFAQs(c *gin.Context) {
	var faqs []entity.FAQ
	if err := config.DB().Order("created_at desc").Find(&faqs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve FAQs"})
		return
	}
	c.JSON(http.StatusOK, faqs)
}

// PUT /faqs/:id
func UpdateFAQ(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid FAQ ID"})
		return
	}

	var faq entity.FAQ
	if err := config.DB().First(&faq, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "FAQ not found"})
		return
	}

	var input struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	faq.Title = input.Title
	faq.Content = input.Content
	config.DB().Save(&faq)

	c.JSON(http.StatusOK, faq)
}

// DELETE /faqs/:id
func DeleteFAQ(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid FAQ ID"})
		return
	}

	if err := config.DB().Delete(&entity.FAQ{}, uint(id)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete FAQ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "FAQ deleted successfully"})
}


// --- Request Ticket System ---

// POST /tickets
func CreateRequestTicket(c *gin.Context) {
	var ticket entity.RequestTicket
	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	ticket.UserID = userID.(uint)
	ticket.Status = "Open"

	if err := config.DB().Create(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request ticket"})
		return
	}
	c.JSON(http.StatusCreated, ticket)
}

// GET /admin/tickets
func GetRequestTickets(c *gin.Context) {
	var tickets []entity.RequestTicket
	if err := config.DB().Preload("User").Preload("Replies.Author").Order("created_at desc").Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tickets"})
		return
	}
	c.JSON(http.StatusOK, tickets)
}

// GET /tickets (สำหรับผู้ใช้)
func GetMyRequestTickets(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	var tickets []entity.RequestTicket
	if err := config.DB().Where("user_id = ?", userID).Order("created_at desc").Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user tickets"})
		return
	}

	c.JSON(http.StatusOK, tickets)
}

// GET /tickets/:id
func GetRequestTicketByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}

	var ticket entity.RequestTicket
	if err := config.DB().Preload("User").Preload("Replies.Author").First(&ticket, uint(id)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve ticket"})
		return
	}
	c.JSON(http.StatusOK, ticket)
}
// ======================= START: ของพรศิริ =======================

// POST /tickets/:id/replies
// เพิ่มการตอบกลับใน Ticket
func CreateTicketReply(c *gin.Context) {
	ticketID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}

	var reply entity.TicketReply
	if err := c.ShouldBindJSON(&reply); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่า Ticket มีอยู่จริงหรือไม่
	var ticket entity.RequestTicket
	if err := config.DB().First(&ticket, ticketID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	// ดึง ID ของผู้ที่ตอบ (คนที่ login อยู่)
	authorID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Author not identified"})
		return
	}
	reply.AuthorID = authorID.(uint)
	reply.RequestTicketID = uint(ticketID)

	// บันทึกการตอบกลับ
	if err := config.DB().Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply"})
		return
	}

	// ดึงข้อมูลผู้ตอบกลับเพื่อแสดงผล
	config.DB().Preload("Author").First(&reply, reply.ID)
	c.JSON(http.StatusCreated, reply)
}

// PUT /tickets/:id/status (สำหรับ Admin)
// อัปเดตสถานะของ Ticket
func UpdateTicketStatus(c *gin.Context) {
	ticketID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}

	var statusUpdate struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&statusUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var ticket entity.RequestTicket
	if err := config.DB().First(&ticket, ticketID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	// อัปเดตสถานะและบันทึก
	ticket.Status = statusUpdate.Status
	if err := config.DB().Save(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket status"})
		return
	}

	// ดึงข้อมูลทั้งหมดเพื่อส่งกลับ
	config.DB().Preload("User").Preload("Replies.Author").First(&ticket, ticket.ID)
	c.JSON(http.StatusOK, ticket)
}

