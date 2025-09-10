package entity

import (
	"gorm.io/gorm"
	"time"
)

type PaymentReports struct {
	gorm.Model
	Reportname   string     `json:"report_name"`
	Filepath     string     `json:"file_path"`
	CreateDate   time.Time  `json:"create_date"`
	Payment 	 *Payments  `gorm:"foreignKey:PaymentReportID;references:ID" json:"payment,omitempty"`
}