package entity

import "gorm.io/gorm"

type Interview struct {
	gorm.Model

	InterviewSchedulingID uint
	InterviewScheduling *InterviewScheduling `gorm:"foreignKey:InterviewSchedulingID;not null" json:"InterviewScheduling"`
	//FK

	StudentID uint
	Student *Student `gorm:"foreignKey:StudentID" json:"Student"`

	Status string `gorm:"not null" json:"Status"`
}