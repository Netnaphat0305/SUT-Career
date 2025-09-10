package entity

import (
	"gorm.io/gorm"
	"time"
)

type Reviews struct {
	gorm.Model

	Comment        	string        		`json:"comment"`
	Datetime       	time.Time     		`json:"datetime"`

	//FK
	JobpostID         	uint         	`json:"jobpost_id"`
	Jobpost           	*Jobpost	  	`gorm:"foreignKey: JobpostID;references:ID" json:"jobpost"`

	Ratingscore_ID 	uint          		`json:"ratingscore_id"`
	Ratingscore    	*Ratingscores 		`gorm:"foreignKey: Ratingscore_ID;references:ID" json:"ratingscore"`
}