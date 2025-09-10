package entity

import (
	"gorm.io/gorm"
	"time"
)

type AddonServices struct {
	gorm.Model
	AddonServicesName string `json:"addon_service_name"`
	Description       string `json:"description"`
	Price             float32   `json:"price"`
	ValidFrom         time.Time `json:"valid_from"`
	ValidUntil        time.Time `json:"valid_until"`
}