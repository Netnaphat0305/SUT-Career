package entity

import (
	"gorm.io/gorm"
)

type StudentPostAttachment struct {
	gorm.Model
	URL           string      `json:"url" gorm:"type:varchar(500);not null"`
	Name          string      `json:"name" gorm:"type:varchar(255);not null"`
	Type          string      `json:"type" gorm:"varchar(50);not null"`

	// Foreign Key to StudentPost
	StudentPostID uint        `gorm:"not null" json:"student_post_id"`
	StudentPost   StudentPost `gorm:"foreignKey:StudentPostID" json:"-"`
}

func (StudentPostAttachment) TableName() string {
	return "student_post_attachments"
}