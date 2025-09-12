// backend/entity/interviewScheduling.go
package entity

import (
	"time"
	"gorm.io/gorm"
)
type InterviewScheduling struct {
	gorm.Model
	DateAndTimeStart time.Time `json:"DateAndTimeStart"`
	DateAndTimeEnd time.Time `json:"DateAndTimeEnd"`
	Status string `json:"Status"`
	Detail string `gorm:"type:text" json:"Detail"`

	//FK

	EmployerID uint
	Employer *Employer `gorm:"foreignKey:EmployerID" json:"Employer"`

	Interview []Interview `gorm:"foreignKey:InterviewSchedulingID"`
}