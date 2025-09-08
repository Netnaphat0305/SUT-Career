// backend/entity/question.go
package entity

import "gorm.io/gorm"

// Question represents a simplified FAQ entry
type Question struct {
	gorm.Model
	question string `gorm:"type:varchar(255);not null" json:"title"`
	answer   string `gorm:"type:text;not null" json:"content"`
}
