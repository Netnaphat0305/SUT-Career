package entity

import "gorm.io/gorm"

type BillableItems struct {
	gorm.Model
	Description string `json:"description"`
	Amount      float32   `json:"amount"`
	JobpostID	*uint	`json:"jobpost_id"`
	Jobpost		*Jobpost `gorm:"foreignKey:JobpostID;references:ID" json:"jobpost,omitempty"`
	OrderID		*uint	`json:"order_id"`
	Order		*Orders `gorm:"foreignKey:OrderID;references:ID" json:"order,omitempty"`
}