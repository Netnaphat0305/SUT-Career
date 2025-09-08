package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// GetNotifications retrieves all notifications for the logged-in user.
// GET /notifications
func GetNotifications(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	var notifications []entity.Notification
	if err := config.DB().Where("user_id = ?", userID).Order("created_at desc").Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": notifications})
}

// MarkNotificationAsRead marks a single notification as read.
// PUT /notifications/:id/read
func MarkNotificationAsRead(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	notificationID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	var notification entity.Notification
	if err := config.DB().Where("id = ? AND user_id = ?", notificationID, userID).First(&notification).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	notification.Read = true
	if err := config.DB().Save(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": notification})
}

// MarkAllNotificationsAsRead marks all unread notifications for a user as read.
// PUT /notifications/read-all
func MarkAllNotificationsAsRead(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	if err := config.DB().Model(&entity.Notification{}).Where("user_id = ? AND read = ?", userID, false).Update("read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark all notifications as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// CreateNotification is a helper function to be called from other controllers
func CreateNotification(userID uint, message, link string, notifType entity.NotificationType) error {
	notification := entity.Notification{
		UserID:  userID,
		Message: message,
		Link:    link,
		Type:    notifType,
		Read:    false,
	}
	if err := config.DB().Create(&notification).Error; err != nil {
		fmt.Printf("Error creating notification for user %d: %v\n", userID, err)
		return err
	}
	return nil
}
