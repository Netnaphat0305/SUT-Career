package entity

import (
	"gorm.io/gorm"
	"time"
)

type Discounts struct {
	gorm.Model
	DiscountName  string    `json:"discount_name"`
	DiscountValue uint       `json:"discount_value"`
	Discounttype  string    `json:"discount_type"`
	ValidFrom     time.Time `json:"valid_from"`
	ValidUntil    time.Time `json:"valid_until"`
}