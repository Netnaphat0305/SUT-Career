package entity

import (
	"gorm.io/gorm"
	"time"
)

type Orders struct {
	gorm.Model
	OrderName          string         `gorm:"uniqueIndex" json:"order_name"`
	Description        string         `json:"description"`
	OrderDate          time.Time      `json:"order_date"`
	Amount             float32        `json:"amount"`
	Service_Start_Date time.Time      `json:"service_start_date"`
	Service_End_Date   time.Time      `json:"service_end_date"`
	AddonServicesID    uint           `json:"addon_services_id"`
	AddonService       *AddonServices `gorm:"foreignKey: AddonServicesID;references:ID" json:"addon_service"`
	
	//FK

	EmployerID         uint           `json:"employer_id"`
	Employer           *Employer      `gorm:"foreignKey: EmployerID;references:ID" json:"employer"`

	BillableItem 	   *BillableItems `gorm:"foreignKey:OrderID;references:ID" json:"billable_item,omitempty"`
}