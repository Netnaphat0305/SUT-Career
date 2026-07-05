package entity

import (
	"time"

	"gorm.io/gorm"
)

type StatusEnum string

const (
	Open  StatusEnum = "Open"
	Close StatusEnum = "Close"
)

type Jobpost struct {
	gorm.Model
	Title             string     `gorm:"type:varchar(255);not null" json:"title"`
	Description       string     `gorm:"type:text;not null" json:"description"`
	Deadline          time.Time  `gorm:"not null" json:"deadline"`
	Status            StatusEnum `gorm:"not null" json:"status"`
	ImageURL          *string    `gorm:"type:varchar(255)" json:"image_url"`          // nullable string
	PortfolioRequired *string    `gorm:"type:varchar(100)" json:"portfolio_required"` // nullable
	Salary            int        `json:"salary"`
	LocationJob       string     `gorm:"column:locationjob;type:varchar(255);not null" json:"locationjob"`

	//FK
	EmployerID uint     `gorm:"not null" json:"employer_id"`
	Employer   Employer `gorm:"foreignKey:EmployerID;references:ID" json:"employer"`

	JobCategoryID uint        `json:"job_category_id"`
	JobCategory   JobCategory `gorm:"foreignKey:JobCategoryID"`

	// LocationID			uint			`gorm:"not null" json:"location_id"`
	// Location			Location		`gorm:"foreignKey:LocationID;references:ID"`

	EmploymentTypeID uint           `gorm:"not null" json:"employment_type_id"`
	EmploymentType   EmploymentType `gorm:"foreignKey:EmploymentTypeID;references:ID"`

	SalaryTypeID uint       `gorm:"not null" json:"salary_type_id"`
	SalaryType   SalaryType `gorm:"foreignKey:SalaryTypeID;references:ID"`

	//เหมือนจะไม่ได้ใช้แล้วเพราะว่ามันรู้ในหน้า jopappแล้วว่าสมัครโพสต์ไหน
	// StudentID			uint			`json:"student_id"`
	// Student				*Student		`gorm:"foreignKey: StudentID;references:ID" json:"student"`

	// เพิ่มตรงนี้ preload ผู้สมัครในโพสต์งาน
	Applications []JobApplication `gorm:"foreignKey:JobPostID" json:"applications,omitempty"`
}
