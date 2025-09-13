package entity

import (
	"gorm.io/gorm"
	"time"
)

type Reviews struct {
	gorm.Model

	Comment        	string        		`json:"comment"`
	Datetime       	time.Time     		`json:"datetime"`

	JobApplicationID	*uint	`json:"job_application_id"`
	JobApplication		*JobApplication `gorm:"foreignKey:JobApplicationID;references:ID" json:"job_application,omitempty"`

	Ratingscore_ID 	uint          		`json:"ratingscore_id"`
	Ratingscore    	*Ratingscores 		`gorm:"foreignKey: Ratingscore_ID;references:ID" json:"ratingscore"`
}