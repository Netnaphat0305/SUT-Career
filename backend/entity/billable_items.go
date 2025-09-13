package entity

import "gorm.io/gorm"

type BillableItems struct {
	gorm.Model
	Description string `json:"description"`
	Amount      float32   `json:"amount"`
	JobApplicationID	*uint	`json:"job_application_id"`
	JobApplication		*JobApplication `gorm:"foreignKey:JobApplicationID;references:ID" json:"job_application,omitempty"`
	OrderID		*uint	`json:"order_id"`
	Order		*Orders `gorm:"foreignKey:OrderID;references:ID" json:"order,omitempty"`
}