package entity

import "gorm.io/gorm"

type Statuses struct {
	gorm.Model
	StatusName string `json:"status_name"`
}