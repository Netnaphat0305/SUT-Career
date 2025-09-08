package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// --- FAQ Management (For Admins) ---

// POST /admin/faqs
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

	type FAQResponse struct {
		entity.FAQ
		CommentCount int64 `json:"comment_count"`
	}

	var response []FAQResponse
	for _, faq := range faqs {
		var count int64
		config.DB().Model(&entity.FAQComment{}).Where("faq_id = ?", faq.ID).Count(&count)
		response = append(response, FAQResponse{
			FAQ:          faq,
			CommentCount: count,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// GET /faqs/:id
func GetFAQByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid FAQ ID"})
		return
	}

	var faq entity.FAQ
	if err := config.DB().First(&faq, uint(id)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "FAQ not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve FAQ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": faq})
}

// PUT /admin/faqs/:id
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
		Title           string  `json:"title"`
		Content         string  `json:"content"`
		ImageURL        *string `json:"image_url"`
		CommentsEnabled bool    `json:"comments_enabled"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	faq.Title = input.Title
	faq.Content = input.Content
	faq.ImageURL = input.ImageURL
	faq.CommentsEnabled = input.CommentsEnabled
	config.DB().Save(&faq)

	c.JSON(http.StatusOK, faq)
}

// DELETE /admin/faqs/:id
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

// --- FAQ Comment Management ---

// POST /faqs/:id/comments
func CreateFAQComment(c *gin.Context) {
	faqID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid FAQ ID"})
		return
	}

	var faq entity.FAQ
	if err := config.DB().First(&faq, faqID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "FAQ not found"})
		return
	}

	if !faq.CommentsEnabled {
		c.JSON(http.StatusForbidden, gin.H{"error": "Comments are disabled for this FAQ"})
		return
	}

	var input struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	comment := entity.FAQComment{
		Content:  input.Content,
		AuthorID: userID.(uint),
		FAQID:    uint(faqID),
	}

	if err := config.DB().Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	config.DB().Preload("Author").First(&comment, comment.ID)
	c.JSON(http.StatusCreated, gin.H{"data": comment})
}

// GET /faqs/:id/comments
func GetFAQComments(c *gin.Context) {
	faqID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid FAQ ID"})
		return
	}

	var comments []entity.FAQComment
	if err := config.DB().Where("faq_id = ?", faqID).Preload("Author").Order("created_at asc").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve comments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": comments})
}


// --- Request Ticket System ---
// ... (The rest of the file for RequestTicket remains the same) ...
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
func GetAllRequestTickets(c *gin.Context) {
	var tickets []entity.RequestTicket
	if err := config.DB().Preload("User").Order("created_at desc").Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tickets"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tickets})
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

	c.JSON(http.StatusOK, gin.H{"data": tickets})
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
	if err := config.DB().
		Preload("User").
		Preload("Attachments").
		Preload("Replies.Author").
		Preload("Replies.Attachments").
		First(&ticket, uint(id)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve ticket"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ticket})
}

// POST /tickets/:id/replies
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

	var ticket entity.RequestTicket
	if err := config.DB().First(&ticket, ticketID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	authorID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Author not identified"})
		return
	}
	reply.AuthorID = authorID.(uint)
	reply.RequestTicketID = uint(ticketID)

	if err := config.DB().Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply"})
		return
	}

	// Create notification if a staff member replies
	if reply.IsStaffReply {
		message := fmt.Sprintf("เจ้าหน้าที่ตอบกลับในคำร้อง: '%s'", ticket.Subject)
		link := fmt.Sprintf("/help?tab=2&ticket_id=%d", ticket.ID)
		if err := CreateNotification(ticket.UserID, message, link, entity.NotificationTypeRequest); err != nil {
			fmt.Printf("could not create notification for user %d on ticket %d: %v\n", ticket.UserID, ticket.ID, err)
		}
	}

	config.DB().Preload("Author").Preload("Attachments").First(&reply, reply.ID)
	c.JSON(http.StatusCreated, reply)
}

// PUT /tickets/:id/status (สำหรับ Admin)
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

	ticket.Status = statusUpdate.Status
	if err := config.DB().Save(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket status"})
		return
	}

	config.DB().
		Preload("User").
		Preload("Attachments").
		Preload("Replies.Author").
		Preload("Replies.Attachments").
		First(&ticket, ticket.ID)

	c.JSON(http.StatusOK, gin.H{"data": ticket})
}
