package entity

import "gorm.io/gorm"

// FAQ stores frequently asked questions and answers managed by admins.
type FAQ struct {
	gorm.Model
	Title   string  `gorm:"type:varchar(255);not null" json:"title"`
	Content string  `gorm:"type:text;not null" json:"content"`
	AdminID uint    `gorm:"not null" json:"admin_id"`
	ImageURL *string `gorm:"type:varchar(255)" json:"image_url,omitempty"` // เพิ่มฟิลด์สำหรับ URL ของรูปภาพ
}
