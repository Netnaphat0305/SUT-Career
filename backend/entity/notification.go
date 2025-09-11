package entity

import "gorm.io/gorm"

// NotificationType defines the type of notification
type NotificationType string

const (
	// NotificationTypeJob is for job-related notifications
	NotificationTypeJob NotificationType = "job"
	// NotificationTypeRequest is for help request notifications
	NotificationTypeRequest NotificationType = "request"
)

// Notification represents a notification for a user
type Notification struct {
	gorm.Model
	Message  string           `json:"message"`
	Read     bool             `json:"read" gorm:"default:false"`
	Link     string           `json:"link"`
	Type     NotificationType `json:"type"`
	UserID   uint             `json:"user_id"`
	User     User             `gorm:"foreignKey:UserID"`
}
